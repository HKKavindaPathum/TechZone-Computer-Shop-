'use client';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = cart.findIndex(item => item.productId == product.product_id);
    
    if (index === -1) {
      cart.push({
        productId: product.product_id,
        name: product.product_name,
        price: product.price,
        image: product.image_url,
        qty: 1
      });
    } else {
      cart[index].qty += 1;
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Notify Navbar to update cart count
    window.dispatchEvent(new Event('cartUpdated'));
    
    toast.success(`${product.product_name} added to cart!`);
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="glass-panel glow-card rounded-2xl overflow-hidden flex flex-col h-full bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 group shadow-sm hover:shadow-md">
      
      {/* Product Image Section */}
      <Link href={`/products/${product.product_id}`} className="relative block h-48 bg-slate-100 dark:bg-slate-950 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950">
            🖥️
          </div>
        )}
        
        {/* Stock status tag */}
        {isOutOfStock ? (
          <span className="absolute top-3 right-3 bg-red-500/90 text-white text-xs px-2.5 py-1 rounded-full font-semibold backdrop-blur-sm shadow-sm">
            Out of Stock
          </span>
        ) : product.stock_quantity <= 5 ? (
          <span className="absolute top-3 right-3 bg-amber-500/90 text-white text-xs px-2.5 py-1 rounded-full font-semibold backdrop-blur-sm shadow-sm">
            Only {product.stock_quantity} left
          </span>
        ) : null}
      </Link>

      {/* Details Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand */}
          {product.brand && (
            <span className="text-xs uppercase tracking-wider text-brand-primary dark:text-violet-400 font-bold mb-1.5 block">
              {product.brand}
            </span>
          )}
          
          {/* Title */}
          <Link href={`/products/${product.product_id}`}>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2 line-clamp-2 hover:text-brand-primary dark:hover:text-violet-400 transition-colors duration-200 min-h-[40px]">
              {product.product_name}
            </h3>
          </Link>
          
          {/* Category */}
          {product.category_name && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
              {product.category_name}
            </p>
          )}
        </div>

        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between mb-4 mt-2">
            <span className="text-lg font-bold bg-gradient-to-r from-brand-primary to-brand-accent dark:from-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Rs. {product.price?.toLocaleString()}
            </span>
          </div>

          {/* Action Button */}
          {isOutOfStock ? (
            <button
              disabled
              className="w-full bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 py-2.5 px-4 rounded-xl text-xs font-semibold cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-1.5 shadow-sm ${
                added
                  ? 'bg-emerald-500 text-white shadow-emerald-500/10'
                  : 'bg-brand-primary hover:bg-indigo-700 text-white dark:bg-violet-600 dark:hover:bg-violet-500 shadow-indigo-500/10 hover:shadow-md'
              }`}
            >
              {added ? (
                <>
                  <span>✅</span>
                  <span>Added!</span>
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
  );
}
