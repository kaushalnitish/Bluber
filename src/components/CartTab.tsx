import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Ticket, 
  CheckCircle, 
  ShieldCheck,
  Trash,
  Loader2,
  ArrowLeft,
  MapPin,
  User,
  Phone,
  ArrowRight,
  Coins,
  AlertCircle
} from "lucide-react";
import { CartItem } from "../types";
import { ImageComponent } from "./ImageComponent";

interface CartTabProps {
  cart: CartItem[];
  walletBalance: number;
  userProfile: { name: string; phone: string; email: string };
  savedAddresses: Array<{ id: string; type: string; label: string; detail: string }>;
  onAddToCart: (item: any, shopId: string, shopName: string, type: "food" | "grocery" | "medicine") => void;
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (order: any) => void;
  onDeductWallet: (amount: number) => boolean;
  onSwitchToOrders: () => void;
  onTopUpWallet: (amount: number) => void;
  user?: any;
  onRequireAuth?: (pendingAction?: any) => void;
}

export const CartTab: React.FC<CartTabProps> = ({
  cart,
  walletBalance,
  userProfile,
  savedAddresses,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onPlaceOrder,
  onDeductWallet,
  onSwitchToOrders,
  onTopUpWallet,
  user,
  onRequireAuth
}) => {
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  
  // Checkout flow step: "cart" | "delivery" | "summary" | "processing" | "success"
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "delivery" | "summary" | "processing" | "success">("cart");
  
  // Recipient Delivery Details states
  const [recipientName, setRecipientName] = useState(userProfile.name);
  const [recipientPhone, setRecipientPhone] = useState(userProfile.phone);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedAddresses.length > 0 ? savedAddresses[0].id : "custom"
  );
  const [customAddressDetail, setCustomAddressDetail] = useState("");
  
  // Quick top-up amount
  const [quickTopUpAmount, setQuickTopUpAmount] = useState(500);
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // Sync details when userProfile changes
  useEffect(() => {
    setRecipientName(userProfile.name);
    setRecipientPhone(userProfile.phone);
  }, [userProfile]);

  useEffect(() => {
    if (savedAddresses.length > 0 && selectedAddressId === "custom" && !customAddressDetail) {
      setSelectedAddressId(savedAddresses[0].id);
    }
  }, [savedAddresses]);

  const [lastOrderId, setLastOrderId] = useState("");
  const [txnDetails, setTxnDetails] = useState({ txnId: "", upiRef: "", amount: 0 });

  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  
  // Delivery charges: Free over ₹300, else ₹30
  const deliveryFee = subtotal === 0 ? 0 : (subtotal >= 300 ? 0 : 30);
  const finalTotal = Math.max(0, subtotal + deliveryFee - discount);

  const applyPromo = () => {
    if (coupon.trim().toUpperCase() === "CHAMBA20") {
      const calculatedDiscount = Math.round(subtotal * 0.2);
      setDiscount(calculatedDiscount);
      alert(`Voucher 'CHAMBA20' applied! 20% discount (₹${calculatedDiscount}) has been deducted.`);
    } else {
      alert("Invalid coupon code. Try 'CHAMBA20' for 20% off direct grocery and culinary orders!");
    }
  };

  const handleStartCheckout = () => {
    if (cart.length === 0) return;
    if (!user) {
      onRequireAuth?.({ type: "CHECKOUT" });
      return;
    }
    setCheckoutStep("delivery");
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      alert("Please enter recipient name");
      return;
    }
    if (!recipientPhone.trim()) {
      alert("Please enter recipient phone number");
      return;
    }
    if (selectedAddressId === "custom" && !customAddressDetail.trim()) {
      alert("Please enter custom delivery address details");
      return;
    }
    setCheckoutStep("summary");
  };

  const getSelectedAddressText = () => {
    if (selectedAddressId === "custom") {
      return customAddressDetail;
    }
    const addr = savedAddresses.find(a => a.id === selectedAddressId);
    return addr ? `${addr.label} (${addr.detail})` : "Custom Address";
  };

  const handleQuickTopUp = () => {
    onTopUpWallet(quickTopUpAmount);
    setTopUpSuccess(true);
    setTimeout(() => setTopUpSuccess(false), 2500);
  };

  const triggerPaymentFinalization = () => {
    // Attempt wallet deduction
    const success = onDeductWallet(finalTotal);
    if (!success) {
      alert("Insufficient wallet balance. Please use the quick top-up below to add credits.");
      return;
    }

    setCheckoutStep("processing");
    
    const randomTxn = `TXN${Math.floor(10000000 + Math.random() * 90000000)}`;
    const randomUpiRef = `${Math.floor(300000000000 + Math.random() * 700000000000)}`;
    
    setTxnDetails({
      txnId: randomTxn,
      upiRef: randomUpiRef,
      amount: finalTotal
    });

    // Simulate order generation and scheduling
    setTimeout(() => {
      const generatedId = `BLUB-${Math.floor(1000 + Math.random() * 9000)}`;
      const itemsSummary = cart.map(ci => `${ci.name} × ${ci.quantity}`).join(", ");
      
      // Map cart item type to correct order type
      const firstItemType = cart[0]?.type || "grocery";
      let orderType: "Food" | "Grocery" | "Medicine" = "Grocery";
      if (firstItemType === "food") orderType = "Food";
      if (firstItemType === "medicine") orderType = "Medicine";

      const newOrder = {
        id: generatedId,
        type: orderType,
        merchantName: cart[0]?.storeOrRestaurantName || "Bluber Hyperlocal Hub",
        itemsSummary,
        total: finalTotal,
        status: "Order Confirmed" as const,
        date: "Today, Just Now",
        txnId: randomTxn,
        upiRef: randomUpiRef,
        paymentTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        riderName: "Rohan Thakur",
        riderPhone: "+91-98160-54321",
        riderPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
      };

      onPlaceOrder(newOrder);
      setLastOrderId(generatedId);
      setCheckoutStep("success");
      onClearCart();
    }, 2000);
  };

  return (
    <div id="cart-tab-root" className="px-5 py-5 animate-fade-in pb-28 max-w-2xl mx-auto">
      
      {/* Back navigations for checkout steps */}
      {checkoutStep !== "cart" && checkoutStep !== "processing" && checkoutStep !== "success" && (
        <div className="flex items-center gap-2 mb-5">
          <button 
            onClick={() => {
              if (checkoutStep === "delivery") setCheckoutStep("cart");
              if (checkoutStep === "summary") setCheckoutStep("delivery");
            }}
            className="p-1.5 bg-white border border-border-custom rounded-lg text-text-primary hover:bg-canvas transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="text-left">
            <h2 className="text-base font-black text-text-primary">
              {checkoutStep === "delivery" ? "Delivery Details" : "Order Summary"}
            </h2>
            <p className="text-[10px] text-primary uppercase font-bold tracking-widest">
              {checkoutStep === "delivery" ? "Step 2 of 3 • Recipient & Hub" : "Step 3 of 3 • Check & Pay"}
            </p>
          </div>
        </div>
      )}

      {/* STEP 1: CART VIEW */}
      {checkoutStep === "cart" && (
        <>
          <div className="mb-5 text-left">
            <h2 className="text-xl font-bold text-text-primary">My Persistent Cart</h2>
            <p className="text-xs text-text-secondary">Review orders & secure checkout hub</p>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-14 bg-white rounded-[32px] border border-dashed border-border-custom/60 space-y-4">
              <div className="text-5xl text-primary/45 opacity-60">🛒</div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-text-primary">Your Cart is Empty</h3>
                <p className="text-[11px] text-text-secondary leading-normal max-w-[220px] mx-auto">
                  Add direct groceries, delicious meals, or general medical items from Chamba stores!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Cart Item Cards list */}
              <div className="bg-white rounded-[28px] p-4 shadow-sm border border-border-custom/40 space-y-3.5">
                <div className="flex justify-between items-center pb-2.5 border-b border-border-custom/30 text-xs">
                  <span className="font-bold text-text-primary">Summary list ({cart.length} items)</span>
                  <button 
                    onClick={onClearCart}
                    className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash size={12} /> Clear Cart
                  </button>
                </div>

                <div className="divide-y divide-border-custom/30 space-y-3 text-left">
                  {cart.map((item, idx) => (
                    <div key={item.id} className={`flex items-center justify-between pt-3 ${idx === 0 ? "pt-0 border-none px-0" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border-custom/30 flex items-center justify-center bg-canvas">
                          <ImageComponent 
                            src={item.image} 
                            alt={item.name} 
                            fallbackName={item.name}
                            fallbackType="product"
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-text-primary max-w-[160px] truncate leading-tight">{item.name}</h4>
                          <p className="text-[10px] text-text-secondary mt-0.5">₹{item.price} • {item.storeOrRestaurantName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-primary">₹{item.price * item.quantity}</span>
                        <div className="flex items-center border border-border-custom/65 bg-canvas rounded-xl py-0.5 px-1 bg-white">
                          <button 
                            onClick={() => onRemoveFromCart(item.id)}
                            className="px-2 py-1 text-text-secondary hover:text-rose-500 cursor-pointer"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-[11px] font-black text-text-primary w-5 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => onAddToCart(item, item.storeOrRestaurantId, item.storeOrRestaurantName, item.type)}
                            className="px-2 py-1 text-text-secondary hover:text-primary cursor-pointer"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupons */}
              <div className="bg-white rounded-[24px] p-4 shadow-sm border border-border-custom/35 space-y-3">
                <label className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider block text-left">Apply Valley Promocode</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter (e.g. CHAMBA20)..." 
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="flex-1 bg-canvas border border-border-custom text-xs px-3.5 py-3 rounded-xl focus:outline-none uppercase font-bold placeholder:normal-case placeholder:font-light"
                  />
                  <button 
                    onClick={applyPromo}
                    className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-[9px] text-[#22C55E] font-medium leading-normal text-left">
                  💡 Hint: Enter <strong>CHAMBA20</strong> to get 20% flat discount on subtotal!
                </p>
              </div>

              {/* Pricing table summary */}
              <div className="bg-white rounded-[28px] p-4.5 border border-border-custom/40 shadow-xs space-y-2.5 text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-text-primary">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Hyperlocal Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-[#22C55E] font-bold uppercase text-[10px]">Free Delivery</span>
                  ) : (
                    <span className="font-bold text-text-primary">₹{deliveryFee}</span>
                  )}
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Voucher Savings</span>
                    <span>- ₹{discount}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-3 border-t border-border-custom/40">
                  <span className="text-xs font-black text-text-primary uppercase tracking-wide">Total price</span>
                  <span className="text-lg font-black text-primary">₹{finalTotal}</span>
                </div>
              </div>

              <button 
                onClick={handleStartCheckout}
                className="w-full bg-primary hover:bg-primary/95 text-white font-black text-xs py-4 rounded-2xl shadow-md transition-all active:scale-[0.98] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proceed to Delivery Details</span>
                <ArrowRight size={14} />
              </button>

              <div className="flex items-center justify-center gap-1.5 opacity-60 text-[9.5px] text-text-secondary">
                <ShieldCheck size={14} className="text-[#22C55E] shrink-0" />
                <span>100% Secure Guest Checkout System</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* STEP 2: DELIVERY DETAILS VIEW */}
      {checkoutStep === "delivery" && (
        <form onSubmit={handleDeliverySubmit} className="space-y-5 text-left">
          <div className="bg-white rounded-[28px] p-5 shadow-sm border border-border-custom/40 space-y-4">
            <h3 className="text-sm font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b pb-2.5 border-border-custom/35">
              <User size={16} className="text-primary" />
              Recipient Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-text-secondary uppercase block mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Enter recipient name..."
                  className="w-full bg-canvas text-xs font-bold border border-border-custom p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-text-secondary uppercase block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="Enter contact number..."
                  className="w-full bg-canvas text-xs font-bold border border-border-custom p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] p-5 shadow-sm border border-border-custom/40 space-y-4">
            <h3 className="text-sm font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b pb-2.5 border-border-custom/35">
              <MapPin size={16} className="text-primary" />
              Select Delivery Address
            </h3>

            {/* Saved Addresses list */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                {savedAddresses.map((addr) => (
                  <label 
                    key={addr.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedAddressId === addr.id 
                        ? "border-primary bg-primary-light/10" 
                        : "border-border-custom hover:bg-canvas"
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery-address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-0.5 text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="text-xs font-black text-text-primary">{addr.label}</p>
                      <p className="text-[10.5px] text-text-secondary mt-0.5 leading-relaxed">{addr.detail}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Custom/New Address choice */}
            <label 
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedAddressId === "custom" 
                  ? "border-primary bg-primary-light/10" 
                  : "border-border-custom hover:bg-canvas"
              }`}
            >
              <input
                type="radio"
                name="delivery-address"
                checked={selectedAddressId === "custom"}
                onChange={() => setSelectedAddressId("custom")}
                className="mt-0.5 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <p className="text-xs font-black text-text-primary">Deliver to different address</p>
                <p className="text-[10.5px] text-text-secondary mt-0.5">Specify a custom dropoff location below</p>
                
                {selectedAddressId === "custom" && (
                  <textarea
                    required={selectedAddressId === "custom"}
                    value={customAddressDetail}
                    onChange={(e) => setCustomAddressDetail(e.target.value)}
                    placeholder="Enter complete delivery address details, landmark, and street..."
                    rows={3}
                    className="w-full mt-3 bg-white text-xs font-bold border border-border-custom p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent leading-relaxed"
                  />
                )}
              </div>
            </label>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/95 text-white font-black text-xs py-4 rounded-2xl shadow-md transition-all active:scale-[0.98] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Proceed to Order Summary</span>
            <ArrowRight size={14} />
          </button>
        </form>
      )}

      {/* STEP 3: ORDER SUMMARY & WALLET PAYMENT */}
      {checkoutStep === "summary" && (
        <div className="space-y-5 text-left">
          {/* Recipient / Address Summary Card */}
          <div className="bg-white rounded-[28px] p-5 shadow-sm border border-border-custom/40 space-y-4">
            <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest border-b pb-2 border-border-custom/30">
              Delivery Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <User size={14} className="text-text-secondary" />
                <span className="font-bold text-text-primary">{recipientName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Phone size={14} className="text-text-secondary" />
                <span className="font-medium text-text-primary">{recipientPhone}</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <MapPin size={14} className="text-text-secondary mt-0.5 shrink-0" />
                <span className="font-medium text-text-primary leading-relaxed">{getSelectedAddressText()}</span>
              </div>
            </div>
          </div>

          {/* Cart Item Summary Card */}
          <div className="bg-white rounded-[28px] p-5 shadow-sm border border-border-custom/40 space-y-3.5">
            <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest border-b pb-2 border-border-custom/30">
              Selected Items
            </h3>
            <div className="divide-y divide-border-custom/25 space-y-2.5">
              {cart.map((item, idx) => (
                <div key={item.id} className={`flex justify-between items-center text-xs pt-2.5 ${idx === 0 ? "pt-0 border-none" : ""}`}>
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-primary bg-primary-light/40 px-2 py-0.5 rounded-md text-[10.5px]">
                      {item.quantity}x
                    </span>
                    <span className="font-bold text-text-primary truncate max-w-[200px]">{item.name}</span>
                  </div>
                  <span className="font-black text-text-primary">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Wallet Balance Widget & Auto recharge */}
          <div className="bg-white rounded-[28px] p-5 shadow-sm border border-border-custom/40 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest">
                  Bluber Guest Wallet
                </h3>
                <p className="text-xl font-black text-text-primary flex items-center gap-1.5 mt-1">
                  <Coins size={20} className="text-amber-500" />
                  ₹{walletBalance.toLocaleString()}
                </p>
              </div>
              
              {walletBalance >= finalTotal ? (
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-1.5 rounded-xl uppercase flex items-center gap-1">
                  ✓ Balance Sufficient
                </span>
              ) : (
                <span className="bg-rose-50 text-rose-800 text-[10px] font-black px-2.5 py-1.5 rounded-xl uppercase flex items-center gap-1">
                  <AlertCircle size={12} /> Insufficient
                </span>
              )}
            </div>

            {/* QUICK TOP UP FORM IF INSUFFICIENT OR PREFERRED */}
            {walletBalance < finalTotal && (
              <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/50 space-y-3 animate-fade-in">
                <div className="flex gap-2 items-center">
                  <AlertCircle size={16} className="text-amber-600 shrink-0" />
                  <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                    You need <strong>₹{finalTotal - walletBalance}</strong> more to complete this order. Use the quick-topup node below!
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {[100, 200, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setQuickTopUpAmount(amt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        quickTopUpAmount === amt 
                          ? "bg-amber-500 border-amber-500 text-white" 
                          : "bg-white border-border-custom text-text-primary hover:bg-canvas"
                      }`}
                    >
                      + ₹{amt}
                    </button>
                  ))}
                </div>

                {topUpSuccess && (
                  <p className="text-[10px] text-emerald-600 font-black">✓ Guest Wallet charged up successfully!</p>
                )}

                <button
                  type="button"
                  onClick={handleQuickTopUp}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black py-2.5 rounded-xl uppercase tracking-wider shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  Charge up +₹{quickTopUpAmount} instantly
                </button>
              </div>
            )}
          </div>

          {/* Bill summary and place order */}
          <div className="bg-white rounded-[28px] p-5 border border-border-custom/40 shadow-xs space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Items Subtotal</span>
                <span className="font-bold text-text-primary">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Hyperlocal Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span className="text-[#22C55E] font-bold uppercase text-[10px]">Free Delivery</span>
                ) : (
                  <span className="font-bold text-text-primary">₹{deliveryFee}</span>
                )}
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Voucher Savings</span>
                  <span>- ₹{discount}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-3 border-t border-border-custom/40">
                <span className="text-xs font-black text-text-primary uppercase tracking-wide">Total price</span>
                <span className="text-lg font-black text-primary">₹{finalTotal}</span>
              </div>
            </div>

            <button 
              onClick={triggerPaymentFinalization}
              disabled={walletBalance < finalTotal}
              className={`w-full py-4 text-white text-xs font-black rounded-2xl tracking-wider active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer uppercase ${
                walletBalance >= finalTotal 
                  ? "bg-primary hover:bg-primary/95" 
                  : "bg-neutral-300 cursor-not-allowed shadow-none"
              }`}
            >
              <span>Place Order (Pay ₹{finalTotal} via Wallet)</span>
              <CheckCircle size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PROCESSING VIEWER */}
      {checkoutStep === "processing" && (
        <div className="bg-white rounded-[32px] p-8 text-center border border-border-custom shadow-md space-y-6 animate-fade-in py-16">
          <div className="flex flex-col items-center justify-center">
            <Loader2 size={44} className="text-primary animate-spin shrink-0" />
            <h3 className="text-base font-black text-text-primary mt-4">Transmitting Order to Hub...</h3>
            <p className="text-[11px] text-text-secondary uppercase font-bold tracking-widest text-primary mt-1">Prepaid Guest Node Passthrough</p>
          </div>

          <div className="bg-canvas border border-border-custom p-4 rounded-2xl max-w-xs mx-auto text-left space-y-2 text-[11px] font-mono text-text-secondary">
            <div className="flex justify-between">
              <span>Transaction ID:</span>
              <span className="font-bold text-text-primary">{txnDetails.txnId}</span>
            </div>
            <div className="flex justify-between">
              <span>UPI Ref Number:</span>
              <span className="font-bold text-text-primary">{txnDetails.upiRef}</span>
            </div>
            <div className="flex justify-between">
              <span>Settlement Sum:</span>
              <span className="font-bold text-text-primary">₹{txnDetails.amount}.00</span>
            </div>
            <div className="flex justify-between">
              <span>Gateway Node:</span>
              <span className="font-bold text-[#1E6B3D]">GUEST_WALLET_PASSTHRU</span>
            </div>
          </div>
          
          <p className="text-[11px] text-text-secondary leading-normal max-w-[240px] mx-auto">
            Securing guest checkout receipt and planning optimal driver matching...
          </p>
        </div>
      )}

      {/* STEP 5: SUCCESS VIEWER */}
      {checkoutStep === "success" && (
        <div className="bg-white rounded-3xl p-6 text-center border border-emerald-100 shadow-custom animate-fade-in space-y-5">
          <div className="w-14 h-14 bg-[#EDF7EF] text-[#1E6B3D] rounded-full flex items-center justify-center mx-auto scale-110 border border-emerald-500/20">
            <CheckCircle size={36} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-[#1E6B3D]">Order Placed Successfully!</h3>
            <p className="text-xs text-text-primary font-bold">Driver Sourcing Triggered</p>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Guest wallet payment captured. Receipt ID: <span className="font-mono font-bold text-text-primary">{txnDetails.txnId}</span>.<br />
            Our owner logistics captains have received your order <strong>{lastOrderId}</strong>! A rider is being assigned.
          </p>

          <button
            onClick={onSwitchToOrders}
            className="w-full py-4 bg-primary text-white text-xs font-black rounded-2xl tracking-wider active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer hover:bg-primary/95"
          >
            Track Order ➔
          </button>
        </div>
      )}
    </div>
  );
};

export default CartTab;
