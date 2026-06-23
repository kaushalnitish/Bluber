import React from "react";

interface IllustrationProps {
  className?: string;
}

export const ScooterIllustration: React.FC<IllustrationProps> = () => (
  <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#EDF7EF]">
    {/* Speed lines */}
    <div className="absolute left-2 top-8 w-6 h-0.5 bg-emerald-300/40 rounded-full animate-pulse"></div>
    <div className="absolute left-4 top-14 w-4 h-0.5 bg-emerald-300/30 rounded-full"></div>
    <div className="absolute left-1 top-18 w-5 h-0.5 bg-emerald-300/40 rounded-full"></div>
    
    {/* Scooter body */}
    <div className="relative w-16 h-12 flex items-center justify-center">
      {/* Steering column */}
      <div className="absolute right-3.5 bottom-3.5 w-1.5 h-10 bg-gray-700 rounded-full transform rotate-12"></div>
      <div className="absolute right-2 top-0.5 w-4 h-1 bg-gray-700 rounded-full"></div>
      {/* Front Basket / light detail */}
      <div className="absolute right-1 top-1.5 w-3 h-2 bg-yellow-400 rounded-sm"></div>
      
      {/* Seat */}
      <div className="absolute left-3.5 top-3.5 w-8 h-2 bg-[#1E6B3D] rounded-full"></div>
      
      {/* Main frame / floor */}
      <div className="absolute left-3 bottom-3 w-10 h-1.5 bg-[#4ADE80] rounded-sm"></div>
      <div className="absolute left-1.5 bottom-3.5 w-3 h-2 bg-gray-700/80 rounded-tl-lg"></div>
      
      {/* Wheels */}
      <div className="absolute left-2.5 bottom-0 w-4 h-4 rounded-full border-2 border-gray-600 bg-white shadow-sm flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
      </div>
      <div className="absolute right-2.5 bottom-0 w-4 h-4 rounded-full border-2 border-gray-600 bg-white shadow-sm flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
      </div>
    </div>
  </div>
);

export const SnackIllustration: React.FC<IllustrationProps> = () => (
  <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#FEF4E8]">
    {/* Background bubbles */}
    <div className="absolute top-2 left-6 w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></div>
    <div className="absolute top-6 right-6 w-1 h-1 bg-amber-400 rounded-full"></div>
    
    <div className="relative w-14 h-12 flex items-end justify-center gap-1.5">
      {/* Chips packet */}
      <div className="w-6 h-10 bg-amber-500 rounded-md border border-amber-600 flex flex-col justify-between p-0.5 transform -rotate-6 shadow-sm">
        <div className="w-full h-1.5 bg-red-500 rounded-t-xs"></div>
        <div className="w-4 h-4 rounded-full bg-yellow-300 mx-auto flex items-center justify-center text-[7px] font-black font-mono text-amber-900 leading-none">C</div>
        <div className="w-full h-1 bg-red-500 rounded-b-xs"></div>
      </div>
      
      {/* Soda can */}
      <div className="w-4 h-8 bg-sky-500 rounded-sm border border-sky-600 flex flex-col justify-between pt-0.5 pb-1 px-0.5 shadow-sm">
        <div className="w-2.5 h-1 bg-gray-300 rounded-full mx-auto -mt-1"></div>
        <div className="w-full h-1 bg-white opacity-45"></div>
        <div className="w-2 h-2 rounded-full bg-white opacity-80 mx-auto flex items-center justify-center text-[5px] text-sky-800 font-bold">S</div>
      </div>
    </div>
  </div>
);

