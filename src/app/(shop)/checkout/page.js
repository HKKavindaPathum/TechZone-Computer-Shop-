'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getToken, getUser } from '@/lib/auth';
import { api } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [formData, setFormData] = useState({ shipping_address: '', payment_method: 'cash' });

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login?redirect=checkout');
      return;
    }
    const user = getUser();
    if (user?.address) {
      setFormData(prev => ({ ...prev, shipping_address: user.address }));
    }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = getToken();
      const data = await api.get('/cart', token);
      if (!data.items || data.items.length === 0) {
        router.push('/cart');
        return;
      }
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch checkout cart:', err);
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!formData.shipping_address.trim()) {
      alert('කරුණාකර භාණ්ඩ එවීමට අවශ්‍ය ලිපිනය (Shipping Address) ඇතුළත් කරන්න!');
      return;
    }
    setPlacing(true);
    try {
      const token = getToken();
      const data = await api.post('/orders/checkout', formData, token);
      if (data.orderId) {
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
        router.push(`/orders/${data.orderId}?success=true`);
      } else {
        alert(data.message || 'Order එක සකස් කිරීමට නොහැකි විය.');
      }
    } catch (err) {
      console.error('Failed to place order:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-8 h-8 border-4 border-brand-primary dark:border-violet-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  const paymentOptions = [
    { value: 'cash', label: '💵 Cash on Delivery', desc: 'භාණ්ඩ ලැබුණු පසු මුදල් ගෙවන්න' },
    { value: 'card', label: '💳 Card Payment', desc: 'Credit / Debit Card මඟින් ගෙවන්න (Online)' },
    { value: 'bank', label: '🏦 Bank Transfer', desc: 'අපගේ බැංකු ගිණුමට මුදල් තැන්පත් කරන්න' },
  ];

  return (
    <main className="min-h-screen bg-bg-primary pb-20">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Checkout</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">ඇණවුම සම්පූර්ණ කිරීමට ලිපිනය සහ ගෙවීම් ක්‍රමය තෝරන්න</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {/* Form and Options section */}
          <div className="md:col-span-2 space-y-6">

            {/* Shipping Address */}
            <div className="glass-panel rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                <span>📦</span> Shipping Address
              </h2>
              <textarea
                value={formData.shipping_address}
                onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                rows={3}
                placeholder="ඔබගේ ලිපිනය ඇතුළත් කරන්න..."
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 dark:focus:ring-violet-500/50 resize-none font-medium"
              />
            </div>

            {/* Payment Method selection */}
            <div className="glass-panel rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                <span>💳</span> Payment Method
              </h2>
              <div className="space-y-3">
                {paymentOptions.map((option) => {
                  const isSelected = formData.payment_method === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-brand-primary/60 bg-brand-primary/[0.04] dark:border-violet-500/60 dark:bg-violet-500/[0.04]'
                          : 'border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={option.value}
                        checked={isSelected}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                        className="mt-1 w-4 h-4 text-brand-primary focus:ring-brand-primary dark:focus:ring-violet-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{option.label}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{option.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Checkout Order Summary Column */}
          <div className="md:col-span-1">
            <div className="glass-panel rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 shadow-sm p-6 sticky top-24">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-wider pb-2 border-b border-slate-200/40 dark:border-slate-800/40">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-[180px] overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div key={item.cart_item_id} className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span className="line-clamp-1 flex-1 mr-4">{item.product_name} <span className="text-slate-400 font-bold">x{item.quantity}</span></span>
                    <span className="flex-shrink-0">Rs. {item.subtotal?.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-4 mb-6">
                <div className="flex justify-between font-extrabold text-slate-800 dark:text-slate-100 text-base">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-brand-primary to-brand-accent dark:from-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    Rs. {cart.total?.toLocaleString()}
                  </span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder} 
                disabled={placing} 
                className="w-full bg-brand-primary hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white py-3.5 rounded-xl font-bold hover:shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider active:scale-98"
              >
                {placing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    Placing Order...
                  </span>
                ) : 'Place Order ✅'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}