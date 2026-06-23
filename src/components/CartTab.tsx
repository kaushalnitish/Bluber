import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Ticket, 
  CheckCircle, 
  ShieldCheck,
  CreditCard,
  Trash,
  Smartphone,
  QrCode,
  Loader2,
  Lock,
  ArrowLeft,
  Coins
} from "lucide-react";
import { CartItem } from "../types";

interface CartTabProps {
  cart: CartItem[];
  walletBalance: number;
  onAddToCart: (item: any, shopId: string, shopName: string, type: "food" | "grocery" | "medicine") => void;
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (order: any) => void;
  onDeductWallet: (amount: number) => boolean;
  onSwitchToOrders: () => void;
}

export const CartTab: React.FC<CartTabProps> = ({
  cart,
  walletBalance,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onPlaceOrder,
  onDeductWallet,
  onSwitchToOrders
}) => {
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  
  // Payment Flow States
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "payment" | "processing" | "success">("cart");
  const [paymentOption, setPaymentOption] = useState<"UPI_APP" | "UPI_QR">("UPI_APP");
  const [selectedUPIApp, setSelectedUPIApp] = useState<"GPay" | "PhonePe" | "Paytm" | "BHIM">("GPay");
  const [pinInput, setPinInput] = useState("");
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  
  const [lastOrderId, setLastOrderId] = useState("");
  const [txnDetails, setTxnDetails] = useState({ txnId: "", upiRef: "", amount: 0 });

  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  
  // Delivery charges: Free over ₹300, else ₹30
  const deliveryFee = subtotal === 0 ? 0 : (subtotal >= 300 ? 0 : 30);
  const finalTotal = Math.max(0, subtotal + deliveryFee - discount);

  // Timer for QR simulation
  const [qrCountdown, setQrCountdown] = useState(300); // 5 min
  useEffect(() => {
    let interval: any = null;
    if (checkoutStep === "payment" && paymentOption === "UPI_QR") {
      interval = setInterval(() => {
        setQrCountdown(prev => (prev > 0 ? prev - 1 : 300));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [checkoutStep, paymentOption]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const applyPromo = () => {
    if (coupon.trim().toUpperCase() === "CHAMBA20") {
      const calculatedDiscount = Math.round(subtotal * 0.2);
      setDiscount(calculatedDiscount);
      alert(`Voucher 'CHAMBA20' applied! 20% discount (₹${calculatedDiscount}) has been deducted.`);
    } else {
      alert("Invalid coupon code. Try 'CHAMBA20' for 20% off direct grocery and culinary orders!");
    }
  };

  const handleStartPayment = () => {
    if (cart.length === 0) return;
    setCheckoutStep("payment");
  };

  const handlePINSubmit = () => {
    if (pinInput.length < 4) {
      alert("Please enter a valid 4 or 6-digit UPI PIN");
      return;
    }
    setIsPinModalOpen(false);
    triggerPaymentFinalization();
  };

  const triggerPaymentFinalization = () => {
    setCheckoutStep("processing");
    
    const randomTxn = `TXN${Math.floor(10000000 + Math.random() * 90000000)}`;
    const randomUpiRef = `${Math.floor(300000000000 + Math.random() * 700000000000)}`;
    
    setTxnDetails({
      txnId: randomTxn,
      upiRef: randomUpiRef,
      amount: finalTotal
    });

    // Simulate server side payment verification
    setTimeout(() => {
      const generatedId = `BLUB-${Math.floor(1000 + Math.random() * 9000)}`;
      const itemsSummary = cart.map(ci => `${ci.name} × ${ci.quantity}`).join(", ");

      const newOrder = {
        id: generatedId,
        type: "Grocery" as const,
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
    }, 2500);
  };

  return (
    <div id="cart-tab-root" className="px-5 py-5 animate-fade-in pb-28">
      {/* Header */}
      {checkoutStep === "cart" && (
        <div className="mb-5 text-left">
          <h2 className="text-xl font-bold text-text-primary">My Persistent Cart</h2>
          <p className="text-xs text-text-secondary">Review orders & secure checkout hub</p>
        </div>
      )}

      {checkoutStep === "payment" && (
        <div className="flex items-center gap-2 mb-5">
          <button 
            onClick={() => setCheckoutStep("cart")}
            className="p-1.5 bg-white border border-border-custom rounded-lg text-text-primary"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="text-left">
            <h2 className="text-base font-black text-text-primary">UPI Payments Gateway</h2>
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest text-primary flex items-center gap-1">
              <Lock size={10} className="text-primary" /> Prepaid-First Security Enabled
            </p>
          </div>
        </div>
      )}

      {checkoutStep === "cart" && (
        cart.length === 0 ? (
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

              <div className="divide-y divide-border-custom/30 space-y-3">
                {cart.map((item, idx) => (
                  <div key={item.id} className={`flex items-center justify-between pt-3 ${idx === 0 ? "pt-0 border-none px-0" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border-custom/30 flex items-center justify-center bg-canvas">
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
              onClick={handleStartPayment}
              className="w-full bg-primary hover:bg-primary/95 text-white font-black text-xs py-4 rounded-2xl shadow-md transition-all active:scale-[0.98] uppercase tracking-wider cursor-pointer"
            >
              Confirm & Pay Securely (₹{finalTotal})
            </button>

            <div className="flex items-center justify-center gap-1.5 opacity-60 text-[9.5px] text-text-secondary">
              <ShieldCheck size={14} className="text-[#22C55E] shrink-0" />
              <span>100% Secure Prepaid Payment Node System</span>
            </div>
          </div>
        )
      )}

      {/* STEP 2: PREPAID UPI PAYMENT CHOICES (COD REMOVED) */}
      {checkoutStep === "payment" && (
        <div className="space-y-5">
          {/* Bill summary check */}
          <div className="bg-white rounded-[20px] p-4 border border-border-custom/40 shadow-sm flex justify-between items-center text-xs">
            <div className="text-left">
              <p className="text-[10px] font-bold text-text-secondary uppercase">Bill Total Due</p>
              <p className="text-lg font-black text-text-primary">₹{finalTotal}</p>
            </div>
            <div className="text-right bg-[#EDF7EF] text-[#1E6B3D] px-2.5 py-1.5 rounded-xl font-bold text-[10px]">
              Prepaid Order Only
            </div>
          </div>

          <div className="bg-white rounded-[28px] p-4 shadow-sm border border-border-custom/45 space-y-4">
            <p className="text-xs font-black text-text-primary uppercase tracking-wide text-left">Choose Instant UPI Method</p>
            
            {/* Tabs for UPI Selection */}
            <div className="grid grid-cols-2 gap-2 bg-canvas p-1 rounded-xl">
              <button
                onClick={() => setPaymentOption("UPI_APP")}
                className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentOption === "UPI_APP" ? "bg-white text-primary shadow-xs" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Smartphone size={14} /> Mobile App UPI
              </button>
              <button
                onClick={() => setPaymentOption("UPI_QR")}
                className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentOption === "UPI_QR" ? "bg-white text-primary shadow-xs" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <QrCode size={14} /> Scan UPI QR
              </button>
            </div>

            {/* UPI INTENT CONTAINER */}
            {paymentOption === "UPI_APP" && (
              <div className="space-y-3 pt-2">
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider text-left">Select Instant App Intent</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "GPay", name: "Google Pay", logo: "🟢" },
                    { id: "PhonePe", name: "PhonePe", logo: "🟣" },
                    { id: "Paytm", name: "Paytm", logo: "🔵" },
                    { id: "BHIM", name: "BHIM UPI", logo: "🇮🇳" }
                  ].map(app => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedUPIApp(app.id as any)}
                      className={`p-3.5 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                        selectedUPIApp === app.id ? "border-primary bg-primary-light/35 font-bold" : "border-border-custom hover:bg-canvas"
                      }`}
                    >
                      <span className="text-base leading-none">{app.logo}</span>
                      <span className="text-xs text-text-primary">{app.name}</span>
                    </button>
                  ))}
                </div>

                <div className="bg-canvas p-3 rounded-xl border border-border-custom/40 text-[10.5px] text-text-secondary leading-relaxed text-left space-y-1">
                  <p>✔ Launches <strong>{selectedUPIApp}</strong> secure viewport instantly</p>
                  <p>✔ Auto-returns upon secure PIN verification</p>
                </div>

                <button
                  onClick={() => setIsPinModalOpen(true)}
                  className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md mt-4 cursor-pointer"
                >
                  Pay ₹{finalTotal} via {selectedUPIApp} ➔
                </button>
              </div>
            )}

            {/* UPI QR CONTAINER */}
            {paymentOption === "UPI_QR" && (
              <div className="space-y-4 pt-2 text-center flex flex-col items-center">
                <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">Dynamic QR Code Terminal</p>
                
                {/* SVG QR Code Mockup */}
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-md relative group">
                  <svg width="150" height="150" viewBox="0 0 100 100" className="opacity-95 text-text-primary">
                    <rect width="100" height="100" fill="white" />
                    {/* Corners */}
                    <path d="M5 5 H25 V15 H15 V25 H5 Z" fill="currentColor" />
                    <path d="M75 5 H95 V25 H85 V15 H75 Z" fill="currentColor" />
                    <path d="M5 75 H15 V85 H25 V95 H5 Z" fill="currentColor" />
                    {/* Interior Patterns */}
                    <rect x="5" y="5" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
                    <rect x="75" y="5" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
                    <rect x="5" y="75" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
                    {/* Dots center representation */}
                    <path d="M35 15 H45 V25 M55 15 H65 V35 M40 40 H50 M30 50 H60 V55 M15 35 H25 V45 M80 35 H85 V60 M75 75 H95 V85" stroke="currentColor" strokeWidth="3" strokeLinecap="square" fill="none" />
                    <circle cx="50" cy="50" r="10" fill="none" stroke="#22C55E" strokeWidth="2" />
                    {/* Small inner UPI typography marker */}
                    <text x="50" y="53" fontSize="8" fontWeight="black" fill="#1E6B3D" textAnchor="middle">UPI</text>
                  </svg>
                  
                  {/* Pinging green scanner dot */}
                  <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-text-primary">Scan using GPay, PhonePe, Paytm or BHIM</p>
                  <p className="text-[10px] text-text-secondary">Amount match: <strong>₹{finalTotal}</strong> • Code expires in <span className="text-rose-500 font-mono font-bold">{formatTime(qrCountdown)}</span></p>
                </div>

                <div className="bg-[#EDF7EF] p-3 rounded-xl border border-emerald-500/10 text-[10px] text-[#1E6B3D] leading-normal font-medium max-w-[280px] text-center">
                  💡 Dynamic scanning updates settlement automatically. Click below to mock successful QR match.
                </div>

                <button
                  onClick={triggerPaymentFinalization}
                  className="w-full bg-[#1E6B3D] hover:bg-emerald-800 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Simulate QR Payment Success ✓
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: TRANSACTION SERVERSIDE VERIFICATION LOADER */}
      {checkoutStep === "processing" && (
        <div className="bg-white rounded-[32px] p-8 text-center border border-border-custom shadow-md space-y-6 animate-fade-in py-16">
          <div className="flex flex-col items-center justify-center">
            <Loader2 size={44} className="text-primary animate-spin shrink-0" />
            <h3 className="text-base font-black text-text-primary mt-4">Verifying Secure Payment...</h3>
            <p className="text-[11px] text-text-secondary uppercase font-bold tracking-widest text-primary mt-1">Prepaid Authentication Node</p>
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
              <span className="font-bold text-[#1E6B3D]">SERVERSIDE_PASSTHRU</span>
            </div>
          </div>
          
          <p className="text-[11px] text-text-secondary leading-normal max-w-[240px] mx-auto">
            Please do not hit back or close the browser tab. Securing dynamic checkout receipt settlement...
          </p>
        </div>
      )}

      {/* STEP 4: PAYMENT SUCCESS / ORDER TRANSMITTED SCREEN */}
      {checkoutStep === "success" && (
        <div className="bg-white rounded-3xl p-6 text-center border border-emerald-100 shadow-custom animate-fade-in space-y-5">
          <div className="w-14 h-14 bg-[#EDF7EF] text-[#1E6B3D] rounded-full flex items-center justify-center mx-auto scale-110 border border-emerald-500/20">
            <CheckCircle size={36} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-[#1E6B3D]">Prepaid Payment Authenticated!</h3>
            <p className="text-xs text-text-primary font-bold">Order Confirmed Successfully</p>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Payment has been securely captured. Receipt ID: <span className="font-mono font-bold text-text-primary">{txnDetails.txnId}</span>.<br />
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

      {/* UPI PIN INTERACTIVE SECURE POPUP */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-5 pointer-events-auto">
          <div className="bg-surface rounded-3xl p-5 text-center max-w-xs w-full shadow-2xl animate-[zoomIn_150ms_ease-out]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-custom">
              <span className="text-xs font-bold text-text-secondary flex items-center gap-1">
                <Lock size={12} fill="currentColor" /> ENTER UPI PIN
              </span>
              <span className="text-[10px] font-black text-text-primary">Amount: ₹{finalTotal}</span>
            </div>
            
            <p className="text-[11px] text-text-secondary text-left mb-2.5">Enter 4-digit UPI PIN for your bank account:</p>
            
            <input 
              type="password"
              maxLength={4}
              placeholder="• • • •"
              value={pinInput}
              readOnly
              className="w-full bg-canvas text-center text-xl font-bold font-mono tracking-widest py-3.5 rounded-xl focus:outline-none border border-border-custom"
            />

            {/* Simulated Grid Keypad */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-extrabold text-[#475569]">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(num => (
                <button
                  key={num}
                  onClick={() => pinInput.length < 4 && setPinInput(prev => prev + num)}
                  className="py-2.5 bg-canvas hover:bg-border-custom rounded-lg border border-border-custom/50 active:scale-95 text-text-primary cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setPinInput("")}
                className="py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg font-bold border border-rose-100 cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => pinInput.length < 4 && setPinInput(prev => prev + "0")}
                className="py-2.5 bg-canvas hover:bg-border-custom rounded-lg border border-border-custom/50 cursor-pointer"
              >
                0
              </button>
              <button
                onClick={handlePINSubmit}
                className="py-2.5 bg-primary text-white hover:bg-primary/95 rounded-lg font-bold shadow-xs cursor-pointer"
              >
                ✓ OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
