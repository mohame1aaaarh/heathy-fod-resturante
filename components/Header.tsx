import React from 'react';
import { Logo } from './Logo';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: 'home' | 'menu' | 'cart' | 'checkout';
  cartCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, cartCount = 0 }) => {
  return (
    <div className="sticky top-0 z-50 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-3 md:py-4">
        <header className="flex items-center justify-between whitespace-nowrap">
          {/* Logo Section */}
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => onNavigate('home')} className="block hover:opacity-90 transition-opacity flex items-center gap-2 md:gap-3">
              <Logo className="h-8 md:h-12 w-auto" />
              <span className="font-italian text-primary text-xl md:text-3xl font-semibold italic tracking-tight leading-none">
                La Prama
              </span>
            </button>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex flex-1 justify-center gap-10">
            <button 
              onClick={() => onNavigate('home')}
              className={`hover:text-primary transition-colors text-base font-bold ${currentPage === 'home' ? 'text-primary' : 'text-[#181112] dark:text-white'}`}
            >
              الرئيسية
            </button>
            <button 
              onClick={() => onNavigate('menu')}
              className={`hover:text-primary transition-colors text-base font-bold ${currentPage === 'menu' ? 'text-primary' : 'text-[#181112] dark:text-white'}`}
            >
              القائمة
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 md:gap-4">
            <button className="flex min-w-[auto] sm:min-w-[130px] items-center justify-center gap-2 rounded-full h-10 md:h-11 px-4 md:px-6 bg-primary text-white text-sm md:text-base font-black transition-transform active:scale-95 shadow-lg shadow-primary/20 hover:bg-red-600">
              <span className="material-symbols-outlined text-sm md:text-base">call</span>
              <span className="dir-ltr text-sm md:text-base">01554400554</span>
            </button>
            
            <button 
              onClick={() => onNavigate('cart')}
              className="size-10 md:size-11 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary/20 transition-all relative active:scale-90"
            >
              <span className="material-symbols-outlined text-xl md:text-2xl">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white shadow-sm border-2 border-white dark:border-background-dark animate-[bounce_0.5s_ease-out]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </header>
      </div>
    </div>
  );
};