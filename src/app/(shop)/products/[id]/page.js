'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error('Failed to fetch product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Scroll to top when the product ID changes or when loading finishes to ensure the page starts at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!loading) {
      window.scrollTo(0, 0);
    }
  }, [loading]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = cart.findIndex(item => item.productId == product.product_id);
    
    if (index === -1) {
      cart.push({
        productId: product.product_id,
        name: product.product_name,
        price: product.price,
        image: product.image_url,
        qty: quantity
      });
    } else {
      cart[index].qty += quantity;
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    toast.success(`${product.product_name} added to cart!`);
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-8 h-8 border-4 border-brand-primary dark:border-violet-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!product || product.message === 'Product not found') return (
    <div className="min-h-screen flex flex-col items-center justify-center text-slate-400 bg-bg-primary">
      <span className="text-6xl mb-4">🖥️</span>
      <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">Product not found</h2>
      <button onClick={() => router.push('/products')} className="mt-4 bg-brand-primary dark:bg-violet-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:shadow-md transition">
        Back to Products
      </button>
    </div>
  );

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <main className="min-h-screen bg-bg-primary pb-20">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-violet-400 mb-6 flex items-center gap-1.5 transition-colors group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          <span>Back</span>
        </button>

        {/* Product Details Panel */}
        <div className="glass-panel rounded-3xl overflow-hidden bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 shadow-sm">
          <div className="grid md:grid-cols-2 gap-0">

            {/* Product Image section */}
            <div className="h-80 md:h-[450px] bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-200/65 dark:border-slate-800/65 relative">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.product_name} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-102"
                />
              ) : (
                <span className="text-8xl">🖥️</span>
              )}
            </div>

            {/* Product Info section */}
            <div className="p-8 sm:p-10 flex flex-col justify-between">
              <div>
                {/* Brand */}
                {product.brand && (
                  <span className="text-xs uppercase tracking-wider text-brand-primary dark:text-violet-400 font-extrabold mb-2 block">
                    {product.brand}
                  </span>
                )}
                
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mb-3 tracking-tight">
                  {product.product_name}
                </h1>
                
                {/* Category tag */}
                {product.category_name && (
                  <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-1 rounded-lg font-semibold mb-6">
                    Category: {product.category_name}
                  </span>
                )}
                
                {/* Description */}
                <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-4 mb-6">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {product.description || 'මෙම නිෂ්පාදනය සඳහා විස්තරයක් නොමැත.'}
                  </p>
                </div>
              </div>

              <div>
                {/* Price section */}
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-black bg-gradient-to-r from-brand-primary to-brand-accent dark:from-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    Rs. {product.price?.toLocaleString()}
                  </span>
                </div>

                {/* Stock Level Badge */}
                <div className="mb-6 flex items-center">
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-500 text-xs px-3 py-1.5 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
                      ❌ Out of Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 text-xs px-3 py-1.5 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"/>
                      ✅ In Stock ({product.stock_quantity} available)
                    </span>
                  )}
                </div>

                {/* Quantity Control Selector */}
                {!isOutOfStock && (
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quantity:</span>
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/40">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                        className="px-3.5 py-2 text-slate-500 hover:text-brand-primary dark:text-slate-400 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-lg"
                      >
                        −
                      </button>
                      <span className="px-5 py-2 font-bold text-slate-800 dark:text-slate-100 text-sm min-w-[30px] text-center">
                        {quantity}
                      </span>
                      <button 
                        onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} 
                        className="px-3.5 py-2 text-slate-500 hover:text-brand-primary dark:text-slate-400 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Action button */}
                {isOutOfStock ? (
                  <button 
                    disabled 
                    className="w-full bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 py-3.5 rounded-2xl font-bold cursor-not-allowed text-xs uppercase tracking-wider"
                  >
                    Out of Stock
                  </button>
                ) : (
                  <button 
                    onClick={addToCart} 
                    className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2 shadow-sm ${
                      added 
                        ? 'bg-emerald-500 text-white shadow-emerald-500/10' 
                        : 'bg-brand-primary hover:bg-indigo-700 text-white dark:bg-violet-600 dark:hover:bg-violet-500 shadow-indigo-500/10 hover:shadow-md'
                    }`}
                  >
                    {added ? (
                      <>
                        <span>✅</span>
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <span>🛒</span>
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}