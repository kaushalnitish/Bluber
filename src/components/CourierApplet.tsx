import React, { useState } from "react";
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  User, 
  Coins, 
  CheckCircle,
  Truck,
  ChevronRight
} from "lucide-react";
import { CourierState } from "../types";

interface CourierAppletProps {
  walletBalance: number;
  onDeductWallet: (amount: number) => boolean;
  onAddOrder: (order: any) => void;
  onBack: () => void;
  onSwitchToOrders: () => void;
}

const CHAMBA_LANDMARKS = [
  "Gandhi Chowk, Chamba",
  "Near Chowgan, Chamba",
  "Court Road, Chamba",
  "Chamba Bus Stand",
  "Laxmi Narayan Temple",
  "Lower Bazar, Chamba",
  "Pangi Valley Route Portal"
];

const PACKAGE_TYPES = [
  { id: "Docs", name: "Documents", desc: "Envelopes, records", icon: "📄", standardPrice: 40 },
  { id: "Apples", name: "Apples Box", desc: "Local fruits, produce", icon: "🍎", standardPrice: 70 },
  { id: "Clothes", name: "Warm Shawls", desc: "Woolen, garments", icon: "🧣", standardPrice: 50 },
  { id: "Pickles", name: "Pickle Jars", desc: "Glass bottles, food", icon: "🫙", standardPrice: 60 },
  { id: "Heavy", name: "Heavy Box", desc: "Up to 10kg packages", icon: "📦", standardPrice: 120 }
];

