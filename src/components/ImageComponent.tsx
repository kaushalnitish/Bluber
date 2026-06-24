import React, { useState } from "react";
import { Store, ShoppingBag, Leaf, Heart, Coffee, User, Sparkles, Compass, Apple, Package } from "lucide-react";

export interface ImageComponentProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  fallbackName?: string;
  fallbackType?: "store" | "restaurant" | "food" | "product" | "avatar" | "generic";
  categoryText?: string;
}

export const ImageComponent: React.FC<ImageComponentProps> = ({
  src,
  alt = "Image",
  fallbackName = "",
  fallbackType = "generic",
  categoryText = "",
  className = "",
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get initials for branding fallback
  const getInitials = (text: string) => {
    if (!text) return "";
    return text
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .substring(0, 3)
      .toUpperCase();
  };

  // Select icon and styles based on type and category
  const getStyleAndIcon = () => {
    const textLower = (categoryText || fallbackName || "").toLowerCase();
    
    if (fallbackType === "store" || textLower.includes("grocery") || textLower.includes("essential") || textLower.includes("supermarket")) {
      return {
        icon: <ShoppingBag size={22} className="text-emerald-600" />,
        bgColor: "bg-emerald-50/80 border-emerald-100",
        textColor: "text-emerald-700",
      };
    }
    
    if (textLower.includes("fruit") || textLower.includes("vegetable") || textLower.includes("fresh") || textLower.includes("organic")) {
      return {
        icon: <Leaf size={22} className="text-amber-600" />,
        bgColor: "bg-amber-50/80 border-amber-100",
        textColor: "text-amber-700",
      };
    }

    if (fallbackType === "restaurant" || textLower.includes("cafe") || textLower.includes("café") || textLower.includes("fast food") || textLower.includes("bakery") || textLower.includes("pizza") || textLower.includes("burger")) {
      return {
        icon: <Coffee size={22} className="text-indigo-600" />,
        bgColor: "bg-indigo-50/80 border-indigo-100",
        textColor: "text-indigo-700",
      };
    }

    if (textLower.includes("pharmacy") || textLower.includes("medical") || textLower.includes("healthcare") || textLower.includes("medicine")) {
      return {
        icon: <Heart size={22} className="text-rose-600" />,
        bgColor: "bg-rose-50/80 border-rose-100",
        textColor: "text-rose-700",
      };
    }

    if (fallbackType === "food") {
      return {
        icon: <Apple size={22} className="text-orange-600" />,
        bgColor: "bg-orange-50/80 border-orange-100",
        textColor: "text-orange-700",
      };
    }

    if (fallbackType === "product") {
      return {
        icon: <Package size={22} className="text-slate-600" />,
        bgColor: "bg-slate-100/90 border-slate-200",
        textColor: "text-slate-700",
      };
    }

    if (fallbackType === "avatar") {
      return {
        icon: <User size={20} className="text-neutral-500" />,
        bgColor: "bg-neutral-100 border-neutral-200",
        textColor: "text-neutral-700",
      };
    }

    return {
      icon: <Sparkles size={20} className="text-slate-500" />,
      bgColor: "bg-slate-50/80 border-slate-100",
      textColor: "text-slate-700",
    };
  };

  const { icon, bgColor, textColor } = getStyleAndIcon();

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const imageElement = (
    <img
      src={src}
      alt={alt}
      onLoad={handleImageLoad}
      onError={handleImageError}
      className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
      {...props}
    />
  );

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-neutral-50 select-none">
      {/* Loading Skeleton Pulse State */}
      {isLoading && !imageError && src && (
        <div className="absolute inset-0 bg-neutral-200 animate-pulse flex items-center justify-center">
          <Sparkles className="text-neutral-400 animate-pulse" size={18} />
        </div>
      )}

      {/* Render Image or Branded Fallback */}
      {!imageError && src ? (
        imageElement
      ) : (
        /* Branded Fallback View with Store Initials, Custom Icons and Gradients (Uber Eats & Apple Inspired) */
        <div className={`w-full h-full flex flex-col items-center justify-center p-3 text-center gap-1 border-0 ${bgColor} transition-all duration-300`}>
          <div className="transform transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
          {fallbackName && (
            <span className={`text-[12px] font-black tracking-wider ${textColor} font-mono mt-1 uppercase`}>
              {getInitials(fallbackName)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageComponent;
