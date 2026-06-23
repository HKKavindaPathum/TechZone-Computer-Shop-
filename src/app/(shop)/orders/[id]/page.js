'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { isLoggedIn, getToken } from '@/lib/auth';
import { api } from '@/lib/api';

function OrderDetail() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSuccess = searchParams.get('success') === 'true';

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrder = async () => {
    try {
      const token = getToken();
      const data = await api.get(`/orders/my-orders/${id}`, token);
      setOrder(data.order);
      setItems(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30',
      processing: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border-sky-200/50 dark:border-sky-900/30',
      shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/30',
      delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30',
      cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-450';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-8 h-8 border-4 border-brand-primary dark:border-violet-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-slate-400 bg-bg-primary">
      <span className="text-6xl mb-4">📦</span>
      <h2 className="text-base font-bold text-slate-700 dark:text-slate-200">Order not found</h2>
      <button onClick={() => router.push('/orders')} className="mt-4 bg-brand-primary dark:bg-violet-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-md transition active:scale-95">
        My Orders
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-bg-primary pb-20">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {isSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 mb-8 text-center shadow-sm">
            <p className="text-4xl mb-2">🎉</p>
            <h2 className="text-base font-bold text-emerald-700 dark:text-emerald-400 mb-1">Order Place වුණා!</h2>
            <p className="text-emerald-600 dark:text-emerald-500 text-xs font-medium">ඔබගේ ඇණවුම සාර්ථකව සකස් කරන ලදී.</p>
          </div>
        )}

        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-violet-400 mb-6 flex items-center gap-1.5 transition-colors group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          <span>Back</span>
        </button>

        {/* Order Details Panel */}
        <div className="glass-panel rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-200/40 dark:border-slate-800/40">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Order #{order.order_id}</h1>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">
                {new Date(order.order_date).toLocaleDateString('si-LK', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${statusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Shipping Address</p>
              <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed whitespace-pre-wrap">{order.shipping_address}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Payment Method</p>
              <p className="text-slate-700 dark:text-slate-300 font-semibold capitalize flex items-center gap-1">
                {order.payment_method === 'cash' ? '💵 Cash on Delivery' : order.payment_method === 'card' ? '💳 Card Payment' : '🏦 Bank Transfer'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Payment Status</p>
              <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                order.payment_status === 'completed' 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200/40 dark:border-emerald-800/30' 
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/40 dark:border-amber-800/30'
              }`}>
                {order.payment_status}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-lg font-black bg-gradient-to-r from-brand-primary to-brand-accent dark:from-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">Rs. {order.total_amount?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Order Items List */}
        <div className="glass-panel rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-6 uppercase tracking-wider pb-2 border-b border-slate-200/40 dark:border-slate-800/40">Order Items</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.order_item_id} className="flex gap-4 items-center py-2 border-b border-slate-100/50 dark:border-slate-800/40 last:border-0 last:pb-0">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/50">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover"/>
                  ) : (
                    <span className="text-2xl">🖥️</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{item.product_name}</p>
                  {item.brand && <p className="text-[10px] text-brand-primary dark:text-violet-400 font-extrabold uppercase mt-0.5">{item.brand}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-0.5">x{item.quantity}</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Rs. {(item.unit_price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/orders" className="flex-1 text-center border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-xs font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95">
            My Orders
          </Link>
          <Link href="/products" className="flex-1 text-center bg-brand-primary dark:bg-violet-600 text-white py-3 rounded-xl text-xs font-bold transition hover:bg-indigo-700 dark:hover:bg-violet-500 active:scale-95 shadow-sm">
            Continue Shopping
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
      </div>
    }>
      <OrderDetail />
    </Suspense>
  );
}