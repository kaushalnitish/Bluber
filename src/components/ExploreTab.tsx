import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Car, 
  Bike, 
  Package, 
  Store, 
  ChevronRight, 
  ArrowRight, 
  ThumbsUp, 
  ThumbsDown,
  Clock,
  Sparkles,
  Check
} from "lucide-react";
import { CartItem } from "../types";
import { DIRECT_GROCERY_PRODUCTS } from "../data";
import { safeStorage } from "../utils/safeStorage";

interface ExploreTabProps {
  cart: CartItem[];
  onAddToCart: (item: any, shopId: string, shopName: string, type: "food" | "grocery" | "medicine") => void;
  onRemoveFromCart: (itemId: string) => void;
  onSelectShop: (shop: { id: string; type: "restaurant" | "store" } | null) => void;
  onSetIsRiding: (val: boolean) => void;
  onSetIsCouriering: (val: boolean) => void;
  onSetIsGrocery: (val: boolean, category?: string) => void;
  onSetIsCustomOrder: (val: boolean) => void;
  onSetActiveTab: (tab: "home" | "explore" | "orders" | "cart" | "profile") => void;
}

interface TrendingItem {
  id: string;
  name: string;
  weight: string;
  price: number;
  image: string;
  category: string;
}

export const ExploreTab: React.FC<ExploreTabProps> = ({
  cart,
  onAddToCart,
  onRemoveFromCart,
  onSelectShop,
  onSetIsRiding,
  onSetIsCouriering,
  onSetIsGrocery,
  onSetIsCustomOrder,
  onSetActiveTab
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [surveyVote, setSurveyVote] = useState<"Yes" | "No" | null>(() => {
    try {
      const saved = safeStorage.getItem("bluber_ride_demand_vote");
      return saved ? (saved as "Yes" | "No") : null;
    } catch {
      return null;
    }
  });

  const [voteStats, setVoteStats] = useState({ yes: 1420, no: 180 });

  // Trending Products dynamically using audited direct products for flawless cart alignment
  const trendingProducts: TrendingItem[] = DIRECT_GROCERY_PRODUCTS.slice(0, 10).map(p => ({
    id: p.id,
    name: p.name,
    weight: p.unit,
    price: p.price,
    image: p.image,
    category: p.category === "fruits" ? "Fruits" : (p.category === "dairy" ? "Dairy" : (p.category === "bakery" ? "Bakery" : (p.category === "beverages" ? "Beverages" : (p.category === "snacks" ? "Snacks" : (p.category === "icecream" ? "Ice Cream" : (p.category === "beauty" ? "Personal Care" : "Household"))))))
  }));

  // Popular searches
  const popularSearches = [
    "Milk",
    "Grapes",
    "Cold Drinks",
    "Ice Cream",
    "Momos",
    "Pizza",
    "Courier",
    "Ride to Chowgan"
  ];

  // Popular Categories list - sleek premium text-only definitions
  const popularCategories = [
    { name: "Fresh Fruits", action: "grocery", categoryKey: "fruits" },
    { name: "Dairy Store", action: "grocery", categoryKey: "dairy" },
    { name: "Fresh Bakery", action: "grocery", categoryKey: "bakery" },
    { name: "Ice Cream Hub", action: "grocery", categoryKey: "icecream" },
    { name: "Beverages", action: "grocery", categoryKey: "beverages" },
    { name: "Snacks", action: "grocery", categoryKey: "snacks" },
    { name: "Beauty & Care", action: "grocery", categoryKey: "beauty" },
    { name: "Household", action: "grocery", categoryKey: "household" },
    { name: "Food Delivery", action: "food" },
    { name: "Custom Orders", action: "custom" },
    { name: "Ride Services", action: "rides" }
  ];

  // Recently Ordered list (persisted in local storage or seeded defaults)
  const [recentOrdered] = useState<TrendingItem[]>(() => {
    try {
      const saved = safeStorage.getItem("bluber_explore_recent_ordered");
      if (saved) return JSON.parse(saved);
    } catch {}
    
    return [
      { id: "g-fruit-apple", name: "Crisp Royal Delicious Red Apples", weight: "1kg", price: 180, image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=400&auto=format&fit=crop", category: "Fruits" },
      { id: "f5", name: "Steamed Dumplings with Mountain Herbs", weight: "1 plate", price: 120, image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=400&auto=format&fit=crop", category: "Food" },
      { id: "g-snack-namkeen", name: "Haldiram's Chatpata Aloo Bhujia", weight: "150g", price: 40, image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=400&auto=format&fit=crop", category: "Snacks" }
    ];
  });

  useEffect(() => {
    try {
      safeStorage.setItem("bluber_explore_recent_ordered", JSON.stringify(recentOrdered));
    } catch {}
  }, [recentOrdered]);

  // Vote handler
  const handleVote = (vote: "Yes" | "No") => {
    try {
      safeStorage.setItem("bluber_ride_demand_vote", vote);
      setSurveyVote(vote);
      
      // Update local storage statistics simulation
      const key = `bluber_demand_${vote.toLowerCase()}`;
      const current = Number(safeStorage.getItem(key) || (vote === "Yes" ? "1420" : "180"));
      safeStorage.setItem(key, (current + 1).toString());
      
      setVoteStats(prev => ({
        ...prev,
        [vote.toLowerCase()]: prev[vote.toLowerCase() as "yes" | "no"] + 1
      }));
    } catch (e) {
      console.warn("Storage vote error", e);
    }
  };

  // Click on Category helper
  const handleCategoryClick = (action: string, categoryKey?: string) => {
    if (action === "grocery") {
      onSetIsGrocery(true, categoryKey);
    } else if (action === "food") {
      onSelectShop({ id: "cafe_hilltop", type: "restaurant" });
    } else if (action === "custom") {
      onSetIsCustomOrder(true);
    } else if (action === "rides") {
      onSetIsRiding(true);
    } else if (action === "courier") {
      onSetIsCouriering(true);
    }
  };

  // Helper to click popular search item
  const handlePopularSearchClick = (term: string) => {
    setSearchQuery(term);
  };

  // Check how many items in cart
  const getProductCartCount = (itemId: string) => {
    const found = cart.find(ci => ci.id === itemId);
    return found ? found.quantity : 0;
  };

  // Filter trending products by search
  const filteredProducts = trendingProducts.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="explore-tab-root" className="px-5 py-5 animate-fade-in pb-28 text-left space-y-6">
      
      {/* SECTION 1: SEARCH PRODUCTS */}
      <section id="explore-search-section" className="space-y-2 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-primary">
            <Sparkles size={16} className="animate-pulse text-[#1E6B3D] fill-current" />
            <span className="text-[10px] font-black uppercase tracking-wider">Quick Finder</span>
          </div>
          <span className="text-[10px] text-text-secondary bg-[#EDF7EF] py-0.5 px-2 rounded-full font-bold">Blinkit + Uber Express</span>
        </div>
        <div className="h-14 bg-white rounded-3xl border border-border-custom px-4.5 flex items-center shadow-sm focus-within:border-primary transition-colors">
          <Search size={22} className="text-text-secondary mr-3" />
          <input 
            type="text" 
            placeholder="Search groceries, food, rides or custom orders" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs font-semibold w-full text-text-primary placeholder:text-text-secondary placeholder:font-light focus:outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")} 
              className="text-[11px] font-bold text-rose-500 hover:underline px-2 border-none bg-transparent cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* SECTION 2: POPULAR CATEGORIES */}
      <section id="explore-categories-section" className="text-left">
        <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest mb-3">Popular Categories</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {popularCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.action, cat.categoryKey)}
              className="py-3.5 px-2 rounded-2xl flex items-center justify-center text-center cursor-pointer transition-all active:scale-[0.96] hover:scale-[1.02] border border-border-custom/50 shadow-xs bg-white hover:border-primary hover:bg-canvas"
            >
              <span className="text-[10px] font-black text-text-primary uppercase tracking-tight">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 3: TRENDING PRODUCTS */}
      <section id="explore-trending-section" className="text-left">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest">Trending Products</h3>
          <span className="text-[9px] bg-[#EDF7EF] text-primary px-2 py-0.5 rounded font-black uppercase">Picked Fresh</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3.5">
          {filteredProducts.map((prod) => {
            const count = getProductCartCount(prod.id);
            return (
              <div 
                key={prod.id}
                className="bg-white border border-border-custom/45 rounded-3xl p-3.5 flex flex-col justify-between shadow-xs hover:border-primary/20 hover:scale-[1.01] transition-all text-left"
              >
                {/* Image & badge */}
                <div className="bg-canvas/40 w-full h-28 rounded-2xl overflow-hidden flex items-center justify-center mb-3 relative">
                  <img 
                    src={prod.image} 
                    alt={prod.name} 
                    loading="lazy"
                    className="w-full h-full object-cover select-none"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop";
                    }}
                  />
                  <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-[8px] font-black text-text-primary px-2 py-0.5 rounded-full uppercase border border-border-custom/30">
                    {prod.category}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[11px] font-bold text-text-primary line-clamp-2 leading-tight min-h-[32px]">{prod.name}</h4>
                    <p className="text-[9.5px] text-text-secondary mt-1.5 font-bold">{prod.weight}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-black text-text-primary">₹{prod.price}</span>
                    
                    {count > 0 ? (
                      <div className="flex items-center bg-primary text-white py-1 px-2.5 rounded-full text-xs font-black select-none gap-2">
                        <button 
                          onClick={() => onRemoveFromCart(prod.id)}
                          className="hover:scale-125 active:scale-90 font-bold p-0.5 cursor-pointer border-none bg-transparent text-white"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="w-3 text-center text-[10px]">{count}</span>
                        <button 
                          onClick={() => onAddToCart(
                            { id: prod.id, name: prod.name, price: prod.price, image: prod.image },
                            "direct_grocery",
                            "Bluber Direct Sourcing",
                            "grocery"
                          )}
                          className="hover:scale-125 active:scale-90 font-bold p-0.5 cursor-pointer border-none bg-transparent text-white"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onAddToCart(
                          { id: prod.id, name: prod.name, price: prod.price, image: prod.image },
                          "direct_grocery",
                          "Bluber Direct Sourcing",
                          "grocery"
                        )}
                        className="bg-primary hover:bg-[#1E6B3D] text-white py-1 px-3.5 rounded-full text-[10px] font-black active:scale-95 transition-all shadow-sm border-none cursor-pointer"
                      >
                        ADD
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <p className="col-span-2 text-xs text-center text-text-secondary py-6">No products match your search.</p>
          )}
        </div>
      </section>

      {/* SECTION 4: QUICK SERVICES */}
      <section id="explore-services-section" className="text-left">
        <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest mb-3">Quick Services</h3>
        <div className="space-y-2.5">
          {[
            { title: "Book Elite Scooty", subtitle: "24×7 Premium Two-Wheeler ride convenience", icon: <Bike size={18} />, action: () => onSetIsRiding(true), badge: "Convenient" },
            { title: "Pickup & Delivery Courier", subtitle: "Send secure parcels and courier packages", icon: <Package size={18} />, action: () => onSetIsCouriering(true), badge: "Direct" },
            { title: "Custom Order / Sourcing", subtitle: "Retrieve hard-to-find items from Chamba corners", icon: <Store size={18} />, action: () => onSetIsCustomOrder(true), badge: "Anywhere" },
            { title: "Order Restaurant Food", subtitle: "Pure Dham, steaming Momos & hot tea flasks", icon: <ShoppingBag size={18} />, action: () => onSelectShop({ id: "cafe_hilltop", type: "restaurant" }), badge: "Hot" }
          ].map((item, index) => (
            <div
              key={index}
              onClick={item.action}
              className="bg-white p-3.5 rounded-2xl border border-border-custom/30 hover:border-primary/20 flex justify-between items-center cursor-pointer transition-all hover:scale-[1.005] active:scale-[0.995] text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="bg-[#EDF7EF] text-primary p-2.5 rounded-xl">
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-text-primary">{item.title}</h4>
                    <span className="text-[7.5px] bg-[#EDF7EF] text-primary font-bold tracking-tight uppercase px-1.5 py-0.25 rounded">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-secondary mt-0.5">{item.subtitle}</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-text-secondary" />
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: POPULAR SEARCHES */}
      <section id="explore-searches-section" className="text-left">
        <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest mb-2.5">Popular Searches</h3>
        <div className="flex flex-wrap gap-2 text-left">
          {popularSearches.map((term) => (
            <button
              key={term}
              onClick={() => handlePopularSearchClick(term)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                searchQuery.toLowerCase() === term.toLowerCase()
                  ? "bg-primary border-primary text-white"
                  : "bg-white border-border-custom text-text-primary hover:bg-canvas"
              }`}
            >
              🔍 {term}
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 6: RECENTLY ORDERED */}
      <section id="explore-recent-section" className="text-left">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Clock size={14} className="text-text-secondary" />
          <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest">Recently Ordered</h3>
        </div>
        
        <div className="space-y-2.5">
          {recentOrdered.map((item) => {
            const count = getProductCartCount(item.id);
            return (
              <div 
                key={item.id}
                className="bg-white p-3 rounded-2xl border border-border-custom/30 flex justify-between items-center text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover select-none"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop";
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-text-primary leading-tight">{item.name}</h4>
                    <p className="text-[9.5px] text-text-secondary mt-0.5">{item.weight} • ₹{item.price}</p>
                  </div>
                </div>
                
                {count > 0 ? (
                  <div className="flex items-center bg-primary text-white py-1 px-2.5 rounded-full text-[10px] font-black select-none gap-2">
                    <button 
                      onClick={() => onRemoveFromCart(item.id)}
                      className="cursor-pointer border-none bg-transparent text-white"
                    >
                      <Minus size={9} />
                    </button>
                    <span className="w-2.5 text-center text-[9.5px]">{count}</span>
                    <button 
                      onClick={() => onAddToCart(
                        { id: item.id, name: item.name, price: item.price, image: item.image },
                        item.id.startsWith("g-") ? "direct_grocery" : "cafe_hilltop",
                        item.id.startsWith("g-") ? "Bluber Direct Sourcing" : "Cafe Hilltop",
                        item.id.startsWith("g-") ? "grocery" : "food"
                      )}
                      className="cursor-pointer border-none bg-transparent text-white"
                    >
                      <Plus size={9} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onAddToCart(
                      { id: item.id, name: item.name, price: item.price, image: item.image },
                      item.id.startsWith("g-") ? "direct_grocery" : "cafe_hilltop",
                      item.id.startsWith("g-") ? "Bluber Direct Sourcing" : "Cafe Hilltop",
                      item.id.startsWith("g-") ? "grocery" : "food"
                    )}
                    className="bg-[#EDF7EF] hover:bg-[#1E6B3D] hover:text-white text-primary py-1 px-3 rounded-md text-[10px] font-black tracking-tight active:scale-95 transition-all cursor-pointer border-none"
                  >
                    REORDER
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 7: RIDE DEMAND PROGRAM */}
      <section id="explore-demand-section" className="text-left">
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-[24px] p-4.5 border border-indigo-800 shadow-md flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="bg-[#a3e635] text-indigo-950 text-[8px] font-black uppercase px-2 py-0.5 rounded">
                Survey Program
              </span>
              <h4 className="text-xs font-black uppercase text-white mt-2 leading-tight">Elite Scooty Rollout poll</h4>
            </div>
            <span className="text-xl">📊</span>
          </div>
          
          <div className="text-[10px] text-indigo-100/90 leading-normal">
            <p className="font-bold text-white">Help us understand demand in Chamba.</p>
            <p className="mt-1">Would you use locally integrated, premium on-demand Elite Scooty services on a regular basis?</p>
          </div>

          {surveyVote ? (
            <div className="bg-white/10 p-3 rounded-xl border border-white/5 space-y-2 animate-fade-in text-[10px]">
              <div className="flex items-center gap-1.5 text-[#a3e635] font-black">
                <Check size={12} />
                <span>Thank you! Your feedback has been stored.</span>
              </div>
              <div className="space-y-1 text-white/90 font-medium">
                <div className="flex justify-between items-center">
                  <span>👍 Voted Yes ({voteStats.yes} votes)</span>
                  <span className="font-bold text-right">{Math.round((voteStats.yes / (voteStats.yes + voteStats.no)) * 100)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>👎 Voted No ({voteStats.no} votes)</span>
                  <span className="font-bold text-right">{Math.round((voteStats.no / (voteStats.yes + voteStats.no)) * 100)}%</span>
                </div>
              </div>
              <button 
                onClick={() => setSurveyVote(null)}
                className="text-[8.5px] underline text-indigo-200 hover:text-white cursor-pointer block mt-1 border-none bg-transparent"
              >
                Change vote
              </button>
            </div>
          ) : (
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => handleVote("Yes")}
                className="flex-1 bg-[#a3e635] hover:bg-[#bbf64a] text-indigo-950 font-black py-2 rounded-xl text-[10px] flex items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer border-none"
              >
                <ThumbsUp size={11} className="fill-current" />
                <span>Yes, absolutely</span>
              </button>
              <button
                onClick={() => handleVote("No")}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white font-black py-2 rounded-xl text-[10px] flex items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer border-none"
              >
                <ThumbsDown size={11} className="fill-current" />
                <span>No</span>
              </button>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};
