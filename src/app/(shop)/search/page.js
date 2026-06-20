'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(query);

  useEffect(() => {
    if (query) {
      setSearch(query);
      fetchResults(query);
    }
  }, [query]);

  const fetchResults = async (q) => {
    setLoading(true);
    try {
      const data = await api.get('/products');
      const filtered = data.filter(p =>
        p.product_name.toLowerCase().includes(q.toLowerCase()) ||
        p.brand?.toLowerCase().includes(q.toLowerCase()) ||
        p.description?.toLowerCase().includes(q.toLowerCase())
      );
      setProducts(filtered);
    } catch (err) {
      console.error('Failed to fetch search results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <main className="min-h-screen bg-bg-primary pb-20">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Search Header Form */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8 bg-white/50 dark:bg-slate-900/35 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by brand or name..."
            className="flex-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 dark:focus:ring-violet-500/50"
          />
          <button 
            type="submit" 
            className="bg-brand-primary hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-bold transition duration-200 hover:shadow-md active:scale-95 text-xs"
          >
            Search
          </button>
        </form>

        {query && (
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mb-6 uppercase tracking-wider">
            {loading ? 'Searching...' : `"${query}" සඳහා results ${products.length} ක් සොයාගැනිණි.`}
          </p>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-200 dark:bg-slate-800/50 rounded-2xl h-80 animate-pulse border border-slate-100/50 dark:border-slate-800/50"/>
            ))}
          </div>
        )}

        {/* Empty States */}
        {!loading && query && products.length === 0 && (
          <div className="text-center py-24 glass-panel rounded-3xl p-8 bg-white/40 dark:bg-slate-900/30">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">Results No Found</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-6">"{query}" සඳහා ගැලපෙන භාණ්ඩ කිසිවක් සොයා ගැනීමට නොහැකි විය.</p>
            <Link 
              href="/products" 
              className="bg-brand-primary dark:bg-violet-600 text-white px-6 py-3 rounded-xl text-xs font-bold hover:shadow-md transition active:scale-95"
            >
              All Products බලන්න
            </Link>
          </div>
        )}

        {!query && (
          <div className="text-center py-24 glass-panel rounded-3xl p-8 bg-white/40 dark:bg-slate-900/30">
            <p className="text-5xl mb-4 text-indigo-400 dark:text-violet-400">🔍</p>
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">Search Products</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">ඉහත සෙවුම් කොටුවෙන් ඔබට අවශ්‍ය පරිගණක උපාංග සොයාගන්න</p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 border-4 border-brand-primary dark:border-violet-500 border-t-transparent rounded-full animate-spin"/>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}