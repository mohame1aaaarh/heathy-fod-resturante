import React, { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { MenuItem, Category, ProductSize, ProductAddon } from '../types';

interface FullMenuProps {
  items: MenuItem[];
  categories?: Category[];
  onAddToCart: (item: MenuItem, variant?: 'spicy' | 'regular', size?: ProductSize, addons?: ProductAddon[]) => void;
}

export const FullMenu: React.FC<FullMenuProps> = ({ items, categories = [], onAddToCart }) => {
  // Default to first category if available, else 'all' or empty
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');

  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
        // Set default to first category (usually Family Meals based on sort)
        setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  const handleCategoryClick = (catId: string) => {
    setActiveCategoryId(catId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter items based on active category
  const displayItems = items.filter(item => item.category === activeCategoryId);
  const activeCategoryConfig = categories.find(c => c.id === activeCategoryId);

  return (
    <section className="py-8 md:py-12 animate-[fadeIn_0.5s_ease-out]">
      {/* Page Header */}
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl md:text-6xl font-black text-[#181112] dark:text-white mb-4 relative inline-block">
          <span className="relative z-10">قائمة الطعام</span>
          <span className="absolute bottom-2 left-0 w-full h-3 bg-primary/20 -skew-x-12 z-0"></span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium max-w-2xl mx-auto">
          تذوق الطعم الأصلي للقرمشة
        </p>
      </div>

      {/* Categories Filter - Sticky & Scrollable with Icons */}
      <div className="sticky top-[70px] md:top-[80px] z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md py-4 border-b border-gray-100 dark:border-gray-800 mb-8 -mx-6 lg:-mx-10 px-6 lg:px-10 shadow-sm transition-all">
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex-none snap-start rounded-full px-5 py-2.5 transition-all duration-300 border border-transparent whitespace-nowrap flex items-center gap-2
                ${activeCategoryId === cat.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50'}`}
            >
              <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
              <span className="font-bold text-sm">{cat.label}</span>
            </button>
          ))}
          <div className="w-4 flex-none"></div>
        </div>
      </div>

      {/* Active Category Display */}
      {activeCategoryConfig && (
        <div className="flex flex-col items-center mb-8 animate-[fadeIn_0.3s_ease-out]">
             <div className="flex items-center gap-3 text-primary opacity-90 mb-2">
                <span className="material-symbols-outlined text-3xl">{activeCategoryConfig.icon}</span>
             </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#181112] dark:text-white mb-1">
                {activeCategoryConfig.label}
            </h2>
            <p className="text-sm font-script text-gray-400">{activeCategoryConfig.label_en}</p>
        </div>
      )}

      {/* Items Grid - Compact on Mobile (grid-cols-2 with gap-3) */}
      {displayItems.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 pb-12">
            {displayItems.map((item) => (
            <ProductCard 
                key={item.id} 
                item={item} 
                categoryConfig={activeCategoryConfig} 
                onAddToCart={onAddToCart} 
            />
            ))}
        </div>
      ) : (
        <div className="text-center py-20 flex flex-col items-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">restaurant_menu</span>
            <p className="text-lg text-gray-400 font-bold">لا توجد وجبات في هذا القسم حالياً</p>
        </div>
      )}
    </section>
  );
};