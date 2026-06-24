'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getToken } from '@/lib/auth';
import { api } from '@/lib/api';
import CartItem from '@/components/CartItem';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(stored);
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) {
      removeItem(productId);
      return;
    }
    const updated = cart.map(item => item.productId == productId ? { ...item, qty } : item);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (productId) => {
    const updated = cart.filter(item => item.productId != productId);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleClearCart = () => {
    if (!confirm('Cart එක හිස් කරන්නද?')) return;
    setCart([]);
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = async () => {
    if (!isLoggedIn()) {
      router.push('/login?redirect=cart');
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      await api.post('/cart/sync', { items: cart }, token);
      router.push('/checkout');
    } catch (err) {
      console.error('Failed to sync cart:', err);
      toast.error('Something went wrong during checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
        <div className="text-center py-16 glass-panel rounded-3xl p-10 max-w-md w-full bg-white/40 dark:bg-slate-900/30">
          <p className="text-6xl mb-4">🛒</p>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Cart එක හිස්!</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">මිලදී ගැනීමට අවශ්‍ය භාණ්ඩ එකතු කරන්න.</p>
          <Link 
            href="/products" 
            className="w-full inline-block bg-brand-primary hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-md transition active:scale-95 text-xs uppercase tracking-wider"
          >
            Shop Now
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-primary pb-20">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="flex justify-between items-end mb-8 border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">My Cart</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">ඔබ තෝරාගත් භාණ්ඩ මෙතැනින් පරීක්ෂා කරන්න</p>
          </div>
          <button 
            onClick={handleClearCart} 
            className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {/* Cart Items stack */}
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <CartItem 
                key={item.productId} 
                item={item} 
                onUpdateQty={updateQty} 
                onRemove={removeItem} 
              />
            ))}
          </div>

          {/* Order Summary box */}
          <div className="md:col-span-1">
            <div className="glass-panel rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 shadow-sm p-6 sticky top-24">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-wider pb-2 border-b border-slate-200/40 dark:border-slate-800/40">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-[220px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span className="line-clamp-1 flex-1 mr-4">{item.name} <span className="text-slate-400 font-bold">x{item.qty}</span></span>
                    <span className="flex-shrink-0">Rs. {(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-4 mb-6">
                <div className="flex justify-between font-extrabold text-slate-800 dark:text-slate-100 text-base">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-brand-primary to-brand-accent dark:from-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button 
                onClick={handleCheckout} 
                disabled={loading} 
                className="w-full bg-brand-primary hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white py-3.5 rounded-xl font-bold hover:shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider active:scale-98"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    Processing...
                  </span>
                ) : 'Checkout →'}
              </button>

              <Link 
                href="/products" 
                className="block text-center text-xs font-bold text-slate-400 hover:text-brand-primary dark:hover:text-violet-400 mt-4 transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}