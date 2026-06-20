'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getToken } from '@/lib/auth';
import { api } from '@/lib/api';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = getToken();
      const data = await api.get('/orders/my-orders', token);
      setOrders(data);
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

  return (
    <main className="min-h-screen bg-bg-primary pb-20">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">My Orders</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">ඔබ ලබාදුන් ඇණවුම් වල තොරතුරු සහ වත්මන් තත්ත්වය</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl p-8 bg-white/40 dark:bg-slate-900/30">
            <p className="text-5xl mb-4">📦</p>
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No Orders Found</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-6">ඔබ මෙතෙක් කිසිදු ඇණවුමක් සිදු කර නොමැත.</p>
            <Link href="/products" className="bg-brand-primary dark:bg-violet-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-bold transition hover:shadow-md active:scale-95 text-xs uppercase tracking-wider">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.order_id}
                href={`/orders/${order.order_id}`}
                className="glass-panel glow-card rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 flex items-center justify-between hover:shadow-md transition duration-300 block"
              >
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100 mb-1 text-sm">Order #{order.order_id}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-2 font-medium">
                    {new Date(order.order_date).toLocaleDateString('si-LK')}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">{order.payment_method} Payment</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-brand-primary dark:text-violet-400 mb-2 text-sm">Rs. {order.total_amount?.toLocaleString()}</p>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}