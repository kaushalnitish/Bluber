import React from "react";
import { Star } from "lucide-react";
import { ImageComponent } from "./ImageComponent";

interface StoreCardProps {
  id: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  type: "store" | "restaurant";
  onClick: () => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({
  id,
  name,
  category,
  rating,
  image,
  type,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[24px] border border-neutral-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:border-neutral-200/60 cursor-pointer transition-all duration-300 text-left flex gap-4 p-4.5 relative group min-h-[140px] items-stretch sm:min-h-[150px] overflow-hidden"
    >
      {/* Visual background ambient hover touch (Apple-inspired) */}
      <div className="absolute inset-0 bg-neutral-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* 35-40% Width Image Container */}
      <div className="w-[36%] sm:w-[38%] shrink-0 relative rounded-[20px] overflow-hidden bg-neutral-50 border border-neutral-100/40 flex items-center justify-center select-none">
        <ImageComponent
          src={image}
          alt={name}
          fallbackName={name}
          fallbackType={type}
          categoryText={category}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Information Area (Remaining 60-65% width) */}
      <div className="flex flex-col justify-between py-1 min-w-0 flex-1 space-y-2">
        <div className="space-y-1">
          {/* Category text - light & high legibility */}
          <p className="text-[10px] sm:text-[11px] font-bold text-neutral-400 tracking-wider uppercase font-sans">
            {category}
          </p>
          {/* Store name with up to 2 lines, large font weight, and beautiful line height */}
          <h4 className="text-[14px] sm:text-[15.5px] font-extrabold text-neutral-900 tracking-tight leading-snug line-clamp-2 font-sans group-hover:text-primary transition-colors">
            {name}
          </h4>
        </div>

        {/* Dedicated Footer Row */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100/60 mt-auto">
          {/* Extremely clean rating visual */}
          <div className="flex items-center gap-1 text-[11px] font-black text-neutral-800 bg-neutral-50 border border-neutral-100/80 px-2 py-0.5 rounded-lg shrink-0">
            <Star size={11.5} className="text-amber-500 fill-amber-500 stroke-none" />
            <span>{rating.toFixed(1)}</span>
          </div>

          {/* Visit Store / Browse CTA */}
          <span className="text-primary text-[11px] sm:text-[11.5px] font-black tracking-tight flex items-center gap-0.5 transition-transform duration-300 group-hover:translate-x-0.5 font-sans shrink-0">
            {type === "restaurant" ? "Browse Menu" : "Visit Store"} →
          </span>
        </div>
      </div>
    </div>
  );
};
