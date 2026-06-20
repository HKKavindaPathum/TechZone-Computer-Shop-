'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const data = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address
      });

      if (data.userId) {
        router.push('/login?registered=true');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 dark:focus:ring-violet-500/50 transition-all font-medium";
  const labelClass = "block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5";

  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-brand-primary/5 rounded-full blur-[100px] pointer-events-none"/>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"/>

      <div className="glass-panel shadow-sm bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 w-full max-w-md p-8 sm:p-10 rounded-3xl relative z-10">

        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-black bg-gradient-to-r from-brand-primary to-brand-accent dark:from-violet-400 dark:to-cyan-400 bg-clip-text text-transparent tracking-tight">
            TechZone
          </Link>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">නව account එකක් හදාගන්න</p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl mb-6 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Name</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="ඔබගේ නම"/>
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder="you@example.com"/>
          </div>

          <div>
            <label className={labelClass}>Phone</label>
            <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} placeholder="077XXXXXXX"/>
          </div>

          <div>
            <label className={labelClass}>Address</label>
            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputClass} placeholder="ඔබගේ ලිපිනය"/>
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputClass} placeholder="••••••••"/>
          </div>

          <div>
            <label className={labelClass}>Confirm Password</label>
            <input type="password" required value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className={inputClass} placeholder="••••••••"/>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 transform active:scale-98 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                Registering...
              </span>
            ) : 'Register'}
          </button>
        </form>

        <p className="text-center text-slate-400 dark:text-slate-500 text-xs mt-6 font-semibold">
          Account එකක් තියෙනවාද?{' '}
          <Link href="/login" className="text-brand-primary dark:text-violet-400 hover:underline font-bold">
            Login වන්න
          </Link>
        </p>

      </div>
    </main>
  );
}