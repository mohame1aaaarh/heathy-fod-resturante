import React from 'react';
import { ProductCard } from './ProductCard';
import { MenuItem, Category } from '../types';

interface MenuGridProps {
  items: MenuItem[];
  categories?: Category[];
  onNavigate?: (page: string) => void;
  onAddToCart?: (item: MenuItem, variant?: 'spicy' | 'regular') => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({ items, categories = [], onNavigate, onAddToCart }) => {
  // Filter for featured items based on DB flag
  const featuredItems = items.filter(item => item.is_featured);
  
  if (featuredItems.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="pt-16 pb-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-end">
        <div className="text-right">
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-[#181112] dark:text-white">✨ عروضنا الخاصة</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">توليفة السعادة بأسعار مميزة</p>
        </div>
        <button 
          onClick={() => onNavigate && onNavigate('menu')}
          className="hidden sm:flex items-center gap-2 text-primary font-bold hover:underline transition-all hover:gap-3"
        >
          عرض المنيو بالكامل <span className="material-symbols-outlined transform rotate-180">arrow_forward</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 pb-24">
        {featuredItems.map((item) => {
           // Find category for this item to determine spicy option
           const cat = categories.find(c => c.id === item.category);
           return (
             <ProductCard 
                key={item.id} 
                item={item} 
                categoryConfig={cat}
                onAddToCart={onAddToCart} 
             />
           );
        })}
      </div>
    </section>
  );
};