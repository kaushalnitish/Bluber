import React, { useState } from "react";
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  MapPin, 
  Plus, 
  Minus, 
  ShoppingBag, 
  X,
  CheckCircle,
  Ticket,
  Coins,
  QrCode,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { Restaurant, Store, CartItem } from "../types";

interface ShopDetailProps {
  shop: Restaurant | Store;
  type: "restaurant" | "store";
  cart: CartItem[];
  walletBalance: number;
  onAddToCart: (item: any, shopId: string, shopName: string, type: "food" | "grocery" | "medicine") => void;
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  onDeductWallet: (amount: number) => boolean;
  onPlaceOrder: (order: any) => void;
  onBack: () => void;
  onSwitchToOrders: () => void;
}

export const ShopDetail: React.FC<ShopDetailProps> = ({
  shop,
  type,
  cart,
  walletBalance,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onDeductWallet,
  onPlaceOrder,
  onBack,
  onSwitchToOrders
}) => {
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"Wallet">("Wallet");
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Filter items in cart that belong to THIS shop
  const shopCartItems = cart.filter(item => item.storeOrRestaurantId === shop.id);
  const cartItemCount = shopCartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartSubtotal = shopCartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  
  // Surcharge or delivery charges
  const deliveryFee = cartSubtotal > 300 ? 0 : 30;
  const taxes = Math.round(cartSubtotal * 0.05); // 5% GST
  const discountAmount = appliedDiscount;
  const cartTotal = Math.max(0, cartSubtotal + deliveryFee + taxes - discountAmount);

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "CHAMBA20") {
      setAppliedDiscount(Math.round(cartSubtotal * 0.2));
      alert("Coupon 'CHAMBA20' applied! 20% discount added.");
    } else if (couponCode.trim().toUpperCase() === "FREECOURIER") {
      setAppliedDiscount(deliveryFee);
      alert("Free delivery coupon applied!");
    } else {
      alert("Invalid coupon code. Try 'CHAMBA20' for 20% off!");
    }
  };

  const [checkoutStep, setCheckoutStep] = useState<"review" | "qr_verify">("review");
  const [scannedTxn, setScannedTxn] = useState("");

  const handleCheckoutSubmit = () => {
    if (walletBalance >= cartTotal) {
      // Wallet is healthy, deduct and checkout instantly
      onDeductWallet(cartTotal);
      processFinalOrder();
    } else {
      // Wallet balance is too low, switch to live secure UPI QR terminal so they don't get blocked
      setCheckoutStep("qr_verify");
    }
  };

  const handleUPIPaymentVerify = () => {
    // Simulate successful payment validation
    processFinalOrder();
  };

  // Shared order placing dispatch logic
  const processFinalOrder = () => {
    const simulatedOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsSummary = shopCartItems.map(item => `${item.name} × ${item.quantity}`).join(", ");
    
    const newOrder = {
      id: simulatedOrderId,
      type: type === "restaurant" ? "Food" : (shop.id === "sharma_medical" ? "Medicine" : "Grocery"),
      merchantName: shop.name,
      itemsSummary,
      total: cartTotal,
      status: "Looking For Rider", // Fixed initial state matching state constraints "Looking For Rider" (COD/Prepaid transition to real activity)
      date: "Today, Just Now",
      estimatedTime: shop.eta,
      riderName: "Captain Bunty Verma",
      riderPhone: "+91-98164-02487" // Helpline support number
    };

    onPlaceOrder(newOrder);
    onClearCart();
    setIsCartDrawerOpen(false);
    setCheckoutStep("review");
    setShowSuccessModal(true);
  };

  return (
    <div id="shop-detail-root" className="bg-canvas min-h-screen animate-fade-in pb-28 text-left">
      {/* Immersive Photo Hero Header */}
      <div className="relative h-64 w-full overflow-hidden">
        <img 
          src={shop.image} 
          alt={shop.name}
          className="w-full h-full object-cover select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15"></div>
        
        {/* Floating Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-5 left-5 p-3 bg-white/95 rounded-full text-text-primary hover:scale-105 active:scale-95 transition-all shadow-lg border-none cursor-pointer z-10"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Rating and Badges */}
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#a3e635] drop-shadow">
            {type === "restaurant" ? (shop as Restaurant).cuisine : shop.category}
          </p>
          <h2 className="text-xl font-bold tracking-tight mt-1 drop-shadow-md">{shop.name}</h2>
          
          <div className="flex items-center gap-3.5 mt-2.5 text-xs text-white/90 font-medium">
            <span className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
              <Star size={14} className="text-amber-400 fill-current" />
              {shop.rating}
            </span>
            <span className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
              <Clock size={14} />
              {shop.eta}
            </span>
            <span className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
              <MapPin size={14} />
              {type === "store" ? (shop as Store).distance : "Chamba Center"}
            </span>
          </div>
        </div>
      </div>

      {/* Catalog items list */}
      <div className="px-5 py-6">
        <h3 className="text-base font-bold text-text-primary mb-4 uppercase tracking-wide text-xs">
          {type === "restaurant" ? "✦ Explore Special Menu" : "✦ Available Catalog Stock"}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {type === "restaurant" ? (
            // Restaurants Menu Item Layout - Luxurious Grid Cards
            (shop as Restaurant).items.map((item) => {
              const cartItem = shopCartItems.find(ci => ci.id === item.id);
              const qty = cartItem ? cartItem.quantity : 0;

              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-[28px] border border-border-custom/30 p-3 flex flex-col justify-between shadow-xs hover:shadow-sm text-left"
                >
                  {/* Top: Large Image (60-70% visual weight) */}
                  <div className="relative w-full h-32 bg-canvas rounded-2xl overflow-hidden mb-2.5">
                    <img 
                      src={item.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop"} 
                      alt={item.name} 
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 select-none"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop";
                      }}
                    />
                    <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-[8px] font-black text-text-primary px-1.5 py-0.5 rounded-full uppercase border border-border-custom/30">
                      {item.category}
                    </span>
                  </div>

                  {/* Middle representation & pricing info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[11.5px] font-bold text-text-primary leading-tight line-clamp-2 min-h-[30px]">{item.name}</h4>
                      <p className="text-[9.5px] text-text-secondary mt-1 line-clamp-2 leading-relaxed h-[26px] overflow-hidden">{item.description}</p>
                    </div>

                    <div className="mt-2">
                      <p className="text-xs font-extrabold text-primary">₹{item.price}</p>
                      
                      {/* Bottom action: Add To Cart/Quantity adjustment */}
                      <div className="w-full mt-2.5">
                        {qty === 0 ? (
                          <button
                            onClick={() => onAddToCart(item, shop.id, shop.name, "food")}
                            className="w-full bg-primary hover:bg-[#1E6B3D] text-white font-black text-[10px] py-1.5 rounded-xl uppercase tracking-wider text-center cursor-pointer transition-all border-none"
                          >
                            + Add
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-primary text-white rounded-xl overflow-hidden text-[10px] font-bold h-[26px]">
                            <button 
                              onClick={() => onRemoveFromCart(item.id)}
                              className="px-2.5 h-full hover:bg-primary/90 cursor-pointer flex items-center justify-center border-none bg-transparent text-white"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="px-1">{qty}</span>
                            <button 
                              onClick={() => onAddToCart(item, shop.id, shop.name, "food")}
                              className="px-2.5 h-full hover:bg-primary/95 cursor-pointer flex items-center justify-center border-none bg-transparent text-white"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Grocery or Drugstore Products List - Luxurious Grid Cards
            (shop as Store).products.map((item) => {
              const cartItem = shopCartItems.find(ci => ci.id === item.id);
              const qty = cartItem ? cartItem.quantity : 0;
              const productType = shop.id === "sharma_medical" ? "medicine" : "grocery";

              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-[28px] border border-border-custom/30 p-3 flex flex-col justify-between shadow-xs hover:shadow-sm text-left"
                >
                  {/* Top: Large Image (60-70% visual weight) */}
                  <div className="relative w-full h-32 bg-canvas rounded-2xl overflow-hidden mb-2.5">
                    <img 
                      src={item.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop"} 
                      alt={item.name} 
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 select-none"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop";
                      }}
                    />
                    <span className="absolute bottom-2 left-2 bg-white/95 text-[9px] font-black text-text-primary px-1.5 py-0.5 rounded-full uppercase border border-border-custom/30">
                      {item.unit}
                    </span>
                  </div>

                  {/* Middle representation & pricing info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[11.5px] font-bold text-text-primary leading-tight line-clamp-2 min-h-[30px]">{item.name}</h4>
                      <p className="text-[9.5px] text-text-secondary mt-1">{item.category}</p>
                    </div>

                    <div className="mt-2">
                      <p className="text-xs font-extrabold text-primary">₹{item.price}</p>
                      
                      {/* Bottom action: Add To Cart/Quantity adjustment */}
                      <div className="w-full mt-2.5">
                        {qty === 0 ? (
                          <button
                            onClick={() => onAddToCart(item, shop.id, shop.name, productType)}
                            className="w-full bg-primary hover:bg-[#1E6B3D] text-white font-black text-[10px] py-1.5 rounded-xl uppercase tracking-wider text-center cursor-pointer transition-all border-none"
                          >
                            + Add
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-primary text-white rounded-xl overflow-hidden text-[10px] font-bold h-[26px]">
                            <button 
                              onClick={() => onRemoveFromCart(item.id)}
                              className="px-2.5 h-full hover:bg-[#111827] cursor-pointer flex items-center justify-center border-none bg-transparent text-white"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="px-1">{qty}</span>
                            <button 
                              onClick={() => onAddToCart(item, shop.id, shop.name, productType)}
                              className="px-2.5 h-full hover:bg-primary/95 cursor-pointer flex items-center justify-center border-none bg-transparent text-white"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sticky Bottom Floating Basket drawer */}
      {cartItemCount > 0 && !isCartDrawerOpen && (
        <div className="fixed bottom-[84px] inset-x-0 bg-primary mx-4 my-2.5 rounded-[22px] px-5 py-4 flex items-center justify-between text-white shadow-xl pointer-events-auto animate-bounce z-40 text-left">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-xs font-bold">{cartItemCount} item{cartItemCount > 1 && "s"} in basket</p>
              <p className="text-[11px] text-white/80">From {shop.name}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            className="bg-white text-primary text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1 border-none cursor-pointer"
          >
            Review Basket ➔
          </button>
        </div>
      )}

      {/* Cart Drawer Sliding overlay */}
      {isCartDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center pointer-events-auto">
          <div className="bg-surface w-full max-w-md rounded-t-[32px] p-6 pb-10 transition-transform animate-[slideUp_250ms_ease-out] text-left">
            
            {checkoutStep === "review" ? (
              <>
                <div className="flex items-center justify-between border-b border-border-custom pb-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">Your Basket</h3>
                    <p className="text-xs text-text-secondary">Delivered from {shop.name}</p>
                  </div>
                  <button 
                    onClick={() => setIsCartDrawerOpen(false)}
                    className="p-2 bg-canvas rounded-full text-text-secondary hover:text-text-primary border-none cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Cart Items list */}
                <div className="max-h-56 overflow-y-auto space-y-3.5 pr-1 no-scrollbar mb-5">
                  {shopCartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-canvas/40 p-3 rounded-2xl text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center bg-white">
                          <img 
                            src={item.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop"} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop";
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text-primary max-w-[170px] truncate">{item.name}</p>
                          <p className="text-[10px] text-text-secondary">₹{item.price} each</p>
                        </div>
                      </div>
                      <div className="flex items-center border border-border-custom bg-white rounded-full">
                        <button 
                          onClick={() => onRemoveFromCart(item.id)}
                          className="px-2 py-1 text-text-secondary hover:text-text-primary font-bold bg-transparent border-none"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="px-2 text-xs font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => onAddToCart(item, shop.id, shop.name, item.type)}
                          className="px-2 py-1 text-text-secondary hover:text-text-primary font-bold bg-transparent border-none"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code section */}
                <div className="bg-[#EDF7EF] p-4 rounded-2xl mb-4 text-left">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Ticket size={16} /> Apply Chamba Saver Code
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter code e.g. CHAMBA20" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-white text-xs px-3 py-2 rounded-xl border border-border-custom focus:outline-none focus:border-primary uppercase font-bold text-text-primary"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl border-none cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-[9px] text-[#2F7E4F] font-semibold mt-1.5">*Tip: Enter 'CHAMBA20' to get flat 20% off total order value!</p>
                </div>

                {/* Secure Prepaid Checkout Label Notice */}
                <div className="mb-4 bg-[#EEF2FF] border border-indigo-100 p-3 rounded-xl text-[9.5px] text-[#312E81] leading-relaxed flex items-start gap-2 text-left">
                  <ShieldCheck className="w-4.5 h-4.5 shrink-0 text-indigo-600 mt-0.5" />
                  <div>
                    <label className="font-black uppercase tracking-wider block text-[8px] text-indigo-900 leading-none mb-1">Prepaid Only Checkout</label>
                    <span>We operate purely on a prepaid model. No cash or Pay Later is integrated to ensure safety of local runners.</span>
                  </div>
                </div>

                {/* Payment Selection Label */}
                <div className="mb-4 text-left bg-canvas p-3 rounded-[18px]">
                  <p className="text-[10pt] font-black text-text-primary flex items-center gap-1.5 uppercase tracking-tight">
                    <Coins size={14} className="text-[#1E6B3D]" /> Payment Source
                  </p>
                  <div className="flex justify-between items-center mt-1.5">
                    <div>
                      <p className="text-xs font-bold text-text-primary">Bluber Balance Debit</p>
                      <p className="text-[10px] text-text-secondary font-medium">Available: ₹{walletBalance}</p>
                    </div>
                    {walletBalance >= cartTotal ? (
                      <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">Wallet OK</span>
                    ) : (
                      <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">Balance Low</span>
                    )}
                  </div>
                </div>

                {/* Financial bill block */}
                <div className="space-y-1.5 text-xs text-text-secondary mb-5 border-t border-border-custom pt-4 text-left">
                  <div className="flex justify-between">
                    <span>Basket Subtotal</span>
                    <span className="font-medium text-text-primary">₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chamba Town Delivery Fee</span>
                    <span className="font-medium text-text-primary">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & GST (5%)</span>
                    <span className="font-medium text-text-primary">₹{taxes}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-[#1E6B3D] font-bold mb-1">
                      <span>Saver Discount Coupon</span>
                      <span>-₹{appliedDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-text-primary pt-2 border-t border-border-custom">
                    <span className="text-primary font-black uppercase tracking-tight">Total Prepaid Bill</span>
                    <span className="text-primary font-black">₹{cartTotal}</span>
                  </div>
                </div>

                {/* Checkout Action Button */}
                <button
                  onClick={handleCheckoutSubmit}
                  className="w-full py-4 bg-primary text-white font-black text-xs rounded-2xl tracking-wider uppercase shadow-xs hover:opacity-95 active:scale-[0.98] transition-all border-none cursor-pointer text-center block"
                >
                  {walletBalance >= cartTotal ? `Deduct Wallet & Order (₹${cartTotal}) ➔` : `Secure scan UPI Payment (₹${cartTotal}) ➔`}
                </button>
              </>
            ) : (
              /* DYNAMIC QR PAYMENT INTERFACE ON INSUFFICIENT WALLET BALANCE */
              <div className="space-y-4 text-center py-2 animate-fade-in">
                <div className="flex items-center justify-between border-b border-border-custom pb-3">
                  <h4 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
                    <QrCode size={16} /> Dynamic Prepaid QR Terminal
                  </h4>
                  <span className="text-sm font-black text-primary">₹{cartTotal}</span>
                </div>

                <div className="py-2.5 flex flex-col items-center">
                  <div className="bg-canvas p-3 rounded-2xl border-2 border-dashed border-gray-200 inline-block">
                    <QrCode size={120} className="text-gray-900 mx-auto" />
                  </div>
                  <p className="text-[10px] font-bold text-text-primary mt-3 uppercase tracking-wide">Scan through GPay, PhonePe, Paytm, BHIM</p>
                  <p className="text-[9px] text-[#2F7E4F] max-w-[210px] leading-normal font-semibold mt-1">
                    Send amount ₹{cartTotal} directly to developer/platform merchant address: <strong>bluber@ybl</strong>
                  </p>
                </div>

                {/* Sandbox verify button */}
                <button
                  type="button"
                  onClick={handleUPIPaymentVerify}
                  className="w-full bg-[#111827] hover:bg-black text-white text-xs font-black py-3 rounded-xl uppercase tracking-widest border-none cursor-pointer"
                >
                  Confirm QR Scan & Secure Order ➔
                </button>

                <button
                  type="button"
                  onClick={() => setCheckoutStep("review")}
                  className="w-full py-2 bg-transparent text-text-secondary text-[11px] underline block border-none cursor-pointer"
                >
                  Change Payment Source
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Checkout Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-5 pointer-events-auto">
          <div className="bg-surface rounded-[32px] p-6 text-center max-w-sm w-full mx-auto shadow-2xl animate-[zoomIn_200ms_ease-out] text-left space-y-4">
            <div className="w-14 h-14 bg-[#EDF7EF] rounded-full flex items-center justify-center mx-auto mb-1 text-primary">
              <CheckCircle size={32} />
            </div>
            
            <div className="text-center">
              <h3 className="text-base font-black text-text-primary">Order Sourced Successfully!</h3>
              <p className="text-[11px] text-text-secondary leading-relaxed mt-1 max-w-[220px] mx-auto">
                Your prepaid dispatch order from <strong>{shop.name}</strong> was validated and confirmed.
              </p>
            </div>

            <div className="p-3.5 bg-canvas/80 rounded-2xl text-left space-y-1.5 text-[11px] text-text-secondary border border-border-custom font-medium">
              <div className="flex justify-between">
                <span>Dispatch Mode</span>
                <span className="font-extrabold text-[#111827] uppercase text-[9px] tracking-wide flex items-center gap-1 text-[#1E6B3D]">
                  <Sparkles size={10} /> Prepaid Active
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rider Assigned</span>
                <span className="font-bold text-text-primary">Captain Bunty Verma</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sourcing</span>
                <span className="font-bold text-text-primary">{shop.eta}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onBack();
                }}
                className="py-3 bg-canvas border border-border-custom text-text-primary font-bold text-xs rounded-xl cursor-pointer"
              >
                Back to Shops
              </button>
              
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onSwitchToOrders();
                }}
                className="py-3 bg-primary text-white font-bold text-xs rounded-xl shadow-xs border-none cursor-pointer"
              >
                Track Sourcing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
