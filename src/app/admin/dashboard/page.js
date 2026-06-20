'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isAdmin, isLoggedIn } from '@/lib/auth';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [productForm, setProductForm] = useState({
    product_name: '', brand: '', description: '',
    price: '', stock_quantity: '', image_url: '', category_id: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [formMessage, setFormMessage] = useState('');

  // Image upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isLoggedIn() || !isAdmin()) {
      router.push('/login');
      return;
    }
    setAuthChecked(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getToken();
      const [ords, prods, cats] = await Promise.all([
        api.get('/orders', token),
        api.get('/products'),
        api.get('/categories')
      ]);
      setOrders(Array.isArray(ords) ? ords : []);
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setOrders([]);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = getToken();
      const data = await api.put(`/orders/${orderId}/status`, { status }, token);
      if (data.message) {
        setOrders(orders.map(o => o.order_id === orderId ? { ...o, status } : o));
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Error updating order status');
    }
  };

  const statusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/30',
      processing: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border-sky-200 dark:border-sky-900/30',
      shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30',
      delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30',
      cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/30',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
  };

  // =================== IMAGE UPLOAD ===================
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return productForm.image_url;
    setUploading(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('image', imageFile);

      // Centralized API call using the custom upload helper
      const data = await api.upload('/upload', formData, token);

      if (data.url) {
        setProductForm(prev => ({ ...prev, image_url: data.url }));
        setImageFile(null);
        return data.url;
      } else {
        alert('Upload failed: ' + (data.message || 'Unknown error'));
        return productForm.image_url;
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Image upload failed!');
      return productForm.image_url;
    } finally {
      setUploading(false);
    }
  };

  // =================== PRODUCT FORM ===================
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');

    let imageUrl = productForm.image_url;
    if (imageFile) {
      imageUrl = await uploadImage();
    }

    try {
      const token = getToken();
      const submitData = { ...productForm, image_url: imageUrl };

      if (editingProduct) {
        const data = await api.put(`/products/${editingProduct}`, submitData, token);
        if (data.message?.includes('error') || data.message?.includes('failed')) {
          setFormMessage('❌ ' + data.message);
        } else {
          setFormMessage('✅ Product updated successfully!');
          resetForm();
          fetchData();
        }
      } else {
        const data = await api.post('/products', submitData, token);
        if (data.productId) {
          setFormMessage('✅ Product added successfully!');
          resetForm();
          fetchData();
        } else {
          setFormMessage('❌ ' + (data.message || 'Error occurred'));
        }
      }
    } catch (err) {
      console.error('Failed to save product:', err);
      setFormMessage('❌ Error occurred saving product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product.product_id);
    setProductForm({
      product_name: product.product_name,
      brand: product.brand || '',
      description: product.description || '',
      price: product.price,
      stock_quantity: product.stock_quantity,
      image_url: product.image_url || '',
      category_id: product.category_id
    });
    setImagePreview(product.image_url || '');
    setImageFile(null);
    setActiveTab('add-product');
    window.scrollTo(0, 0);
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('මෙම product එක ඉවත් කිරීමට (Delete) ඔබට සහතිකද?')) return;
    try {
      const token = getToken();
      const res = await api.delete(`/products/${productId}`, token);
      if (res.message?.includes('Cannot delete')) {
        alert(res.message);
      } else {
        setProducts(products.filter(p => p.product_id !== productId));
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Error deleting product');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setProductForm({ product_name: '', brand: '', description: '', price: '', stock_quantity: '', image_url: '', category_id: '' });
    setImageFile(null);
    setImagePreview('');
    setFormMessage('');
  };

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const inputClass = "w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 dark:focus:ring-violet-500/50 transition-all font-medium";
  const labelClass = "block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5";

  if (!authChecked) return null;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-8 h-8 border-4 border-brand-primary dark:border-violet-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <main className="min-h-screen bg-bg-primary pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">භාණ්ඩ, ඇණවුම් සහ සංඛ්‍යාලේඛන කළමනාකරණය</p>
        </div>

        {/* Tab Buttons bar (Modern sliding capsule design) */}
        <div className="flex gap-1.5 overflow-x-auto p-1.5 scrollbar-none mb-8 bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200/65 dark:border-slate-800/80 rounded-2xl w-fit max-w-full">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'orders', label: '📦 Orders' },
            { id: 'products', label: '🖥️ Products' },
            { id: 'add-product', label: editingProduct ? '✏️ Edit Product' : '➕ Add Product' },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (tab.id !== 'add-product') resetForm(); }}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex-shrink-0 active:scale-95 ${
                  isActive 
                    ? 'bg-white dark:bg-slate-900 text-brand-primary dark:text-violet-400 shadow-sm border border-slate-200/30 dark:border-slate-800/30' 
                    : 'text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Stats list */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                { 
                  label: 'Total Orders', 
                  value: orders.length, 
                  color: 'text-brand-primary dark:text-indigo-400',
                  icon: (
                    <svg className="w-4 h-4 text-brand-primary dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  ),
                  bg: 'bg-brand-primary/10'
                },
                { 
                  label: 'Pending Orders', 
                  value: pendingOrders, 
                  color: 'text-amber-500 dark:text-amber-450',
                  icon: (
                    <svg className="w-4 h-4 text-amber-500 dark:text-amber-450" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  bg: 'bg-amber-500/10'
                },
                { 
                  label: 'Total Products', 
                  value: products.length, 
                  color: 'text-violet-500 dark:text-violet-400',
                  icon: (
                    <svg className="w-4 h-4 text-violet-500 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  bg: 'bg-violet-500/10'
                },
                { 
                  label: 'Total Revenue', 
                  value: `Rs. ${totalRevenue.toLocaleString()}`, 
                  color: 'text-emerald-500 dark:text-emerald-400',
                  icon: (
                    <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  bg: 'bg-emerald-500/10'
                },
              ].map((stat, i) => (
                <div key={i} className="glass-panel rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-5 hover:shadow-md transition-all duration-300 group relative overflow-hidden text-left">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</span>
                    <div className={`p-2 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                      {stat.icon}
                    </div>
                  </div>
                  <p className={`text-xl sm:text-2xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders table */}
            <div className="glass-panel rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 text-left">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-6 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
                <span>📋</span> Recent Orders
              </h2>
              <div className="space-y-4">
                {orders.slice(0, 5).map(order => (
                  <div key={order.order_id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-150/40 dark:border-slate-800/30 last:border-0 last:pb-0 gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Order #{order.order_id}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-550 font-medium mt-0.5">{order.name} • {order.email}</p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                      <p className="text-xs font-black text-brand-primary dark:text-violet-400">Rs. {parseFloat(order.total_amount).toLocaleString()}</p>
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold border ${statusColor(order.status)}`}>{order.status}</span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-center py-6 text-xs text-slate-400">No orders placed yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS LIST */}
        {activeTab === 'orders' && (
          <div className="glass-panel rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden animate-in fade-in duration-300">
            {/* Scrollable table container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="bg-slate-100/50 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800/50">
                  <tr>
                    {['Order', 'Customer', 'Amount', 'Status', 'Update Status'].map(h => (
                      <th key={h} className="px-6 py-4.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150/40 dark:divide-slate-850/30 text-xs">
                  {orders.map(order => (
                    <tr key={order.order_id} className="hover:bg-slate-100/30 dark:hover:bg-slate-850/15 font-medium transition-colors">
                      <td className="px-6 py-4.5">
                        <p className="font-bold text-slate-800 dark:text-slate-100">#{order.order_id}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">{new Date(order.order_date).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4.5">
                        <p className="text-slate-800 dark:text-slate-100 font-bold">{order.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">{order.email}</p>
                      </td>
                      <td className="px-6 py-4.5 font-black text-brand-primary dark:text-violet-400">Rs. {parseFloat(order.total_amount).toLocaleString()}</td>
                      <td className="px-6 py-4.5">
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold border ${statusColor(order.status)}`}>{order.status}</span>
                      </td>
                      <td className="px-6 py-4.5">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/50 dark:focus:ring-violet-500/50 cursor-pointer transition-all"
                        >
                          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-slate-400 font-medium">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS LIST */}
        {activeTab === 'products' && (
          <div className="glass-panel rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden animate-in fade-in duration-300">
            {/* Scrollable table container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="bg-slate-100/50 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800/50">
                  <tr>
                    {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150/40 dark:divide-slate-850/30 text-xs">
                  {products.map(product => (
                    <tr key={product.product_id} className="hover:bg-slate-100/30 dark:hover:bg-slate-850/15 font-medium transition-colors">
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/40 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover"/>
                            ) : <span className="text-base">🖥️</span>}
                          </div>
                          <div>
                            <p className="font-bold text-slate-850 dark:text-slate-100 line-clamp-1">{product.product_name}</p>
                            <p className="text-[10px] text-slate-450 mt-1 font-extrabold uppercase tracking-wide">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 font-semibold">{product.category_name}</td>
                      <td className="px-6 py-4.5 font-black text-brand-primary dark:text-violet-400">Rs. {parseFloat(product.price).toLocaleString()}</td>
                      <td className="px-6 py-4.5">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${
                          product.stock_quantity > 0 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}>
                          {product.stock_quantity} available
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex gap-2">
                          <button onClick={() => handleEditProduct(product)} className="bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 px-3 py-1.5 rounded-xl text-[10px] font-bold transition duration-200 active:scale-95 transform">
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDeleteProduct(product.product_id)} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 px-3 py-1.5 rounded-xl text-[10px] font-bold transition duration-200 active:scale-95 transform">
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-slate-400 font-medium">No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ADD/EDIT PRODUCT FORM */}
        {activeTab === 'add-product' && (
          <div className="max-w-2xl animate-in fade-in duration-200">
            <div className="glass-panel rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 shadow-sm p-6 sm:p-8">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-6 uppercase tracking-wider pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
                {editingProduct ? '✏️ Edit Product details' : '➕ Add New Product'}
              </h2>

              {formMessage && (
                <div className={`px-4 py-3 rounded-xl mb-6 text-xs font-semibold ${
                  formMessage.includes('✅') 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                }`}>
                  {formMessage}
                </div>
              )}

              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Product Name</label>
                    <input type="text" required value={productForm.product_name} onChange={(e) => setProductForm({ ...productForm, product_name: e.target.value })} className={inputClass} placeholder="e.g. Core i5 Laptop"/>
                  </div>
                  <div>
                    <label className={labelClass}>Brand</label>
                    <input type="text" value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} className={inputClass} placeholder="e.g. ASUS"/>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea rows={3} required value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className={`${inputClass} resize-none`} placeholder="Product එක පිළිබඳ විස්තරයක්..."/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Price (Rs.)</label>
                    <input type="number" required min="0" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className={inputClass} placeholder="e.g. 150000"/>
                  </div>
                  <div>
                    <label className={labelClass}>Stock Quantity</label>
                    <input type="number" required min="0" value={productForm.stock_quantity} onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })} className={inputClass} placeholder="e.g. 10"/>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Category</label>
                  <select required value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })} className={`${inputClass} font-bold`}>
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                    ))}
                  </select>
                </div>

                {/* Cloudinary Image Selector and Uploader */}
                <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-4 mt-6">
                  <label className={labelClass}>Product Image</label>

                  {/* Thumbnail Preview */}
                  {(imagePreview || productForm.image_url) && (
                    <div className="mb-3.5 relative w-28 h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <img
                        src={imagePreview || productForm.image_url}
                        alt="Product Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* File Input */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400 focus:outline-none cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-brand-primary/10 file:text-brand-primary dark:file:bg-violet-500/10 dark:file:text-violet-400 hover:file:bg-brand-primary/20 dark:hover:file:bg-violet-500/20"
                  />

                  {/* Cloudinary Upload Trigger button */}
                  {imageFile && (
                    <button
                      type="button"
                      onClick={uploadImage}
                      disabled={uploading}
                      className="mt-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition disabled:opacity-50 flex items-center gap-1.5 shadow-sm shadow-emerald-600/10 active:scale-95"
                    >
                      {uploading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                          Uploading...
                        </>
                      ) : '☁️ Upload to Cloudinary'}
                    </button>
                  )}

                  {productForm.image_url && !imageFile && (
                    <p className="text-[10px] text-emerald-500 font-bold mt-1.5 flex items-center gap-1">
                      <span>✅</span>
                      <span>Image uploaded and ready</span>
                    </p>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200/40 dark:border-slate-800/40 mt-6">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-brand-primary hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white py-3 rounded-xl text-xs font-bold transition disabled:opacity-50 active:scale-98"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  {editingProduct && (
                    <button 
                      type="button" 
                      onClick={() => { resetForm(); setActiveTab('products'); }} 
                      className="flex-1 border border-slate-250 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-98"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}