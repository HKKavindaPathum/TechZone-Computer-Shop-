'use client';
import Link from 'next/link';

export default function CartItem({ item, onUpdateQty, onRemove }) {
  const subtotal = item.price * item.qty;

  return (
    <div className="glass-panel rounded-2xl p-4 flex gap-4 bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 shadow-sm transition-all duration-300 hover:shadow-md">
      
      {/* Thumbnail */}
      <Link 
        href={`/products/${item.productId}`}
        className="w-20 h-20 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/50"
      >
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-3xl">🖥️</span>
        )}
      </Link>

      {/* Details & Actions */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <div>
            <Link href={`/products/${item.productId}`}>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1 line-clamp-1 hover:text-brand-primary dark:hover:text-violet-400 transition-colors">
                {item.name}
              </h3>
            </Link>
            <p className="text-sm font-medium text-brand-primary dark:text-violet-400">
              Rs. {item.price?.toLocaleString()}
            </p>
          </div>
          
          <button 
            onClick={() => onRemove(item.productId)}
            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
            title="Remove item"
          >
            🗑️
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/50 dark:border-slate-800/50">
          {/* Quantity selector */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/40">
            <button 
              onClick={() => onUpdateQty(item.productId, item.qty - 1)}
              className="px-2.5 py-1 text-slate-500 hover:text-brand-primary dark:text-slate-400 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold"
            >
              −
            </button>
            <span className="px-3 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 min-w-[20px] text-center">
              {item.qty}
            </span>
            <button 
              onClick={() => onUpdateQty(item.productId, item.qty + 1)}
              className="px-2.5 py-1 text-slate-500 hover:text-brand-primary dark:text-slate-400 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold"
            >
              +
            </button>
          </div>
          
          {/* Subtotal */}
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            Rs. {subtotal.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
