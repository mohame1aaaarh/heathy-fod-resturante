import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MenuItem, Order, DeliveryZone, ProductSize, Category, ProductAddon, NutritionFact } from '../../types';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'loading';
}

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'zones' | 'categories'>('orders');
  
  // Order Sub-tabs
  const [orderSubTab, setOrderSubTab] = useState<'pending' | 'active' | 'history'>('pending');

  // Product Form Visibility
  const [showProductForm, setShowProductForm] = useState(false);
  
  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    if (type !== 'loading') {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    }
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Forms States
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<MenuItem>>({ currency: 'ج.م', is_featured: false, is_available: true, is_hidden: false, has_sizes: false, sizes: [], addons: [], nutritionFacts: [] });
  // Temp state for adding a new size line
  const [tempSize, setTempSize] = useState<ProductSize>({ name: '', price: 0 });
  const [tempAddon, setTempAddon] = useState<ProductAddon>({ name: '', price: 0 });
  const [tempNutritionFact, setTempNutritionFact] = useState<NutritionFact>({ label: '', value: '' });

  
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [newZone, setNewZone] = useState<Partial<DeliveryZone>>({ active: true });

  // Category Form State
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({ has_spicy_option: false, sort_order: 0 });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'la-prama-admin' && password === 'laprama@2025') {
      setIsAuthenticated(true);
      fetchData();
    } else {
      showToast('بيانات الدخول غير صحيحة', 'error');
    }
  };

  const fetchData = async () => {
    const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (ordersData) setOrders(ordersData as any);

    const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (productsData) setProducts(productsData.map(p => ({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle,
        price: p.price,
        currency: p.currency,
        imageUrl: p.image_url,
        category: p.category,
        is_featured: p.is_featured,
        is_available: p.is_available,
        is_hidden: p.is_hidden,
        has_sizes: p.has_sizes,
        sizes: p.sizes,
        addons: p.addons || [],
        nutritionFacts: p.nutrition_facts || []
    })));

    const { data: zonesData } = await supabase.from('delivery_zones').select('*').order('name', { ascending: true });
    if (zonesData) setZones(zonesData);
    
    const { data: catsData } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
    if (catsData) setCategories(catsData);

    setInitialLoading(false);
  };

  // --- ORDER ACTIONS ---
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!confirm(`هل أنت متأكد من تغيير حالة الطلب إلى "${newStatus}"؟`)) return;

    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
        showToast('تم تحديث حالة الطلب بنجاح');
    } else {
        showToast('حدث خطأ أثناء تحديث الطلب', 'error');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب نهائياً من السجل؟')) return;
    
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (!error) {
        setOrders(orders.filter(o => o.id !== orderId));
        showToast('تم حذف الطلب بنجاح');
    } else {
        showToast('حدث خطأ أثناء حذف الطلب', 'error');
    }
  };

  // Filter Orders Helper
  const getFilteredOrders = () => {
      if (orderSubTab === 'pending') return orders.filter(o => o.status === 'new');
      if (orderSubTab === 'active') return orders.filter(o => o.status === 'preparing' || o.status === 'delivering');
      if (orderSubTab === 'history') return orders.filter(o => o.status === 'completed' || o.status === 'cancelled');
      return [];
  };

  // --- PRODUCT ACTIONS ---
  const handleAddSize = () => {
    if (!tempSize.name || tempSize.price <= 0) {
        showToast('يرجى إدخال اسم وسعر صحيح للحجم', 'error');
        return;
    }
    setNewProduct(prev => ({
        ...prev,
        sizes: [...(prev.sizes || []), tempSize]
    }));
    setTempSize({ name: '', price: 0 });
  };

  const handleRemoveSize = (index: number) => {
    setNewProduct(prev => ({
        ...prev,
        sizes: prev.sizes?.filter((_, i) => i !== index)
    }));
  };
  
  const handleAddAddon = () => {
      if (!tempAddon.name || tempAddon.price <= 0) {
          showToast('يرجى إدخال اسم وسعر صحيح للإضافة/الكومبو', 'error');
          return;
      }
      setNewProduct(prev => ({
          ...prev,
          addons: [...(prev.addons || []), tempAddon]
      }));
      setTempAddon({ name: '', price: 0 });
  };

  const handleRemoveAddon = (index: number) => {
      setNewProduct(prev => ({
          ...prev,
          addons: prev.addons?.filter((_, i) => i !== index)
      }));
  };

  const handleAddNutritionFact = () => {
      if (!tempNutritionFact.label || !tempNutritionFact.value) {
          showToast('يرجى إدخال اسم وقيمة صحيحين للحقيقة الغذائية', 'error');
          return;
      }
      setNewProduct(prev => ({
          ...prev,
          nutritionFacts: [...(prev.nutritionFacts || []), tempNutritionFact]
      }));
      setTempNutritionFact({ label: '', value: '' });
  };

  const handleRemoveNutritionFact = (index: number) => {
      setNewProduct(prev => ({
          ...prev,
          nutritionFacts: prev.nutritionFacts?.filter((_, i) => i !== index)
      }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure if has_sizes is enabled, we have sizes
    if (newProduct.has_sizes && (!newProduct.sizes || newProduct.sizes.length === 0)) {
        showToast('لقد قمت بتفعيل "تعدد الأحجام"، يرجى إضافة حجم واحد على الأقل.', 'error');
        return;
    }

    // If has_sizes is enabled, set main price to the lowest size price for sorting/display purposes
    let finalPrice = newProduct.price;
    if (newProduct.has_sizes && newProduct.sizes && newProduct.sizes.length > 0) {
        finalPrice = Math.min(...newProduct.sizes.map(s => s.price));
    }

    const productPayload = {
        title: newProduct.title,
        subtitle: newProduct.subtitle,
        price: finalPrice,
        currency: newProduct.currency,
        image_url: newProduct.imageUrl,
        category: newProduct.category,
        is_featured: newProduct.is_featured,
        is_available: newProduct.is_available,
        is_hidden: newProduct.is_hidden,
        has_sizes: newProduct.has_sizes,
        sizes: newProduct.sizes,
        addons: newProduct.addons,
        nutrition_facts: newProduct.nutritionFacts
    };
    
    let error;
    if (editingProductId) {
        const { error: updateError } = await supabase.from('products').update(productPayload).eq('id', editingProductId);
        error = updateError;
    } else {
        const { error: insertError } = await supabase.from('products').insert([productPayload]);
        error = insertError;
    }

    if (!error) {
        setNewProduct({ currency: 'ج.م', is_featured: false, is_available: true, is_hidden: false, has_sizes: false, sizes: [], addons: [], nutritionFacts: [] });
        setEditingProductId(null);
        setShowProductForm(false);
        fetchData();
        showToast(editingProductId ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
    } else {
        showToast('حدث خطأ: ' + error.message, 'error');
    }
  };

  const handleEditProductClick = (product: MenuItem) => {
      setNewProduct({
          ...product,
          sizes: product.sizes || [],
          addons: product.addons || [],
          nutritionFacts: product.nutritionFacts || []
      });
      setEditingProductId(product.id);
      setShowProductForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditProduct = () => {
      setNewProduct({ currency: 'ج.م', is_featured: false, is_available: true, is_hidden: false, has_sizes: false, sizes: [], addons: [], nutritionFacts: [] });
      setEditingProductId(null);
      setShowProductForm(false);
  };

  const handleToggleProductAvailability = async (id: string, currentStatus: boolean) => {
      const { error } = await supabase.from('products').update({ is_available: !currentStatus }).eq('id', id);
      if (!error) {
          setProducts(products.map(p => p.id === id ? { ...p, is_available: !currentStatus } : p));
          showToast(currentStatus ? 'تم إخفاء المنتج من الطلب' : 'المنتج متاح للطلب الآن');
      } else {
          showToast('حدث خطأ أثناء تغيير الحالة', 'error');
      }
  };

  const handleDeleteProduct = async (id: string) => {
      if(!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
          setProducts(products.filter(p => p.id !== id));
          showToast('تم حذف المنتج بنجاح');
      } else {
          showToast('حدث خطأ أثناء حذف المنتج', 'error');
      }
  };

  // --- ZONE ACTIONS ---
  const handleSaveZone = async (e: React.FormEvent) => {
      e.preventDefault();
      let error;
      if (editingZoneId) {
          const { error: updateError } = await supabase.from('delivery_zones').update(newZone).eq('id', editingZoneId);
          error = updateError;
      } else {
          const { error: insertError } = await supabase.from('delivery_zones').insert([newZone]);
          error = insertError;
      }

      if(!error) {
          setNewZone({ active: true });
          setEditingZoneId(null);
          fetchData();
          showToast(editingZoneId ? 'تم تحديث المنطقة بنجاح' : 'تم إضافة المنطقة بنجاح');
      } else {
          showToast('حدث خطأ أثناء حفظ المنطقة', 'error');
      }
  };

  const handleEditZoneClick = (zone: DeliveryZone) => {
      setNewZone(zone);
      setEditingZoneId(zone.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditZone = () => {
      setNewZone({ active: true });
      setEditingZoneId(null);
  };

  const handleDeleteZone = async (id: string) => {
    if(!confirm('هل أنت متأكد من حذف هذه المنطقة؟')) return;
    const { error } = await supabase.from('delivery_zones').delete().eq('id', id);
    if (!error) {
        setZones(zones.filter(z => z.id !== id));
        showToast('تم حذف المنطقة بنجاح');
    } else {
        showToast('حدث خطأ أثناء حذف المنطقة', 'error');
    }
  };

  // --- CATEGORY ACTIONS ---
  const handleSaveCategory = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCategory.id || !newCategory.label) {
          showToast('يرجى ملء البيانات الأساسية', 'error');
          return;
      }
      
      const payload = {
          id: newCategory.id,
          label: newCategory.label,
          label_en: newCategory.label_en,
          icon: newCategory.icon,
          has_spicy_option: newCategory.has_spicy_option,
          sort_order: newCategory.sort_order
      };

      let error;
      // We use 'upsert' for categories since ID is text based and primary key
      const { error: upsertError } = await supabase.from('categories').upsert([payload]);
      error = upsertError;

      if (!error) {
          setNewCategory({ has_spicy_option: false, sort_order: 0 });
          setEditingCategoryId(null);
          fetchData();
          showToast('تم حفظ القسم بنجاح');
      } else {
          showToast('خطأ في الحفظ: ' + error.message, 'error');
      }
  };

  const handleEditCategoryClick = (cat: Category) => {
      setNewCategory(cat);
      setEditingCategoryId(cat.id);
  };
  
  const handleDeleteCategory = async (id: string) => {
      if(!confirm('هل أنت متأكد من حذف هذا القسم؟ قد يؤثر ذلك على المنتجات المرتبطة به.')) return;
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) {
          setCategories(categories.filter(c => c.id !== id));
          showToast('تم حذف القسم بنجاح');
      } else {
          showToast('حدث خطأ أثناء حذف القسم', 'error');
      }
  };


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-background-dark p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-black text-center mb-6 text-primary">لوحة تحكم La Prama</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">اسم المستخدم</label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">كلمة المرور</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold">تسجيل الدخول</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans" dir="rtl">
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`px-4 py-3 rounded-xl shadow-xl text-white font-bold text-sm flex items-center gap-3 animate-[fadeIn_0.3s_ease-out] ${
                t.type === 'success' ? 'bg-green-600' :
                t.type === 'error' ? 'bg-red-500' :
                'bg-blue-600'
              }`}
            >
              {t.type === 'loading' && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {t.type === 'success' && <span className="material-symbols-outlined text-sm">check_circle</span>}
              {t.type === 'error' && <span className="material-symbols-outlined text-sm">error</span>}
              <span className="flex-grow">{t.message}</span>
              <button onClick={() => removeToast(t.id)} className="opacity-70 hover:opacity-100">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Admin Header */}
      <header className="bg-white dark:bg-background-dark shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-black text-primary">LA PRAMA ADMIN</h1>
            <div className="flex items-center gap-4">
                <button 
                   onClick={() => { fetchData(); showToast('تم تحديث البيانات'); }} 
                   className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                   <span className="material-symbols-outlined text-sm">refresh</span>
                   تحديث
                </button>
               <button onClick={() => setIsAuthenticated(false)} className="text-red-500 font-bold text-sm">تسجيل خروج</button>
            </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="bg-white dark:bg-background-dark rounded-xl shadow-sm p-4 space-y-2 sticky top-24">
                <button onClick={() => setActiveTab('orders')} className={`w-full text-right p-3 rounded-lg font-bold flex items-center gap-3 ${activeTab === 'orders' ? 'bg-primary text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    <span className="material-symbols-outlined">receipt_long</span> الطلبات
                </button>
                <button onClick={() => setActiveTab('products')} className={`w-full text-right p-3 rounded-lg font-bold flex items-center gap-3 ${activeTab === 'products' ? 'bg-primary text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    <span className="material-symbols-outlined">restaurant</span> المنتجات
                </button>
                <button onClick={() => setActiveTab('categories')} className={`w-full text-right p-3 rounded-lg font-bold flex items-center gap-3 ${activeTab === 'categories' ? 'bg-primary text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    <span className="material-symbols-outlined">category</span> الأقسام
                </button>
                <button onClick={() => setActiveTab('zones')} className={`w-full text-right p-3 rounded-lg font-bold flex items-center gap-3 ${activeTab === 'zones' ? 'bg-primary text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    <span className="material-symbols-outlined">location_on</span> مناطق التوصيل
                </button>
            </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-grow">
            {initialLoading && <div className="text-center py-10">جاري التحميل...</div>}
            
            {!initialLoading && activeTab === 'orders' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black">إدارة الطلبات</h2>
                    </div>
                    {/* (Orders code remains same as before) */}
                    {/* Orders Sub-Tabs */}
                    <div className="flex p-1 bg-white dark:bg-background-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 mb-4">
                        <button 
                            onClick={() => setOrderSubTab('pending')}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${orderSubTab === 'pending' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            جاري التأكيد ({orders.filter(o => o.status === 'new').length})
                        </button>
                        <button 
                            onClick={() => setOrderSubTab('active')}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${orderSubTab === 'active' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            يتم التحضير/التوصيل ({orders.filter(o => o.status === 'preparing' || o.status === 'delivering').length})
                        </button>
                        <button 
                            onClick={() => setOrderSubTab('history')}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${orderSubTab === 'history' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                             المنتهية ({orders.filter(o => o.status === 'completed' || o.status === 'cancelled').length})
                        </button>
                    </div>

                    {getFilteredOrders().length === 0 ? (
                        <div className="text-center py-10 bg-white dark:bg-background-dark rounded-xl border border-dashed">
                            <p className="text-gray-500 font-bold">لا توجد طلبات في هذا القسم</p>
                        </div>
                    ) : ( 
                        getFilteredOrders().map(order => (
                        <div key={order.id} className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-2 h-full ${order.status === 'new' ? 'bg-blue-500' : order.status === 'completed' ? 'bg-green-500' : order.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                            
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg">{order.customer_first_name} {order.customer_last_name}</h3>
                                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono select-all" dir="ltr">#{order.id.slice(0, 8)}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                                      <span className="flex items-center gap-1">
                                          <span className="material-symbols-outlined text-sm">call</span> 
                                          <span dir="ltr" className="font-mono text-left">{order.phone}</span>
                                      </span>
                                      
                                      {order.whatsapp && (
                                         <span className="flex items-center gap-1 text-green-600">
                                             <span className="material-symbols-outlined text-sm">chat</span> 
                                             <span dir="ltr" className="font-mono text-left">{order.whatsapp}</span>
                                         </span>
                                      )}
                                    </div>
                                    <p className="text-gray-500 text-sm flex items-center gap-1">
                                       <span className="material-symbols-outlined text-sm">
                                         {order.order_type === 'delivery' ? 'delivery_dining' : 'storefront'}
                                       </span>
                                       <span className="font-bold text-black dark:text-white">
                                          {order.order_type === 'delivery' 
                                            ? `توصيل: ${order.zone_name} - ${order.address}` 
                                            : `استلام من الفرع`}
                                       </span>
                                    </p>
                                    
                                    {order.payment_method && (
                                        <p className="text-sm flex items-center gap-1">
                                           <span className="material-symbols-outlined text-sm">payments</span>
                                           الدفع: <span className="font-bold text-primary">
                                             {order.payment_method === 'online' ? 'تحويل (فودافون/انستا)' : 'كاش عند الاستلام'}
                                           </span>
                                        </p>
                                    )}
                                </div>
                                <div className="text-left pl-4">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-2 
                                        ${order.status === 'new' ? 'bg-blue-100 text-blue-600' : 
                                          order.status === 'completed' ? 'bg-green-100 text-green-600' : 
                                          order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                          'bg-yellow-100 text-yellow-600'}`}>
                                        {order.status === 'new' ? 'جديد' : 
                                         order.status === 'preparing' ? 'جاري التحضير' :
                                         order.status === 'delivering' ? 'خرج للتوصيل' :
                                         order.status === 'completed' ? 'تم التسليم' :
                                         order.status === 'cancelled' ? 'مرفوض' : order.status}
                                    </span>
                                    <p className="text-xs text-gray-400 font-mono" dir="ltr">{new Date(order.created_at).toLocaleString('en-US', { hour12: true })}</p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex flex-col text-sm py-2 border-b border-dashed border-gray-200 dark:border-gray-800 last:border-0">
                                        <div className="flex justify-between w-full">
                                            <span>
                                                {item.quantity}x {item.title} 
                                                {item.selectedSize && <span className="text-gray-500 text-xs mx-1 font-bold">[حجم: {item.selectedSize.name}]</span>}
                                                {item.variant && <span className={`text-xs mx-1 font-bold ${item.variant === 'spicy' ? 'text-red-500' : 'text-blue-500'}`}>({item.variant === 'spicy' ? 'حار 🔥' : 'عادي 👍'})</span>}
                                            </span>
                                            <span className="font-bold">{item.price * item.quantity}</span>
                                        </div>
                                        {item.selectedAddons && item.selectedAddons.length > 0 && (
                                            <div className="mr-6 mt-1 flex flex-wrap gap-2">
                                                {item.selectedAddons.map((ad, i) => (
                                                    <span key={i} className="text-xs text-green-600 font-bold bg-green-50 px-2 rounded border border-green-100">+ {ad.name}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div className="mt-2 pt-2 flex justify-between font-bold border-t border-gray-200 dark:border-gray-700">
                                    <span>الإجمالي (شامل التوصيل)</span>
                                    <span className="text-primary text-lg">{order.total} ج.م</span>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                                {/* Workflow Logic */}
                                {order.status === 'new' && (
                                    <>
                                        <button onClick={() => handleStatusUpdate(order.id, 'preparing')} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                                            تأكيد الطلب (تحضير)
                                        </button>
                                        <button onClick={() => handleStatusUpdate(order.id, 'cancelled')} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-200">
                                            رفض
                                        </button>
                                    </>
                                )}

                                {order.status === 'preparing' && (
                                    <button onClick={() => handleStatusUpdate(order.id, 'delivering')} className="px-6 py-2 bg-yellow-500 text-white rounded-lg text-sm font-bold hover:bg-yellow-600 shadow-lg shadow-yellow-500/20 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">local_shipping</span>
                                        تم الانتهاء (خروج للتوصيل)
                                    </button>
                                )}

                                {order.status === 'delivering' && (
                                    <button onClick={() => handleStatusUpdate(order.id, 'completed')} className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-500/20 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        تم التسليم
                                    </button>
                                )}

                                {(order.status === 'completed' || order.status === 'cancelled') && (
                                    <button onClick={() => handleDeleteOrder(order.id)} className="px-4 py-2 border border-red-200 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                        حذف من السجل
                                    </button>
                                )}
                            </div>
                        </div>
                    )))
                    }
                </div>
            )}

            {!initialLoading && activeTab === 'products' && (
                <div className="space-y-6">
                     <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black">إدارة المنتجات</h2>
                        <button 
                            onClick={() => {
                                setNewProduct({ currency: 'ج.م', is_featured: false, is_available: true, is_hidden: false, has_sizes: false, sizes: [], addons: [], nutritionFacts: [] });
                                setEditingProductId(null);
                                setShowProductForm(!showProductForm);
                            }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${showProductForm ? 'bg-gray-200 text-gray-800' : 'bg-primary text-white shadow-primary/30'}`}
                        >
                            <span className="material-symbols-outlined">{showProductForm ? 'close' : 'add'}</span>
                            {showProductForm ? 'إلغاء' : 'إضافة منتج جديد'}
                        </button>
                     </div>

                     {/* Add/Edit Product Form - Toggleable */}
                     {showProductForm && (
                        <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-xl border-2 border-primary/10 animate-[fadeIn_0.3s_ease-out]">
                            <h3 className="text-xl font-black mb-6 text-primary border-b pb-4">
                                {editingProductId ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للقائمة'}
                            </h3>
                            
                            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="font-bold text-sm">اسم المنتج</label>
                                    <input required className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none" value={newProduct.title || ''} onChange={e => setNewProduct({...newProduct, title: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-bold text-sm">وصف قصير</label>
                                    <input className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none" value={newProduct.subtitle || ''} onChange={e => setNewProduct({...newProduct, subtitle: e.target.value})} />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="font-bold text-sm">القسم</label>
                                    <select required className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none" value={newProduct.category || ''} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                                        <option value="" disabled>اختر القسم</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="font-bold text-sm">رابط الصورة</label>
                                    <input required className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none" value={newProduct.imageUrl || ''} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
                                </div>

                                {/* Sizes & Price Section */}
                                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3 mb-4">
                                        <input 
                                            type="checkbox" 
                                            id="hasSizes"
                                            className="w-5 h-5 text-primary rounded" 
                                            checked={newProduct.has_sizes || false} 
                                            onChange={e => setNewProduct({...newProduct, has_sizes: e.target.checked})} 
                                        />
                                        <label htmlFor="hasSizes" className="font-bold cursor-pointer">تفعيل تعدد الأحجام</label>
                                    </div>

                                    {newProduct.has_sizes ? (
                                        <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                                            <p className="text-sm text-gray-500">قم بإضافة الأحجام المتاحة وسعر كل حجم (مثل: طبقة واحدة، طبقتين...)</p>
                                            
                                            {/* Size List */}
                                            <div className="space-y-2">
                                                {newProduct.sizes && newProduct.sizes.map((size, idx) => (
                                                    <div key={idx} className="flex gap-2 items-center bg-white dark:bg-gray-800 p-2 rounded-lg border">
                                                        <span className="flex-grow font-bold px-2">{size.name}</span>
                                                        <span className="text-primary font-bold px-2">{size.price} ج.م</span>
                                                        <button type="button" onClick={() => handleRemoveSize(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><span className="material-symbols-outlined">delete</span></button>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add Size Form */}
                                            <div className="flex gap-2 items-end">
                                                <div className="flex-grow">
                                                    <label className="text-xs font-bold mb-1 block">اسم الحجم</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="مثال: سنجل / دبل" 
                                                        className="w-full p-2 rounded-lg border text-sm"
                                                        value={tempSize.name}
                                                        onChange={e => setTempSize({...tempSize, name: e.target.value})}
                                                    />
                                                </div>
                                                <div className="w-24">
                                                    <label className="text-xs font-bold mb-1 block">السعر</label>
                                                    <input 
                                                        type="number" 
                                                        placeholder="0" 
                                                        className="w-full p-2 rounded-lg border text-sm"
                                                        value={tempSize.price || ''}
                                                        onChange={e => setTempSize({...tempSize, price: parseFloat(e.target.value)})}
                                                    />
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={handleAddSize}
                                                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 h-[38px] w-[38px] flex items-center justify-center"
                                                >
                                                    <span className="material-symbols-outlined">add</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="font-bold text-sm">السعر الأساسي</label>
                                            <input required={!newProduct.has_sizes} type="number" className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Addons / Combo Section */}
                                <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                    <h4 className="font-bold mb-2 text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                        <span className="material-symbols-outlined">recommend</span>
                                        إضافات / كومبو / اقتراحات (Upselling)
                                    </h4>
                                    <p className="text-xs text-gray-500 mb-4">هذه الخيارات ستظهر للعميل في نافذة المنتج لإضافتها (مثل: بيبسي، بطاطس، كومبو...)</p>
                                    
                                     {/* Addon List */}
                                    <div className="space-y-2 mb-4">
                                        {newProduct.addons && newProduct.addons.map((addon, idx) => (
                                            <div key={idx} className="flex gap-2 items-center bg-white dark:bg-gray-800 p-2 rounded-lg border">
                                                <span className="flex-grow font-bold px-2">{addon.name}</span>
                                                <span className="text-primary font-bold px-2">+{addon.price} ج.م</span>
                                                <button type="button" onClick={() => handleRemoveAddon(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><span className="material-symbols-outlined">delete</span></button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Addon Form */}
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-grow">
                                            <label className="text-xs font-bold mb-1 block">اسم الإضافة</label>
                                            <input 
                                                type="text" 
                                                placeholder="مثال: كومبو (بطاطس + بيبسي)" 
                                                className="w-full p-2 rounded-lg border text-sm"
                                                value={tempAddon.name}
                                                onChange={e => setTempAddon({...tempAddon, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="w-24">
                                            <label className="text-xs font-bold mb-1 block">السعر</label>
                                            <input 
                                                type="number" 
                                                placeholder="0" 
                                                className="w-full p-2 rounded-lg border text-sm"
                                                value={tempAddon.price || ''}
                                                onChange={e => setTempAddon({...tempAddon, price: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={handleAddAddon}
                                            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 h-[38px] w-[38px] flex items-center justify-center"
                                        >
                                            <span className="material-symbols-outlined">add</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Nutrition Facts Section */}
                                <div className="md:col-span-2 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                                    <h4 className="font-bold mb-2 text-green-800 dark:text-green-300 flex items-center gap-2">
                                        <span className="material-symbols-outlined">monitoring</span>
                                        الحقائق الغذائية (Nutrition Facts)
                                    </h4>
                                    <p className="text-xs text-gray-500 mb-4">معلومات صحية لكل أكلة (مثل: سعرات، بروتين، صوديوم...)</p>

                                    {/* Nutrition Facts List */}
                                    <div className="space-y-2 mb-4">
                                        {newProduct.nutritionFacts && newProduct.nutritionFacts.map((fact, idx) => (
                                            <div key={idx} className="flex gap-2 items-center bg-white dark:bg-gray-800 p-2 rounded-lg border">
                                                <span className="flex-grow font-bold px-2">{fact.label}</span>
                                                <span className="text-primary font-bold px-2">{fact.value}</span>
                                                <button type="button" onClick={() => handleRemoveNutritionFact(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><span className="material-symbols-outlined">delete</span></button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Nutrition Fact Form */}
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-grow">
                                            <label className="text-xs font-bold mb-1 block">الاسم</label>
                                            <input
                                                type="text"
                                                placeholder="مثال: سعرات حرارية"
                                                className="w-full p-2 rounded-lg border text-sm"
                                                value={tempNutritionFact.label}
                                                onChange={e => setTempNutritionFact({...tempNutritionFact, label: e.target.value})}
                                            />
                                        </div>
                                        <div className="w-40">
                                            <label className="text-xs font-bold mb-1 block">القيمة</label>
                                            <input
                                                type="text"
                                                placeholder="مثال: 320 kcal"
                                                className="w-full p-2 rounded-lg border text-sm"
                                                value={tempNutritionFact.value}
                                                onChange={e => setTempNutritionFact({...tempNutritionFact, value: e.target.value})}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddNutritionFact}
                                            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 h-[38px] w-[38px] flex items-center justify-center"
                                        >
                                            <span className="material-symbols-outlined">add</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="md:col-span-2 flex flex-col md:flex-row gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-1">
                                        <div className={`w-6 h-6 rounded border flex items-center justify-center ${newProduct.is_featured ? 'bg-primary border-primary text-white' : 'border-gray-400'}`}>
                                            {newProduct.is_featured && <span className="material-symbols-outlined text-sm">check</span>}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={newProduct.is_featured || false} onChange={e => setNewProduct({...newProduct, is_featured: e.target.checked})} />
                                        <div>
                                            <span className="font-bold block">عرض في "عروضنا الخاصة"</span>
                                            <span className="text-xs text-gray-500">سيظهر المنتج في الصفحة الرئيسية</span>
                                        </div>
                                    </label>
                                    
                                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-1">
                                         <div className={`w-6 h-6 rounded border flex items-center justify-center ${newProduct.is_available !== false ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400'}`}>
                                            {newProduct.is_available !== false && <span className="material-symbols-outlined text-sm">check</span>}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={newProduct.is_available !== false} onChange={e => setNewProduct({...newProduct, is_available: e.target.checked})} />
                                        <div>
                                            <span className="font-bold block">متاح للطلب</span>
                                            <span className="text-xs text-gray-500">إلغاء التحديد سيمنع العملاء من طلب المنتج</span>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-1">
                                         <div className={`w-6 h-6 rounded border flex items-center justify-center ${newProduct.is_hidden ? 'bg-red-500 border-red-500 text-white' : 'border-gray-400'}`}>
                                            {newProduct.is_hidden && <span className="material-symbols-outlined text-sm">check</span>}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={newProduct.is_hidden || false} onChange={e => setNewProduct({...newProduct, is_hidden: e.target.checked})} />
                                        <div>
                                            <span className="font-bold block text-red-600">إخفاء المنتج</span>
                                            <span className="text-xs text-gray-500">لن يظهر المنتج للعملاء نهائياً</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="md:col-span-2 flex gap-4 pt-4">
                                    <button type="submit" className={`flex-1 text-white py-4 rounded-xl font-bold text-lg shadow-xl transition-transform active:scale-95 ${editingProductId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary hover:bg-[#4A5D2E]'}`}>
                                        {editingProductId ? 'حفظ التعديلات' : 'إضافة المنتج الآن'}
                                    </button>
                                    <button type="button" onClick={handleCancelEditProduct} className="px-6 py-4 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200">
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                     )}

                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map(product => {
                            const catName = categories.find(c => c.id === product.category)?.label || product.category;
                            return (
                                <div key={product.id} className={`flex gap-3 p-3 bg-white dark:bg-background-dark rounded-xl border shadow-sm transition-all hover:shadow-md relative ${!product.is_available ? 'opacity-70 grayscale bg-gray-50' : ''}`}>
                                    {product.is_hidden && (
                                        <div className="absolute top-2 right-2 z-10 bg-black text-white text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[10px]">visibility_off</span> مخفي
                                        </div>
                                    )}
                                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
                                        <img src={product.imageUrl} className="w-full h-full object-cover" alt="" />
                                        {!product.is_available && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">غير متاح</div>}
                                    </div>
                                    <div className="flex-grow flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-sm line-clamp-1" title={product.title}>{product.title}</h4>
                                                {product.is_featured && <span className="text-amber-500 material-symbols-outlined text-sm" title="مميز في الرئيسية">star</span>}
                                            </div>
                                            <p className="text-sm text-primary font-bold">
                                                {product.has_sizes ? 'يبدأ من ' : ''}{product.price} ج.م
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">{catName}</p>
                                            <div className="flex gap-1 mt-1">
                                                {product.has_sizes && (
                                                    <span className="inline-block text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">أحجام</span>
                                                )}
                                                {product.addons && product.addons.length > 0 && (
                                                    <span className="inline-block text-[10px] bg-blue-50 px-1.5 py-0.5 rounded text-blue-600">إضافات</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button onClick={() => handleEditProductClick(product)} className="text-blue-600 bg-blue-50 p-1.5 rounded-lg hover:bg-blue-100 transition-colors" title="تعديل"><span className="material-symbols-outlined text-sm">edit</span></button>
                                            <button onClick={() => handleToggleProductAvailability(product.id, product.is_available ?? true)} className={`p-1.5 rounded-lg transition-colors ${product.is_available !== false ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-500 bg-gray-200'}`} title="تغيير الإتاحة"><span className="material-symbols-outlined text-sm">{product.is_available !== false ? 'visibility' : 'visibility_off'}</span></button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 bg-red-50 p-1.5 rounded-lg hover:bg-red-100 transition-colors" title="حذف"><span className="material-symbols-outlined text-sm">delete</span></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                     </div>
                </div>
            )}
            
            {!initialLoading && activeTab === 'categories' && (
                <div className="space-y-6">
                     <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-primary/10">
                         <h3 className="text-xl font-black mb-4">{editingCategoryId ? 'تعديل قسم' : 'إضافة قسم جديد'}</h3>
                         <form onSubmit={handleSaveCategory} className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">المعرف (ID)</label>
                                    <input required disabled={!!editingCategoryId} className={`w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 ${editingCategoryId ? 'bg-gray-100 text-gray-500' : ''}`} placeholder="ex: burgers" value={newCategory.id || ''} onChange={e => setNewCategory({...newCategory, id: e.target.value})} />
                                    <p className="text-xs text-gray-400 mt-1">يجب أن يكون بالإنجليزية وبدون مسافات (يستخدم للربط)</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">اسم القسم (عربي)</label>
                                    <input required className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700" placeholder="مثال: البرجر" value={newCategory.label || ''} onChange={e => setNewCategory({...newCategory, label: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">اسم القسم (إنجليزي)</label>
                                    <input required className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700" placeholder="ex: Burgers" value={newCategory.label_en || ''} onChange={e => setNewCategory({...newCategory, label_en: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">أيقونة (Material Symbol)</label>
                                    <input required className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700" placeholder="ex: lunch_dining" value={newCategory.icon || ''} onChange={e => setNewCategory({...newCategory, icon: e.target.value})} />
                                    <a href="https://fonts.google.com/icons" target="_blank" rel="noreferrer" className="text-xs text-blue-500 underline mt-1 block">تصفح الأيقونات</a>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">الترتيب</label>
                                    <input type="number" className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700" value={newCategory.sort_order || 0} onChange={e => setNewCategory({...newCategory, sort_order: parseInt(e.target.value)})} />
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-4 py-2">
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-lg border">
                                    <input type="checkbox" className="w-5 h-5 text-primary rounded" checked={newCategory.has_spicy_option || false} onChange={e => setNewCategory({...newCategory, has_spicy_option: e.target.checked})} />
                                    <div>
                                        <span className="font-bold text-sm block">تفعيل خيار (عادي / حار)</span>
                                        <span className="text-xs text-gray-500">سيظهر هذا الخيار لجميع منتجات القسم</span>
                                    </div>
                                </label>
                             </div>

                             <div className="flex gap-4">
                                <button type="submit" className="bg-primary text-white px-8 py-3 rounded-xl font-bold">
                                    {editingCategoryId ? 'حفظ التعديلات' : 'إضافة القسم'}
                                </button>
                                {editingCategoryId && (
                                    <button type="button" onClick={() => { setEditingCategoryId(null); setNewCategory({ has_spicy_option: false, sort_order: 0 }); }} className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold">
                                        إلغاء
                                    </button>
                                )}
                             </div>
                         </form>
                     </div>

                     <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="p-4 font-black">الترتيب</th>
                                    <th className="p-4 font-black">الاسم</th>
                                    <th className="p-4 font-black">ID</th>
                                    <th className="p-4 font-black">خيارات</th>
                                    <th className="p-4 font-black">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(cat => (
                                    <tr key={cat.id} className="border-t border-gray-100 dark:border-gray-800">
                                        <td className="p-4">{cat.sort_order}</td>
                                        <td className="p-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gray-400">{cat.icon}</span>
                                            <div>
                                                <div className="font-bold">{cat.label}</div>
                                                <div className="text-xs text-gray-400">{cat.label_en}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-sm text-gray-500">{cat.id}</td>
                                        <td className="p-4">
                                            {cat.has_spicy_option && <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-bold">حار/عادي</span>}
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            <button onClick={() => handleEditCategoryClick(cat)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"><span className="material-symbols-outlined">edit</span></button>
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><span className="material-symbols-outlined">delete</span></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>
            )}

            {!initialLoading && activeTab === 'zones' && (
                <div className="space-y-6">
                     <div className="bg-white dark:bg-background-dark p-6 rounded-xl shadow-sm border border-primary/10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-black">{editingZoneId ? 'تعديل المنطقة' : 'إضافة منطقة توصيل'}</h3>
                            {editingZoneId && (
                                <button onClick={handleCancelEditZone} className="text-sm text-gray-500 hover:text-red-500">إلغاء التعديل</button>
                            )}
                        </div>
                        <form onSubmit={handleSaveZone} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-grow w-full">
                                <label className="block text-sm font-bold mb-1">اسم المنطقة</label>
                                <input required className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700" value={newZone.name || ''} onChange={e => setNewZone({...newZone, name: e.target.value})} />
                            </div>
                            <div className="w-full md:w-32">
                                <label className="block text-sm font-bold mb-1">سعر التوصيل</label>
                                <input required type="number" className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700" value={newZone.fee || ''} onChange={e => setNewZone({...newZone, fee: parseFloat(e.target.value)})} />
                            </div>
                            <div className="w-full md:w-auto flex items-center mb-3">
                                 <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 text-primary rounded" checked={newZone.active !== false} onChange={e => setNewZone({...newZone, active: e.target.checked})} />
                                    <span className="font-bold text-sm">مفعلة</span>
                                </label>
                            </div>
                            <button type="submit" className={`w-full md:w-auto text-white p-3 rounded-xl font-bold h-[50px] min-w-[100px] ${editingZoneId ? 'bg-blue-600' : 'bg-primary'}`}>
                                {editingZoneId ? 'تحديث' : 'إضافة'}
                            </button>
                        </form>
                     </div>

                     <div className="bg-white dark:bg-background-dark rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="p-4 font-black">المنطقة</th>
                                    <th className="p-4 font-black">السعر</th>
                                    <th className="p-4 font-black">الحالة</th>
                                    <th className="p-4 font-black">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {zones.map(zone => (
                                    <tr key={zone.id} className="border-t border-gray-100 dark:border-gray-800">
                                        <td className="p-4 font-bold">{zone.name}</td>
                                        <td className="p-4">{zone.fee} ج.م</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${zone.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {zone.active ? 'مفعل' : 'غير مفعل'}
                                            </span>
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            <button onClick={() => handleEditZoneClick(zone)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"><span className="material-symbols-outlined">edit</span></button>
                                            <button onClick={() => handleDeleteZone(zone.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><span className="material-symbols-outlined">delete</span></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};