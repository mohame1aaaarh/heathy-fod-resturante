import React from 'react';
import { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number, variant?: 'spicy' | 'regular', sizeName?: string) => void;
  onRemove: (id: string, variant?: 'spicy' | 'regular', sizeName?: string) => void;
  onNavigate: (page: string) => void;
}

export const Cart: React.FC<CartProps> = ({ items, onUpdateQuantity, onRemove, onNavigate }) => {
  // Calculate total: (Price + Addons Price) * Quantity
  const subtotal = items.reduce((sum, item) => {
      const addonsCost = item.selectedAddons ? item.selectedAddons.reduce((a, b) => a + b.price, 0) : 0;
      return sum + ((item.price + addonsCost) * item.quantity);
  }, 0);
  
  const total = subtotal;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-[fadeIn_0.5s_ease-out]">
        <div className="size-40 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-6xl text-gray-400">shopping_cart_off</span>
        </div>
        <h2 className="text-3xl font-black text-[#181112] dark:text-white mb-2">سلتك فارغة!</h2>
        <p className="text-gray-500 text-lg mb-8 max-w-md">يبدو أنك لم تضف أي وجبات لذيذة بعد. تصفح القائمة واشبع جوعك.</p>
        <button 
          onClick={() => onNavigate('menu')}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-red-600 transition-colors shadow-lg shadow-primary/30"
        >
          تصفح القائمة
        </button>
      </div>
    );
  }

  return (
    <section className="py-12 animate-[fadeIn_0.5s_ease-out]">
      <h1 className="text-4xl font-black text-[#181112] dark:text-white mb-8 border-r-8 border-primary pr-4">سلة المشتريات</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item, index) => {
            const addonsCost = item.selectedAddons ? item.selectedAddons.reduce((a, b) => a + b.price, 0) : 0;
            const itemTotal = (item.price + addonsCost) * item.quantity;
            
            return (
                <div key={`${item.id}-${item.variant || index}-${item.selectedSize?.name}`} className="flex gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
                {/* Image */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-[#181112] dark:text-white">
                                {item.title}
                            </h3>
                            <div className="flex flex-col gap-1 mt-1">
                                <div className="flex flex-wrap gap-2">
                                    {item.variant && (
                                        <span className={`text-xs py-1 px-2 rounded-full inline-flex items-center gap-1 ${item.variant === 'spicy' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                            {item.variant === 'spicy' ? (
                                                <><span className="material-symbols-outlined text-[14px]">local_fire_department</span> حار</>
                                            ) : (
                                                <><span className="material-symbols-outlined text-[14px]">thumb_up</span> عادي</>
                                            )}
                                        </span>
                                    )}
                                    {item.selectedSize && (
                                        <span className="text-xs py-1 px-2 rounded-full inline-flex items-center gap-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                            <span className="material-symbols-outlined text-[14px]">layers</span> {item.selectedSize.name}
                                        </span>
                                    )}
                                </div>
                                {/* Show selected addons */}
                                {item.selectedAddons && item.selectedAddons.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {item.selectedAddons.map((addon, i) => (
                                            <span key={i} className="text-[10px] py-0.5 px-2 rounded border border-green-200 text-green-700 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                                                + {addon.name} ({addon.price})
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button 
                        onClick={() => onRemove(item.id, item.variant, item.selectedSize?.name)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                        <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        {item.price} {item.currency} 
                        {addonsCost > 0 && <span className="text-xs"> (+ {addonsCost} إضافات)</span>}
                    </p>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button 
                        onClick={() => onUpdateQuantity(item.id, -1, item.variant, item.selectedSize?.name)}
                        className="size-8 flex items-center justify-center bg-white dark:bg-gray-700 rounded-md shadow-sm text-gray-600 dark:text-white hover:text-primary active:scale-95 transition-all"
                        >
                        <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="w-4 text-center font-bold text-[#181112] dark:text-white">{item.quantity}</span>
                        <button 
                        onClick={() => onUpdateQuantity(item.id, 1, item.variant, item.selectedSize?.name)}
                        className="size-8 flex items-center justify-center bg-white dark:bg-gray-700 rounded-md shadow-sm text-gray-600 dark:text-white hover:text-primary active:scale-95 transition-all"
                        >
                        <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                    </div>
                    <p className="font-black text-lg text-primary">{itemTotal} {item.currency}</p>
                    </div>
                </div>
                </div>
            )})}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 sticky top-24">
            <h3 className="text-xl font-black text-[#181112] dark:text-white mb-6">ملخص الطلب</h3>
            
            <div className="space-y-4 mb-6 pb-6 border-b border-dashed border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>المجموع</span>
                <span className="font-bold text-[#181112] dark:text-white">{subtotal} {items[0].currency}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>التوصيل</span>
                <span>يُحسب في الخطوة التالية</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold text-[#181112] dark:text-white">الإجمالي المبدئي</span>
              <span className="text-2xl font-black text-primary">{total} {items[0].currency}</span>
            </div>

            <button 
              onClick={() => onNavigate('checkout')}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-red-600 shadow-xl shadow-primary/20 transition-all active:scale-95 flex justify-center items-center gap-2"
            >
              <span>متابعة الشراء</span>
              <span className="material-symbols-outlined rtl-flip">arrow_back</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};