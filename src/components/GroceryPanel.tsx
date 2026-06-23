import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Sparkles
} from "lucide-react";
import { CartItem } from "../types";
import { 
  GROCERY_CATEGORIES as GLOBAL_CATEGORIES, 
  DIRECT_GROCERY_PRODUCTS as GLOBAL_PRODUCTS 
} from "../data";

interface GroceryPanelProps {
  cart: CartItem[];
  onAddToCart: (item: any, shopId: string, shopName: string, type: "food" | "grocery" | "medicine") => void;
  onRemoveFromCart: (itemId: string) => void;
  onBack: () => void;
  onViewCart: () => void;
  initialCategory?: string;
}

export const GroceryPanel: React.FC<GroceryPanelProps> = ({
  cart,
  onAddToCart,
  onRemoveFromCart,
  onBack,
  onViewCart,
  initialCategory = "fruits"
}) => {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory === "veg" ? "fruits" : initialCategory);
    }
  }, [initialCategory]);

  // Fallback image for safety
  const fallbackProductImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop";

  // Filter products based on active category and query
  const filteredProducts = GLOBAL_PRODUCTS.filter(p => {
    const matchesCategory = searchQuery ? true : (p.category === selectedCategory);
    
    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) return matchesCategory;

    const matchesSearch = 
      p.name.toLowerCase().includes(searchLower) ||
      p.id.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower) ||
      (p.category === "fruits" && ("fruit apples bananas mangoes oranges grapes pineapple peaches fruits").includes(searchLower)) ||
      (p.category === "dairy" && ("dairy cheese butter milk curd dahi paneer cream milk").includes(searchLower)) ||
      (p.category === "icecream" && ("icecream ice cream kulfi dessert family pack vanilla chocolate kesar kulfi").includes(searchLower)) ||
      (p.category === "beverages" && ("beverage soft drink soda juice water energy juice cola drink").includes(searchLower)) ||
      (p.category === "snacks" && ("snack chips namkeen biscuits cookies lays chips bhujia").includes(searchLower)) ||
      (p.category === "bakery" && ("bakery bread cake bun muffin whole wheat bake biscuit cookie").includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div id="grocery-panel-root" className="px-5 py-5 animate-fade-in pb-28 text-left">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-3 bg-white rounded-full text-text-primary hover:scale-105 active:scale-95 transition-all shadow-sm border border-border-custom/50 cursor-pointer text-text-primary"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Bluber Instant Grocery</h2>
            <p className="text-xs text-text-secondary">Pristine catalog • Direct delivery in 15 mins</p>
          </div>
        </div>
        {cartCount > 0 && (
          <button 
            onClick={onViewCart}
            className="bg-primary hover:bg-[#1E6B3D] text-white text-[11px] font-black px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 animate-pulse border-none cursor-pointer"
          >
            <ShoppingBag size={14} />
            Cart ({cartCount})
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-5 text-left">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input 
          type="text"
          placeholder="Search products directly (e.g. Apples, Ghee, Honey)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs bg-white border border-border-custom/80 focus:border-primary rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none transition-colors shadow-sm placeholder:opacity-50 font-medium text-text-primary"
        />
      </div>

      {/* Categories Bento Slider horizontal row - Text only */}
      <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider mb-2.5">Browse Direct Catalog</p>
      <div className="flex gap-2.5 overflow-x-auto pb-2 mb-5 no-scrollbar">
        {GLOBAL_CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery("");
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-black shrink-0 transition-all cursor-pointer border-none ${
                isSelected 
                  ? "bg-primary text-white shadow-sm scale-102" 
                  : "bg-white text-text-primary border border-border-custom/50 hover:bg-canvas"
              }`}
            >
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Category Header */}
      <div className="flex justify-between items-center mb-3 text-left">
        <span className="text-xs font-black text-text-primary uppercase tracking-wide">
          {GLOBAL_CATEGORIES.find(c => c.id === selectedCategory)?.name || "Products"}
        </span>
        <span className="text-[10px] text-text-secondary font-semibold">
          {filteredProducts.length} items available
        </span>
      </div>

      {/* Direct Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-border-custom/60 text-text-secondary text-xs font-medium">
          No matches found under this catalog. Try looking in other categories!
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 text-left">
          {filteredProducts.map(p => {
            // Check if item is already in cart
            const cartItem = cart.find(ci => ci.id === p.id);
            const quantity = cartItem ? cartItem.quantity : 0;

            return (
              <div 
                key={p.id}
                className="bg-white rounded-3xl p-3.5 border border-border-custom/30 shadow-xs flex flex-col justify-between hover:scale-[1.01] transition-transform text-left"
              >
                {/* Visual Image & Unit */}
                <div className="relative w-full h-32 bg-canvas rounded-2xl overflow-hidden flex items-center justify-center mb-3">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 select-none"
                    onError={(e) => {
                      e.currentTarget.src = fallbackProductImage;
                    }}
                  />
                  <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs text-[9px] font-black text-text-primary px-1.5 py-0.5 rounded-full uppercase border border-border-custom/30">
                    {p.unit}
                  </span>
                </div>

                {/* Info and price */}
                <div>
                  <h4 className="text-[11px] font-bold text-text-primary leading-tight min-h-[32px] line-clamp-2">{p.name}</h4>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-black text-primary">₹{p.price}</span>
                    
                    {/* Add / Quantity selector */}
                    {quantity > 0 ? (
                      <div className="flex items-center bg-primary text-white rounded-xl overflow-hidden text-[10px] font-bold">
                        <button 
                          onClick={() => onRemoveFromCart(p.id)}
                          className="px-2.5 py-1.5 hover:bg-primary/90 cursor-pointer border-none bg-transparent text-white"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="px-1.5">{quantity}</span>
                        <button 
                          onClick={() => onAddToCart(p, "direct_grocery", "Bluber Direct Sourcing", "grocery")}
                          className="px-2.5 py-1.5 hover:bg-primary/95 cursor-pointer border-none bg-transparent text-white"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onAddToCart(p, "direct_grocery", "Bluber Direct Sourcing", "grocery")}
                        className="bg-primary hover:bg-[#1E6B3D] text-white text-[10px] uppercase font-black px-3.5 py-1.5 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer border-none"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info banner */}
      <div className="bg-[#EDF7EF]/60 p-4 rounded-2xl border border-primary/10 mt-6 flex items-start gap-2.5 text-left">
        <Sparkles size={18} className="text-primary mt-0.5" />
        <p className="text-[9.5px] text-text-secondary leading-relaxed font-semibold">
          <strong>Instant Sourcing Rules:</strong> All grocery products are directly picked from Chamba warehouse hubs and delivered straight to you, guaranteeing absolute farm freshness without external shop marked-up prices!
        </p>
      </div>
    </div>
  );
};
