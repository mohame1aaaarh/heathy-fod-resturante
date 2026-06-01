import React from 'react';
import { Logo } from './Logo';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-primary text-white overflow-hidden relative mt-auto font-sans">
      {/* Visual Hook Section (Recreating the 'BEFORE YOU BLINK' poster) */}
      <div className="relative w-full px-4 py-16 md:py-24 flex flex-col items-center justify-center text-center overflow-hidden">
        
        {/* Top Decoration Row */}
        <div className="absolute top-8 md:top-12 left-0 right-0 px-4 md:px-12 flex justify-between items-start w-full max-w-[1400px] mx-auto z-10">
          
          {/* Left Stars */}
          <div className="flex gap-2 md:gap-4 text-black">
            {[1, 2, 3].map((_, i) => (
              <svg key={`l-${i}`} className="size-6 md:size-10 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>

          {/* Center Badge (Offset) */}
          <div className="hidden md:flex absolute left-1/3 -translate-x-1/2 top-0 border-[3px] border-black bg-primary text-black transform -rotate-1 hover:rotate-0 transition-transform duration-300">
             <div className="flex">
                {/* Vertical Text Column */}
                <div className="flex flex-col justify-between py-1 px-1.5 border-r-[3px] border-black text-[0.6rem] font-bold leading-[1.1] tracking-wider text-left">
                   <span>HEALTHY</span>
                   <span>TAS</span>
                   <span>GRE</span>
                   <span>AT</span>
                </div>
                {/* CF Logo Column */}
                   <div className="flex flex-col justify-center items-center px-2 py-1">
                    <div className="relative">
                      <span className="text-4xl font-black font-logo leading-none block">L</span>
                      <span className="absolute -top-1 -right-2 text-[0.5rem] font-bold">®</span>
                    </div>
                    <span className="text-4xl font-black font-logo leading-none block mt-[-0.2em]">P</span>
                 </div>
             </div>
          </div>

          {/* Right Stars */}
          <div className="flex gap-2 md:gap-4 text-black">
            {[1, 2, 3].map((_, i) => (
              <svg key={`r-${i}`} className="size-6 md:size-10 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Main Typography - Adjusted spacing to prevent overlap */}
        <div className="relative z-0 w-full max-w-[90rem] mx-auto flex flex-col items-center leading-none mt-10 md:mt-20 select-none">
            <h2 className="text-[17vw] md:text-[14rem] font-logo font-black tracking-wide text-white drop-shadow-sm w-full text-center">
            TASTE
            </h2>
            <h2 className="text-[17vw] md:text-[14rem] font-logo font-black tracking-wide text-white drop-shadow-sm w-full text-center flex justify-center gap-8 md:gap-16 mt-2 md:mt-0">
              <span>THE</span>
              <span>HEALTHY.</span>
            </h2>
        </div>

        {/* Overlays Wrapper */}
        <div className="relative w-full max-w-4xl mx-auto h-0 flex justify-center items-visible">
          
          {/* Stamp - Positioned between YOU and BLINK */}
          <div className="absolute -top-[10vw] md:-top-[8rem] z-10 pointer-events-none">
             <div className="relative size-20 md:size-32 group select-none">
                <div className="absolute inset-0 animate-spin-slow opacity-90">
                   <svg viewBox="0 0 100 100" className="w-full h-full">
                     <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                     <text className="text-[10px] font-bold uppercase tracking-[0.2em] fill-black">
                    <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
                      ★ HEALTHY NEVER TASTED THIS GOOD ★
                    </textPath>
                     </text>
                   </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="font-script text-black text-xl md:text-2xl transform -rotate-12">yummy</span>
                </div>
                <div className="absolute inset-3 border border-black rounded-full opacity-50"></div>
             </div>
          </div>

          {/* Script Text - Positioned below the main text */}
          <div className="absolute top-[2vw] md:top-[2rem] z-20">
             <div className="relative inline-block transform -rotate-2">
                <span className="font-script text-black text-5xl md:text-8xl relative z-10 block whitespace-nowrap">
                  Healthy Food
                </span>
               <svg className="absolute -bottom-2 md:-bottom-4 left-1/2 -translate-x-1/2 w-[110%] h-8 md:h-12 text-black pointer-events-none" viewBox="0 0 200 60" preserveAspectRatio="none">
                 <path d="M10,20 Q100,60 190,10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
               </svg>
             </div>
          </div>
        </div>

        {/* Bottom Logo - Replaced with Image for exact match */}
        <div className="mt-36 md:mt-56 mb-12 transform hover:scale-105 transition-transform duration-300">
           {/* Added brightness-0 invert to make the logo white */}
           <Logo className="h-24 md:h-32 w-auto mx-auto brightness-0 invert" />
        </div>

      </div>

      {/* Functional Footer Strip */}
      <div className="border-t border-white/20 bg-black/20 backdrop-blur-xl">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4">
             {/* Added brightness-0 invert to make the logo white */}
             <Logo className="h-10 w-auto brightness-0 invert" />
             <div className="text-right">
                 <span className="text-xs opacity-70">HEALTHY TASTE</span>
             </div>
           </div>
           
           <div className="flex flex-col items-center md:items-end gap-1 text-xs opacity-60 font-mono">
              <span className="dir-ltr">© 2025 La Prama.</span>
             <span className="dir-ltr">
                Developed by <strong className="text-white opacity-90">DEVELOEGYPT</strong>
             </span>
           </div>
        </div>
      </div>
    </footer>
  );
};