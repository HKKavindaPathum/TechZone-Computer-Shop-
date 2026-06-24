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
                  <path fillRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" clipRule="evenodd" />
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
