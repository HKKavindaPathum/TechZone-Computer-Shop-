'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Successfully subscribed to our newsletter! 📬');
    setEmail('');
  };

  return (
    <footer className="border-t border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/40 backdrop-blur-md transition-all duration-300 w-full">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link 
              href="/" 
              className="text-lg font-bold bg-gradient-to-r from-brand-primary to-brand-accent dark:from-violet-400 dark:to-cyan-400 bg-clip-text text-transparent flex items-center gap-1.5"
            >
              <span className="text-xl">💻</span>
              <span className="font-black tracking-tight">TechZone</span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Your ultimate destination for high-performance laptops, custom PC builds, and premium computer accessories.
            </p>
            <div className="flex gap-4.5 pt-2">
              <a href="#" className="text-slate-400 hover:text-brand-primary dark:hover:text-violet-400 transition-colors duration-250" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-brand-primary dark:hover:text-violet-400 transition-colors duration-250" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.008 3.81.055.983.045 1.637.21 2.213.435a4.346 4.346 0 011.58 1.03 4.346 4.346 0 011.03 1.58c.225.576.39 1.23.435 2.214.047 1.026.055 1.379.055 3.81s-.008 2.784-.055 3.81c-.045.983-.21 1.637-.435 2.213a4.346 4.346 0 01-1.03 1.58 4.346 4.346 0 01-1.58 1.03c-.576.225-1.23.39-2.214.435-1.026.047-1.379.055-3.81.055s-2.784-.008-3.81-.055c-.983-.045-1.637-.21-2.213-.435a4.346 4.346 0 01-1.58-1.03 4.346 4.346 0 01-1.03-1.58c-.225-.576-.39-1.23-.435-2.214C2.007 15.784 2 15.431 2 13s.008-2.784.055-3.81c.045-.983.21-1.637.435-2.213a4.346 4.346 0 011.03-1.58 4.346 4.346 0 011.58-1.03c.576-.225 1.23-.39 2.214-.435C9.53 2.007 9.883 2 12.315 2m0 2c-2.4 0-2.724.009-3.668.052-.862.04-1.33.184-1.64.305-.412.16-.706.353-.1.014a2.346 2.346 0 00-.593.592c-.16.413-.353.707-.014 1.1a2.346 2.346 0 00-.592.593c-.12.31-.265.778-.305 1.64C4.008 10.276 4 10.6 4 13s.009 2.724.052 3.668c.04.862.184 1.33.305 1.64.16.412.353.706.014 1.1a2.346 2.346 0 00.593.592c.312.12.778.265 1.64.305.944.042 1.268.052 3.668.052s2.724-.009 3.668-.052c.862-.04 1.33-.184 1.64-.305.412-.16.706-.353 1.1-.014.36-.36.52-.59.592-.593.12-.31.265-.778.305-1.64.042-.944.052-1.268.052-3.668s-.009-2.724-.052-3.668c-.04-.862-.184-1.33-.305-1.64a2.346 2.346 0 00-.592-.593c-.413-.16-.707-.353-1.1-.014a2.346 2.346 0 00-.593-.592c-.31-.12-.778-.265-1.64-.305C15.04 4.008 14.716 4 12.315 4zm0 2.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zm0 11a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm5.75-10.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-brand-primary dark:hover:text-violet-400 transition-colors duration-250" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400 font-bold">
              <li>
                <Link href="/" className="hover:text-brand-primary dark:hover:text-violet-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-brand-primary dark:hover:text-violet-400 transition-colors">Products</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-brand-primary dark:hover:text-violet-400 transition-colors">Shopping Cart</Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-brand-primary dark:hover:text-violet-400 transition-colors">My Orders</Link>
              </li>
            </ul>
          </div>

          {/* Store Info Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Store Location</h3>
            <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              <li className="flex gap-2">
                <span>📍</span>
                <span>TechZone, Galle Road, Colombo 03, Sri Lanka.</span>
              </li>
              <li className="flex gap-2">
                <span>📞</span>
                <span>+94 11 234 5678</span>
              </li>
              <li className="flex gap-2">
                <span>✉️</span>
                <span>support@techzone.lk</span>
              </li>
              <li className="flex gap-2">
                <span>🕒</span>
                <span>Mon - Sat: 9:00 AM - 7:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Newsletter</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Subscribe to receive updates on new arrivals, exclusive discounts, and restocks.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 dark:focus:ring-violet-500/50 w-full transition-all duration-300 font-medium"
              />
              <button 
                type="submit"
                className="bg-brand-primary hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white text-xs px-4 py-2 rounded-xl font-bold transition active:scale-95 shadow-sm"
              >
                Send
              </button>
            </form>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-slate-200/50 dark:border-slate-800/40 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            © {new Date().getFullYear()} TechZone. All rights reserved.
          </p>
          <div className="flex gap-4 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            <a href="#" className="hover:text-brand-primary dark:hover:text-violet-400 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-brand-primary dark:hover:text-violet-400 transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
