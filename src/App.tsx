import React, { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  MapPin, 
  Search, 
  Mic, 
  Home, 
  Compass, 
  Clock, 
  Wallet, 
  User, 
  Car, 
  Bike, 
  ShoppingBag, 
  Utensils, 
  Pill, 
  Package, 
  Store as LucideStore, 
  Users, 
  ChevronRight,
  Star,
  ArrowRight,
  Plus,
  Coins,
  Sparkles,
  MessageSquare,
  Apple,
  IceCream,
  FileText,
  X
} from "lucide-react";

import { 
  serviceCategories, 
  quickActions, 
  stores, 
  restaurants, 
  sampleOrders, 
  CHAMBA_HERO_IMAGE,
  DIRECT_GROCERY_PRODUCTS
} from "./data";
import { CartItem, Order, LiveChambaInfo, Store, Restaurant } from "./types";

// Import modules
import { ChambaSimulator } from "./components/ChambaSimulator";
import { RideApplet } from "./components/RideApplet";
import { ShopDetail } from "./components/ShopDetail";
import { CourierApplet } from "./components/CourierApplet";
import { GroceryPanel } from "./components/GroceryPanel";
import { safeStorage } from "./utils/safeStorage";
import { CustomOrderApplet } from "./components/CustomOrderApplet";
import { CustomRequestsHomeWidget } from "./components/CustomRequestsHomeWidget";
import { CartTab } from "./components/CartTab";
import { AdminPanel } from "./components/AdminPanel";
import { ExploreTab } from "./components/ExploreTab";
import { ProfileTab } from "./components/ProfileTab";
import { OrdersTab } from "./components/OrdersTab";
import { getPricingTier, PRICING_TIERS } from "./utils/pricing";
import {
  ScooterIllustration,
  DeliveryIllustration,
  GroceryIllustration,
  SnackIllustration,
  FoodIllustration,
  IceCreamIllustration,
  BeautyIllustration,
  HouseholdIllustration,
  CustomOrdersIllustration
} from "./components/CategoryIllustrations";

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "explore" | "orders" | "cart" | "profile">("home");
  const [selectedShop, setSelectedShop] = useState<{ id: string; type: "restaurant" | "store" } | null>(null);
  const [isRiding, setIsRiding] = useState(false);
  const [isEliteRide, setIsEliteRide] = useState(false);
  const [isCouriering, setIsCouriering] = useState(false);
  const [isGrocery, setIsGrocery] = useState(false);
  const [groceryInitialCategory, setGroceryInitialCategory] = useState<string>("fruits");
  const [isCustomOrder, setIsCustomOrder] = useState(false);

  const handleOpenGrocery = (category: string = "fruits") => {
    setGroceryInitialCategory(category);
    setIsGrocery(true);
  };
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  // App dynamic states persisted in local storage
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = safeStorage.getItem("bluber_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = safeStorage.getItem("bluber_orders");
    return saved ? JSON.parse(saved) : sampleOrders;
  });

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = safeStorage.getItem("bluber_wallet");
    return saved ? Number(saved) : 1250;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [rideFeedback, setRideFeedback] = useState<"YES" | "NO" | null>(null);
  
  // Global Success Toast State
  const [successToast, setSuccessToast] = useState<{
    show: boolean;
    itemName: string;
    itemImage: string;
  }>({
    show: false,
    itemName: "",
    itemImage: ""
  });
  const toastTimeoutRef = useRef<any>(null);

  // Redirect alert/confirm dynamically for iframe sandbox safety
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Top-level simulated time synced with components
  const [custTime, setCustTime] = useState<Date>(() => new Date());

  // Pricing Tariff Transition Toast Notification
  const [pricingToast, setPricingToast] = useState<{
    show: boolean;
    tierName: string;
    rate: number;
    icon: string;
    timeLabel: string;
  } | null>(null);

  const prevTierNameRef = useRef<string>("");

  useEffect(() => {
    const currentTier = getPricingTier(custTime);
    
    // On mount, initialize prevTierNameRef without toast
    if (!prevTierNameRef.current) {
      prevTierNameRef.current = currentTier.name;
      return;
    }

    if (prevTierNameRef.current !== currentTier.name) {
      // Pricing tier transition has occurred!
      console.log(`[TARIFF TIER CHANGE]: Changed from ${prevTierNameRef.current} to ${currentTier.name}`);
      
      // Trigger subtle real-time toast notification
      setPricingToast({
        show: true,
        tierName: currentTier.name,
        rate: currentTier.rate,
        icon: currentTier.icon,
        timeLabel: currentTier.timeLabel
      });

      prevTierNameRef.current = currentTier.name;

      // Auto dismiss after 5.5 seconds
      const timer = setTimeout(() => {
        setPricingToast(null);
      }, 5500);

      return () => clearTimeout(timer);
    }
  }, [custTime]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.alert = (msg: any) => {
          console.log("[BLUBER CUSTOM ALERT]:", msg);
          setAlertMessage(String(msg));
        };
      } catch (e) {
        console.warn("[BLUBER]: Could not override window.alert", e);
      }
      
      try {
        window.confirm = (msg: any) => {
          console.log("[BLUBER CUSTOM CONFIRM]:", msg);
          // Safely auto-confirm actions to preserve flow in sandboxed frames
          return true;
        };
      } catch (e) {
        console.warn("[BLUBER]: Could not override window.confirm", e);
      }
    }
  }, []);

  const triggerGlobalToast = (name: string, image: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setSuccessToast({
      show: true,
      itemName: name,
      itemImage: image || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop"
    });
    toastTimeoutRef.current = setTimeout(() => {
      setSuccessToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  // Sync states to local storage
  useEffect(() => {
    safeStorage.setItem("bluber_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    safeStorage.setItem("bluber_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    safeStorage.setItem("bluber_wallet", walletBalance.toString());
  }, [walletBalance]);

  // Global navigation scroll state reset
  useEffect(() => {
    const mainScroll = document.getElementById("main-scroll-content");
    if (mainScroll) {
      mainScroll.scrollTo({ top: 0, behavior: "instant" });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [activeTab, selectedShop, isRiding, isCouriering, isGrocery, isCustomOrder, isAdminOpen]);

  // Live simulation states
  const [chambaInfo, setChambaInfo] = useState<LiveChambaInfo>({
    weatherTemp: 22,
    weatherCondition: "Partly Cloudy",
    trafficLevel: "Light",
    roadJotPassStatus: "Clear",
    roadSachPassStatus: "Clear",
    deliveryStatus: "Normal"
  });
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  // Helper mapping for Lucide-react icons
  const renderPhosphorIcon = (name: string, size = 24, weight: "fill" | "regular" = "fill", className = "") => {
    switch (name) {
      case "Car": return <Car size={size} className={className} />;
      case "Scooter": return <Bike size={size} className={className} />;
      case "ShoppingBagOpen": return <ShoppingBag size={size} className={className} />;
      case "Hamburger": return <Utensils size={size} className={className} />;
      case "Pill": return <Pill size={size} className={className} />;
      case "Package": return <Package size={size} className={className} />;
      case "Storefront": return <LucideStore size={size} className={className} />;
      case "Users": return <Users size={size} className={className} />;
      default: return <Package size={size} className={className} />;
    }
  };

  // State modification logic
  const handleAddToCart = (item: any, shopId: string, shopName: string, type: "food" | "grocery" | "medicine") => {
    setCart(prev => {
      const existing = prev.find(ci => ci.id === item.id);
      if (existing) {
        return prev.map(ci => ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      } else {
        return [...prev, {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.image || "📦",
          storeOrRestaurantId: shopId,
          storeOrRestaurantName: shopName,
          type
        }];
      }
    });
    // Trigger the standardized global addition feedback toast
    triggerGlobalToast(item.name, item.image);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(ci => ci.id === itemId);
      if (!existing) return prev;
      if (existing.quantity === 1) {
        return prev.filter(ci => ci.id !== itemId);
      } else {
        return prev.map(ci => ci.id === itemId ? { ...ci, quantity: ci.quantity - 1 } : ci);
      }
    });
  };

  const handleDeductWallet = (amount: number): boolean => {
    if (walletBalance < amount) return false;
    setWalletBalance(prev => prev - amount);
    return true;
  };

  const handleAddOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const handleAdvanceOrderStatus = (orderId: string, customStatus?: Order["status"]) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      if (customStatus) {
        return { ...o, status: customStatus };
      }
      let nextStatus: Order["status"] = o.status;
      
      switch (o.status) {
        case "Order Confirmed": nextStatus = "Looking For Rider"; break;
        case "Looking For Rider": nextStatus = "Rider Accepted"; break;
        case "Rider Accepted": nextStatus = "Rider Reached Store"; break;
        case "Rider Reached Store": nextStatus = "Order Picked Up"; break;
        case "Order Picked Up": nextStatus = "Out For Delivery"; break;
        case "Out For Delivery": nextStatus = "Arriving Soon"; break;
        case "Arriving Soon": nextStatus = "Delivered"; break;
        default: break;
      }
      return { ...o, status: nextStatus };
    }));
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Cancelled" as const } : o));
  };

  const handleAddCustomOrder = (desc: string, customerName = "Nitish Kaushal", phoneNumber = "+91-98782-99015") => {
    try {
      const saved = safeStorage.getItem("bluber_custom_orders");
      const current = saved ? JSON.parse(saved) : [
        { 
          id: "CUST-304", 
          customerName: "Rahul Sharma", 
          phoneNumber: "+91-98160-22101", 
          description: "Requesting 6 custom local wood packaging boxes for Chamba Apples shipping", 
          status: "Accepted", 
          timestamp: "Today, 10:15 AM", 
          date: "Today, 10:15 AM" 
        },
        { 
          id: "CUST-112", 
          customerName: "Sunita Sharma", 
          phoneNumber: "+91-94180-88334", 
          description: "Sourcing 250g premium local Chamba Honey & Traditional Gahat Dal", 
          status: "Completed", 
          timestamp: "Yesterday, 04:30 PM", 
          date: "Yesterday, 04:30 PM" 
        }
      ];
      const newCust = {
        id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
        customerName: customerName || "Guest User",
        phoneNumber: phoneNumber || "+91-98782-99015",
        description: desc,
        status: "Pending",
        timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: "Today, Just Now"
      };
      current.unshift(newCust);
      safeStorage.setItem("bluber_custom_orders", JSON.stringify(current));

      // Append general Order for visibility
      const newOrder: Order = {
        id: newCust.id,
        type: "Grocery",
        merchantName: "Custom Dispatch Inquiry",
        itemsSummary: `Custom request: "${desc}" (By ${newCust.customerName})`,
        total: 150, // simulated initial security fee
        status: "Order Confirmed",
        date: "Today, Just Now",
        estimatedTime: "Verifying Quote",
        riderName: "Founder nitish",
        riderPhone: "+91-98782-99015"
      };
      setOrders(prev => [newOrder, ...prev]);
    } catch (e) {
      console.warn("Storage custom order error", e);
    }
  };

  // Nav helpers
  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === "rides") {
      setIsRiding(true);
    } else if (categoryId === "courier") {
      setIsCouriering(true);
    } else if (categoryId === "custom_order" || categoryId === "custom") {
      setIsCustomOrder(true);
    } else if (categoryId === "grocery" || categoryId === "icecream" || categoryId === "beauty" || categoryId === "household") {
      setIsGrocery(true);
    } else if (categoryId === "food") {
      setSelectedShop({ id: "cafe_hilltop", type: "restaurant" });
    } else if (categoryId === "medicine") {
      setSelectedShop({ id: "sharma_medical", type: "store" });
    } else {
      setActiveTab("explore");
    }
  };

  // Filter stores & restaurants for Search
  const filteredRestaurants = searchQuery 
    ? restaurants.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()))
    : restaurants;

  const filteredStores = searchQuery
    ? stores.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : stores;

  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartSubtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  return (
    <div className="min-h-screen bg-canvas md:py-6 flex items-center justify-center font-sans tracking-tight antialiased selection:bg-primary-light">
      {/* Immersive iPhone 14 Viewport Container */}
      <div 
        id="phone-wrapper" 
        className="w-full max-w-md bg-[#F7F8F5] h-screen md:h-[844px] shadow-custom relative flex flex-col overflow-hidden md:rounded-[40px] md:border-8 md:border-[#111827] pointer-events-auto"
      >
        {/* Global Success Toast */}
        {successToast.show && (
          <div className="absolute top-4 inset-x-4 bg-white/95 backdrop-blur-md border border-emerald-500/20 shadow-xl rounded-2xl p-3 flex items-center justify-between z-[9999] animate-slide-down pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center bg-[#EDF7EF]">
                <img 
                  src={successToast.itemImage} 
                  alt={successToast.itemName} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop";
                  }}
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-[#1E6B3D] flex items-center gap-1">
                  <span>✓</span> Added to Cart
                </p>
                <p className="text-[11px] text-text-primary font-bold line-clamp-1 max-w-[170px] mt-0.5">
                  {successToast.itemName}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setIsGrocery(false);
                setSelectedShop(null);
                setIsRiding(false);
                setIsCouriering(false);
                setIsCustomOrder(false);
                setActiveTab("cart");
                setSuccessToast(prev => ({ ...prev, show: false }));
              }}
              className="text-[10px] font-black bg-[#EDF7EF] hover:bg-emerald-100 text-[#1E6B3D] py-1.5 px-3 rounded-lg border border-emerald-500/10 active:scale-95 transition-all cursor-pointer"
            >
              View Cart
            </button>
          </div>
        )}

        {/* Real-time Pricing Tariff Switch Toast Notification */}
        {pricingToast?.show && (
          <div 
            className="absolute top-4 inset-x-4 bg-[#EDF7EF] border border-[#1E6B3D]/30 shadow-2xl rounded-[24px] p-4 flex items-start gap-3.5 z-[10000] animate-slide-down pointer-events-auto text-left"
          >
            <div className="bg-[#1E6B3D] text-white w-10.5 h-10.5 rounded-full flex items-center justify-center text-lg select-none shrink-0 shadow-xs border-2 border-white">
              {pricingToast.icon}
            </div>
            <div className="flex-1 text-left min-w-0 pr-1">
              <span className="text-[9px] font-black tracking-widest text-[#1E6B3D] uppercase block">
                Local Surcharge & Tariff Update
              </span>
              <h4 className="text-xs font-extrabold text-[#111827] mt-1.5 flex items-center gap-1.5">
                <span>{pricingToast.tierName} Active</span>
                <span className="text-gray-300">•</span>
                <span className="bg-[#1E6B3D] text-white px-2 py-0.5 rounded text-[9px] font-bold">₹{pricingToast.rate}/KM</span>
              </h4>
              <p className="text-[10px] text-emerald-800 font-semibold leading-normal mt-1 w-full truncate">
                Rider pricing updated automatically to <span className="font-extrabold">₹{pricingToast.rate}/KM</span>.
              </p>
              <p className="text-[9px] text-[#9CA3AF] mt-1 font-bold leading-none">
                Active Tier Hours: {pricingToast.timeLabel}
              </p>
            </div>
            <button 
              onClick={() => setPricingToast(null)}
              className="text-[#1E6B3D]/60 hover:text-[#1E6B3D] p-1 rounded-full cursor-pointer hover:bg-[#1E6B3D]/5 transition-colors border-none bg-none shrink-0"
              title="Dismiss Alert"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div id="main-scroll-content" className="flex-1 overflow-y-auto no-scrollbar pb-24">
          
          {/* 1. INTERACTIVE POPUPS / DETAIL VIEWS */}
          {isAdminOpen ? (
            <AdminPanel
              orders={orders}
              onAdvanceOrderStatus={handleAdvanceOrderStatus}
              onCancelOrder={handleCancelOrder}
              onBack={() => setIsAdminOpen(false)}
            />
          ) : isRiding ? (
            <RideApplet 
              walletBalance={walletBalance}
              onDeductWallet={handleDeductWallet}
              onAddOrder={handleAddOrder}
              onBack={() => {
                setIsRiding(false);
                setIsEliteRide(false);
              }}
              initialElite={isEliteRide}
              custTime={custTime}
              onCustTimeChange={setCustTime}
            />
          ) : isCouriering ? (
            <CourierApplet 
              walletBalance={walletBalance}
              onDeductWallet={handleDeductWallet}
              onAddOrder={handleAddOrder}
              onBack={() => setIsCouriering(false)}
              onSwitchToOrders={() => {
                setIsCouriering(false);
                setActiveTab("orders");
              }}
            />
          ) : isGrocery ? (
            <GroceryPanel 
              cart={cart}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              onBack={() => setIsGrocery(false)}
              onViewCart={() => {
                setIsGrocery(false);
                setActiveTab("cart");
              }}
              initialCategory={groceryInitialCategory}
            />
          ) : isCustomOrder ? (
            <CustomOrderApplet 
              onAddCustomOrder={handleAddCustomOrder}
              onBack={() => setIsCustomOrder(false)}
            />
          ) : selectedShop ? (
            <ShopDetail 
              shop={selectedShop.type === "restaurant" ? restaurants.find(r => r.id === selectedShop.id)! : stores.find(s => s.id === selectedShop.id)!}
              type={selectedShop.type}
              cart={cart}
              walletBalance={walletBalance}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={() => setCart([])}
              onDeductWallet={handleDeductWallet}
              onPlaceOrder={handleAddOrder}
              onBack={() => setSelectedShop(null)}
              onSwitchToOrders={() => {
                setSelectedShop(null);
                setActiveTab("orders");
              }}
            />
          ) : (
            // standard Tab Switchers
            <>
              {activeTab === "explore" && (
                <ExploreTab 
                  cart={cart}
                  onAddToCart={handleAddToCart}
                  onRemoveFromCart={handleRemoveFromCart}
                  onSelectShop={setSelectedShop}
                  onSetIsRiding={setIsRiding}
                  onSetIsCouriering={setIsCouriering}
                  onSetIsGrocery={(val, catKey) => {
                    if (val) {
                      handleOpenGrocery(catKey || "fruits");
                    } else {
                      setIsGrocery(false);
                    }
                  }}
                  onSetIsCustomOrder={setIsCustomOrder}
                  onSetActiveTab={setActiveTab}
                />
              )}
              
              {activeTab === "orders" && (
                <OrdersTab 
                  orders={orders} 
                  onAdvanceOrderStatus={handleAdvanceOrderStatus}
                  onCancelOrder={handleCancelOrder}
                />
              )}
              
              {activeTab === "cart" && (
                <CartTab 
                  cart={cart}
                  walletBalance={walletBalance}
                  onAddToCart={handleAddToCart}
                  onRemoveFromCart={handleRemoveFromCart}
                  onClearCart={() => setCart([])}
                  onPlaceOrder={handleAddOrder}
                  onDeductWallet={handleDeductWallet}
                  onSwitchToOrders={() => setActiveTab("orders")}
                />
              )}

              {activeTab === "profile" && (
                <ProfileTab 
                  walletBalance={walletBalance}
                  onTopUpWallet={(amt) => setWalletBalance(prev => prev + amt)}
                  onEnterAdmin={() => setIsAdminOpen(true)}
                  orders={orders}
                  onViewAllOrders={() => setActiveTab("orders")}
                />
              )}

              {activeTab === "home" && (
                <div className="px-5 animate-fade-in space-y-6">
                  
                  {/* Section 1: Header */}
                  <header id="app-header" className="sticky top-0 z-50 bg-white/95 backdrop-blur-md h-[72px] flex items-center justify-between py-2 border-b border-border-custom/30 px-5 -mx-5 animate-fade-in">
                    <div className="flex items-center gap-2.5 text-left">
                      <div className="bg-[#1E6B3D] text-white p-2.5 rounded-full shadow-sm">
                        <MapPin size={22} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1">
                          <h1 className="text-sm font-black text-text-primary leading-none">Chamba, HP</h1>
                          <ChevronRight size={12} className="text-text-primary" />
                        </div>
                        <p className="text-[10px] text-text-secondary leading-none mt-1">Delivering to you</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Live Chamba weather info / Simulator modal access */}
                      <div 
                        onClick={() => setIsSimModalOpen(true)}
                        className="bg-[#EDF7EF] hover:bg-[#1E6B3D]/10 py-1.5 px-2.5 rounded-full border border-[#1E6B3D]/10 flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                      >
                        <span className="text-[10px] font-black text-[#1E6B3D]">⛅ {chambaInfo.weatherTemp}°C</span>
                      </div>

                      {/* Notification Bell Icon */}
                      <div className="relative p-2 text-text-primary hover:bg-canvas rounded-full transition-colors cursor-pointer" onClick={() => setAlertMessage("Welcome to BLUBER! Hyperlocal services are now fully operational in Chamba!")}>
                        <Bell size={22} />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                      </div>
                      
                      {/* Profile Avatar */}
                      <button 
                        onClick={() => setActiveTab("profile")}
                        className="w-10 h-10 bg-[#EDF7EF] rounded-full text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white cursor-pointer overflow-hidden"
                      >
                        <img 
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop" 
                          alt="Profile Avatar"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    </div>
                  </header>

                  {/* Section 2: Search Bar */}
                  <div id="search-container" className="mt-2">
                    <div className="h-14 bg-white rounded-[28px] border border-border-custom px-4.5 flex items-center justify-between shadow-sm focus-within:border-primary transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <Search size={22} className="text-text-secondary" />
                        <input 
                          type="text" 
                          placeholder="Search groceries, food, rides, deliveries or anything..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-transparent text-xs font-semibold w-full text-text-primary placeholder:text-text-secondary placeholder:font-light focus:outline-none"
                        />
                      </div>
                      <Mic size={22} className="text-text-secondary cursor-pointer hover:text-primary transition-colors" />
                    </div>
                  </div>

                  {/* Search Results Display if Query present */}
                  {searchQuery && (
                    <div className="mt-4 bg-surface rounded-[24px] p-4 shadow-custom space-y-3 border border-border-custom text-left">
                      <div className="flex justify-between items-center pb-2 border-b border-border-custom">
                        <span className="text-xs font-bold text-text-secondary uppercase">Unified Results</span>
                        <button onClick={() => setSearchQuery("")} className="text-xs font-bold text-rose-500 hover:underline">Clear</button>
                      </div>
                      
                      <div className="space-y-2">
                        {filteredRestaurants.map(r => (
                          <div 
                            key={r.id} 
                            onClick={() => setSelectedShop({ id: r.id, type: "restaurant" })}
                            className="p-2.5 rounded-xl bg-canvas flex justify-between items-center cursor-pointer hover:bg-[#EDF7EF]/55"
                          >
                            <span className="text-xs font-bold text-text-primary">🍽️ {r.name} ({r.cuisine})</span>
                            <span className="text-[10px] bg-primary text-white font-bold px-2.5 py-1 rounded-full">Menu ➔</span>
                          </div>
                        ))}
                        {filteredStores.map(s => (
                          <div 
                            key={s.id} 
                            onClick={() => {
                              if (s.id === "malik_general") {
                                setIsGrocery(true);
                              } else {
                                setSelectedShop({ id: s.id, type: "store" });
                              }
                            }}
                            className="p-2.5 rounded-xl bg-canvas flex justify-between items-center cursor-pointer hover:bg-[#EDF7EF]/55"
                          >
                            <span className="text-xs font-bold text-text-primary">🛍️ {s.name} ({s.category})</span>
                            <span className="text-[10px] bg-primary text-white font-bold px-2.5 py-1 rounded-full">{s.id === "malik_general" ? "Direct Products ➔" : "Shop ➔"}</span>
                          </div>
                        ))}
                        {filteredRestaurants.length === 0 && filteredStores.length === 0 && (
                          <p className="text-xs text-text-secondary p-2.5 text-center">No merchants match your query.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 1. Hero Banner (Top Priority) */}
                  <div id="hero-banner" className="pt-2 text-left">
                    <div className="w-full bg-[#FEF9C3] rounded-[32px] p-5 shadow-sm border border-yellow-200 relative overflow-hidden flex justify-between items-center h-44">
                      
                      {/* Premium rider mascot background */}
                      <div className="absolute inset-y-0 right-1 w-[40%] overflow-hidden flex items-center justify-center">
                        <img 
                          src="/src/assets/images/yellow_delivery_rider_1782129458782.jpg" 
                          alt="Premium BLUBER rider mascot on Vespa" 
                          className="w-full h-full object-contain object-right"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="relative z-10 w-[60%] text-left space-y-1.5 pr-2">
                        <span className="inline-block bg-[#1E6B3D] text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                          CHAMBA SUPER APP
                        </span>
                        <div>
                          <h2 className="text-[17px] font-black tracking-tight text-gray-900 leading-tight">
                            BLUBER is now in Chamba
                          </h2>
                          <p className="text-[10px] text-gray-700 leading-normal mt-1 font-bold">
                            Fast deliveries.<br />Local rides.<br />Everything you need.
                          </p>
                        </div>

                        <button 
                          onClick={() => handleOpenGrocery("fruits")}
                          className="bg-gray-900 border border-gray-900 text-white hover:bg-gray-800 text-[10px] font-black px-4 py-2.5 rounded-full shadow-md flex items-center gap-1 active:scale-95 transition-all cursor-pointer mt-1"
                        >
                          Order Now
                        </button>
                      </div>
                    </div>
                    
                    {/* Carousel Indicators */}
                    <div className="flex justify-center gap-1.5 mt-2.5">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                    </div>
                  </div>

                  {/* 2. Services Grid */}
                  <div id="primary-services-grid" className="pt-2 text-left">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-bold text-[#111827] uppercase tracking-widest opacity-80">Services</h3>
                      <button onClick={() => setActiveTab("explore")} className="text-[10px] font-black text-primary hover:underline cursor-pointer bg-none border-none">See all</button>
                    </div>
                    <div className="grid grid-cols-4 gap-3.5 select-none text-left">
                      {[
                        { id: "rides", label: "Ride", icon: Bike, bgColor: "bg-[#FAF6EC]" },
                        { id: "courier", label: "Delivery", icon: Package, bgColor: "bg-[#EAF2EC]" },
                        { id: "grocery", label: "Grocery", icon: Apple, bgColor: "bg-[#E9F5EF]" },
                        { id: "food", label: "Food", icon: Utensils, bgColor: "bg-[#FAF0E6]" },
                        { id: "ice_cream", label: "Ice Cream", icon: IceCream, bgColor: "bg-[#F3EBF5]" },
                        { id: "beauty", label: "Beauty", icon: Sparkles, bgColor: "bg-[#F0E6F7]" },
                        { id: "household", label: "Household", icon: Home, bgColor: "bg-[#E6EEF8]" },
                        { id: "custom_order", label: "Custom Orders", icon: FileText, bgColor: "bg-[#EEF1F7]" }
                      ].map((service) => {
                        const IconComponent = service.icon;
                        return (
                          <div 
                            key={service.id}
                            onClick={() => {
                              if (service.id === "rides") {
                                setIsEliteRide(false);
                                setIsRiding(true);
                              }
                              else if (service.id === "courier") setIsCouriering(true);
                              else if (service.id === "grocery") handleOpenGrocery("fruits");
                              else if (service.id === "ice_cream") handleOpenGrocery("icecream");
                              else if (service.id === "beauty") handleOpenGrocery("beauty");
                              else if (service.id === "household") handleOpenGrocery("household");
                              else if (service.id === "food") setSelectedShop({ id: "cafe_hilltop", type: "restaurant" });
                              else if (service.id === "custom_order") setIsCustomOrder(true);
                            }}
                            className={`${service.bgColor} rounded-[20px] py-4 px-2.5 flex flex-col items-center justify-between cursor-pointer transition-all duration-300 active:scale-[0.94] hover:-translate-y-0.5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] border border-black/[0.01] h-[92px]`}
                          >
                            <div className="flex items-center justify-center shrink-0 mt-0.5">
                              <IconComponent size={24} strokeWidth={2} className="text-[#1F2937]" />
                            </div>
                            <span className="text-[#111827] text-[10px] font-bold text-center truncate w-full leading-tight select-none mb-0.5 pr-0.5">
                              {service.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Shop by Categories (SaaS Quality Vector Redesign) */}
                  <div id="shop-by-categories" className="text-left pt-2">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-black text-text-primary tracking-tight font-sans">Shop by Categories</h3>
                      <button onClick={() => setActiveTab("explore")} className="text-[10px] font-bold text-primary hover:underline cursor-pointer bg-none border-none">See all</button>
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar">
                      {[
                        { id: "grocery_kitchen", label: "Grocery & Kitchen", categoryKey: "fruits", Illustration: GroceryIllustration },
                        { id: "snacks_drinks", label: "Snacks & Drinks", categoryKey: "snacks", Illustration: SnackIllustration },
                        { id: "icecream_hub", label: "Ice Cream Hub", categoryKey: "icecream", Illustration: IceCreamIllustration },
                        { id: "beauty_care", label: "Beauty & Personal Care", categoryKey: "beauty", Illustration: BeautyIllustration },
                        { id: "household_essentials", label: "Household Essentials", categoryKey: "household", Illustration: HouseholdIllustration },
                        { id: "food_delivery", label: "Food", Illustration: FoodIllustration },
                        { id: "ride_services", label: "Ride Services", Illustration: ScooterIllustration },
                        { id: "custom_orders", label: "Custom Orders", Illustration: CustomOrdersIllustration },
                      ].map((cat) => {
                        const Illustration = cat.Illustration;
                        return (
                          <div 
                            key={cat.id}
                            onClick={() => {
                              if (cat.id === "food_delivery") setSelectedShop({ id: "cafe_hilltop", type: "restaurant" });
                              else if (cat.id === "ride_services") setIsRiding(true);
                              else if (cat.id === "custom_orders") setIsCustomOrder(true);
                              else handleOpenGrocery((cat as any).categoryKey || "fruits");
                            }}
                            className="group bg-white w-28 h-36 rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-black/[0.04] hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] active:scale-[0.97] cursor-pointer transition-all duration-300 transform-gpu shrink-0 text-center flex flex-col justify-between"
                          >
                            {/* Illustration area: LARGE illustration area (70%) */}
                            <div className="h-[96px] w-full overflow-hidden relative flex items-center justify-center">
                              <Illustration />
                            </div>
                            
                            {/* Text label: Smaller text labels (30%) */}
                            <div className="h-[44px] flex items-center justify-center px-1.5 py-1 bg-white border-t border-black/[0.02]">
                              <span className="text-[10.5px] font-bold text-neutral-800 tracking-tight leading-tight line-clamp-2">
                                {cat.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Featured Products */}
                  <div id="featured-products" className="text-left pt-2">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-black text-text-primary tracking-tight">🔥 Featured Products</h3>
                      <button onClick={() => handleOpenGrocery("fruits")} className="text-[10px] font-bold text-primary hover:underline cursor-pointer bg-none border-none">See all</button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {DIRECT_GROCERY_PRODUCTS.slice(0, 8).map((prod) => {
                        const inCart = (cart || []).find(item => item.id === prod.id);
                        return (
                          <div 
                            key={prod.id}
                            className="bg-white rounded-[24px] p-3 flex flex-col justify-between border border-border-custom/30 shadow-xs hover:shadow-sm"
                          >
                            <div className="flex flex-col">
                              <div className="w-full h-28 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100 mb-2.5 relative">
                                <img 
                                  src={prod.image} 
                                  alt={prod.name} 
                                  loading="lazy"
                                  className="w-full h-full object-cover select-none"
                                  onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop";
                                  }}
                                />
                              </div>
                              <div className="w-full">
                                <h4 className="text-[11px] font-bold text-text-primary line-clamp-2 leading-tight min-h-[32px]">{prod.name}</h4>
                                <span className="text-[9.5px] text-text-secondary font-black tracking-tight uppercase block mt-1">{prod.unit}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3.5 w-full">
                              <span className="text-xs font-black text-text-primary">₹{prod.price}</span>
                              {inCart ? (
                                <div className="flex items-center border border-primary/20 bg-[#EDF7EF] rounded-lg overflow-hidden h-7">
                                  <button 
                                    onClick={() => handleRemoveFromCart(prod.id)}
                                    className="px-2 h-full text-xs font-black text-primary hover:bg-emerald-100 transition-colors cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="px-1.5 text-xs font-bold text-primary">{inCart.quantity}</span>
                                  <button 
                                    onClick={() => handleAddToCart({ id: prod.id, name: prod.name, price: prod.price, unit: prod.unit, image: prod.image }, "direct_grocery", "Bluber Direct Sourcing", "grocery")}
                                    className="px-2 h-full text-xs font-black text-primary hover:bg-emerald-100 transition-colors cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => handleAddToCart({ id: prod.id, name: prod.name, price: prod.price, unit: prod.unit, image: prod.image }, "direct_grocery", "Bluber Direct Sourcing", "grocery")}
                                  className="border border-primary text-primary hover:bg-[#EDF7EF] text-[10px] font-black px-3 py-1 rounded-lg shadow-inner active:scale-95 transition-all cursor-pointer h-7 flex items-center justify-center uppercase"
                                >
                                  + ADD
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. Popular Near You */}
                  <div id="popular-near-you" className="text-left pt-2">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-black text-text-primary tracking-tight font-sans">🍕 Popular Near You</h3>
                      <button onClick={() => setSelectedShop({ id: "cafe_hilltop", type: "restaurant" })} className="text-[10px] font-bold text-primary hover:underline cursor-pointer bg-none border-none font-sans">See all</button>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-1.5 no-scrollbar">
                      {[
                        { id: "cafe_hilltop", targetId: "cafe_hilltop", name: "Cafe Hilltop", cuisine: "Italian, Continental", rating: 4.6, eta: "20-30 min", priceRange:  "₹250 for two", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200&auto=format&fit=crop" },
                        { id: "pizza_corner", targetId: "cafe_hilltop", name: "Pizza Corner", cuisine: "Gourmet Woodfired", rating: 4.8, eta: "15-25 min", priceRange: "₹300 for two", image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=200&auto=format&fit=crop" },
                        { id: "momo_express", targetId: "tibetan_kitchen", name: "Momo Express", cuisine: "Tibetan Food", rating: 4.5, eta: "15-20 min", priceRange: "₹180 for two", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=200&auto=format&fit=crop" },
                        { id: "burger_hub", targetId: "cafe_hilltop", name: "Burger Hub", cuisine: "American Fast Food", rating: 4.3, eta: "10-15 min", priceRange: "₹200 for two", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200&auto=format&fit=crop" }
                      ].map((foodShop) => (
                        <div
                          key={foodShop.id}
                          onClick={() => setSelectedShop({ id: foodShop.targetId, type: "restaurant" })}
                          className="bg-white w-52 rounded-[24px] overflow-hidden shadow-sm hover:scale-[1.02] cursor-pointer transition-all shrink-0 text-left border border-border-custom/40"
                        >
                          <div className="relative h-28 w-full">
                            <img src={foodShop.image} alt={foodShop.name} className="w-full h-full object-cover" />
                            <span className="absolute top-3 left-3 bg-[#111827]/85 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                              {foodShop.eta}
                            </span>
                          </div>
                          
                          <div className="p-3.5 space-y-1">
                            <h4 className="text-xs font-black text-text-primary tracking-tight leading-none">{foodShop.name}</h4>
                            <p className="text-[10px] text-text-secondary truncate">{foodShop.cuisine}</p>
                            <p className="text-[9.5px] text-primary font-black mt-0.5">{foodShop.priceRange}</p>
                            
                            <div className="flex items-center gap-1.5 pt-1 text-[10px] font-bold text-text-primary">
                              <span className="flex items-center gap-0.5 bg-yellow-50 text-amber-700 px-1.5 py-0.25 rounded-md">
                                <Star size={10} className="text-amber-500 fill-amber-500" />
                                {foodShop.rating}
                              </span>
                              <span>•</span>
                              <span className="text-text-secondary text-[9px]">Chamba Favorite</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 6. Custom Order Section */}
                  <div id="custom-order-section" className="text-left pt-2 space-y-6">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-black text-text-primary tracking-tight">✨ Custom Sourcing & Elite Rides</h3>
                    </div>

                    <CustomRequestsHomeWidget 
                      onAddCustomRequest={handleAddCustomOrder}
                    />

                    <div id="ride-services-section">
                      <div 
                        onClick={() => {
                          setIsEliteRide(true);
                          setIsRiding(true);
                        }}
                        className="bg-gradient-to-br from-[#111827] to-[#1E6B3D] text-white rounded-[28px] p-5 border border-emerald-500/20 shadow-md flex flex-col space-y-3 relative overflow-hidden text-left cursor-pointer transition-all duration-300 transform-gpu hover:-translate-y-1 hover:scale-[1.015] active:translate-y-0 active:scale-[0.99] hover:shadow-[0_24px_50px_-10px_rgba(163,230,53,0.3)] hover:border-emerald-400/50"
                      >
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="bg-[#a3e635] text-indigo-950 px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider">
                              Elite Scooty Service
                            </span>
                            <h4 className="text-sm font-black text-white mt-2 leading-none">Premium Two-Wheeler Convenience</h4>
                            <p className="text-[10px] text-emerald-100/90 leading-snug mt-1.5 font-semibold">
                              Fast • Reliable • 24×7 Availability
                            </p>
                          </div>
                          <span className="text-2xl">🛵</span>
                        </div>
                        
                        <div className="text-[10.5px] text-gray-300 leading-normal border-t border-white/10 pt-2 space-y-0.5">
                          <p>• <strong>Availability:</strong> 24 Hours, 7 Days A Week</p>
                          <p>• <strong>Ideal for:</strong> Selected customers within Chamba limits looking for premium, prompt travel.</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-1">
                          <div>
                            <p className="text-[9px] text-emerald-200 font-extrabold uppercase leading-none">Affordable Base Price</p>
                            <p className="text-base font-black text-white mt-1">₹40 <span className="text-[10px] text-gray-300 font-medium">per KM</span></p>
                          </div>
                          <button
                            type="button"
                            className="bg-[#a3e635] hover:bg-[#bbf64a] text-indigo-950 text-[11px] font-black py-2.5 px-6 rounded-xl shadow-md transition-all block border-none cursor-pointer"
                          >
                            Book Elite Scooty
                          </button>
                        </div>
                      </div>
                    </div>

                    <div id="ride-demand-feedback">
                      <div className="bg-[#EDF7EF] rounded-[28px] p-5 border border-[#1E6B3D]/10 flex flex-col items-start gap-3 relative overflow-hidden">
                        <span className="absolute top-4 right-4 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>

                        <div className="space-y-1">
                          <h4 className="text-[10px] font-black text-[#1E6B3D] uppercase tracking-wider">Local Ride Feedback</h4>
                          <h3 className="text-xs font-black text-gray-900 tracking-tight">Help us gauge demand in Chamba</h3>
                          <p className="text-[10.5px] text-text-secondary leading-normal">
                            Would you use local instant ride services within Chamba municipal limits?
                          </p>
                        </div>

                        {rideFeedback ? (
                          <div className="bg-white/80 border border-emerald-100 p-3 rounded-2xl w-full text-center text-xs font-black text-primary animate-fade-in shadow-inner">
                            🎉 Thank you! Feedback recorded: "{rideFeedback}". We are assessing requirements in Chamba, HP.
                          </div>
                        ) : (
                          <div className="flex gap-2 w-full pt-1">
                            <button 
                              onClick={() => setRideFeedback("YES")}
                              className="flex-1 bg-primary hover:bg-[#1E6B3D] text-white font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
                            >
                              YES
                            </button>
                            <button 
                              onClick={() => setRideFeedback("NO")}
                              className="bg-white border border-border-custom hover:bg-canvas text-text-primary font-extrabold text-xs px-4 py-2.5 flex-1 rounded-xl transition-all cursor-pointer text-center"
                            >
                              NO
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {orders.length > 0 && (
                      <div id="horizontal-recent-orders" className="text-left pt-2 pb-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Recent Orders</h3>
                          <button onClick={() => setActiveTab("orders")} className="text-[10px] font-bold text-primary hover:underline cursor-pointer bg-none border-none">View All</button>
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-1.5 no-scrollbar">
                          {orders.map((ord) => (
                            <div 
                              key={ord.id} 
                              onClick={() => setActiveTab("orders")}
                              className="bg-white min-w-[200px] max-w-[220px] p-3.5 rounded-[24px] shadow-sm border border-border-custom/40 flex flex-col justify-between relative cursor-pointer active:scale-98 transition-transform shrink-0"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xl">
                                  {ord.type === "Ride" ? "🚕" : "📦"}
                                </span>
                                <div className="min-w-0">
                                  <h4 className="text-[11px] font-black text-text-primary leading-tight truncate">{ord.merchantName}</h4>
                                  <p className="text-[8.5px] text-text-secondary leading-none mt-1">{ord.date}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-dashed border-border-custom/50">
                                <span className="text-[11px] font-extrabold text-text-primary">₹{ord.total}</span>
                                <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  ord.status === "Delivered" || ord.status === "Completed" ? "bg-emerald-50 text-primary" : "bg-primary-light/45 text-primary"
                                }`}>
                                  {ord.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 7. Footer */}
                  <footer className="mt-8 pt-8 pb-12 border-t border-black/[0.06] text-left space-y-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-gray-900 tracking-tight font-sans">BLUBER Chamba</span>
                        <span className="bg-[#EDF7EF] text-primary text-[8.5px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#1E6B3D]/10">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          LIVE IN CHAMBA, HP
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed font-sans font-medium">
                        Your trustworthy and hyperlocal delivery companion. Bringing fresh groceries, hot restaurant food, daily essential snacks, ice-creams, and elite two-wheeler ride convenience directly to you.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1 text-[10.5px] text-text-secondary font-medium font-sans">
                      <div className="space-y-1">
                        <p className="font-bold text-gray-900 uppercase tracking-widest text-[8.5px]">Assurance</p>
                        <p>✓ 100% Genuine Inventory</p>
                        <p>✓ Instant Verification</p>
                        <p>✓ No Hidden Fees</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-gray-900 uppercase tracking-widest text-[8.5px]">Support</p>
                        <p>☎ 24/7 Helpline Support</p>
                        <p>★ Rated 4.9 by Locals</p>
                        <p>📍 Municipal Limits Coverage</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-black/[0.03] flex flex-col gap-1 text-[9px] text-[#9CA3AF] font-bold tracking-tight uppercase font-sans">
                      <p>© {new Date().getFullYear()} Bluber Hyperlocal Services. All Rights Reserved.</p>
                      <p>Active Session: {chambaInfo.weatherTemp > 24 ? "Sunny Summer" : "Cool Chamba Breeze"} • Sim Time: {custTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </footer>

                  <ChambaSimulator 
                    info={chambaInfo} 
                    onChange={setChambaInfo} 
                    isOpen={isSimModalOpen}
                    onClose={() => setIsSimModalOpen(!isSimModalOpen)}
                    custTime={custTime}
                    onCustTimeChange={setCustTime}
                  />

                </div>
              )}
            </>
          )}

        </div>

        {/* 2. DYNAMIC FLOATING BLINKIT-STYLE CART BOTTOM DOCK BAR */}
        {cartCount > 0 && !isGrocery && !isRiding && !isCouriering && !isCustomOrder && !isAdminOpen && selectedShop === null && activeTab !== "cart" && (
          <div 
            onClick={() => setActiveTab("cart")}
            className="absolute bottom-[94px] inset-x-4 bg-primary hover:bg-primary/95 text-white p-3.5 rounded-2xl flex justify-between items-center shadow-lg shadow-emerald-700/20 active:scale-98 transition-all cursor-pointer z-50 animate-bounce"
          >
            <div className="flex items-center gap-2.5">
              <span className="bg-emerald-600 p-1.5 rounded-lg flex items-center justify-center">
                <ShoppingBag size={14} />
              </span>
              <div className="text-left">
                <p className="text-xs font-black tracking-wide leading-none">{cartCount} items in basket</p>
                <p className="text-[9.5px] text-emerald-100 mt-1 leading-none">Vouchers & fast checkout ready • ₹{cartSubtotal}</p>
              </div>
            </div>
            <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest text-[9.5px]">
              Checkout ➔
            </span>
          </div>
        )}

        {/* 3. CONSTANT NATIVE BOTTOM NAVIGATION */}
        <nav 
          id="app-bottom-nav" 
          className="absolute bottom-0 inset-x-0 h-[84px] bg-white border-t border-border-custom px-5 flex items-center justify-between z-40"
        >
          {[
            { id: "home" as const, label: "Home", icon: Home },
            { id: "explore" as const, label: "Explore", icon: Compass },
            { id: "orders" as const, label: "Orders", icon: Clock },
            { id: "cart" as const, label: "Cart", icon: ShoppingBag },
            { id: "profile" as const, label: "Profile", icon: User }
          ].map((tab) => {
            const isSelected = activeTab === tab.id && !selectedShop && !isRiding && !isCouriering && !isGrocery && !isCustomOrder && !isAdminOpen;
            
            // Render cart icon with count badge
            const isCart = tab.id === "cart";

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedShop(null);
                  setIsRiding(false);
                  setIsCouriering(false);
                  setIsGrocery(false);
                  setIsCustomOrder(false);
                  setIsAdminOpen(false);
                  setActiveTab(tab.id);
                }}
                className={`flex flex-col items-center justify-center flex-1 cursor-pointer transition-all duration-150 relative border-none bg-transparent ${
                  isSelected ? "scale-105" : "hover:opacity-80"
                }`}
              >
                <div className="relative">
                  <tab.icon 
                    size={24} 
                    className={isSelected ? "text-[#1E6B3D]" : "text-[#9CA3AF]"} 
                    fill={isSelected ? "currentColor" : "none"}
                  />
                  {isCart && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-bold tracking-tight ${
                  isSelected ? "text-[#1E6B3D]" : "text-[#9CA3AF]"
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Custom dialog for safe window.alert behavior within sandbox iframes */}
        {alertMessage && (
          <div className="absolute inset-0 bg-black/60 z-[99999] flex items-center justify-center p-6 pointer-events-auto">
            <div className="bg-white rounded-[32px] p-6 text-center max-w-xs w-full mx-auto shadow-2xl animate-[zoomIn_120ms_ease-out] text-left space-y-4">
              <div className="w-12 h-12 bg-[#EDF7EF] rounded-full flex items-center justify-center mx-auto text-[#1E6B3D] shrink-0">
                <Sparkles size={22} className="fill-[#1E6B3D]/10" />
              </div>
              
              <div className="text-center">
                <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">Operational Update</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed mt-2.5 font-semibold">
                  {alertMessage}
                </p>
              </div>

              <button
                onClick={() => setAlertMessage(null)}
                className="w-full py-3.5 bg-primary hover:bg-[#1E6B3D] text-white font-black text-xs rounded-2xl shadow-xs border-none cursor-pointer transition-colors text-center uppercase tracking-wider"
              >
                Understood
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
