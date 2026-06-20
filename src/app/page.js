'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prods, cats] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ]);
        setProducts(Array.isArray(prods) ? prods.slice(0, 8) : []);
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        console.error('Failed to fetch home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-bg-primary pb-20">
      
      {/* Premium Split Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-20 sm:py-28 px-6 border-b border-slate-900">
        {/* Glow Effects */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none"/>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"/>
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12 items-center relative z-10">
          {/* Hero Left Column */}
          <div className="md:col-span-7 text-left">
            <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"/>
              🔥 Ultimate Tech Destination
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 bg-gradient-to-br from-white via-indigo-100 to-slate-300 bg-clip-text text-transparent leading-tight sm:leading-none">
              Power Up Your <span className="bg-gradient-to-r from-brand-primary to-brand-accent dark:from-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">Digital World</span>
            </h1>
            <p className="text-sm sm:text-base mb-10 text-slate-400 max-w-lg leading-relaxed font-medium">
              හොඳම Computers, Accessories සහ Parts අසමසම වගකීමක් සහිතව එකම වහලක් යටින් ලබාගන්න. 
              TechZone සමඟින් ඔබේ සිහින පරිගණකය අදම යථාර්ථයක් කරගන්න.
            </p>
            <div className="flex flex-col sm:flex-row justify-start items-center gap-4">
              <Link
                href="/products"
                className="w-full sm:w-auto text-center bg-brand-primary hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-indigo-500/10 hover:shadow-xl active:scale-95 text-xs uppercase tracking-wider"
              >
                Shop Now 🛒
              </Link>
              <Link
                href="/products?category=all"
                className="w-full sm:w-auto text-center border border-slate-700 hover:border-slate-500 hover:bg-slate-800/40 text-slate-300 px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 active:scale-95 text-xs uppercase tracking-wider backdrop-blur-sm"
              >
                Explore Categories
              </Link>
            </div>
          </div>

          {/* Hero Right Column - Image Showcase */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative group w-full max-w-[360px] aspect-[4/5] rounded-[32px] overflow-hidden glass-panel border border-slate-800/50 shadow-2xl transition-all duration-500 hover:translate-y-[-4px]">
              <img 
                src="/images/premium_gaming_pc.png" 
                alt="Premium Custom Gaming PC" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
              />
              {/* Image Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"/>
              {/* Image Info Tag */}
              <div className="absolute bottom-5 left-5 right-5 text-left">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-brand-accent">Custom PC Builds</span>
                <h3 className="text-sm font-bold text-white mt-1">Water-Cooled Masterpieces</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Column Features Grid Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { icon: '⚡', title: 'Island-wide Delivery', desc: 'දිවයින පුරා ආරක්ෂිතව සහ කඩිනමින් භාණ්ඩ ප්‍රවාහනය කරනු ලැබේ.' },
          { icon: '🛡', title: '3-Year Brand Warranty', desc: 'සියලුම උපාංග සඳහා නිෂ්පාදකයාගේ වගකීම සහ අලෙවියෙන් පසු විශිෂ්ට සේවාව.' },
          { icon: '🛠', title: 'Expert Custom Builds', desc: 'ඔබේ අවශ්‍යතාවයට සරිලන පරිදි පළපුරුදු ශිල්පීන් ලවා පරිගණක එකලස් කරගන්න.' },
        ].map((feat, i) => (
          <div key={i} className="glass-panel bg-white/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300">
            <span className="text-3xl mb-3.5 block">{feat.icon}</span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">{feat.title}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* Categories Cards Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Browse by Category
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            ඔබට අවශ්‍ය කාණ්ඩය පහසුවෙන් තෝරාගන්න
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800/50 rounded-2xl animate-pulse border border-slate-100/50 dark:border-slate-800/50"/>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.category_id}
                href={`/products?category=${cat.category_id}`}
                className="glass-panel glow-card p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 block text-left group"
              >
                <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform duration-300 w-fit">
                  {cat.category_name === 'Laptops' ? '💻' : cat.category_name === 'Desktops' ? '🖥️' : cat.category_name === 'PC Parts' ? '🔌' : cat.category_name === 'Accessories' ? '🎧' : '📦'}
                </span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5 group-hover:text-brand-primary dark:group-hover:text-violet-400 transition-colors">
                  {cat.category_name}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal line-clamp-2 font-medium">
                  {cat.description || 'සියලුම උපාංග මෙතැනින් බලන්න.'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products Section */}
      <section className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-end mb-8 border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Featured Products
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              අපගේ සුවිශේෂී නිෂ්පාදන පෙළ
            </p>
          </div>
          <Link 
            href="/products" 
            className="text-xs font-bold text-brand-primary dark:text-violet-400 hover:underline flex items-center gap-1 transition-all duration-200 hover:gap-1.5"
          >
            <span>View All</span>
            <span>→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-200 dark:bg-slate-800/50 rounded-2xl h-80 animate-pulse border border-slate-100/50 dark:border-slate-800/50"/>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <span className="text-5xl mb-3 block">🖥️</span>
            <p className="text-sm font-medium">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </section>

    </main>
  );
}