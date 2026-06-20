'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || 'all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prods, cats] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ]);
        setProducts(Array.isArray(prods) ? prods : []);
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sync selectedCategory with searchParams category filter if it changes
  useEffect(() => {
    if (categoryFilter) {
      setSelectedCategory(categoryFilter);
    }
  }, [categoryFilter]);

  const filtered = products.filter((p) => {
    const matchCategory = selectedCategory === 'all' || p.category_id == selectedCategory;
    const matchSearch = p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <main className="min-h-screen bg-bg-primary pb-20">
      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Explore Products
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            විවිධ මාදිලියේ උසස්ම පරිගණක උපාංග මෙතැනින් තෝරන්න
          </p>
        </div>

        {/* Search + Filter Container */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white/50 dark:bg-slate-900/35 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl">
          
          {/* Search box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products by brand or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 dark:focus:ring-violet-500/50 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
              🔍
            </span>
          </div>

          {/* Category Filters list */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none items-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex-shrink-0 border ${
                selectedCategory === 'all'
                  ? 'bg-brand-primary text-white border-brand-primary dark:bg-violet-600 dark:border-violet-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-brand-primary dark:hover:border-violet-500'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category_id}
                onClick={() => setSelectedCategory(cat.category_id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex-shrink-0 border ${
                  selectedCategory == cat.category_id
                    ? 'bg-brand-primary text-white border-brand-primary dark:bg-violet-600 dark:border-violet-600'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-brand-primary dark:hover:border-violet-500'
                }`}
              >
                {cat.category_name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-200 dark:bg-slate-800/50 rounded-2xl h-80 animate-pulse border border-slate-100/50 dark:border-slate-800/50"/>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 glass-panel rounded-3xl p-8 bg-white/40 dark:bg-slate-900/30">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No Products Found</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-4">ඔබ සොයන නිර්ණායක වලට ගැලපෙන භාණ්ඩ කිසිවක් නැත.</p>
            <button 
              onClick={() => { setSearch(''); setSelectedCategory('all'); }} 
              className="bg-brand-primary dark:bg-violet-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:shadow-md transition active:scale-95"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 border-4 border-brand-primary dark:border-violet-500 border-t-transparent rounded-full animate-spin"/>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}