export const CourierApplet: React.FC<CourierAppletProps> = ({
  walletBalance,
  onDeductWallet,
  onAddOrder,
  onBack,
  onSwitchToOrders
}) => {
  const [form, setForm] = useState<CourierState>({
    pickup: CHAMBA_LANDMARKS[0],
    dropoff: CHAMBA_LANDMARKS[1],
    senderName: "Guest Chamba Travel Group",
    receiverName: "",
    receiverPhone: "",
    packageType: "Apples",
    weight: "up to 2 kg",
    notes: "",
    price: 70
  });

  const [step, setStep] = useState<"idle" | "searching" | "success">("idle");
  const [assignedRider, setAssignedRider] = useState("");

  const handlePackageSelect = (typeId: string, basePrice: number) => {
    setForm(prev => ({
      ...prev,
      packageType: typeId,
      price: basePrice
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.receiverName.trim() || !form.receiverPhone.trim()) {
      alert("Please fill out the recipient name and mobile number.");
      return;
    }
    if (form.pickup === form.dropoff) {
      alert("Pickup and Drop-off locations cannot be identical.");
      return;
    }

    setStep("searching");

    setTimeout(() => {
      // Deduct
      onDeductWallet(form.price);

      // Add Order
      const simulatedOrderId = `COURIER-${Math.floor(1000 + Math.random() * 9000)}`;
      const pName = PACKAGE_TYPES.find(p => p.id === form.packageType)?.name || "Parcel";
      
      const newOrder = {
        id: simulatedOrderId,
        type: "Courier",
        merchantName: "Bluber Instant Courier",
        itemsSummary: `Parcel (${pName}) from ${form.pickup} to ${form.dropoff}`,
        total: form.price,
        status: "Looking For Rider",
        date: "Today, Just Now",
        estimatedTime: "15-20 Min",
        riderName: "Captain Vinod Kumar",
        riderPhone: "+91-98164-02487" // Consolidated to official support/helpline
      };

      onAddOrder(newOrder);
      setAssignedRider("Captain Vinod Kumar");
      setStep("success");
    }, 3000);
  };

  return (
    <div id="courier-applet-root" className="bg-canvas min-h-screen px-4 py-4 animate-fade-in pb-28 text-left">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button 
          onClick={onBack}
          className="p-3 bg-white rounded-full text-text-primary hover:scale-105 active:scale-95 transition-all shadow-sm border border-border-custom"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-text-primary">Bluber Courier Station</h2>
          <p className="text-xs text-text-secondary font-medium">Instant citywide package dispatch</p>
        </div>
      </div>

      {step === "idle" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section 1: Route details */}
          <div className="bg-surface rounded-[24px] p-5 shadow-xs border border-border-custom">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-3.5 flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              Chamba Route Points
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">Pickup Address</label>
                <div className="relative">
                  <select
                    value={form.pickup}
                    onChange={(e) => setForm(p => ({ ...p, pickup: e.target.value }))}
                    className="w-full bg-canvas text-xs font-bold border border-border-custom rounded-xl pl-3 pr-8 py-3 focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    {CHAMBA_LANDMARKS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                    <ChevronRight size={12} className="rotate-90" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">Drop-off Address</label>
                <div className="relative">
                  <select
                    value={form.dropoff}
                    onChange={(e) => setForm(p => ({ ...p, dropoff: e.target.value }))}
                    className="w-full bg-canvas text-xs font-bold border border-border-custom rounded-xl pl-3 pr-8 py-3 focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    {CHAMBA_LANDMARKS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                    <ChevronRight size={12} className="rotate-90" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Recipient Information */}
          <div className="bg-surface rounded-[24px] p-5 shadow-xs border border-border-custom">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-3.5 flex items-center gap-2">
              <User size={16} className="text-primary" />
              Recipient Details
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Singh"
                    value={form.receiverName}
                    onChange={(e) => setForm(p => ({ ...p, receiverName: e.target.value }))}
                    className="w-full bg-canvas text-xs px-3.5 py-3 border border-border-custom rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">Receiver Mobile</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98160-XXXXX"
                    value={form.receiverPhone}
                    onChange={(e) => setForm(p => ({ ...p, receiverPhone: e.target.value }))}
                    className="w-full bg-canvas text-xs px-3.5 py-3 border border-border-custom rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Leave with security, fragile contents..."
                  value={form.notes}
                  onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full bg-canvas text-xs px-3.5 py-3 border border-border-custom rounded-xl focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Package category selection */}
          <div className="bg-surface rounded-[24px] p-5 shadow-xs border border-border-custom">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-2.5">
              Select Package Type
            </h3>
            
            <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
              {PACKAGE_TYPES.map((p) => {
                const isSelected = form.packageType === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handlePackageSelect(p.id, p.standardPrice)}
                    className={`p-3 rounded-2xl border text-center cursor-pointer shrink-0 w-28 transition-all ${
                      isSelected 
                        ? "border-primary bg-primary-light text-primary" 
                        : "border-border-custom bg-canvas text-text-secondary hover:bg-white"
                    }`}
                  >
                    <span className="text-2xl block mb-1">{p.icon}</span>
                    <p className="text-xs font-bold text-text-primary">{p.name}</p>
                    <p className="text-[9px] text-text-secondary mt-1">₹{p.standardPrice}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-text-secondary bg-canvas/60 p-3 rounded-xl border border-border-custom">
              <span className="flex items-center gap-1.5"><Coins size={14} className="text-amber-500" /> Bluber Wallet Balance</span>
              <span className="font-bold text-text-primary">₹{walletBalance}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-primary text-white font-bold text-sm rounded-[20px] tracking-wide shadow-xs hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer border-none"
          >
            Dispatch Courier (₹{form.price})
          </button>
        </form>
      )}

      {step === "searching" && (
        <div className="bg-surface rounded-[24px] shadow-xs border border-border-custom p-6 text-center py-12 animate-fade-in my-10">
          <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            <div className="relative bg-primary text-white p-4 rounded-full shadow-md">
              <Package size={34} className="animate-bounce" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-text-primary">Allocating Chamba Captain</h3>
          <p className="text-xs text-text-secondary mt-1.5 max-w-xs mx-auto">
            Contacting nearest motorcycle courier captains in Gandhi Chowk hub...
          </p>
        </div>
      )}

      {step === "success" && (
        <div className="bg-surface rounded-[24px] shadow-xs border border-border-custom p-6 text-center animate-fade-in my-5 space-y-4">
          <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-2 text-[#1E6B3D]">
            <CheckCircle size={36} />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Courier Booked!</h3>
          <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
            Courier request dispatched! <span className="font-bold text-text-primary">{assignedRider}</span> has been assigned and is heading to {form.pickup} to retrieve the parcel.
          </p>

          <div className="border border-border-custom bg-canvas rounded-2xl p-4 my-5 text-left text-xs text-text-secondary space-y-2 max-w-xs mx-auto">
            <div className="flex justify-between">
              <span>Chamba Runner</span>
              <span className="font-bold text-text-primary">{assignedRider}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Price</span>
              <span className="font-bold text-[#1E6B3D]">₹{form.price}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Time</span>
              <span className="font-bold text-text-primary">15-20 Min</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => {
                setStep("idle");
                onBack();
              }}
              className="py-3 bg-canvas border border-border-custom text-text-primary font-bold text-xs rounded-xl cursor-pointer"
            >
              Back to Home
            </button>
            <button
              onClick={onSwitchToOrders}
              className="py-3 bg-primary text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer border-none"
            >
              Track Courier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
