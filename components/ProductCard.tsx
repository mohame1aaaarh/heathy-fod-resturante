import React, { useState } from 'react';
import { MenuItem, ProductSize, ProductAddon, Category } from '../types';

interface ProductCardProps {
  item: MenuItem;
  categoryConfig?: Category; // Pass category config to know if spicy is allowed
  onAddToCart?: (item: MenuItem, variant?: 'spicy' | 'regular', size?: ProductSize, addons?: ProductAddon[]) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, categoryConfig, onAddToCart }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Temporary selection state
  const [tempSelection, setTempSelection] = useState<{
      variant: 'spicy' | 'regular' | undefined,
      size: ProductSize | undefined,
      selectedAddons: ProductAddon[]
  }>({ variant: undefined, size: undefined, selectedAddons: [] });

  const isAvailable = item.is_available !== false;
  
  // Determine if we need to show options
  // 1. Spicy: if category allows it AND item is not 'sides', 'drinks', 'dessert' (or rely purely on category config)
  const showSpicyOption = categoryConfig?.has_spicy_option ?? false;
  
  // 2. Sizes: if item has sizes
  const showSizes = item.has_sizes && item.sizes && item.sizes.length > 0;
  
  // 3. Addons: if item has addons
  const showAddons = item.addons && item.addons.length > 0;

  const handleAddClick = () => {
    if (!onAddToCart || !isAvailable) return;

    if (showSpicyOption || showSizes || showAddons) {
      setTempSelection({
          variant: showSpicyOption ? 'regular' : undefined,
          size: showSizes && item.sizes ? item.sizes[0] : undefined,
          selectedAddons: []
      });
      setShowOptions(true);
    } else {
      // Add directly for simple items
      onAddToCart(item);
      triggerAnimation();
    }
  };

  const toggleAddon = (addon: ProductAddon) => {
      setTempSelection(prev => {
          const exists = prev.selectedAddons.find(a => a.name === addon.name);
          if (exists) {
              return { ...prev, selectedAddons: prev.selectedAddons.filter(a => a.name !== addon.name) };
          } else {
              return { ...prev, selectedAddons: [...prev.selectedAddons, addon] };
          }
      });
  };

  const handleConfirmSelection = () => {
    if (onAddToCart) {
        onAddToCart(item, tempSelection.variant, tempSelection.size, tempSelection.selectedAddons);
        setShowOptions(false);
        triggerAnimation();
    }
  };

  const triggerAnimation = () => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1000);
  };

  // Calculate dynamic price for modal
  const basePrice = tempSelection.size ? tempSelection.size.price : item.price;
  const addonsPrice = tempSelection.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const totalPrice = basePrice + addonsPrice;

  return (
    <>
      <div className={`group flex flex-col gap-3 md:gap-5 p-2 md:p-4 bg-white dark:bg-background-dark border rounded-xl hover:shadow-2xl transition-all duration-300 ${!isAvailable ? 'opacity-70 border-gray-100 dark:border-gray-800' : 'border-gray-100 dark:border-gray-800'}`}>
        <div className="relative overflow-hidden rounded-lg md:rounded-xl aspect-square bg-gray-100 dark:bg-gray-800">
          <div 
            className={`w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-500 ${isAvailable ? 'group-hover:scale-110' : 'grayscale'}`} 
            style={{ backgroundImage: `url("${item.imageUrl}")` }}
          />
          
          {!isAvailable && (
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                <span className="bg-red-600 text-white px-2 py-1 md:px-4 md:py-1 rounded-full font-bold text-xs md:text-sm transform -rotate-12 border-2 border-white/50">
                    غير متاح
                </span>
             </div>
          )}

          {isAvailable && (
            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 transform -rotate-12 transition-transform duration-300 group-hover:rotate-0">
                <div className="bg-white dark:bg-background-dark p-0.5 md:p-1 rounded-full shadow-xl shadow-black/20">
                <div className="bg-primary text-white w-10 h-10 md:w-16 md:h-16 rounded-full flex flex-col items-center justify-center border-2 border-dashed border-white/40">
                    {item.has_sizes ? (
                        <>
                            <span className="text-[8px] md:text-[10px] font-bold leading-none">يبدأ</span>
                            <span className="text-xs md:text-lg font-black leading-none">{item.price}</span>
                        </>
                    ) : (
                        <span className="text-sm md:text-xl font-black leading-none">{item.price}</span>
                    )}
                    <span className="text-[8px] md:text-[10px] font-bold mt-0.5">{item.currency}</span>
                </div>
                </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row items-start gap-2">
          <div className="text-right w-full">
            <h3 className="text-sm md:text-xl font-black text-[#181112] dark:text-white group-hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
            <p className="text-primary text-[10px] md:text-sm font-bold mt-1 line-clamp-2 md:line-clamp-none">{item.subtitle}</p>
            {item.nutritionFacts && item.nutritionFacts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.nutritionFacts.map((fact, idx) => (
                  <span key={idx} className="text-[9px] md:text-[10px] bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-700 font-bold whitespace-nowrap">
                    {fact.label}: {fact.value}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={handleAddClick}
            disabled={!isAvailable}
            className={`w-full md:w-12 h-8 md:h-12 md:rounded-full rounded-lg flex items-center justify-center shadow-lg transition-all active:scale-90 text-white
                ${!isAvailable 
                    ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                    : isAdded 
                        ? 'bg-green-500 shadow-green-500/30' 
                        : 'bg-primary shadow-primary/30 hover:bg-red-600'
                }`}
          >
            <span className={`material-symbols-outlined font-black text-lg md:text-2xl transition-transform duration-300 ${isAdded ? 'rotate-[-360deg]' : ''}`}>
              {!isAvailable ? 'block' : isAdded ? 'check' : 'add'}
            </span>
            <span className="md:hidden mr-2 font-bold text-sm">{isAdded ? 'تمت الإضافة' : 'أضف للسلة'}</span>
          </button>
        </div>
      </div>

      {/* Option Selection Modal / Bottom Sheet */}
      {showOptions && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowOptions(false)}></div>
          
          <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-3xl p-6 md:p-8 w-full md:max-w-md shadow-2xl animate-[slideUp_0.3s_ease-out] md:animate-[fadeIn_0.2s_ease-out] max-h-[85vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 md:hidden"></div>
            
            <button 
              onClick={() => setShowOptions(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors hidden md:block"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-[#181112] dark:text-white mb-2">{item.title}</h3>
              <p className="text-gray-500">اختر تفاصيل وجبتك</p>
            </div>

            <div className="space-y-6">
                {/* Variant Selection (Spicy/Regular) - Conditioned on Category Config */}
                {showSpicyOption && (
                    <div>
                        <h4 className="font-bold mb-3 text-sm text-gray-400">نوع التتبيلة</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setTempSelection(prev => ({...prev, variant: 'regular'}))}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${tempSelection.variant === 'regular' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'border-gray-100 dark:border-gray-800'}`}
                            >
                                <span className="material-symbols-outlined">thumb_up</span>
                                <span className="font-bold">عادي</span>
                            </button>
                            <button 
                                onClick={() => setTempSelection(prev => ({...prev, variant: 'spicy'}))}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${tempSelection.variant === 'spicy' ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-600' : 'border-gray-100 dark:border-gray-800'}`}
                            >
                                <span className="material-symbols-outlined">local_fire_department</span>
                                <span className="font-bold">حار</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Size Selection */}
                {showSizes && item.sizes && (
                    <div>
                        <h4 className="font-bold mb-3 text-sm text-gray-400">الحجم</h4>
                        <div className="space-y-2">
                            {item.sizes.map((size, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setTempSelection(prev => ({...prev, size: size}))}
                                    className={`w-full flex justify-between items-center p-3 rounded-xl border-2 transition-all ${tempSelection.size?.name === size.name ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 dark:border-gray-800'}`}
                                >
                                    <span className="font-bold">{size.name}</span>
                                    <span className="font-black">{size.price} {item.currency}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Addons / Combo Suggestions */}
                {showAddons && item.addons && (
                    <div>
                         <h4 className="font-bold mb-3 text-sm text-gray-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">recommend</span>
                            أكمل وجبتك (إضافات مقترحة)
                         </h4>
                         <div className="space-y-2">
                            {item.addons.map((addon, idx) => {
                                const isSelected = tempSelection.selectedAddons.some(a => a.name === addon.name);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => toggleAddon(addon)}
                                        className={`w-full flex justify-between items-center p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-gray-100 dark:border-gray-800'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400'}`}>
                                                {isSelected && <span className="material-symbols-outlined text-sm">check</span>}
                                            </div>
                                            <span className="font-bold">{addon.name}</span>
                                        </div>
                                        <span className="font-black text-sm">+{addon.price} {item.currency}</span>
                                    </button>
                                );
                            })}
                         </div>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 font-bold">السعر النهائي</span>
                    <span className="text-2xl font-black text-primary animate-[pulse_0.5s]">
                        {totalPrice} {item.currency}
                    </span>
                </div>
                <button 
                    onClick={handleConfirmSelection}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 active:scale-95 transition-transform"
                >
                    إضافة للسلة ({totalPrice} {item.currency})
                </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
};