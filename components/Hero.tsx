import React from 'react';

interface HeroProps {
  onNavigate?: (page: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section className="py-10 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="flex flex-col gap-8 order-2 lg:order-1 text-right">
          <div className="flex flex-col relative z-10">
            {/* Tagline */}
            <span className="text-primary font-black uppercase tracking-widest text-sm animate-pulse mb-2 inline-block">
              لو الدايت بقي دراما .. الحل في لابراما
            </span>
            
            {/* Stylized Headline - Centered Block Layout */}
            <div className="relative select-none text-center w-full mt-8">
                <span className="absolute -top-10 left-0 md:left-8 font-script text-4xl md:text-5xl text-gray-300 dark:text-gray-600 transform -rotate-12 z-0 opacity-90">
                  Healthy
                </span>
                <h1 className="relative z-10 font-logo font-black italic flex flex-col items-center leading-[0.8]">
                  {/* Line 1: LA PRAMA */}
                  <span className="block text-[7.5rem] sm:text-[10rem] lg:text-[13.5rem] text-[#181112] dark:text-white drop-shadow-xl transform -skew-x-6 origin-bottom transition-transform hover:skew-x-0 duration-500 tracking-wide">
                    LA PRAMA
                  </span>
                  {/* Line 2: هتبدع في الدايت */}
                  <span className="block text-[4.5rem] sm:text-[6rem] lg:text-[8rem] text-primary drop-shadow-lg -mt-2 sm:-mt-4 lg:-mt-8 transform -skew-x-6 origin-top transition-transform hover:skew-x-0 duration-500 whitespace-nowrap tracking-tight">
                    هتبدع في الدايت
                  </span>
                </h1>
            </div>

            {/* Updated Description */}
            <p className="text-gray-600 dark:text-gray-400 text-lg lg:text-xl font-medium max-w-lg mt-8 leading-relaxed border-r-4 border-primary pr-6">
              اطلب الآن أونلاين واستمتع بألذ الوجبات الصحية لباب بيتك، أو وفر وقتك واختر "الاستلام من الفرع". لابراما أطعم وألذ دايت في المنصورة.
            </p>
          </div>
          
          <div className="relative flex flex-wrap gap-4 mt-2">
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
              className="flex-1 sm:flex-none min-w-[240px] h-20 bg-primary text-white rounded-full font-black text-2xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              <span className="material-symbols-outlined relative z-10 text-4xl">restaurant_menu</span>
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