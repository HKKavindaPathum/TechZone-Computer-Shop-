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

  // Order Detail Modal State
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);

  // User Management States
  const [users, setUsers] = useState([]);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersMessage, setUsersMessage] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Stock Update States
  const [stagedUpdates, setStagedUpdates] = useState({});
  const [bulkSearch, setBulkSearch] = useState('');
  const [bulkCategoryFilter, setBulkCategoryFilter] = useState('');
  const [selectedProductForStockModal, setSelectedProductForStockModal] = useState(null);
  const [stockAdjustMode, setStockAdjustMode] = useState('add'); // 'add' or 'set'
  const [stockAdjustValue, setStockAdjustValue] = useState('');
  const [salesPeriod, setSalesPeriod] = useState('7days');

  useEffect(() => {
    if (!isLoggedIn() || !isAdmin()) {
      router.push('/login');
      return;
    }
    setAuthChecked(true);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersMessage('');
    try {
      const token = getToken();
      const data = await api.get('/users', token);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsersMessage('❌ Failed to load users list');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setUsersMessage('');
    if (!confirm('මෙම user ගිණුම ඉවත් කිරීමට (Delete) ඔබට සහතිකද?')) return;
    try {
      const token = getToken();
      const res = await api.delete(`/users/${userId}`, token);
      if (res.message?.includes('Cannot delete')) {
        alert(res.message);
      } else {
        setUsers(users.filter(u => u.user_id !== userId));
        setUsersMessage('✅ User deleted successfully!');
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
      setUsersMessage('❌ Error deleting user');
    }
  };

  const handleToggleBlockUser = async (userId, currentBlockedStatus) => {
    const nextBlockedStatus = !currentBlockedStatus;
    setUsersMessage('');
    const actionText = nextBlockedStatus ? 'Block' : 'Unblock';
    if (!confirm(`මෙම user ගිණුම ${actionText} කිරීමට ඔබට සහතිකද?`)) return;
    try {
      const token = getToken();
      const res = await api.put(`/users/${userId}`, { is_blocked: nextBlockedStatus }, token);
      if (res.message) {
        setUsers(users.map(u => u.user_id === userId ? { ...u, is_blocked: nextBlockedStatus } : u));
        setUsersMessage(`✅ User ${actionText}ed successfully!`);
      }
    } catch (err) {
      console.error(`Failed to ${actionText} user:`, err);
      setUsersMessage(`❌ Error during user ${actionText}`);
    }
  };

  const handleSelectProductForStock = (product) => {
    const existing = stagedUpdates[product.product_id];
    setSelectedProductForStockModal(product);
    if (existing) {
      setStockAdjustMode(existing.mode);
      setStockAdjustValue(existing.value.toString());
    } else {
      setStockAdjustMode('add');
      setStockAdjustValue('');
    }
  };

  const handleStageStockUpdate = (e) => {
    e.preventDefault();
    if (!selectedProductForStockModal) return;
    const value = parseInt(stockAdjustValue);
    if (isNaN(value)) {
      alert('Please enter a valid stock value');
      return;
    }
    const currentStock = selectedProductForStockModal.stock_quantity;
    const newStock = stockAdjustMode === 'add' ? currentStock + value : value;
    if (newStock < 0) {
      alert('Stock quantity cannot be negative');
      return;
    }
    setStagedUpdates(prev => ({
      ...prev,
      [selectedProductForStockModal.product_id]: {
        product_id: selectedProductForStockModal.product_id,
        product_name: selectedProductForStockModal.product_name,
        brand: selectedProductForStockModal.brand,
        category_name: selectedProductForStockModal.category_name || categories.find(c => c.category_id === selectedProductForStockModal.category_id)?.category_name || 'General',
        stock_quantity: currentStock,
        mode: stockAdjustMode,
        value: value,
        new_stock: newStock,
        image_url: selectedProductForStockModal.image_url
      }
    }));
    setSelectedProductForStockModal(null);
    setBulkSearch('');
    setBulkCategoryFilter('');
  };

  const handleUpgradeStock = async () => {
    const updates = Object.values(stagedUpdates).map(u => ({
      product_id: u.product_id,
      stock_quantity: u.new_stock
    }));
    if (updates.length === 0) return;
    try {
      const token = getToken();
      const res = await api.put('/products/bulk-stock', { updates }, token);
      if (res.message?.includes('successfully')) {
        alert('✅ Stock updated successfully!');
        setStagedUpdates({});
        fetchData(); // Refetch products to get latest DB state
      } else {
        alert('❌ Error updating stock: ' + (res.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Failed to submit stock update:', err);
      alert('❌ Server error during stock update');
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

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

  // Get sales data for the selected period
  const getSalesChartData = () => {
    const data = [];
    const today = new Date();
    let days = 7;
    if (salesPeriod === '30days') days = 30;
    else if (salesPeriod === '90days') days = 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const fullDateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      // Determine if we should render the label on X-axis to prevent overlapping
      let showLabel = false;
      if (days === 7) {
        showLabel = true;
      } else if (days === 30) {
        showLabel = (i % 5 === 0 || i === days - 1 || i === 0);
      } else if (days === 90) {
        showLabel = (i % 15 === 0 || i === days - 1 || i === 0);
      }
      
      const dayOrders = orders.filter(o => {
        if (o.status === 'cancelled') return false;
        const orderDate = new Date(o.order_date);
        return orderDate.getDate() === d.getDate() &&
               orderDate.getMonth() === d.getMonth() &&
               orderDate.getFullYear() === d.getFullYear();
      });
      
      const totalSales = dayOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      data.push({ date: fullDateStr, showLabel, amount: totalSales });
    }
    return data;
  };

  const salesData = getSalesChartData();
  const rawMaxSalesAmount = Math.max(...salesData.map(d => d.amount), 10000);
  
  // Round up to nearest clean threshold (e.g. 1000, 10000, 100000)
  const getRoundedMaxAmount = (val) => {
    if (val <= 10000) {
      return Math.ceil(val / 1000) * 1000 || 10000;
    }
    const magnitude = Math.pow(10, Math.floor(Math.log10(val)) - 1);
    return Math.ceil(val / magnitude) * magnitude;
  };
  const maxSalesAmount = getRoundedMaxAmount(rawMaxSalesAmount);
  
  // Calculate points for SVG Area Chart
  const svgChartWidth = 520;
  const svgChartHeight = 160;
  const svgPaddingLeft = 60;
  const svgPaddingTop = 20;
  const totalPointsCount = salesData.length;
  
  const chartPoints = salesData.map((d, i) => {
    const x = svgPaddingLeft + i * (svgChartWidth / (totalPointsCount - 1 || 1));
    const y = svgPaddingTop + svgChartHeight * (1 - (d.amount / maxSalesAmount));
    return { x, y, date: d.date, showLabel: d.showLabel, amount: d.amount };
  });
  
  let salesLinePath = '';
  let salesAreaPath = '';
  if (chartPoints.length > 0) {
    salesLinePath = `M ${chartPoints[0].x} ${chartPoints[0].y} ` + chartPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    salesAreaPath = `${salesLinePath} L ${chartPoints[chartPoints.length - 1].x} 180 L ${chartPoints[0].x} 180 Z`;
  }

  // Aggregate order status stats
  const orderStatusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
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
            { id: 'bulk-stock', label: '📦 Stock' },
            { id: 'users', label: '👥 User Management' },
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
                  bg: 'bg-brand-primary/10',
                  tabLink: 'orders'
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
                  bg: 'bg-amber-500/10',
                  tabLink: 'orders'
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
                  bg: 'bg-violet-500/10',
                  tabLink: 'products'
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
                  bg: 'bg-emerald-500/10',
                  tabLink: null
                },
              ].map((stat, i) => {
                const CardComponent = stat.tabLink ? 'button' : 'div';
                return (
                  <CardComponent
                    key={i}
                    onClick={stat.tabLink ? () => { setActiveTab(stat.tabLink); if (stat.tabLink !== 'add-product') resetForm(); } : undefined}
                    className={`glass-panel rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-5 hover:shadow-md transition-all duration-300 group relative overflow-hidden text-left w-full ${
                      stat.tabLink 
                        ? 'cursor-pointer hover:border-brand-primary/50 dark:hover:border-violet-500/50 hover:-translate-y-0.5 active:scale-98' 
                        : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</span>
                      <div className={`p-2 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                        {stat.icon}
                      </div>
                    </div>
                    <p className={`text-xl sm:text-2xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
                  </CardComponent>
                );
              })}
            </div>

            {/* Charts & Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Side: Chart & Recent Orders (Col span 2) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Sales Trend Chart */}
                <div className="glass-panel rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 text-left">
                  <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
                    <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📈</span> Sales Trend
                    </h2>
                    <div className="flex items-center gap-2">
                      <select
                        value={salesPeriod}
                        onChange={(e) => setSalesPeriod(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1 text-[11px] text-slate-700 dark:text-slate-350 font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/50 dark:focus:ring-violet-500/50 cursor-pointer transition-all"
                      >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                      </select>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">
                        Live
                      </span>
                    </div>
                  </div>
                  
                  {/* SVG Area Chart */}
                  <div className="w-full overflow-x-auto scrollbar-none">
                    <svg viewBox="0 0 600 240" className="w-full min-w-[500px] h-auto overflow-visible select-none">
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Grid Lines */}
                      <line x1="60" y1="20" x2="580" y2="20" className="stroke-slate-250 dark:stroke-slate-800/50 stroke-1" strokeDasharray="4 4" />
                      <line x1="60" y1="100" x2="580" y2="100" className="stroke-slate-250 dark:stroke-slate-800/50 stroke-1" strokeDasharray="4 4" />
                      <line x1="60" y1="180" x2="580" y2="180" className="stroke-slate-250 dark:stroke-slate-800/50 stroke-1" strokeDasharray="4 4" />
                      
                      {/* Y-Axis Labels */}
                      <text x="50" y="24" textAnchor="end" className="text-[9px] fill-slate-400 dark:fill-slate-500 font-bold">
                        Rs. {maxSalesAmount >= 1000000 ? `${(maxSalesAmount / 1000000).toFixed(1)}M` : maxSalesAmount.toLocaleString()}
                      </text>
                      <text x="50" y="104" textAnchor="end" className="text-[9px] fill-slate-400 dark:fill-slate-500 font-bold">
                        Rs. {(maxSalesAmount / 2) >= 1000000 ? `${(maxSalesAmount / 2000000).toFixed(1)}M` : (maxSalesAmount / 2).toLocaleString()}
                      </text>
                      <text x="50" y="184" textAnchor="end" className="text-[9px] fill-slate-400 dark:fill-slate-500 font-bold">
                        Rs. 0
                      </text>
                      
                      {/* Area & Line */}
                      {salesAreaPath && (
                        <path d={salesAreaPath} fill="url(#salesGradient)" />
                      )}
                      {salesLinePath && (
                        <path d={salesLinePath} fill="none" className="stroke-brand-primary dark:stroke-violet-500 stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round" />
                      )}
                      
                      {/* Interactive Circles & Tooltips */}
                      {chartPoints.map((p, i) => (
                        <g className="group/dot cursor-pointer" key={i}>
                          <circle cx={p.x} cy={p.y} r="12" className="fill-transparent" />
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r={totalPointsCount > 7 ? "2.5" : "4.5"} 
                            className={`${
                              totalPointsCount > 7 
                                ? 'fill-brand-primary dark:fill-violet-400 opacity-60' 
                                : 'fill-brand-primary dark:fill-violet-400 stroke-white dark:stroke-slate-900 stroke-[2.5]'
                            } transition-all group-hover/dot:r-6 group-hover/dot:opacity-100`} 
                          />
                          
                          {/* Tooltip Card */}
                          <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <rect 
                              x={p.x - 55} 
                              y={p.y < 100 ? p.y + 12 : p.y - 42} 
                              width="110" 
                              height="34" 
                              rx="6" 
                              className="fill-slate-900/95 dark:fill-slate-950/95 stroke-slate-800/80 stroke-1 shadow-xl" 
                            />
                            <text 
                              x={p.x} 
                              y={p.y < 100 ? p.y + 24 : p.y - 30} 
                              textAnchor="middle" 
                              className="text-[9.5px] fill-slate-100 font-black"
                            >
                              Rs. {p.amount.toLocaleString()}
                            </text>
                            <text 
                              x={p.x} 
                              y={p.y < 100 ? p.y + 36 : p.y - 18} 
                              textAnchor="middle" 
                              className="text-[8px] fill-slate-400 font-bold"
                            >
                              {p.date}
                            </text>
                          </g>
                        </g>
                      ))}
                      
                      {/* X-Axis Labels */}
                      {chartPoints.map((p, i) => p.showLabel && (
                        <text key={i} x={p.x} y="210" textAnchor="middle" className="text-[9.5px] fill-slate-400 dark:fill-slate-500 font-bold">
                          {p.date}
                        </text>
                      ))}
                    </svg>
                  </div>
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
                          <button 
                            onClick={() => setSelectedOrderForModal(order)}
                            className="text-xs font-bold text-brand-primary dark:text-violet-400 hover:underline cursor-pointer focus:outline-none"
                          >
                            Order #{order.order_id}
                          </button>
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

              {/* Right Side: Order Status Breakdown (Col span 1) */}
              <div className="space-y-6">
                <div className="glass-panel rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 text-left">
                  <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-6 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
                    <span>📊</span> Order Status Breakdown
                  </h2>
                  <div className="space-y-5">
                    {[
                      { status: 'pending', label: 'Pending Orders', color: 'bg-amber-500', textColor: 'text-amber-500' },
                      { status: 'processing', label: 'Processing', color: 'bg-sky-500', textColor: 'text-sky-500' },
                      { status: 'shipped', label: 'Shipped', color: 'bg-indigo-500', textColor: 'text-indigo-500' },
                      { status: 'delivered', label: 'Delivered', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
                      { status: 'cancelled', label: 'Cancelled', color: 'bg-rose-500', textColor: 'text-rose-500' },
                    ].map((item) => {
                      const count = orderStatusCounts[item.status] || 0;
                      const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                      return (
                        <div key={item.status} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-350">{item.label}</span>
                            <span className="font-black text-slate-850 dark:text-slate-100">
                              {count} <span className="text-[10px] text-slate-405 dark:text-slate-500 font-normal">({percentage.toFixed(0)}%)</span>
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200/30 dark:border-slate-800/40">
                            <div 
                              className={`h-full ${item.color} rounded-full transition-all duration-500`} 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Additional Insight Card */}
                <div className="glass-panel rounded-2xl bg-brand-primary/5 dark:bg-violet-950/20 border border-brand-primary/10 dark:border-violet-500/10 p-5 text-left">
                  <h3 className="text-xs font-bold text-brand-primary dark:text-violet-400 uppercase tracking-wider mb-2">💡 Quick Stats</h3>
                  <div className="space-y-3 text-xs font-medium">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Average Order Value</p>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">
                        Rs. {orders.length > 0 ? Math.round(totalRevenue / (orders.filter(o => o.status !== 'cancelled').length || 1)).toLocaleString() : 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Success Delivery Rate</p>
                      <p className="text-sm font-black text-emerald-500 dark:text-emerald-400 mt-0.5">
                        {orders.length > 0 ? `${((orders.filter(o => o.status === 'delivered').length / orders.length) * 100).toFixed(0)}%` : '0%'}
                      </p>
                    </div>
                  </div>
                </div>
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
                        <button 
                          onClick={() => setSelectedOrderForModal(order)}
                          className="font-bold text-brand-primary dark:text-violet-400 hover:underline cursor-pointer focus:outline-none"
                        >
                          #{order.order_id}
                        </button>
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

        {/* TAB 5: STOCK */}
        {activeTab === 'bulk-stock' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Search and category filter section */}
            <div className="glass-panel rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 text-left">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
                <span>🔍</span> Find Products to Update
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Search Product Name / Brand</label>
                  <input 
                    type="text" 
                    value={bulkSearch}
                    onChange={(e) => setBulkSearch(e.target.value)}
                    className={inputClass}
                    placeholder="Type to search e.g. Core i5, ASUS, Logitech..."
                  />
                </div>
                <div>
                  <label className={labelClass}>Category Filter</label>
                  <select 
                    value={bulkCategoryFilter}
                    onChange={(e) => setBulkCategoryFilter(e.target.value)}
                    className={`${inputClass} font-bold`}
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Suggestions dropdown container */}
              {(bulkSearch.trim() !== '' || bulkCategoryFilter !== '') && (
                <div className="mt-4 border border-slate-200/60 dark:border-slate-800/85 rounded-xl bg-white dark:bg-slate-950 overflow-hidden shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900/80">
                  {(() => {
                    const filtered = products.filter(p => {
                      const matchesSearch = bulkSearch.trim() === '' || 
                        p.product_name.toLowerCase().includes(bulkSearch.toLowerCase()) ||
                        (p.brand && p.brand.toLowerCase().includes(bulkSearch.toLowerCase()));
                      const matchesCategory = bulkCategoryFilter === '' || 
                        p.category_id === parseInt(bulkCategoryFilter);
                      return matchesSearch && matchesCategory;
                    });

                    if (filtered.length === 0) {
                      return <p className="p-4 text-center text-xs text-slate-400 dark:text-slate-555">No products found matching your search</p>;
                    }

                    return filtered.map(product => {
                      const isStaged = !!stagedUpdates[product.product_id];
                      return (
                        <div key={product.product_id} className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover"/>
                              ) : <span className="text-xs">🖥️</span>}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-850 dark:text-slate-100 line-clamp-1">{product.product_name}</p>
                              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold uppercase mt-0.5">{product.brand || 'No Brand'} • Current: {product.stock_quantity}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSelectProductForStock(product)}
                            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black tracking-wide uppercase transition duration-200 active:scale-95 border ${
                              isStaged 
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' 
                                : 'bg-brand-primary/10 text-brand-primary dark:bg-indigo-500/10 dark:text-indigo-400 border-brand-primary/20 hover:bg-brand-primary/20 dark:hover:bg-indigo-500/20'
                            }`}
                          >
                            {isStaged ? '✏️ Staged' : '＋ Select'}
                          </button>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

            {/* Staged Updates list */}
            <div className="glass-panel rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 text-left">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-6 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
                <span>📦</span> Staged Stock Upgrades
              </h2>

              {Object.keys(stagedUpdates).length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <div className="text-3xl mb-2">📥</div>
                  <p className="text-xs font-medium">Staged updates will show up here. Use the search bar above to stage adjustments.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead className="border-b border-slate-200/60 dark:border-slate-800/50">
                      <tr>
                        {['Product', 'Category', 'Current', 'Adjustment', 'New Stock', 'Actions'].map(h => (
                          <th key={h} className="pb-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150/40 dark:divide-slate-850/30 text-xs">
                      {Object.values(stagedUpdates).map(item => (
                        <tr key={item.product_id} className="hover:bg-slate-100/20 dark:hover:bg-slate-850/10 font-medium transition-colors">
                          <td className="py-3.5 pr-4 flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-100 dark:bg-slate-950 border border-slate-200/45 dark:border-slate-850/45 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover"/>
                              ) : <span className="text-xs">🖥️</span>}
                            </div>
                            <div>
                              <p className="font-bold text-slate-850 dark:text-slate-100 line-clamp-1">{item.product_name}</p>
                              <p className="text-[10px] text-slate-450 uppercase font-black">{item.brand}</p>
                            </div>
                          </td>
                          <td className="py-3.5 text-slate-500 dark:text-slate-400 font-semibold">{item.category_name}</td>
                          <td className="py-3.5 text-slate-600 dark:text-slate-400 font-bold">{item.stock_quantity}</td>
                          <td className="py-3.5">
                            {item.mode === 'add' ? (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                item.value >= 0 
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                              }`}>
                                {item.value >= 0 ? `+${item.value}` : item.value}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-violet-500/10 text-violet-500 dark:text-violet-400 border-violet-500/20">
                                ={item.value}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200">{item.new_stock}</td>
                          <td className="py-3.5">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  const p = products.find(prod => prod.product_id === item.product_id);
                                  if (p) handleSelectProductForStock(p);
                                }}
                                className="bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg text-[9px] font-bold transition duration-200 active:scale-95"
                              >
                                ✏️ Edit
                              </button>
                              <button 
                                onClick={() => {
                                  const newStaged = { ...stagedUpdates };
                                  delete newStaged[item.product_id];
                                  setStagedUpdates(newStaged);
                                }}
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 px-2.5 py-1.5 rounded-lg text-[9px] font-bold transition duration-200 active:scale-95"
                              >
                                🗑️ Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sticky footer action bar */}
            {Object.keys(stagedUpdates).length > 0 && (
              <div className="sticky bottom-6 inset-x-0 glass-panel rounded-2xl bg-white/85 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl p-4 flex items-center justify-between animate-in slide-in-from-bottom duration-300 z-10">
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-850 dark:text-slate-100">Pending Changes</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{Object.keys(stagedUpdates).length} products staged for updates</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (confirm('මෙම සියලු staged updates ඉවත් කිරීමට (Discard) ඔබට සහතිකද?')) {
                        setStagedUpdates({});
                      }
                    }}
                    className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
                  >
                    Discard All
                  </button>
                  <button 
                    onClick={handleUpgradeStock}
                    className="bg-brand-primary hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white px-5 py-2 rounded-xl text-xs font-black transition active:scale-95 cursor-pointer"
                  >
                    🚀 Upgrade Stock
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="glass-panel rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 text-left">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-6 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
                <span>👥</span> User Accounts
              </h2>

              {usersMessage && (
                <div className={`px-4 py-3 rounded-xl mb-6 text-xs font-semibold ${
                  usersMessage.includes('✅') 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                }`}>
                  {usersMessage}
                </div>
              )}

              {/* User search bar */}
              <div className="mb-6 max-w-md">
                <label className={labelClass}>Search Users</label>
                <input 
                  type="text" 
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  className={inputClass}
                  placeholder="Filter users by name or email..."
                />
              </div>

              {usersLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="w-6 h-6 border-3 border-brand-primary dark:border-violet-500 border-t-transparent rounded-full animate-spin"/>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="border-b border-slate-200/60 dark:border-slate-800/50">
                      <tr>
                        {['User ID', 'Name', 'Email / Phone', 'Address', 'Role', 'Actions'].map(h => (
                          <th key={h} className="pb-3 px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150/40 dark:divide-slate-850/30 text-xs">
                      {(() => {
                        const filtered = users.filter(u => 
                          u.name.toLowerCase().includes(usersSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(usersSearch.toLowerCase())
                        );

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan="6" className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">No users found.</td>
                            </tr>
                          );
                        }

                        // Try to extract current user's ID to prevent self-deletion UI logic
                        let currentUserId = null;
                        try {
                          const token = getToken();
                          if (token) {
                            const decoded = JSON.parse(atob(token.split('.')[1]));
                            currentUserId = decoded.userId;
                          }
                        } catch (e) {}

                        return filtered.map(user => (
                          <tr key={user.user_id} className="hover:bg-slate-100/20 dark:hover:bg-slate-850/10 font-medium transition-colors">
                            <td className="py-4.5 px-4 font-bold text-slate-800 dark:text-slate-100">#{user.user_id}</td>
                            <td className="py-4.5 px-4">
                              <p className="font-bold text-slate-850 dark:text-slate-100">{user.name}</p>
                              {currentUserId === user.user_id && (
                                <span className="text-[9px] bg-brand-primary/10 text-brand-primary dark:text-violet-400 px-2 py-0.5 rounded-full font-bold">You</span>
                              )}
                            </td>
                            <td className="py-4.5 px-4">
                              <p className="text-slate-800 dark:text-slate-200">{user.email}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{user.phone || 'No Phone'}</p>
                            </td>
                            <td className="py-4.5 px-4 text-slate-500 dark:text-slate-400 font-semibold max-w-xs truncate">{user.address || 'Not Provided'}</td>
                            <td className="py-4.5 px-4">
                              <div className="flex flex-col gap-1.5 items-start">
                                <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold border ${
                                  user.role === 'admin' 
                                    ? 'bg-violet-500/10 text-violet-500 border-violet-500/20' 
                                    : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                }`}>
                                  {user.role}
                                </span>
                                {user.is_blocked && (
                                  <span className="text-[9.5px] px-2 py-0.5 rounded-md font-extrabold bg-rose-500/10 text-rose-500 border border-rose-500/25">
                                    🔒 Blocked
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4.5 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleToggleBlockUser(user.user_id, user.is_blocked)}
                                  disabled={currentUserId === user.user_id}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition duration-200 active:scale-95 ${
                                    currentUserId === user.user_id
                                      ? 'opacity-45 cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                                      : user.is_blocked
                                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-450'
                                  }`}
                                >
                                  {user.is_blocked ? '🔓 Unblock' : '🔒 Block'}
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(user.user_id)}
                                  disabled={currentUserId === user.user_id}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition duration-200 active:scale-95 ${
                                    currentUserId === user.user_id 
                                      ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-450 dark:bg-slate-800 dark:text-slate-600'
                                      : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500'
                                  }`}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ==================== ORDER DETAILS MODAL ==================== */}
      {selectedOrderForModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] text-left animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Order Details</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Order ID: #{selectedOrderForModal.order_id} • Placed on {new Date(selectedOrderForModal.order_date).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedOrderForModal(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition active:scale-90"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Two Column details: Customer Info & Payment/Shipping details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Customer Information */}
                <div className="bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/55 dark:border-slate-850/55 rounded-xl p-4">
                  <h4 className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                    <span>👤</span> Customer profile
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Name:</span>
                      <span className="font-bold text-slate-850 dark:text-slate-100">{selectedOrderForModal.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Email:</span>
                      <span className="font-bold text-slate-850 dark:text-slate-100 select-all">{selectedOrderForModal.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Phone:</span>
                      <span className="font-bold text-slate-850 dark:text-slate-100 select-all">{selectedOrderForModal.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Order / Shipping details */}
                <div className="bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/55 dark:border-slate-855/55 rounded-xl p-4">
                  <h4 className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                    <span>💳</span> Order Summary & Payments
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Payment Method:</span>
                      <span className="font-bold text-slate-850 dark:text-slate-100 uppercase">{selectedOrderForModal.payment_method || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Payment Status:</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase ${
                        selectedOrderForModal.payment_status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {selectedOrderForModal.payment_status || 'pending'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Order Status:</span>
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold border ${statusColor(selectedOrderForModal.status)}`}>
                        {selectedOrderForModal.status}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Shipping Address (Full-width block) */}
              <div className="bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/55 dark:border-slate-855/55 rounded-xl p-4">
                <h4 className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <span>📍</span> Shipping Address
                </h4>
                <p className="font-semibold text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line select-all">{selectedOrderForModal.shipping_address}</p>
              </div>

              {/* Staged Items List */}
              <div>
                <h4 className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-3">Ordered Items</h4>
                <div className="border border-slate-200/60 dark:border-slate-800/80 rounded-xl overflow-hidden bg-white dark:bg-slate-950/20">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100/50 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800/50">
                      <tr>
                        {['Product', 'Price', 'Qty', 'Total'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150/40 dark:divide-slate-850/35">
                      {selectedOrderForModal.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-100/20 dark:hover:bg-slate-850/10">
                          <td className="px-4 py-3 flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850/40 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {item.image_url ? (
                                  <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover"/>
                                ) : <span className="text-[10px]">🖥️</span>}
                            </div>
                            <div>
                              <p className="font-bold text-slate-850 dark:text-slate-100 line-clamp-1">{item.product_name}</p>
                              <p className="text-[9px] text-slate-455 uppercase font-black">{item.brand}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-355">Rs. {item.unit_price.toLocaleString()}</td>
                          <td className="px-4 py-3 font-bold text-slate-850 dark:text-slate-200">{item.quantity}</td>
                          <td className="px-4 py-3 font-bold text-brand-primary dark:text-violet-400">Rs. {(item.unit_price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</p>
                <p className="text-lg font-black text-brand-primary dark:text-violet-400">Rs. {selectedOrderForModal.total_amount.toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedOrderForModal(null)}
                className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold transition active:scale-95 cursor-pointer"
              >
                Close Detail
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================== STOCK ADJUSTMENT MODAL (CONFIG WINDOW) ==================== */}
      {selectedProductForStockModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col text-left animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4.5 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">🔧 Adjust Stock level</h3>
              <button 
                onClick={() => setSelectedProductForStockModal(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-750 flex items-center justify-center text-slate-500 dark:text-slate-400 transition active:scale-90"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStageStockUpdate} className="p-6 space-y-5">
              {/* Product mini card */}
              <div className="flex items-center gap-3.5 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/65">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {selectedProductForStockModal.image_url ? (
                    <img src={selectedProductForStockModal.image_url} alt={selectedProductForStockModal.product_name} className="w-full h-full object-cover"/>
                  ) : <span className="text-base">🖥️</span>}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{selectedProductForStockModal.product_name}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase mt-0.5">{selectedProductForStockModal.brand || 'No Brand'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-200/50 dark:border-slate-850/50 text-center">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Current Stock</span>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1 block">{selectedProductForStockModal.stock_quantity}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-200/50 dark:border-slate-850/50 text-center">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Live Preview</span>
                  {(() => {
                    const val = parseInt(stockAdjustValue) || 0;
                    const next = stockAdjustMode === 'add' ? selectedProductForStockModal.stock_quantity + val : val;
                    const diff = next - selectedProductForStockModal.stock_quantity;
                    return (
                      <div className="mt-1 flex items-center justify-center gap-1.5">
                        <span className="text-base font-black text-slate-855 dark:text-slate-100">{next >= 0 ? next : '—'}</span>
                        {val !== 0 && next >= 0 && (
                          <span className={`text-[9.5px] font-extrabold ${diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            ({diff >= 0 ? `+${diff}` : diff})
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div>
                <label className={labelClass}>Adjustment Mode</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950 border border-slate-250/20 dark:border-slate-800/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setStockAdjustMode('add')}
                    className={`py-2 text-[10.5px] font-bold rounded-lg transition-all ${
                      stockAdjustMode === 'add'
                        ? 'bg-white dark:bg-slate-900 text-brand-primary dark:text-violet-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    ➕ Add to Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockAdjustMode('set')}
                    className={`py-2 text-[10.5px] font-bold rounded-lg transition-all ${
                      stockAdjustMode === 'set'
                        ? 'bg-white dark:bg-slate-900 text-brand-primary dark:text-violet-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    ✍️ Set Total Stock
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  {stockAdjustMode === 'add' ? 'Add Quantity (use negative to reduce)' : 'New Total Stock'}
                </label>
                <input
                  type="number"
                  value={stockAdjustValue}
                  onChange={(e) => setStockAdjustValue(e.target.value)}
                  className={inputClass}
                  placeholder={stockAdjustMode === 'add' ? 'e.g. 50 or -10' : 'e.g. 25'}
                  required
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setSelectedProductForStockModal(null)}
                  className="flex-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 py-2.5 rounded-xl text-xs font-bold transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-primary hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white py-2.5 rounded-xl text-xs font-bold transition active:scale-95"
                >
                  Stage Update
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </main>
  );
}