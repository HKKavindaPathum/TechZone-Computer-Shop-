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
      
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white py-24 sm:py-32 px-6 text-center border-b border-indigo-950">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none"/>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none"/>
        
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="inline-block bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            🔥 Ultimate Tech Destination
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6 bg-gradient-to-r from-white via-indigo-100 to-slate-300 bg-clip-text text-transparent leading-none">
            Upgrade Your Computing Experience
          </h1>
          <p className="text-base sm:text-lg mb-10 text-slate-300 max-w-xl mx-auto leading-relaxed">
            හොඳම Computers, Accessories සහ Parts අසමසම වගකීමක් සහිතව එකම වහලක් යටින් ලබාගන්න.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/products"
              className="w-full sm:w-auto bg-brand-primary hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-indigo-500/10 hover:shadow-xl active:scale-95 text-sm"
            >
              Shop Now
            </Link>
            <Link
              href="/products?category=all"
              className="w-full sm:w-auto border border-slate-700 hover:border-slate-500 hover:bg-slate-800/40 text-slate-300 px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 active:scale-95 text-sm backdrop-blur-sm"
            >
              Explore Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Bubble Links Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Browse by Category
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              ඔබට අවශ්‍ය කාණ්ඩය පහසුවෙන් තෝරාගන්න
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-wrap gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-11 w-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"/>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.category_id}
                href={`/products?category=${cat.category_id}`}
                className="glass-panel px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80 hover:bg-brand-primary hover:text-white dark:hover:bg-violet-600 dark:hover:text-white hover:border-brand-primary dark:hover:border-violet-600 transition-all duration-300 shadow-sm active:scale-95"
              >
                {cat.category_name}
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