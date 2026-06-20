'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getUser, isLoggedIn, isAdmin, logout } from '@/lib/auth';
import { getTheme, setTheme, applyTheme } from '@/lib/theme';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState('light');

  useEffect(() => {
    setMounted(true);
    if (isLoggedIn()) {
      setUser(getUser());
      setIsAdminUser(isAdmin());
    } else {
      setUser(null);
      setIsAdminUser(false);
    }
    const savedTheme = getTheme();
    setThemeState(savedTheme);
    applyTheme(savedTheme);
    updateCartCount();
    
    // Close menus on path change
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, [pathname]);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    setCartCount(count);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsAdminUser(false);
    router.push('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = e.target.search.value;
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      e.target.search.value = '';
    }
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(mobileSearch.trim())}`);
      setMobileSearch('');
      setMobileMenuOpen(false);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  };

  if (!mounted) return (
    <nav className="glass-nav border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50 h-16 w-full"/>
  );

  return (
    <nav className="glass-nav sticky top-0 z-50 transition-all duration-300 w-full">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link 
          href="/" 
          className="text-lg font-bold bg-gradient-to-r from-brand-primary to-brand-accent dark:from-violet-400 dark:to-cyan-400 bg-clip-text text-transparent flex items-center gap-1.5 flex-shrink-0"
        >
          <span className="text-xl">💻</span>
          <span className="hidden sm:inline font-black tracking-tight">TechZone</span>
        </Link>

        {/* Desktop Menu Link Options */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className={`text-sm font-semibold transition-colors duration-200 ${
              pathname === '/' 
                ? 'text-brand-primary dark:text-violet-400' 
                : 'text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-violet-400'
            }`}
          >
            Home
          </Link>
          <Link 
            href="/products" 
            className={`text-sm font-semibold transition-colors duration-200 ${
              pathname === '/products' 
                ? 'text-brand-primary dark:text-violet-400' 
                : 'text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-violet-400'
            }`}
          >
            Products
          </Link>
          {isAdminUser && (
            <Link 
              href="/admin/dashboard" 
              className={`text-sm font-semibold transition-colors duration-200 ${
                pathname.startsWith('/admin') 
                  ? 'text-brand-primary dark:text-violet-400' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-violet-400'
              }`}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs relative group">
          <input
            name="search"
            type="text"
            placeholder="Search products..."
            className="w-full bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 dark:focus:ring-violet-500/50 transition-all duration-300"
          />
          <button 
            type="submit" 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-primary dark:hover:text-violet-400 transition-colors text-xs"
          >
            🔍
          </button>
        </form>

        {/* Right Nav Options */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 text-sm"
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Cart Icon */}
          <Link href="/cart" className="relative w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">
            <span className="text-sm">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-primary dark:bg-violet-600 text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold animate-pulse shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Section */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-brand-primary to-brand-accent dark:from-violet-500 dark:to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-xs font-semibold text-slate-700 dark:text-slate-200 pr-1">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-800/80 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1.5">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{user.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Link 
                    href="/orders" 
                    onClick={() => setUserDropdownOpen(false)} 
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span>📦</span> My Orders
                  </Link>
                  {isAdminUser && (
                    <Link 
                      href="/admin/dashboard" 
                      onClick={() => setUserDropdownOpen(false)} 
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span>⚙️</span> Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-t border-slate-100 dark:border-slate-800/50 mt-1.5 pt-2"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-brand-primary hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 hover:shadow-md active:scale-95"
            >
              Login
            </Link>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button 
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setUserDropdownOpen(false);
            }} 
            className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 text-base"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800/80 px-6 py-4 flex flex-col gap-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md animate-in slide-in-from-top duration-300">
          <form onSubmit={handleMobileSearch} className="flex items-center relative">
            <input
              type="text"
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 dark:focus:ring-violet-500/50"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</button>
          </form>
          <div className="flex flex-col gap-3.5 py-1">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-primary dark:hover:text-violet-400 transition-colors">Home</Link>
            <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-primary dark:hover:text-violet-400 transition-colors">Products</Link>
            <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-primary dark:hover:text-violet-400 transition-colors flex items-center justify-between">
              <span>Cart 🛒</span>
              {cartCount > 0 && <span className="bg-brand-primary dark:bg-violet-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{cartCount}</span>}
            </Link>
            {user && <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-primary dark:hover:text-violet-400 transition-colors">My Orders</Link>}
            {isAdminUser && <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-primary dark:hover:text-violet-400 transition-colors">Admin Dashboard</Link>}
          </div>
        </div>
      )}
    </nav>
  );
}