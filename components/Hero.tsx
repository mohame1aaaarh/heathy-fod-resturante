import React from 'react';

interface HeroProps {
  onNavigate?: (page: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section className="py-6 md:py-10 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
        {/* Text Content */}
        <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 order-2 lg:order-1 text-right">
          <div className="flex flex-col relative z-10">
            {/* La Prama Brand Mark - Decorative */}
            <div className="flex items-center gap-2 mb-2 md:mb-4">
              <span className="w-8 h-0.5 bg-primary/40 rounded-full"></span>
              <span className="font-italian text-primary/60 text-sm md:text-base italic tracking-wide">La Prama</span>
            </div>
            
            {/* Stylized Headline - Slogan Focus */}
            <div className="relative select-none text-center w-full">
                <h1 className="relative z-10 font-logo font-black italic flex flex-col items-center leading-[0.85]">
                  {/* Line 1: لو الدايت بقي دراما */}
                  <span className="block text-[3.2rem] sm:text-[4.5rem] md:text-[6.5rem] lg:text-[8rem] text-[#181112] dark:text-white drop-shadow-xl transform -skew-x-6 origin-bottom transition-transform hover:skew-x-0 duration-500 tracking-wide leading-[0.85]">
                    لو الدايت بقي
                  </span>
                  <span className="block text-[3.2rem] sm:text-[4.5rem] md:text-[6.5rem] lg:text-[8rem] text-primary drop-shadow-xl transform -skew-x-6 origin-bottom transition-transform hover:skew-x-0 duration-500 tracking-wide leading-[0.85] -mt-1 sm:-mt-2">
                    دراما
                  </span>
                  {/* Line 2: الحل مع لابراما */}
                  <span className="block text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6rem] text-[#181112] dark:text-white drop-shadow-lg mt-1 sm:mt-0 transform -skew-x-6 origin-top transition-transform hover:skew-x-0 duration-500 whitespace-nowrap tracking-tight leading-[0.85]">
                    الحل مع
                  </span>
                  <span className="block text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6rem] text-primary drop-shadow-lg transform -skew-x-6 origin-top transition-transform hover:skew-x-0 duration-500 whitespace-nowrap tracking-tight leading-[0.85] -mt-1 sm:-mt-2">
                    لابراما
                  </span>
                </h1>
            </div>

            {/* Updated Description */}
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-lg lg:text-xl font-medium max-w-lg mt-4 md:mt-6 lg:mt-8 leading-relaxed border-r-4 border-primary pr-4 md:pr-6">
              اطلب الآن أونلاين واستمتع بألذ الوجبات الصحية لباب بيتك، أو وفر وقتك واختر "الاستلام من الفرع". لابراما أطعم وألذ دايت في المنصورة.
            </p>
          </div>
          
          <div className="relative flex flex-wrap gap-3 md:gap-4 mt-1 md:mt-2">
             {/* Visual Cue Arrow - Moved further left (right-48) to avoid text overlap */}
             <div className="hidden lg:block absolute -top-12 right-48 transform -rotate-12">
                <span className="font-script text-2xl text-primary animate-bounce block">ابدأ الآن!</span>
                <svg className="w-8 h-8 text-primary transform rotate-90 scale-x-[-1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
             </div>

            {/* Main CTA Button - Larger and Changed to View Menu */}
            <button 
              onClick={() => onNavigate && onNavigate('menu')}
              className="flex-1 sm:flex-none min-w-[200px] md:min-w-[240px] h-14 md:h-16 lg:h-20 bg-primary text-white rounded-full font-black text-lg md:text-xl lg:text-2xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              <span className="material-symbols-outlined relative z-10 text-2xl md:text-3xl lg:text-4xl">restaurant_menu</span>
              <span className="relative z-10">شوف المنيو</span>
            </button>
            
            {/* Removed Pickup Button */}
          </div>
        </div>

        {/* Image Content */}
        <div className="order-1 lg:order-2">
          <div className="relative group perspective-1000">
            <div className="absolute -inset-4 bg-primary/10 rounded-xl blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
            <div 
              className="relative aspect-square w-full bg-center bg-no-repeat bg-cover rounded-xl shadow-2xl transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-[1.02]" 
              style={{ backgroundImage: 'url("/header.png")' }}
            >
              {/* Floating Badge - Changed to 'Yalla Qarmasha' */}
              <div className="absolute -bottom-6 -right-4 md:bottom-8 md:-right-8 bg-white dark:bg-background-dark p-1.5 rounded-full shadow-2xl animate-[bounce_3s_infinite]">
                 <div className="bg-primary text-white w-24 h-24 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center border-4 border-dashed border-white/30">
                    <span className="text-xl md:text-3xl font-black text-center leading-tight -rotate-3">
                      دايت<br/>بدراما
                    </span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};