export const DeliveryIllustration: React.FC<IllustrationProps> = () => (
  <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#EBF2FC]">
    {/* Route path */}
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 65 C 30 65, 35 25, 65 30 C 80 32, 85 55, 85 55" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" />
      <circle cx="85" cy="55" r="4.5" fill="#3B82F6" />
    </svg>
    
    {/* Package */}
    <div className="relative w-12 h-10 bg-[#E0A96D] rounded-lg shadow-md border border-[#D0965A] transform -rotate-6 flex flex-col justify-between p-1.5">
      {/* Tape */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2.5 bg-[#BC8A51]/60"></div>
      {/* Shipping label */}
      <div className="w-3.5 h-2.5 bg-white rounded-xs self-end z-10 opacity-90 flex flex-col gap-0.5 p-0.5">
        <div className="w-2 h-0.5 bg-gray-400"></div>
        <div className="w-1.5 h-0.5 bg-gray-400"></div>
      </div>
    </div>
  </div>
);

export const GroceryIllustration: React.FC<IllustrationProps> = () => (
  <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#EAF5EE]">
    <div className="relative w-16 h-14 flex items-center justify-center">
      {/* Basket handle */}
      <div className="absolute top-2 w-10 h-7 rounded-t-full border-2 border-[#1E6B3D]/65"></div>
      
      {/* Items popping out */}
      {/* Carrot */}
      <div className="absolute left-4 top-1.5 w-3.5 h-9 bg-orange-400 rounded-full transform -rotate-12 flex flex-col items-center">
        <div className="w-1.5 h-3 bg-emerald-500 rounded-t-full -mt-2"></div>
      </div>
      {/* Apple */}
      <div className="absolute left-8 top-3.5 w-5 h-5 bg-rose-500 rounded-full">
        <div className="w-0.5 h-1.5 bg-amber-800 rounded-full mx-auto -mt-1 transform rotate-12"></div>
      </div>
      {/* Milk package */}
      <div className="absolute right-4 top-1 w-4 h-8 bg-sky-100 border border-sky-200 rounded-sm shadow-xs flex flex-col items-center pt-1">
        <div className="w-2 h-1 bg-sky-400"></div>
        <div className="w-2 h-0.5 bg-sky-600 mt-1"></div>
      </div>
      
      {/* Basket */}
      <div className="absolute bottom-1 w-12 h-6 bg-emerald-700/80 rounded-b-md border border-emerald-800 flex items-center justify-around px-1">
        <div className="w-0.5 h-4 bg-emerald-900 rounded-full opacity-50"></div>
        <div className="w-0.5 h-4 bg-emerald-900 rounded-full opacity-50"></div>
        <div className="w-0.5 h-4 bg-emerald-900 rounded-full opacity-50"></div>
        <div className="w-0.5 h-4 bg-emerald-900 rounded-full opacity-50"></div>
      </div>
    </div>
  </div>
);

export const FoodIllustration: React.FC<IllustrationProps> = () => (
  <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#FDF2EE]">
    <div className="relative w-14 h-14 flex items-center justify-center">
      {/* Plate */}
      <div className="w-10 h-10 rounded-full bg-white border border-rose-100 shadow-xs flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border border-dashed border-rose-200/50 flex items-center justify-center">
          {/* Sliced tomato flavor */}
          <div className="w-4 h-4 rounded-full bg-rose-500/90 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-yellow-200 rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Fork & Spoon */}
      {/* Fork */}
      <div className="absolute -left-1.5 top-3 flex flex-col items-center">
        <div className="flex gap-0.5">
          <div className="w-0.5 h-3.5 bg-gray-400 rounded-t-full"></div>
          <div className="w-0.5 h-3.5 bg-gray-400 rounded-t-full"></div>
          <div className="w-0.5 h-3.5 bg-gray-400 rounded-t-full"></div>
        </div>
        <div className="w-1.5 h-1 bg-gray-400 -mt-0.5 rounded-b-xs"></div>
        <div className="w-0.5 h-5 bg-gray-400/80 rounded-b-full"></div>
      </div>
      
      {/* Spoon */}
      <div className="absolute -right-1.5 top-3.5 flex flex-col items-center">
        <div className="w-2.5 h-4 bg-gray-400 rounded-full"></div>
        <div className="w-0.5 h-5.5 bg-gray-400/80 rounded-b-full"></div>
      </div>
    </div>
  </div>
);

export const IceCreamIllustration: React.FC<IllustrationProps> = () => (
  <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#FDF0F6]">
    {/* Falling sprinkles */}
    <div className="absolute top-2 left-4 w-1 h-2 bg-pink-400 rounded-full transform rotate-45"></div>
    <div className="absolute top-4 right-5 w-1 h-2.5 bg-purple-400 rounded-full transform -rotate-12"></div>
    <div className="absolute top-8 left-6 w-1.5 h-1 bg-yellow-400 rounded-full"></div>
    
    <div className="relative w-12 h-14 flex flex-col items-center justify-center mt-1">
      {/* Red Cherry */}
      <div className="absolute top-0.5 w-2.5 h-2.5 bg-rose-600 rounded-full z-20 flex justify-center">
        <div className="absolute -top-1.5 right-0.5 w-0.5 h-2 bg-rose-800 rounded-full transform rotate-12"></div>
      </div>
      
      {/* Strawberry Scoop */}
      <div className="absolute top-2 w-8 h-8 rounded-full bg-rose-300 z-10 shadow-xs"></div>
      
      {/* Vanilla Scoop */}
      <div className="absolute top-5 w-9 h-6 rounded-t-full bg-yellow-50 z-5 border-b-2 border-amber-800/25"></div>
      
      {/* Waffle Cone */}
      <div className="absolute bottom-0 w-8 h-8 flex overflow-hidden justify-center">
        <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[32px] border-t-amber-600/70"></div>
      </div>
    </div>
  </div>
);

export const BeautyIllustration: React.FC<IllustrationProps> = () => (
  <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#F5F2FC]">
    {/* Sparkles */}
    <div className="absolute top-2 right-4 text-purple-400 text-xs animate-pulse font-bold">✨</div>
    <div className="absolute bottom-3 left-4 text-indigo-400 text-sm animate-pulse font-bold">✦</div>
    
    <div className="relative w-14 h-12 flex items-end justify-center gap-2">
      {/* Dropper serum bottle */}
      <div className="w-4 h-8 bg-indigo-100 rounded-sm border border-indigo-200 relative flex flex-col items-center justify-between p-0.5 shadow-xs">
        {/* Cap */}
        <div className="absolute -top-1.5 w-3 h-1.5 bg-gray-500 rounded-xs"></div>
        <div className="absolute -top-3 w-1.5 h-1.5 bg-indigo-700 rounded-t-full"></div>
        {/* Label */}
        <div className="w-full h-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-xxs mt-2"></div>
      </div>
      
      {/* Lipstick */}
      <div className="w-3.5 h-10 flex flex-col items-center justify-end relative">
        {/* Red lipstick paste */}
        <div className="w-2 h-4 bg-rose-500 rounded-t-sm transform skew-y-12 mb-[-2px] z-10 shadow-xs"></div>
        {/* Case container */}
        <div className="w-3.5 h-6 bg-neutral-800 rounded-t-xs flex items-center justify-center">
          <div className="w-full h-1 bg-yellow-500/80"></div>
        </div>
      </div>
    </div>
  </div>
);

export const HouseholdIllustration: React.FC<IllustrationProps> = () => (
  <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#EAF3FA]">
    {/* Tiny cloud */}
    <div className="absolute top-2.5 right-3 w-6 h-2.5 bg-white rounded-full opacity-80 shadow-xxs"></div>
    
    <div className="relative w-16 h-12 flex items-end justify-center">
      {/* Soft stylized green tree */}
      <div className="absolute left-10 bottom-1 flex flex-col items-center">
        <div className="w-5 h-5 rounded-full bg-emerald-400"></div>
        <div className="w-1 h-2 bg-amber-800"></div>
      </div>
      
      {/* Premium cottage */}
      <div className="relative w-10 h-9 bg-sky-100 rounded-sm border border-sky-200 flex flex-col justify-end p-1 relative shadow-xs mb-0.5">
        {/* Roof */}
        <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[22px] border-l-transparent border-r-[22px] border-r-transparent border-b-[6px] border-b-sky-800"></div>
        {/* Chimney */}
        <div className="absolute -top-2 left-1.5 w-1.5 h-2.5 bg-gray-500"></div>
        
        {/* Window */}
        <div className="w-2.5 h-2.5 bg-yellow-250 border border-amber-300 rounded-xxs self-start ml-0.5 mb-1 flex items-center justify-center">
          <div className="w-0.5 h-full bg-amber-400/50"></div>
        </div>
        {/* Door */}
        <div className="absolute right-2 bottom-0 w-2.5 h-4.5 bg-sky-800 rounded-t-xs"></div>
      </div>
    </div>
  </div>
);

export const CustomOrdersIllustration: React.FC<IllustrationProps> = () => (
  <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#F0F2FC]">
    {/* Magic wand dust sparkles */}
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <div className="absolute top-[22%] left-[45%] w-1 h-1 bg-violet-400 rounded-full animate-ping"></div>
      <div className="absolute top-[35%] left-[28%] w-1 h-1 bg-violet-300 rounded-full animate-pulse"></div>
      <div className="absolute top-[18%] left-[64%] w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></div>
    </div>
    
    <div className="relative w-14 h-14 flex items-center justify-center">
      {/* Package Box */}
      <div className="w-8 h-8 bg-violet-200 border border-violet-300 rounded-md transform rotate-12 flex flex-col items-center justify-center shadow-md relative">
        <div className="absolute inset-x-0 h-1.5 bg-[#8B5CF6]/50"></div>
        <div className="absolute inset-y-0 w-1.5 bg-[#8B5CF6]/50"></div>
        <div className="text-[10px] z-10">📦</div>
      </div>
      
      {/* Magic Wand */}
      <div className="absolute -top-1 -right-1 w-12 h-12 flex items-center justify-center pointer-events-none transform -rotate-45">
        {/* Wand stick */}
        <div className="w-1.5 h-9 bg-gradient-to-b from-neutral-800 to-amber-900 rounded-full shadow-sm"></div>
        {/* Shiny tip */}
        <div className="absolute top-0 w-3 h-3 bg-yellow-300 rounded-full blur-xs animate-pulse"></div>
        <div className="absolute top-[2px] right-[18px] text-[10px] font-bold text-yellow-500">⭐</div>
      </div>
    </div>
  </div>
);
