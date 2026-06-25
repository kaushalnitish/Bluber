import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
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
  X,
  CheckCircle,
  Pizza,
  Coffee,
  Cookie,
  Heart
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
import { EliteWaitlistModal } from "./components/EliteWaitlistModal";
import { StoreCard } from "./components/StoreCard";
import { CartTab } from "./components/CartTab";
import { AdminPanel } from "./components/AdminPanel";
import { ExploreTab } from "./components/ExploreTab";
import { ProfileTab } from "./components/ProfileTab";
import { ImageComponent } from "./components/ImageComponent";
import { OrdersTab } from "./components/OrdersTab";
import { getPricingTier, PRICING_TIERS } from "./utils/pricing";
import { AuthModal } from "./components/AuthModal";
import { auth, onAuthStateChanged, signOut } from "./utils/firebase";
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

  const [user, setUser] = useState<{ uid: string; name: string; email: string; phone: string; photoURL?: string } | null>(() => {
    const saved = safeStorage.getItem("bluber_auth_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; data?: any } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const u = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.phoneNumber || "Verified User",
          email: firebaseUser.email || "",
          phone: firebaseUser.phoneNumber || "",
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${firebaseUser.uid}`
        };
        setUser(u);
        safeStorage.setItem("bluber_auth_user", JSON.stringify(u));
        setUserProfile({
          name: u.name,
          phone: u.phone,
          email: u.email
        });
      } else {
        setUser(null);
        safeStorage.removeItem("bluber_auth_user");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      safeStorage.removeItem("bluber_auth_user");
      setUserProfile({ name: "", phone: "", email: "" });
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const handleOpenEliteWaitlist = () => {
    if (!user) {
      setPendingAction({ type: "JOIN_WAITLIST" });
      setIsAuthModalOpen(true);
      return;
    }
    setIsEliteWaitlistOpen(true);
  };

  const setPendingActionAndOpenAuth = (act: any) => {
    setPendingAction(act);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (authUser: any) => {
    setIsAuthModalOpen(false);
    setUser(authUser);
    safeStorage.setItem("bluber_auth_user", JSON.stringify(authUser));
    setUserProfile({
      name: authUser.name,
      phone: authUser.phone,
      email: authUser.email
    });
    
    // Now trigger the pendingAction if there is one!
    if (pendingAction) {
      const { type, data } = pendingAction;
      setPendingAction(null);
      if (type === "CUSTOM_ORDER" && data) {
        handleAddCustomOrder(data.desc, authUser.name, authUser.phone);
      } else if (type === "JOIN_WAITLIST") {
        setIsEliteWaitlistOpen(true);
      } else if (type === "BOOK_RIDE") {
        setIsRiding(true);
      } else if (type === "CHECKOUT") {
        // Handled naturally by cart or shop detail being logged in now
      }
    }
  };

  const [userProfile, setUserProfile] = useState<{ name: string; phone: string; email: string }>(() => {
    const saved = safeStorage.getItem("bluber_profile");
    if (saved) return JSON.parse(saved);
    const savedAuth = safeStorage.getItem("bluber_auth_user");
    if (savedAuth) {
      const u = JSON.parse(savedAuth);
      return { name: u.name, phone: u.phone, email: u.email };
    }
    return { name: "", phone: "", email: "" };
  });

  const [savedAddresses, setSavedAddresses] = useState<Array<{ id: string; type: string; label: string; detail: string }>>(() => {
    const saved = safeStorage.getItem("bluber_addresses");
    return saved ? JSON.parse(saved) : [
      { id: "addr-1", type: "Home", label: "Home Base Chamba", detail: "Near Chowgan square, Chamba Town, Himachal Pradesh" },
      { id: "addr-2", type: "Work", label: "Work (HDFC Complex)", detail: "Chamba Market Plaza Road, Chamba" },
      { id: "addr-3", type: "Other", label: "Khajjiar Cabin", detail: "Vista Retreat Cottage, Khajjiar Lake Road" }
    ];
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [rideFeedback, setRideFeedback] = useState<"YES" | "NO" | null>(null);
  
  // V-Mart Coming Soon notify state
  const [isNotifiedVMart, setIsNotifiedVMart] = useState<boolean>(() => {
    return safeStorage.getItem("bluber_v_mart_notified") === "true";
  });

  const handleToggleVMartNotification = () => {
    const newVal = !isNotifiedVMart;
    setIsNotifiedVMart(newVal);
    safeStorage.setItem("bluber_v_mart_notified", String(newVal));
  };

  // BLUBER Elite Experiences waitlist states
  const [isNotifiedEliteBuddy, setIsNotifiedEliteBuddy] = useState<boolean>(() => {
    return safeStorage.getItem("bluber_elite_buddy_notified") === "true";
  });
  
  const [eliteBuddyData, setEliteBuddyData] = useState<{
    email: string;
    phone: string;
    interests: string[];
  } | null>(() => {
    const saved = safeStorage.getItem("bluber_elite_buddy_data");
    return saved ? JSON.parse(saved) : null;
  });

  const [isEliteWaitlistOpen, setIsEliteWaitlistOpen] = useState(false);

  const handleJoinEliteWaitlist = (data: { email: string; phone: string; interests: string[] }) => {
    setIsNotifiedEliteBuddy(true);
    setEliteBuddyData(data);
    safeStorage.setItem("bluber_elite_buddy_notified", "true");
    safeStorage.setItem("bluber_elite_buddy_data", JSON.stringify(data));
  };

  // URL routing sync for /ride-booking
  useEffect(() => {
    if (isRiding) {
      if (window.location.pathname !== "/ride-booking") {
        window.history.pushState({ page: "ride-booking" }, "", "/ride-booking");
      }
    } else {
      if (window.location.pathname === "/ride-booking") {
        window.history.pushState({ page: "home" }, "", "/");
      }
    }
  }, [isRiding]);

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === "/ride-booking") {
        setIsRiding(true);
      } else {
        setIsRiding(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  
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

  useEffect(() => {
    safeStorage.setItem("bluber_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    safeStorage.setItem("bluber_addresses", JSON.stringify(savedAddresses));
  }, [savedAddresses]);

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

  const handleReorderOrder = (order: Order) => {
    if (!order.itemsSummary) return;
    
    const segments = order.itemsSummary.split(", ");
    const newCartItems: CartItem[] = [];
    
    segments.forEach((segment, idx) => {
      // Parse something like "Steamed Organic Vegetable Momos × 1" or "Momo x 2" or "Momo 2"
      const match = segment.match(/(.+?)\s*[×x]\s*(\d+)/i) || segment.match(/(\d+)\s*[×x]\s*(.+)/i);
      let name = segment;
      let quantity = 1;
      
      if (match) {
        if (isNaN(Number(match[1]))) {
          name = match[1].trim();
          quantity = parseInt(match[2], 10);
        } else {
          quantity = parseInt(match[1], 10);
          name = match[2].trim();
        }
      }
      
      // Search inside RESTAURANTS, STORES, and DIRECT_GROCERY_PRODUCTS for a matching item by name
      let price = 100; // default price fallback
      let image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop"; // fallback image
      let itemType: "food" | "grocery" | "medicine" = "grocery";
      let storeOrRestaurantId = "reorder-merchant";
      let storeOrRestaurantName = order.merchantName || "Bluber Merchant";
      
      if (order.type.toLowerCase() === "food") {
        itemType = "food";
      } else if (order.type.toLowerCase() === "medicine") {
        itemType = "medicine";
      }
      
      let found = false;
      // Try to find in restaurants
      for (const r of restaurants) {
        const item = r.items.find(i => 
          i.name.toLowerCase() === name.toLowerCase() || 
          name.toLowerCase().includes(i.name.toLowerCase()) || 
          i.name.toLowerCase().includes(name.toLowerCase())
        );
        if (item) {
          price = item.price;
          image = item.image;
          storeOrRestaurantId = r.id;
          storeOrRestaurantName = r.name;
          found = true;
          break;
        }
      }
      
      // Try to find in stores
      if (!found) {
        for (const s of stores) {
          const prod = s.products.find(p => 
            p.name.toLowerCase() === name.toLowerCase() || 
            name.toLowerCase().includes(p.name.toLowerCase()) || 
            p.name.toLowerCase().includes(name.toLowerCase())
          );
          if (prod) {
            price = prod.price;
            image = prod.image;
            storeOrRestaurantId = s.id;
            storeOrRestaurantName = s.name;
            found = true;
            break;
          }
        }
      }
      
      // Try to find in DIRECT_GROCERY_PRODUCTS
      if (!found) {
        const prod = DIRECT_GROCERY_PRODUCTS.find(p => 
          p.name.toLowerCase() === name.toLowerCase() || 
          name.toLowerCase().includes(p.name.toLowerCase()) || 
          p.name.toLowerCase().includes(name.toLowerCase())
        );
        if (prod) {
          price = prod.price;
          image = prod.image;
          storeOrRestaurantId = "direct_grocery";
          storeOrRestaurantName = "Bluber Direct Sourcing";
          found = true;
        }
      }
      
      newCartItems.push({
        id: `ci-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        name,
        price,
        quantity,
        image,
        storeOrRestaurantId,
        storeOrRestaurantName,
        type: itemType
      });
    });
    
    if (newCartItems.length > 0) {
      setCart(newCartItems);
      setActiveTab("cart");
      triggerGlobalToast(`Reordered ${newCartItems.length} items`, newCartItems[0].image);
    }
  };

  const handleAddCustomOrder = (desc: string, customerName = "Nitish Kaushal", phoneNumber = "+91-98782-99015") => {
    if (!user) {
      setPendingAction({ type: "CUSTOM_ORDER", data: { desc, customerName, phoneNumber } });
      setIsAuthModalOpen(true);
      return;
    }
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
    <div className="min-h-dvh bg-canvas md:py-6 flex items-center justify-center font-sans tracking-tight antialiased selection:bg-primary-light">
      {/* Immersive iPhone 14 Viewport Container */}
      <div 
        id="phone-wrapper" 
        className="w-full max-w-md bg-[#F7F8F5] h-dvh md:h-[844px] shadow-custom relative flex flex-col overflow-hidden md:rounded-[40px] md:border-8 md:border-[#111827] pointer-events-auto"
      >
        {/* Global Success Toast */}
        {successToast.show && (
          <div className="absolute top-4 inset-x-4 bg-white/95 backdrop-blur-md border border-emerald-500/20 shadow-xl rounded-2xl p-3 flex items-center justify-between z-[9999] animate-slide-down pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center bg-[#EDF7EF]">
                <ImageComponent 
                  src={successToast.itemImage} 
                  alt={successToast.itemName} 
                  fallbackName={successToast.itemName}
                  fallbackType="product"
                  className="w-full h-full object-cover" 
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
              user={user}
              onRequireAuth={setPendingActionAndOpenAuth}
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
              user={user}
              onRequireAuth={setPendingActionAndOpenAuth}
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
              user={user}
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
              user={user}
              onRequireAuth={setPendingActionAndOpenAuth}
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
                  onReorder={handleReorderOrder}
                />
              )}
              
              {activeTab === "cart" && (
                <CartTab 
                  cart={cart}
                  walletBalance={walletBalance}
                  userProfile={userProfile}
                  savedAddresses={savedAddresses}
                  onAddToCart={handleAddToCart}
                  onRemoveFromCart={handleRemoveFromCart}
                  onClearCart={() => setCart([])}
                  onPlaceOrder={handleAddOrder}
                  onDeductWallet={handleDeductWallet}
                  onSwitchToOrders={() => setActiveTab("orders")}
                  onTopUpWallet={(amt) => setWalletBalance(prev => prev + amt)}
                  user={user}
                  onRequireAuth={setPendingActionAndOpenAuth}
                />
              )}

              {activeTab === "profile" && (
                <ProfileTab 
                  walletBalance={walletBalance}
                  onTopUpWallet={(amt) => setWalletBalance(prev => prev + amt)}
                  onEnterAdmin={() => setIsAdminOpen(true)}
                  orders={orders}
                  onViewAllOrders={() => setActiveTab("orders")}
                  isNotifiedVMart={isNotifiedVMart}
                  onToggleVMartNotification={handleToggleVMartNotification}
                  userProfile={userProfile}
                  onUpdateProfile={(profile) => setUserProfile(profile)}
                  savedAddresses={savedAddresses}
                  onUpdateAddresses={(addresses) => setSavedAddresses(addresses)}
                  user={user}
                  onRequireAuth={setPendingActionAndOpenAuth}
                  onLogout={handleLogout}
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
                        className="w-10 h-10 bg-[#EDF7EF] rounded-full text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white cursor-pointer overflow-hidden shrink-0"
                      >
                        <ImageComponent 
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop" 
                          alt="Profile Avatar"
                          fallbackName="Chamba User"
                          fallbackType="avatar"
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
                  <div id="hero-banner" className="pt-2 text-left relative group">
                    <div className="w-full bg-gradient-to-r from-[#FFD84D] via-[#FFC72C] to-[#FFB800] rounded-[32px] p-5 shadow-[0_20px_45px_rgba(255,199,44,0.22)] border border-[#FFC72C]/45 relative overflow-hidden flex justify-between items-center h-44 transition-all duration-300 hover:shadow-[0_24px_50px_rgba(255,199,44,0.3)]">
                      
                      {/* Subtle elegant background texture / noise pattern */}
                      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:10px_10px]"></div>

                      {/* Premium light streak / glass reflection curve */}
                      <div className="absolute -inset-x-20 top-0 h-[150%] bg-gradient-to-tr from-transparent via-white/20 to-transparent rotate-[15deg] -translate-y-12 pointer-events-none"></div>

                      {/* Ambient soft gold glow center-left */}
                      <div className="absolute left-[15%] top-[10%] w-32 h-32 bg-white/40 rounded-full blur-2xl pointer-events-none"></div>

                      {/* Soft radial glow behind delivery rider */}
                      <div className="absolute right-[-10%] top-[-10%] w-[65%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.6)_0%,transparent_70%)] opacity-80 pointer-events-none"></div>

                      {/* Glassmorphic frosted highlights */}
                      <div className="absolute inset-0 bg-white/[0.05] backdrop-blur-[0.2px] pointer-events-none"></div>

                      {/* Cinematic dark shadow overlay for text readability (subtle yellow gradient protection) */}
                      <div className="absolute inset-y-0 left-0 w-[60%] bg-gradient-to-r from-[#FFD84D]/25 via-transparent to-transparent pointer-events-none"></div>

                      {/* Premium rider mascot background */}
                      <div className="absolute inset-y-0 right-0 w-[45%] overflow-hidden flex items-center justify-end">
                        <div className="relative w-full h-full flex items-center justify-end pr-2">
                          <img 
                            src="/src/assets/images/yellow_delivery_rider_1782129458782.jpg" 
                            alt="Premium BLUBER rider mascot on Vespa" 
                            className="w-full h-[95%] object-contain object-right mix-blend-multiply drop-shadow-[0_10px_20px_rgba(0,0,0,0.12)] transition-transform duration-500 group-hover:scale-[1.04]"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>

                      <div className="relative z-10 w-[58%] text-left space-y-2.5 pr-1">
                        <span className="inline-flex items-center bg-white/70 backdrop-blur-md text-neutral-950 text-[8.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-[0_2px_10px_rgba(255,199,44,0.25)] border border-white/50">
                          ⚡ CHAMBA SUPERAPP
                        </span>
                        <div>
                          <h2 className="text-[20px] font-black tracking-tight text-neutral-950 leading-tight font-sans">
                            BLUBER is now in Chamba
                          </h2>
                          <p className="text-[11px] text-neutral-800 leading-relaxed mt-0.5 font-bold font-sans">
                            Fast deliveries • Local rides • Food & Groceries
                          </p>
                        </div>

                        <button 
                          onClick={() => handleOpenGrocery("fruits")}
                          className="bg-neutral-950 hover:bg-neutral-900 text-white text-[10px] font-black px-5 py-2.5 rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.25)] flex items-center gap-2 active:scale-95 transition-all cursor-pointer mt-1"
                        >
                          Order Now
                          <span className="text-yellow-400 font-bold">➔</span>
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

                  {/* 2. V-Mart Coming Soon Compact Announcement Banner */}
                  <div id="vmart-teaser-banner" className="bg-gradient-to-r from-[#111827] via-[#1E1B4B] to-[#0F172A] text-white rounded-2xl p-4 border border-indigo-500/20 shadow-md relative overflow-hidden text-left mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Glowing background */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>
                    
                    <div className="flex items-center gap-3">
                      {/* V-Mart Premium Logo Representation */}
                      <div className="bg-white px-2.5 py-1.5 rounded-xl flex items-center gap-0.5 shadow-sm shrink-0 border border-slate-200 select-none">
                        <span className="text-red-600 font-black text-[13px] tracking-tighter font-sans">V</span>
                        <span className="text-blue-800 font-extrabold text-[12px] tracking-tight font-sans">Mart</span>
                      </div>
                      
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black tracking-tight text-white font-sans">V-Mart Coming Soon</h4>
                          <span className="bg-indigo-500/20 border border-indigo-400/30 text-[#818CF8] px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider">
                            Opening Shortly
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 leading-tight font-medium font-sans">
                          Order fashion, household essentials and daily needs directly from BLUBER.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleVMartNotification}
                      className={`shrink-0 text-[10.5px] font-black py-2.5 px-4 rounded-xl transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                        isNotifiedVMart 
                          ? "bg-emerald-500 text-white shadow-sm" 
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
                      }`}
                    >
                      {isNotifiedVMart ? (
                        <>
                          <CheckCircle size={12} className="stroke-[3] text-white" />
                          <span>You'll Be Notified</span>
                        </>
                      ) : (
                        <>
                          <Bell size={12} className="text-white" />
                          <span>Notify Me</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Scooty Ride Service Card (Moved above Categories for Primary Action Hierarchy) */}
                  <div id="ride-services-section" className="pt-2 text-left mb-6">
                    <div 
                      onClick={() => {
                        setIsEliteRide(true);
                        setIsRiding(true);
                      }}
                      className="bg-gradient-to-br from-neutral-900 via-[#1E293B] to-neutral-950 text-white rounded-[32px] p-6 border border-[#10B981]/20 shadow-[0_20px_40px_rgba(16,185,129,0.07)] flex flex-col space-y-4 relative overflow-hidden text-left cursor-pointer transition-all duration-300 transform-gpu hover:-translate-y-1 hover:scale-[1.01] active:translate-y-0 active:scale-[0.99] hover:shadow-[0_24px_50px_rgba(16,185,129,0.12)] hover:border-[#10B981]/35 group"
                    >
                      {/* Premium light streak & soft ambient lighting */}
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all"></div>
                      <div className="absolute inset-0 bg-white/[0.01] pointer-events-none"></div>

                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-400/20 text-[#34D399] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                            24×7 Available
                          </span>
                          <h4 className="text-[17px] font-black text-white tracking-tight leading-tight font-sans">
                            24×7 Scooty Ride Service
                          </h4>
                          <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans max-w-[240px]">
                            Fast, affordable and reliable rides across Chamba.
                          </p>
                        </div>
                        <div className="relative flex items-center justify-center p-3.5 rounded-[22px] bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/60 shadow-[0_8px_20px_rgba(0,0,0,0.3)] shadow-emerald-500/[0.06] backdrop-blur-md overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:border-emerald-500/30 group-hover:shadow-emerald-500/10">
                          {/* Soft internal gradient glow */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent opacity-60"></div>
                          <svg 
                            width="28" 
                            height="28" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="text-emerald-400 drop-shadow-[0_2px_8px_rgba(52,211,153,0.3)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105"
                          >
                            {/* Rear Wheel */}
                            <circle cx="6" cy="17" r="2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="6" cy="17" r="0.75" fill="currentColor" />
                            
                            {/* Front Wheel */}
                            <circle cx="18" cy="17" r="2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="18" cy="17" r="0.75" fill="currentColor" />
                            
                            {/* Floorboard / Deck */}
                            <path d="M8.5 17h6.5c0.8 0 1.2-0.4 1.2-1.2v-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            
                            {/* Chassis / Body */}
                            <path d="M6 14.5c0-2.5 1.5-3.5 3.5-3.5h3c1 0 1.5 0.5 1.5 1.5v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            
                            {/* Premium Seat */}
                            <path d="M7.5 11h4.5c0.8 0 1.2-0.4 1.2-1v-0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            
                            {/* Steering Fork & Front Fender */}
                            <path d="M18 14.5l-2.5-7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            
                            {/* Front Cowl & Handlebar */}
                            <path d="M15.5 7h-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12.5 6h4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="text-[10.5px] text-slate-400 leading-relaxed bg-slate-900/40 p-3 rounded-2xl border border-white/[0.03] space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[#34D399] font-bold">✓</span>
                          <span><strong>Availability:</strong> 24 Hours, 7 Days A Week</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[#34D399] font-bold mt-0.5">✓</span>
                          <span><strong>Coverage:</strong> Quick transit within Chamba municipal limits.</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-1 gap-4">
                        <div>
                          <p className="text-[9px] text-[#34D399] font-black uppercase tracking-widest leading-none">Affordable Base Price</p>
                          <p className="text-[18px] font-black text-white mt-1.5">₹40 <span className="text-[11px] text-slate-400 font-medium">/ KM</span></p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEliteRide(true);
                            setIsRiding(true);
                          }}
                          className="bg-[#10B981] hover:bg-[#34D399] text-neutral-950 text-[11px] font-black py-3 px-5 rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2 border-none cursor-pointer h-11"
                        >
                          <span>Book Scooty Ride</span>
                          <ArrowRight size={13} className="stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* BLUBER Elite Experiences Section */}
                  <div id="elite-experiences-section" className="pt-2 text-left mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-black text-text-primary tracking-tight font-sans">✨ BLUBER Elite Experiences</h3>
                      <span className="text-[8.5px] font-extrabold tracking-[0.15em] uppercase text-slate-400 bg-slate-100 border border-slate-200/50 px-2.5 py-0.5 rounded-full font-sans">
                        Invitation Only
                      </span>
                    </div>

                    <div 
                      onClick={handleOpenEliteWaitlist}
                      className="bg-gradient-to-br from-[#F5F2FF] via-[#FAF5FF] to-[#FFF0F5] rounded-[28px] p-7 border border-white/60 shadow-[0_20px_48px_-12px_rgba(139,92,246,0.12)] flex flex-col space-y-5 relative overflow-hidden text-left cursor-pointer transition-all duration-300 transform-gpu hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_24px_56px_-12px_rgba(139,92,246,0.18)] active:translate-y-0 active:scale-[0.99] group"
                    >
                      {/* Premium light streak, subtle glass highlights, and ambient lighting */}
                      <div className="absolute top-0 right-0 w-52 h-52 bg-gradient-to-tr from-purple-400/25 to-pink-400/20 rounded-full blur-3xl pointer-events-none"></div>
                      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-400/15 rounded-full blur-2xl pointer-events-none"></div>
                      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-300/10 rounded-full blur-xl pointer-events-none"></div>

                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-3">
                          {/* Premium Glass Pill Badge */}
                          <div className="flex">
                            <span className="inline-flex items-center gap-1.5 bg-white/40 backdrop-blur-md border border-white/50 text-purple-700 px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-[0.18em] leading-none shadow-[0_2px_8px_rgba(139,92,246,0.04)]">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
                              Coming Soon
                            </span>
                          </div>
                          
                          <h4 className="text-[19px] font-black text-slate-900 tracking-tight leading-none font-sans flex items-center gap-2">
                            Rent a Friend
                          </h4>
                          <p className="text-[12px] text-slate-700/90 leading-relaxed font-sans max-w-[275px]">
                            Find a verified companion for shopping, cafés, events, local exploration and everyday outings.
                          </p>
                        </div>

                        {/* Premium Outline Lifestyle Icon inside Frosted Glass Container with Soft Glow */}
                        <div className="relative flex items-center justify-center p-3.5 rounded-[22px] bg-white/30 backdrop-blur-md border border-white/50 text-purple-600 shadow-[0_8px_24px_-6px_rgba(139,92,246,0.15)] overflow-hidden transition-all duration-300 group-hover:bg-white/50 group-hover:scale-105 shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <Sparkles size={24} className="text-purple-600 relative z-10 transition-transform duration-500 group-hover:rotate-12" />
                        </div>
                      </div>

                      {/* Natural information highlights with subtle transparent separators instead of a box */}
                      <div className="text-[11px] text-slate-700/95 leading-relaxed py-3.5 border-y border-white/30 space-y-3 font-sans">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/45 border border-white/50 text-purple-600 shrink-0 shadow-[0_2px_6px_rgba(139,92,246,0.05)]">
                            <span className="text-[10px] font-bold">✓</span>
                          </div>
                          <span><strong>Vetted Companions:</strong> Background-verified, respectful, smart, and friendly local partners.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/45 border border-white/50 text-purple-600 shrink-0 shadow-[0_2px_6px_rgba(139,92,246,0.05)] mt-0.5">
                            <span className="text-[10px] font-bold">✓</span>
                          </div>
                          <span><strong>Ultimate Discretion:</strong> Highly professional, secure, and completely private helper service.</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 gap-4">
                        <div>
                          <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-[0.15em] leading-none">Vetting Status</p>
                          <p className="text-[13px] font-bold text-slate-900 mt-1.5">
                            {isNotifiedEliteBuddy ? "Priority Queue Secured" : "Applications Open"}
                          </p>
                        </div>

                        {isNotifiedEliteBuddy ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEliteWaitlist();
                            }}
                            className="bg-white/50 backdrop-blur-md border border-white/60 hover:bg-white/70 text-purple-700 text-[11px] font-extrabold py-2.5 px-4.5 rounded-full shadow-[0_4px_12px_rgba(139,92,246,0.04)] transition-all flex items-center gap-2 cursor-pointer h-10"
                          >
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
                            <span>On Waitlist (#247)</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEliteWaitlist();
                            }}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-[11px] font-black py-2.5 px-4.5 rounded-full shadow-[0_8px_20px_-4px_rgba(139,92,246,0.2)] hover:shadow-[0_12px_24px_-4px_rgba(139,92,246,0.3)] transition-all flex items-center gap-2 border-none cursor-pointer h-10"
                          >
                            <span>Notify Me</span>
                            <ArrowRight size={13} className="stroke-[3]" />
                          </button>
                        )}
                      </div>
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

                  {/* 4. Featured Products Section - Organized by Premium Quick-Commerce Carousels */}
                  <div id="featured-products-section" className="text-left pt-2 pb-5 space-y-8">
                    {[
                      {
                        id: "popular",
                        title: "Popular Near You",
                        iconName: "Sparkles",
                        iconColor: "text-amber-500 animate-pulse",
                        subtitle: "Highly ordered items around you",
                        products: [
                          {
                            id: "fp_pizza",
                            name: "Margherita Pizza",
                            category: "Pizza",
                            price: 249,
                            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop",
                            shopId: "cafe_hilltop",
                            shopName: "Cafe Hilltop",
                            type: "food" as const
                          },
                          {
                            id: "fp_coffee",
                            name: "Cold Coffee",
                            category: "Beverages",
                            price: 139,
                            image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=400&auto=format&fit=crop",
                            shopId: "cafe_hilltop",
                            shopName: "Cafe Hilltop",
                            type: "food" as const
                          },
                          {
                            id: "fp_burger",
                            name: "Veg Burger",
                            category: "Fast Food",
                            price: 119,
                            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop",
                            shopId: "cafe_hilltop",
                            shopName: "Cafe Hilltop",
                            type: "food" as const
                          },
                          {
                            id: "fp_icecream",
                            name: "Ice Cream Tubs",
                            category: "Ice Cream",
                            price: 219,
                            image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=400&auto=format&fit=crop",
                            shopId: "cafe_hilltop",
                            shopName: "Cafe Hilltop",
                            type: "food" as const
                          },
                          {
                            id: "fp_chocolate",
                            name: "Chocolate Bars",
                            category: "Snacks",
                            price: 80,
                            image: "https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=400&auto=format&fit=crop",
                            shopId: "malik_general",
                            shopName: "Mallik General Store",
                            type: "grocery" as const
                          }
                        ]
                      },
                      {
                        id: "fast_food",
                        title: "Fast Food",
                        iconName: "Pizza",
                        iconColor: "text-red-500",
                        subtitle: "Delicious freshly made quick bites",
                        products: [
                          {
                            id: "fp_burger",
                            name: "Veg Burger",
                            category: "Fast Food",
                            price: 119,
                            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop",
                            shopId: "cafe_hilltop",
                            shopName: "Cafe Hilltop",
                            type: "food" as const
                          },
                          {
                            id: "fp_pizza",
                            name: "Margherita Pizza",
                            category: "Pizza",
                            price: 249,
                            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop",
                            shopId: "cafe_hilltop",
                            shopName: "Cafe Hilltop",
                            type: "food" as const
                          },
                          {
                            id: "fp_fries",
                            name: "French Fries",
                            category: "Fast Food",
                            price: 99,
                            image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=400&auto=format&fit=crop",
                            shopId: "cafe_hilltop",
                            shopName: "Cafe Hilltop",
                            type: "food" as const
                          },
                          {
                            id: "fp_momos",
                            name: "Momos",
                            category: "Fast Food",
                            price: 129,
                            image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=400&auto=format&fit=crop",
                            shopId: "cafe_hilltop",
                            shopName: "Cafe Hilltop",
                            type: "food" as const
                          }
                        ]
                      },
                      {
                        id: "beverages",
                        title: "Beverages",
                        iconName: "Coffee",
                        iconColor: "text-blue-500",
                        subtitle: "Chilled refreshment delivered instant",
                        products: [
                          {
                            id: "fp_coffee",
                            name: "Cold Coffee",
                            category: "Beverages",
                            price: 139,
                            image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=400&auto=format&fit=crop",
                            shopId: "cafe_hilltop",
                            shopName: "Cafe Hilltop",
                            type: "food" as const
                          },
                          {
                            id: "fp_soda",
                            name: "Soft Drinks",
                            category: "Beverages",
                            price: 45,
                            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop",
                            shopId: "cafe_hilltop",
                            shopName: "Cafe Hilltop",
                            type: "food" as const
                          }
                        ]
                      },
                      {
                        id: "ice_cream",
                        title: "Ice Cream",
                        iconName: "IceCream",
                        iconColor: "text-pink-500",
                        subtitle: "Frozen treats & creamy scoops",
                        products: [
                          {
                            id: "fp_icecream",
                            name: "Ice Cream Tubs",
                            category: "Ice Cream",
                            price: 219,
                            image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=400&auto=format&fit=crop",
                            shopId: "cafe_hilltop",
                            shopName: "Cafe Hilltop",
                            type: "food" as const
                          }
                        ]
                      },
                      {
                        id: "snacks",
                        title: "Snacks",
                        iconName: "Cookie",
                        iconColor: "text-yellow-500",
                        subtitle: "Quick munchies & instant packs",
                        products: [
                          {
                            id: "fp_chocolate",
                            name: "Chocolate Bars",
                            category: "Snacks",
                            price: 80,
                            image: "https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=400&auto=format&fit=crop",
                            shopId: "malik_general",
                            shopName: "Mallik General Store",
                            type: "grocery" as const
                          },
                          {
                            id: "fp_chips",
                            name: "Chips",
                            category: "Snacks",
                            price: 30,
                            image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=400&auto=format&fit=crop",
                            shopId: "malik_general",
                            shopName: "Mallik General Store",
                            type: "grocery" as const
                          },
                          {
                            id: "fp_noodles",
                            name: "Instant Noodles",
                            category: "Essentials",
                            price: 60,
                            image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=400&auto=format&fit=crop",
                            shopId: "malik_general",
                            shopName: "Mallik General Store",
                            type: "grocery" as const
                          }
                        ]
                      }
                    ].map((carousel) => {
                      const renderIcon = (name: string, color: string) => {
                        const props = { size: 18, className: color };
                        switch (name) {
                          case "Sparkles": return <Sparkles {...props} />;
                          case "Pizza": return <Pizza {...props} />;
                          case "Coffee": return <Coffee {...props} />;
                          case "IceCream": return <IceCream {...props} />;
                          case "Cookie": return <Cookie {...props} />;
                          default: return <Sparkles {...props} />;
                        }
                      };

                      return (
                        <div key={carousel.id} className="space-y-3">
                          {/* Carousel Header */}
                          <div className="flex justify-between items-end px-1">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                {renderIcon(carousel.iconName, carousel.iconColor)}
                                <h3 className="text-[13.5px] font-black text-text-primary tracking-tight font-sans">
                                  {carousel.title}
                                </h3>
                              </div>
                              <p className="text-[9.5px] text-text-secondary font-medium font-sans leading-none">
                                {carousel.subtitle}
                              </p>
                            </div>
                            <button 
                              onClick={() => setActiveTab("explore")} 
                              className="text-[10px] font-bold text-primary hover:underline cursor-pointer bg-none border-none font-sans"
                            >
                              See all
                            </button>
                          </div>

                          {/* Horizontal Scroll Carousel */}
                          <div className="flex gap-3.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none snap-x snap-mandatory scroll-smooth no-scrollbar">
                            {carousel.products.map((prod) => {
                              const qty = cart.find(ci => ci.id === prod.id)?.quantity || 0;
                              return (
                                <div 
                                  key={prod.id} 
                                  className="bg-white rounded-[22px] p-3.5 border border-border-custom/25 shadow-[0_4px_16px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.035)] hover:scale-[1.01] active:scale-[0.99] transition-all text-left flex flex-col justify-between w-[160px] sm:w-[210px] shrink-0 snap-start"
                                >
                                  {/* Product Image */}
                                  <div className="relative aspect-square w-full rounded-[18px] overflow-hidden bg-neutral-50 border border-neutral-100/30">
                                    <ImageComponent
                                      src={prod.image}
                                      alt={prod.name}
                                      fallbackName={prod.name}
                                      fallbackType={prod.type === "food" ? "food" : "product"}
                                      categoryText={prod.category}
                                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                    <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-[7px] font-black text-text-primary px-1.5 py-0.5 rounded-full uppercase border border-border-custom/20 font-sans tracking-wide">
                                      {prod.category}
                                    </span>
                                  </div>
                                  
                                  {/* Info Area */}
                                  <div className="mt-2.5 flex-1 flex flex-col justify-between">
                                    <div>
                                      <h4 className="text-[11.5px] font-extrabold text-neutral-800 leading-snug font-sans tracking-tight line-clamp-2 h-9 flex items-center">
                                        {prod.name}
                                      </h4>
                                      <p className="text-[8.5px] text-text-secondary mt-0.5 font-bold uppercase tracking-wider font-sans">
                                        {prod.category}
                                      </p>
                                    </div>
                                    
                                    {/* Price & Action Row */}
                                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-dashed border-border-custom/25">
                                      <span className="text-[12.5px] font-black text-text-primary font-mono">
                                        ₹{prod.price}
                                      </span>
                                      
                                      {qty > 0 ? (
                                        <div className="flex items-center bg-primary text-white rounded-full px-2 py-0.5 gap-2 text-xs font-black shadow-xs border border-primary/20">
                                          <button
                                            onClick={() => handleRemoveFromCart(prod.id)}
                                            className="hover:scale-110 active:scale-90 transition-transform font-bold outline-none bg-transparent text-white border-none cursor-pointer p-0"
                                          >
                                            -
                                          </button>
                                          <span className="font-mono text-[10px]">{qty}</span>
                                          <button
                                            onClick={() => handleAddToCart(prod, prod.shopId, prod.shopName, prod.type)}
                                            className="hover:scale-110 active:scale-90 transition-transform font-bold outline-none bg-transparent text-white border-none cursor-pointer p-0"
                                          >
                                            +
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => handleAddToCart(prod, prod.shopId, prod.shopName, prod.type)}
                                          className="bg-primary hover:bg-[#154B2B] text-white text-[9.5px] font-black px-3 py-1 rounded-full border-none shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider flex items-center gap-1 font-sans"
                                        >
                                          + Add
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 6. Custom Order Section */}
                  <div id="custom-order-section" className="text-left pt-2 space-y-6">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-black text-text-primary tracking-tight font-sans">✨ Custom Sourcing Services</h3>
                    </div>

                    <CustomRequestsHomeWidget 
                      onAddCustomRequest={handleAddCustomOrder}
                    />

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
          className="absolute bottom-0 inset-x-0 h-[84px] pb-3 bg-white/80 backdrop-blur-xl border-t border-black/[0.04] px-4 flex items-center justify-between z-40 select-none"
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
                className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer relative border-none bg-transparent outline-none focus:outline-none"
              >
                {/* Floating translucent premium pill background with active sliding motion */}
                {isSelected && (
                  <motion.div
                    layoutId="active-nav-pill"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                    className="absolute inset-y-2 inset-x-1.5 rounded-2xl bg-[#1E6B3D]/[0.07] border border-[#1E6B3D]/[0.08] shadow-[0_6px_20px_rgba(30,107,61,0.06)] pointer-events-none"
                  />
                )}

                {/* Content wrapper with scale/translate animation */}
                <div className="flex flex-col items-center justify-center w-full h-full relative z-10">
                  <motion.div
                    animate={{
                      scale: isSelected ? 1.08 : 1,
                      y: isSelected ? -3 : 0,
                    }}
                    whileTap={{ scale: 0.94 }}
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 24,
                    }}
                    className="relative flex items-center justify-center p-1"
                  >
                    <tab.icon 
                      size={21} 
                      className={`transition-colors duration-200 stroke-[1.6] ${
                        isSelected ? "text-[#1E6B3D]" : "text-neutral-400"
                      }`}
                      fill="none"
                    />
                    {isCart && cartCount > 0 && (
                      <span className="absolute -top-1 -right-1.5 bg-rose-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-xs">
                        {cartCount}
                      </span>
                    )}
                  </motion.div>

                  <motion.span
                    animate={{
                      opacity: isSelected ? 1 : 0.6,
                      scale: isSelected ? 1 : 0.96,
                    }}
                    transition={{ duration: 0.2 }}
                    className={`text-[9.5px] font-sans font-bold tracking-tight mt-0.5 transition-colors duration-200 ${
                      isSelected ? "text-[#1E6B3D]" : "text-neutral-500"
                    }`}
                  >
                    {tab.label}
                  </motion.span>
                </div>
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

        <EliteWaitlistModal 
          isOpen={isEliteWaitlistOpen} 
          onClose={() => setIsEliteWaitlistOpen(false)} 
          onSubmit={handleJoinEliteWaitlist} 
          initialData={eliteBuddyData} 
        />

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => {
            setIsAuthModalOpen(false);
            setPendingAction(null);
          }} 
          onSuccess={handleAuthSuccess} 
        />

      </div>
    </div>
  );
}
