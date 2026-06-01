import React from 'react';
import { CartItem } from '../types';

interface StickyCartProps {
  items: CartItem[];
  onNavigate: (page: string) => void;
  isVisible: boolean;
}

export const StickyCart: React.FC<StickyCartProps> = ({ items, onNavigate, isVisible }) => {
  if (!isVisible || items.length === 0) return null;

  const count = items.reduce((acc, item) => acc + item.quantity, 0);
  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden animate-[slideUp_0.3s_ease-out]">
      <button 
        onClick={() => onNavigate('cart')}
        className="w-full bg-[#181112] text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center border border-gray-800 backdrop-blur-md bg-opacity-95 active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary text-white size-10 rounded-full flex items-center justify-center font-black shadow-lg shadow-primary/40 animate-pulse">
            {count}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-bold">الإجمالي</p>
            <p className="text-lg font-black leading-none">{total} ج.م</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 font-bold text-primary">
          <span>عرض السلة</span>
          <span className="material-symbols-outlined rtl-flip">arrow_back</span>
        </div>
      </button>
    </div>
  );
};