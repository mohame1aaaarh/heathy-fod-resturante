import React, { useState, useEffect, useRef } from 'react';
import { CartItem, DeliveryZone, OrderType, PaymentMethod } from '../types';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  items: CartItem[];
  deliveryZones: DeliveryZone[];
  onClearCart: () => void;
  onNavigate: (page: string) => void;
}

// Updated Contact Numbers
const CUSTOMER_SERVICE_NUMBER = '201554400554'; 
const PAYMENT_NUMBER = '01554400554';

export const Checkout: React.FC<CheckoutProps> = ({ items, deliveryZones, onClearCart, onNavigate }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [lastOrderTotal, setLastOrderTotal] = useState<number>(0); 
  const [submittedItems, setSubmittedItems] = useState<CartItem[]>([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Checkout State
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online'); 
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    whatsapp: '',
    addressDetails: ''
  });

  // Validation State
  const [errors, setErrors] = useState({
      phone: '',
      whatsapp: ''
  });

  // Zone Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate Subtotal (Including Addons)
  const subtotal = items.reduce((sum, item) => {
      const addonsCost = item.selectedAddons ? item.selectedAddons.reduce((a, b) => a + b.price, 0) : 0;
      return sum + ((item.price + addonsCost) * item.quantity);
  }, 0);

  const deliveryFee = orderType === 'delivery' && selectedZone ? selectedZone.fee : 0;
  const currentTotal = subtotal + deliveryFee;

  const filteredZones = deliveryZones.filter(zone => 
    zone.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load User Data from Local Storage on Mount
  useEffect(() => {
    const savedData = localStorage.getItem('laprama_user_data');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            setFormData(prev => ({
                ...prev,
                firstName: parsed.firstName || '',
                lastName: parsed.lastName || '',
                phone: parsed.phone || '',
                whatsapp: parsed.whatsapp || '',
                addressDetails: parsed.addressDetails || ''
            }));
        } catch (e) {
            console.error('Failed to parse user data', e);
        }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleZoneSelect = (zone: DeliveryZone) => {
    setSelectedZone(zone);
    setSearchTerm(zone.name);
    setShowDropdown(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedZone(null);
    setShowDropdown(true);
  };

  // Input Change with Real-time Validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time Phone Validation
    if (name === 'phone' || name === 'whatsapp') {
        const phoneRegex = /^01[0125][0-9]{8}$/;
        if (value.length > 0 && !phoneRegex.test(value)) {
            setErrors(prev => ({...prev, [name]: 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 01 ويتكون من 11 رقم)'}));
        } else {
            setErrors(prev => ({...prev, [name]: ''}));
        }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation Checks
    if (orderType === 'delivery' && !selectedZone) {
      alert('يرجى اختيار منطقة التوصيل');
      return;
    }
    if (errors.phone || errors.whatsapp) {
        alert('يرجى تصحيح أرقام الهاتف قبل المتابعة');
        return;
    }

    setIsSubmitting(true);
    
    const finalTotal = currentTotal;

    const orderPayload = {
      customer_first_name: formData.firstName,
      customer_last_name: formData.lastName,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      address: orderType === 'delivery' ? formData.addressDetails : 'استلام من الفرع',
      zone_name: orderType === 'delivery' && selectedZone ? selectedZone.name : 'N/A',
      order_type: orderType,
      payment_method: paymentMethod,
      items: items,
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      total: finalTotal,
      status: 'new'
    };

    try {
      const { data, error } = await supabase.from('orders').insert([orderPayload]).select();
      
      if (error) throw error;
      
      // Save valid data to Local Storage
      localStorage.setItem('laprama_user_data', JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          addressDetails: formData.addressDetails
      }));

      const newOrderId = data && data[0] ? data[0].id : 'Unknown';
      
      setSubmittedItems(items); 
      setSubmittedOrderId(newOrderId);
      setLastOrderTotal(finalTotal); 
      setIsSuccess(true);
      onClearCart();
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error: any) {
      console.error('Order submission failed:', error);
      alert(`حدث خطأ أثناء إرسال الطلب: ${error.message || 'يرجى المحاولة مرة أخرى'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    if (!submittedOrderId) return;

    let message = `*طلب جديد من La Prama 🥗*\n`;
    message += `----------------------------\n`;
    message += `🔖 *رقم الطلب:* ${submittedOrderId.slice(0, 8)}\n`;
    message += `👤 *الاسم:* ${formData.firstName} ${formData.lastName}\n`;
    message += `📱 *رقم الهاتف:* ${formData.phone}\n`;
    message += `🛵 *النوع:* ${orderType === 'delivery' ? 'توصيل للمنزل 🏠' : 'استلام من الفرع 🏪'}\n`;
    
    if (orderType === 'delivery') {
      message += `📍 *المنطقة:* ${selectedZone?.name}\n`;
      message += `📝 *العنوان:* ${formData.addressDetails}\n`;
    }

    message += `\n🛒 *محتويات الفاتورة:*\n`;
    submittedItems.forEach(item => {
        // Explicitly formatting variant, size and addons
        const variantText = item.variant ? ` (تتبيلة: ${item.variant === 'spicy' ? 'حار 🌶️' : 'عادي 👍'})` : '';
        const sizeText = item.selectedSize ? ` [حجم: ${item.selectedSize.name}]` : '';
        const addonsText = item.selectedAddons && item.selectedAddons.length > 0 
            ? `\n   + إضافات: ${item.selectedAddons.map(a => a.name).join(', ')}` 
            : '';
        
        message += `▫️ ${item.quantity}x ${item.title}${sizeText}${variantText}${addonsText}\n`;
    });

    message += `\n💰 *ملخص الحساب:*\n`;
    message += `*الإجمالي المطلوب:* ${lastOrderTotal} ج.م\n`;
    
    message += `----------------------------\n`;

    if (paymentMethod === 'online') {
      message += `💳 *طريقة الدفع:* فودافون كاش / انستا باي\n`;
      message += `✅ *مرفق سكرين شوت التحويل*\n`;
    } else {
      message += `💵 *طريقة الدفع:* عند الاستلام (كاش)\n`;
      message += `🕒 *أرغب في متابعة حالة الطلب*\n`;
    }

    const url = `https://wa.me/${CUSTOMER_SERVICE_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (items.length === 0 && !isSuccess) {
    onNavigate('menu');
    return null;
  }

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center animate-[fadeIn_0.5s_ease-out] px-4 py-8">
        <div className="size-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <span className="material-symbols-outlined text-5xl">check_circle</span>
        </div>
        <h2 className="text-3xl font-black text-[#181112] dark:text-white mb-4">تم تسجيل طلبك بنجاح!</h2>
        
        {paymentMethod === 'online' ? (
           <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl max-w-lg mx-auto mb-8 border-2 border-blue-100 dark:border-blue-800 shadow-xl">
             <div className="flex flex-col gap-3">
                 <p className="text-lg font-bold text-gray-700 dark:text-gray-300">لإكمال طلبك، يرجى تحويل المبلغ:</p>
                 <p className="text-4xl font-black text-primary">{lastOrderTotal} ج.م</p>
                 <div className="my-2 border-t border-b border-blue-200 dark:border-blue-700 py-4">
                    <p className="text-sm text-gray-500 mb-2">على الرقم التالي بواسطه (فودافون كاش او انستا باي)</p>
                    <p className="text-3xl font-black text-[#181112] dark:text-white dir-ltr font-mono select-all cursor-pointer bg-white dark:bg-black/20 p-2 rounded-lg" onClick={() => {navigator.clipboard.writeText(PAYMENT_NUMBER); alert('تم نسخ الرقم')}}>
                        {PAYMENT_NUMBER}
                    </p>
                 </div>
                 <p className="text-sm font-bold text-red-500 animate-pulse">
                     ⚠️ هام جداً: بعد التحويل، اضغط على زر الواتساب بالأسفل وأرسل "سكرين شوت" التحويل لتأكيد الأوردر فوراً.
                 </p>
             </div>
           </div>
        ) : (
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl max-w-lg mx-auto mb-8 border border-gray-200 dark:border-gray-700">
               <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                 شكراً لطلبك!
               </p>
               <p className="text-sm text-gray-600 dark:text-gray-400">
                 سيتم تجهيز طلبك والدفع عند الاستلام. يرجى الضغط على زر الواتساب بالأسفل لتأكيد الطلب مع خدمة العملاء.
               </p>
            </div>
        )}
        
        <p className="text-sm text-gray-500 mb-2">رقم الطلب المرجعي:</p>
        <p className="text-xl font-black text-gray-400 mb-6 select-all font-mono">{submittedOrderId?.slice(0, 8)}...</p>

        <button 
          onClick={handleWhatsAppRedirect}
          className="bg-[#25D366] text-white px-8 py-5 rounded-2xl font-black text-xl hover:bg-[#128C7E] transition-all shadow-xl shadow-green-500/30 flex items-center gap-3 animate-pulse hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-4xl">chat</span>
          <span>
              {paymentMethod === 'online' ? 'إرسال سكرين شوت التحويل' : 'تأكيد الطلب عبر واتساب'}
          </span>
        </button>
      </div>
    );
  }

  return (
    <section className="py-8 md:py-12 animate-[fadeIn_0.5s_ease-out]">
      <button 
        onClick={() => onNavigate('cart')} 
        className="flex items-center gap-2 text-gray-500 hover:text-primary mb-8 font-bold transition-colors"
      >
        <span className="material-symbols-outlined rtl-flip">arrow_forward</span>
        الرجوع للسلة
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Form Section */}
        <div>
          <h1 className="text-3xl font-black text-[#181112] dark:text-white mb-8">إتمام الطلب</h1>
          
          {/* Order Type Toggle */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setOrderType('delivery')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${orderType === 'delivery' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 text-gray-500'}`}
            >
              <span className="material-symbols-outlined text-3xl">delivery_dining</span>
              <span className="font-bold">توصيل للمنزل</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType('pickup')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${orderType === 'pickup' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 text-gray-500'}`}
            >
              <span className="material-symbols-outlined text-3xl">storefront</span>
              <span className="font-bold">استلام من المطعم</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person</span>
                    البيانات الشخصية
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">الاسم الأول</label>
                            <input name="firstName" value={formData.firstName} onChange={handleInputChange} required type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">اسم العائلة</label>
                            <input name="lastName" value={formData.lastName} onChange={handleInputChange} required type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">رقم الاتصال (مهم)</label>
                            <input name="phone" value={formData.phone} onChange={handleInputChange} required type="tel" className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border focus:ring-2 focus:ring-primary outline-none ${errors.phone ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`} dir="ltr" placeholder="01xxxxxxxxx" />
                            {errors.phone && <p className="text-red-500 text-xs font-bold mt-1">{errors.phone}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">رقم الواتساب (مهم)</label>
                            <input name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} required type="tel" className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border focus:ring-2 focus:ring-primary outline-none ${errors.whatsapp ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`} dir="ltr" placeholder="01xxxxxxxxx" />
                             {errors.whatsapp && <p className="text-red-500 text-xs font-bold mt-1">{errors.whatsapp}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Details (Conditional) */}
            {orderType === 'delivery' && (
                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-[fadeIn_0.3s_ease-out]">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">location_on</span>
                        عنوان التوصيل
                    </h3>
                    
                    {/* Warning Note */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-200 p-3 rounded-xl text-sm mb-4 leading-relaxed border border-yellow-100 dark:border-yellow-900/30">
                        <span className="font-bold ml-1">تنبيه:</span>
                        التوصيل متاح لاغلب المحافظات. إذا لم تجد منطقتك، يرجى اختيار الاستلام من الفرع أو أقرب منطقة متاحة.
                    </div>

                    <div className="space-y-4">
                        {/* Zone Search */}
                        <div className="space-y-2 relative" ref={dropdownRef}>
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">ابحث عن منطقتك</label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onFocus={() => setShowDropdown(true)}
                                    placeholder="اكتب اسم المنطقة..."
                                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border focus:ring-2 focus:ring-primary outline-none ${!selectedZone && searchTerm.length > 0 && filteredZones.length === 0 ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
                            </div>

                            {/* Dropdown Results */}
                            {showDropdown && filteredZones.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                                {filteredZones.map(zone => (
                                    <button
                                    key={zone.id}
                                    type="button"
                                    onClick={() => handleZoneSelect(zone)}
                                    className="w-full text-right px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                                    >
                                    <span className="font-bold text-[#181112] dark:text-white">{zone.name}</span>
                                    <span className="text-sm text-primary font-bold">{zone.fee} ج.م</span>
                                    </button>
                                ))}
                                </div>
                            )}

                             {searchTerm.length > 0 && !selectedZone && filteredZones.length === 0 && (
                                <p className="text-red-500 text-sm mt-1 font-bold">عذراً، التوصيل غير متاح لهذه المنطقة حالياً.</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">العنوان بالتفصيل</label>
                            <textarea name="addressDetails" value={formData.addressDetails} onChange={handleInputChange} required rows={2} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none" placeholder="اسم الشارع، رقم المبنى، علامة مميزة..."></textarea>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Methods */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">payments</span>
                    طريقة الدفع
                </h3>

                <div className="space-y-3">
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-800'}`}>
                        <input 
                            type="radio" 
                            name="payment" 
                            value="cash" 
                            checked={paymentMethod === 'cash'} 
                            onChange={() => setPaymentMethod('cash')}
                            className="w-5 h-5 text-primary focus:ring-primary border-gray-300"
                        />
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-600">money</span>
                            <span className="font-bold">دفع عند الاستلام (كاش)</span>
                        </div>
                    </label>

                    <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-800'}`}>
                        <input 
                            type="radio" 
                            name="payment" 
                            value="online" 
                            checked={paymentMethod === 'online'} 
                            onChange={() => setPaymentMethod('online')}
                            className="w-5 h-5 text-primary focus:ring-primary border-gray-300 mt-1"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="material-symbols-outlined text-purple-600">phonelink_ring</span>
                                <span className="font-bold">محفظة إلكترونية (فودافون كاش / انستا باي)</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">
                                {orderType === 'delivery' 
                                    ? 'الدفع مسبق يضمن سرعة التوصيل.' 
                                    : 'يمكنك التحويل مسبقاً لاستلام أسرع.'}
                            </p>
                            {/* Explicit Payment Number Display in Form */}
                            {paymentMethod === 'online' && (
                                <div className="bg-blue-50 dark:bg-blue-900/10 p-2 rounded-lg border border-blue-100 dark:border-blue-800 mt-1">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-bold">الرقم المعتمد للتحويل:</p>
                                    <p className="text-lg font-black text-primary font-mono dir-ltr text-left">{PAYMENT_NUMBER}</p>
                                </div>
                            )}
                        </div>
                    </label>
                </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || (orderType === 'delivery' && !selectedZone) || !!errors.phone || !!errors.whatsapp}
              className={`w-full bg-primary text-white py-4 rounded-xl font-black text-xl shadow-xl shadow-primary/20 transition-all active:scale-95 mt-4 flex justify-center items-center gap-2 ${isSubmitting || (orderType === 'delivery' && !selectedZone) || !!errors.phone || !!errors.whatsapp ? 'opacity-70 cursor-not-allowed bg-gray-400 shadow-none' : 'hover:bg-[#4A5D2E]'}`}
            >
              {isSubmitting ? 'جاري المعالجة...' : 'تأكيد ومتابعة على واتساب'}
            </button>
          </form>
        </div>

        {/* Order Preview */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-6 lg:p-8 h-fit border border-gray-100 dark:border-gray-800 sticky top-24">
           <h3 className="text-xl font-black text-[#181112] dark:text-white mb-6">ملخص الطلب</h3>
           <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto scrollbar-hide">
             {items.map((item, index) => (
               <div key={`${item.id}-${item.variant || index}-${item.selectedSize?.name}`} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4 last:border-0">
                 <div className="flex items-center gap-3">
                   <div className="size-12 bg-white rounded-lg overflow-hidden shrink-0">
                     <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                   </div>
                   <div>
                     <p className="font-bold text-sm text-[#181112] dark:text-white">{item.title}</p>
                     <p className="text-xs text-gray-500">
                         {item.quantity}x
                         {item.variant && <span className="mx-1 text-primary">({item.variant === 'spicy' ? 'حار' : 'عادي'})</span>}
                         {item.selectedSize && <span className="mx-1 text-gray-600">[{item.selectedSize.name}]</span>}
                     </p>
                   </div>
                 </div>
                 <span className="font-bold text-sm whitespace-nowrap">{item.price * item.quantity} {item.currency}</span>
               </div>
             ))}
           </div>
           
           <div className="space-y-3 pt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>المجموع</span>
                <span>{subtotal} {items[0]?.currency || 'ج.م'}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>رسوم التوصيل</span>
                <span>{orderType === 'delivery' ? (selectedZone ? `${deliveryFee} ج.م` : '--') : 'مجاني (استلام)'}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-black text-[#181112] dark:text-white pt-2">
                <span>الإجمالي الكلي</span>
                <span className="text-primary">{currentTotal} {items[0]?.currency || 'ج.م'}</span>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};