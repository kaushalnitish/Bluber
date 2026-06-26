import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle,
  MapPin,
  Clock,
  Phone,
  Package,
  Bike,
  Utensils,
  Pill,
  ShoppingBag,
  Star,
  MessageSquare,
  ShieldCheck,
  Compass,
  ArrowRight,
  User,
  Navigation,
  Sparkles,
  Check,
  X,
  Smartphone,
  RotateCcw
} from "lucide-react";
import { Order } from "../types";
import { ImageComponent } from "./ImageComponent";

interface OrdersTabProps {
  orders: Order[];
  onAdvanceOrderStatus: (orderId: string, customStatus?: any) => void;
  onCancelOrder: (orderId: string) => void;
  onReorder?: (order: Order) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ 
  orders, 
  onAdvanceOrderStatus, 
  onCancelOrder,
  onReorder 
}) => {
  const activeOrders = orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled");
  const pastOrders = orders.filter(o => o.status === "Delivered" || o.status === "Cancelled");

  // Track the currently highlighted active order ID for detailed visual real-time tracking
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");

  useEffect(() => {
    // Auto-select the first active order for the majestic tracking page
    if (activeOrders.length > 0 && !selectedTrackId) {
      setSelectedTrackId(activeOrders[0].id);
    }
  }, [activeOrders, selectedTrackId]);

  // GPS Movement & Simulation states for the selected tracking order
  const [gpsProgress, setGpsProgress] = useState<number>(0); // 0 to 100% between store and home
  const [isSimulatorRunning, setIsSimulatorRunning] = useState<boolean>(true);
  const [distanceRemaining, setDistanceRemaining] = useState<number>(2.4); // in km
  const [etaRemaining, setEtaRemaining] = useState<number>(8); // in minutes
  const [riderCoords, setRiderCoords] = useState<{ lat: number; lng: number }>({ lat: 32.5532, lng: 76.1264 });

  // Chat window simulation inside customer-rider view
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "rider"; text: string; time: string }>>([
    { sender: "rider", text: "Namaste! I have accepted your order and I am navigating to the store now. Any special packing rules?", time: "Just now" }
  ]);
  const [messageInput, setMessageInput] = useState("");

  const activeOrderTrack = orders.find(o => o.id === selectedTrackId);

  // SVG dimensions for smooth vector map route matching
  // Store: x = 40, y = 70. Customer: x = 320, y = 50.
  // Smooth wave curve between them.
  const getCoordinatesAlongPath = (percent: number) => {
    const p = percent / 100;
    const x = 40 + (320 - 40) * p;
    // Curvy sinus path for mountain terrain of Chamba
    const y = 70 + (50 - 70) * p + Math.sin(p * Math.PI) * 25;
    return { x, y };
  };

  // Auto-Simulation of Rider GPS movement when activeOrder state is "Out For Delivery" or "Arriving Soon"
  useEffect(() => {
    let interval: any = null;
    if (activeOrderTrack && activeOrderTrack.status === "Out For Delivery") {
      setIsSimulatorRunning(true);
      interval = setInterval(() => {
        setGpsProgress(prev => {
          const next = prev + 4;
          if (next >= 100) {
            clearInterval(interval);
            onAdvanceOrderStatus(activeOrderTrack.id, "Delivered");
            return 100;
          }
          // Dynamically compute GPS coords
          // Chamba standard lat/lng offset
          const computedLat = 32.553 + (32.557 - 32.553) * (next / 100);
          const computedLng = 76.126 + (76.129 - 76.126) * (next / 100);
          setRiderCoords({ lat: computedLat, lng: computedLng });

          // Compute matching Distance / ETA
          const dist = Math.max(0, 2.4 * (1 - next / 100));
          setDistanceRemaining(parseFloat(dist.toFixed(1)));
          setEtaRemaining(Math.max(1, Math.round(8 * (1 - next / 100))));

          // Geofence / Arriving soon check
          if (next >= 80 && activeOrderTrack.status !== "Arriving Soon" && next < 100) {
            onAdvanceOrderStatus(activeOrderTrack.id, "Arriving Soon");
          }

          return next;
        });
      }, 2500);
    } else {
      // Reset progress if status goes back
      if (activeOrderTrack && activeOrderTrack.status !== "Out For Delivery" && activeOrderTrack.status !== "Arriving Soon" && activeOrderTrack.status !== "Delivered") {
        setGpsProgress(0);
        setDistanceRemaining(2.4);
        setEtaRemaining(8);
      }
    }
    return () => clearInterval(interval);
  }, [selectedTrackId, activeOrderTrack?.status]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    const userMsg = { sender: "user" as const, text: messageInput, time: "Just now" };
    setChatMessages(prev => [...prev, userMsg]);
    setMessageInput("");

    // Simulate instant automated courteous Rider response
    setTimeout(() => {
      const responses = [
        "Achaa, understood! Sourcing right away.",
        "Yes, got it. I am at the store counter, they are verifying payment receipt.",
        "Sure, I will wear matching gloves and drop it at your doorstep securely.",
        "Almost done. Navigating Court Road now, traffic seems light!"
      ];
      const selected = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages(prev => [...prev, { sender: "rider", text: selected, time: "Just now" }]);
    }, 1500);
  };

  const currentCoords = getCoordinatesAlongPath(gpsProgress);

  const getIconForType = (type: string) => {
    switch (type) {
      case "Ride": return { icon: Bike, color: "text-[#1E6B3D]", bg: "bg-[#EDF7EF]" };
      case "Food": return { icon: Utensils, color: "text-[#E11D48]", bg: "bg-[#FFF0F0]" };
      case "Grocery": return { icon: ShoppingBag, color: "text-[#1E6B3D]", bg: "bg-[#EDF7EF]" };
      case "Medicine": return { icon: Pill, color: "text-[#9333EA]", bg: "bg-[#F3E8FF]" };
      default: return { icon: Package, color: "text-[#0284C7]", bg: "bg-[#E0F2FE]" };
    }
  };

  // Standard ordered lifecycle states for the customer dashboard tracking timeline
  const orderStatesList = [
    { key: "Order Confirmed", label: "Order Confirmed", desc: "Payment successfully verified" },
    { key: "Looking For Rider", label: "Assigning Captain", desc: "Matching near court road" },
    { key: "Rider Accepted", label: "Rider Accepted", desc: "Rohan Thakur is accepted" },
    { key: "Rider Reached Store", label: "Reached Store", desc: "Geofenced 50m radius arrival" },
    { key: "Order Picked Up", label: "Order Picked Up", desc: "Secured cargo matches" },
    { key: "Out For Delivery", label: "In Transit Route", desc: "Mountain navigation live" },
    { key: "Arriving Soon", label: "Arriving Soon", desc: "At home gates shortly" },
    { key: "Delivered", label: "Delivered", desc: "Order handed over" }
  ];

  const getActiveStepIndex = (status: string) => {
    return orderStatesList.findIndex(step => step.key === status);
  };

  // Helper inside Rider Simulator context to trigger custom steps
  const handleRiderTrigger = (nextStatus: Order["status"]) => {
    if (!activeOrderTrack) return;
    onAdvanceOrderStatus(activeOrderTrack.id, nextStatus);

    if (nextStatus === "Rider Reached Store") {
      alert("Geofence Match: Rider entered the 50m store radius. State auto-triggered 'Rider Reached Store'!");
    } else if (nextStatus === "Order Picked Up") {
      alert("Cargo Collected: Order picked up. Live tracking map initialized!");
    }
  };

  return (
    <div id="orders-tab-root" className="px-5 py-5 animate-fade-in pb-28">
      <div className="mb-6 text-left">
        <h2 className="text-xl font-bold text-text-primary font-sans">Live Order Hub</h2>
        <p className="text-xs text-text-secondary">Track real-time prepaid deliveries & rider telemetry</p>
      </div>

      {/* ACTIVE TRACKING PANEL (Show selected order tracking detail) */}
      {activeOrderTrack ? (
        <div className="space-y-5">
          {/* Active Orders Horizontal Selector Tab bar */}
          {activeOrders.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1.5 no-scrollbar">
              {activeOrders.map(ord => (
                <button
                  key={ord.id}
                  onClick={() => {
                    setSelectedTrackId(ord.id);
                    setGpsProgress(0);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 transition-all ${
                    selectedTrackId === ord.id 
                      ? "bg-primary border-primary text-white shadow-xs" 
                      : "bg-white border-border-custom text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {ord.id} ({ord.type})
                </button>
              ))}
            </div>
          )}

          {/* Majestic Tracking Card */}
          <div className="bg-white rounded-[28px] p-5 shadow-custom border border-[#1E6B3D]/10 text-left space-y-4 relative overflow-hidden">
            {/* Corner Decorative Aura */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-light/35 rounded-bl-full -z-10 pointer-events-none"></div>

            {/* Title / Status */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-primary px-2.5 py-1 rounded-full border border-emerald-500/10">
                  Prepaid Order Real-Time
                </span>
                <div className="min-h-[28px] mt-2 flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.h3
                      key={activeOrderTrack.status}
                      initial={{ opacity: 0, x: -10, scale: 0.95 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 20
                        },
                        ...(activeOrderTrack.status === "Looking For Rider" ? {
                          scale: [1, 1.03, 1],
                          opacity: [0.85, 1, 0.85],
                          transition: {
                            scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                            opacity: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                          }
                        } : activeOrderTrack.status === "Rider Accepted" ? {
                          scale: [1, 1.08, 1],
                          filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"],
                          transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 15,
                            duration: 0.8
                          }
                        } : {})
                      }}
                      exit={{ opacity: 0, x: 10, scale: 0.95, transition: { duration: 0.15 } }}
                      className="text-sm font-black text-text-primary flex items-center gap-1.5"
                    >
                      {activeOrderTrack.status === "Order Confirmed" && "✓ Store Confirming Receipt"}
                      {activeOrderTrack.status === "Looking For Rider" && (
                        <span className="flex items-center gap-1.5 text-amber-600">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                          </span>
                          🔍 Looking For Runner Nearby
                        </span>
                      )}
                      {activeOrderTrack.status === "Rider Assigned" && "🤝 Assisting Assigned Runner"}
                      {activeOrderTrack.status === "Rider Accepted" && (
                        <span className="flex items-center gap-1.5 text-primary">
                          <motion.span 
                            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                            transition={{ duration: 0.6, repeat: 2, repeatDelay: 3 }}
                            className="inline-block"
                          >
                            🛵
                          </motion.span>
                          Captain Heading to Merchant
                        </span>
                      )}
                      {activeOrderTrack.status === "Rider Reached Store" && "🥘 Captain Assembling Cargo at Store"}
                      {activeOrderTrack.status === "Order Picked Up" && "📦 Cargo Sourced & Verified"}
                      {activeOrderTrack.status === "Out For Delivery" && `🚴 Moving on Road • ETA ${etaRemaining} min`}
                      {activeOrderTrack.status === "Arriving Soon" && "🔔 Captain Rohan is at gate ring!"}
                      {activeOrderTrack.status === "Delivered" && "🛍 delivered with smile"}
                    </motion.h3>
                  </AnimatePresence>
                </div>
                <p className="text-[11px] text-text-secondary mt-1">Order Ref: <strong>{activeOrderTrack.id}</strong> • From {activeOrderTrack.merchantName}</p>
              </div>
              <span className="text-xs font-mono font-bold bg-canvas px-2.5 py-1 rounded-lg text-text-secondary">
                {activeOrderTrack.type}
              </span>
            </div>

            {/* LIVE GPS VECTOR MAP CONTAINER (Visible after lookup status) */}
            {getActiveStepIndex(activeOrderTrack.status) >= 2 && (
              <div className="bg-[#FAFBF9] rounded-2xl p-3 border border-border-custom/40 space-y-2.5 relative">
                {/* Micro Telemetry Header */}
                <div className="flex justify-between items-center text-[10px] font-mono text-text-secondary border-b border-border-custom/30 pb-2">
                  <span className="flex items-center gap-1 text-[#1E6B3D] font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Live GPS Streaming
                  </span>
                  <span>Coords: {riderCoords.lat.toFixed(5)}°N, {riderCoords.lng.toFixed(5)}°E</span>
                </div>

                {/* Vector Canvas Rendering */}
                <div className="h-[120px] bg-[#E9EFE6] rounded-xl relative overflow-hidden flex items-center justify-center border border-border-custom/20">
                  {/* Grid Lines mockup */}
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 opacity-15 pointer-events-none">
                    {Array.from({ length: 18 }).map((_, idx) => (
                      <div key={idx} className="border-t border-l border-emerald-900/60 w-full h-full"></div>
                    ))}
                  </div>

                  {/* SVG Route Path */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    {/* The curves representation */}
                    <path 
                      d="M 40 70 Q 150 20 180 60 T 320 50" 
                      fill="none" 
                      stroke="#CBD5E1" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                    />
                    <path 
                      d="M 40 70 Q 150 20 180 60 T 320 50" 
                      fill="none" 
                      stroke="#1E6B3D" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeDasharray="6,4"
                      className="animate-[dash_20s_linear_infinite]"
                      style={{
                        strokeDashoffset: -gpsProgress
                      }}
                    />
                  </svg>

                  {/* Store Pin (Left) */}
                  <div className="absolute left-[30px] top-[50px] flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md text-[10px] font-black border border-white">
                      🏪
                    </div>
                    <span className="text-[7.5px] font-black bg-white/95 px-1 py-0.25 rounded border mt-0.5 truncate max-w-[50px]">
                      {activeOrderTrack.merchantName}
                    </span>
                  </div>

                  {/* Customer Pin (Right) */}
                  <div className="absolute left-[305px] top-[30px] flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md text-[10px] font-black border border-white animate-bounce">
                      📍
                    </div>
                    <span className="text-[7.5px] font-black bg-white/95 px-1 py-0.25 rounded border mt-0.5 whitespace-nowrap">
                      Home
                    </span>
                  </div>

                  {/* Rider Pin (Moving dynamically along path) */}
                  {activeOrderTrack.status !== "Delivered" && (
                    <div 
                      className="absolute flex flex-col items-center transition-all duration-500"
                      style={{
                        left: `${currentCoords.x - 12}px`,
                        top: `${currentCoords.y - 30}px`
                      }}
                    >
                      <div className="w-7 h-7 bg-primary text-white rounded-full shadow-lg border-2 border-white flex items-center justify-center flex-col scale-110">
                        <Bike size={14} className="animate-pulse" />
                      </div>
                      <span className="text-[8px] font-black bg-primary text-white px-1.5 py-0.25 rounded shadow-xs mt-0.5">
                        Rider ({gpsProgress}%)
                      </span>
                    </div>
                  )}
                </div>

                {/* Distance / ETA stats bar */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-white p-2 rounded-xl border border-border-custom/25">
                    <p className="text-[8px] uppercase tracking-wider text-text-secondary">Rider ETA</p>
                    <p className="text-[13px] font-black text-[#1E6B3D]">
                      {activeOrderTrack.status === "Delivered" ? "Delivered" : `${etaRemaining} Mins away`}
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-border-custom/25">
                    <p className="text-[8px] uppercase tracking-wider text-text-secondary">Distance</p>
                    <p className="text-[13px] font-black text-text-primary">
                      {activeOrderTrack.status === "Delivered" ? "0.0 km" : `${distanceRemaining} km remains`}
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-border-custom/25">
                    <p className="text-[8px] uppercase tracking-wider text-text-secondary">Rider Speed</p>
                    <p className="text-[13px] font-black text-primary">
                      {activeOrderTrack.status === "Out For Delivery" ? "28 km/h" : "0 km/h (Store)"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rider profile card */}
            {activeOrderTrack.riderName && (
              <div className="border border-border-custom/40 bg-canvas/30 rounded-2xl p-3 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-border-custom bg-white">
                    <ImageComponent 
                      src={activeOrderTrack.riderPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"} 
                      alt={activeOrderTrack.riderName} 
                      fallbackName={activeOrderTrack.riderName}
                      fallbackType="avatar"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] text-text-secondary tracking-wide flex items-center gap-1 font-bold">
                      <Sparkles size={10} className="text-primary fill-primary" /> Assigned Captain
                    </p>
                    <p className="font-extrabold text-text-primary leading-tight mt-0.5">{activeOrderTrack.riderName}</p>
                    <p className="text-[9.5px] text-text-secondary leading-tight mt-0.5">Suzuki Access • HP-47-D-4890</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="p-2.5 bg-white border border-border-custom rounded-xl hover:bg-border-custom text-primary shadow-xs transition-colors cursor-pointer"
                    title="Chat with Captain"
                  >
                    <MessageSquare size={14} />
                  </button>
                  <a 
                    href={`tel:${activeOrderTrack.riderPhone || "+91-98160-54321"}`}
                    className="p-2.5 bg-primary text-white rounded-xl shadow-xs hover:opacity-95 transition-all flex items-center justify-center"
                    title="Call Captain"
                  >
                    <Phone size={14} />
                  </a>
                </div>
              </div>
            )}

            <div className="bg-[#EDF7EF] p-2 rounded-xl text-[11px] text-[#1E6B3D] leading-relaxed">
              📃 Bill total ₹{activeOrderTrack.total} PAID via secure prepaid UPI (Ref: {activeOrderTrack.upiRef || "UPI-MOCKED-REF"}). Cash options strictly disabled.
            </div>

            {/* ORDER PROCESS MILESTONES TIMELINE */}
            <div className="border-t border-border-custom/40 pt-4 text-left space-y-3">
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-wider block">Real-Time Timeline</p>
              
              <div className="relative pl-5 space-y-4">
                {/* Connecting vertical status line */}
                <div className="absolute left-1.5 top-2.5 bottom-2 w-0.5 bg-canvas"></div>
                
                {orderStatesList.map((step, idx) => {
                  const currentStepIdx = getActiveStepIndex(activeOrderTrack.status);
                  const isDone = idx < currentStepIdx;
                  const isActive = idx === currentStepIdx;

                  if (idx > currentStepIdx + 1 && !isDone) return null; // Only keep next incoming step visible to maintain compact visual size

                  return (
                    <motion.div 
                      key={step.key} 
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="relative flex gap-3 text-xs leading-none"
                    >
                      {/* Circle marker */}
                      <motion.div 
                        animate={isActive ? {
                          scale: [1, 1.25, 1],
                          borderColor: ["#1E6B3D", "#10B981", "#1E6B3D"],
                          transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                        } : {}}
                        className={`absolute -left-5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isDone 
                            ? "bg-[#1E6B3D] border-[#1E6B3D] text-white" 
                            : isActive 
                            ? "bg-white border-[#1E6B3D] text-[#1E6B3D] shadow-xs" 
                            : "bg-white border-border-custom text-text-secondary"
                        }`}
                      >
                        {isDone && <Check size={8} strokeWidth={4} />}
                      </motion.div>

                      <div className="pl-1 text-left">
                        <motion.p 
                          animate={isActive ? {
                            color: ["#1E6B3D", "#10B981", "#1E6B3D"],
                            transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                          } : {}}
                          className={`font-black text-[11px] ${isActive ? "text-[#1E6B3D] text-[11.5px]" : isDone ? "text-text-primary" : "text-text-secondary"}`}
                        >
                          {step.label} {isActive && "• Live Progress"}
                        </motion.p>
                        <p className="text-[9px] text-text-secondary mt-0.5">{step.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ACTIVE ORDER CONTROLS */}
            <div className="pt-3 border-t border-border-custom/45 flex justify-end gap-2 text-xs">
              <button
                onClick={() => onCancelOrder(activeOrderTrack.id)}
                className="px-3.5 py-1.5 bg-rose-50 text-rose-600 rounded-xl font-bold active:scale-95 transition-all hover:bg-rose-100 cursor-pointer"
              >
                Cancel Box
              </button>
            </div>
          </div>

          {/* RIDER-SIDE PERSPECTIVE simulation Panel */}
          <div className="bg-slate-900 text-white rounded-[24px] p-5 text-left border border-slate-700/50 shadow-md space-y-3 relative overflow-hidden">
            {/* Background vehicle overlay */}
            <div className="absolute -bottom-4 -right-4 w-28 h-28 opacity-[0.03] text-white pointer-events-none">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-full h-full"
              >
                {/* Rear Wheel */}
                <circle cx="6" cy="17" r="2.5" />
                <circle cx="6" cy="17" r="0.75" fill="currentColor" />
                
                {/* Front Wheel */}
                <circle cx="18" cy="17" r="2.5" />
                <circle cx="18" cy="17" r="0.75" fill="currentColor" />
                
                {/* Floorboard / Deck */}
                <path d="M8.5 17h6.5c0.8 0 1.2-0.4 1.2-1.2v-1" />
                
                {/* Chassis / Body */}
                <path d="M6 14.5c0-2.5 1.5-3.5 3.5-3.5h3c1 0 1.5 0.5 1.5 1.5v2" />
                
                {/* Premium Seat */}
                <path d="M7.5 11h4.5c0.8 0 1.2-0.4 1.2-1v-0.5" />
                
                {/* Steering Fork & Front Fender */}
                <path d="M18 14.5l-2.5-7.5" />
                
                {/* Front Cowl & Handlebar */}
                <path d="M15.5 7h-2.5" />
                <path d="M12.5 6h4.5" />
              </svg>
            </div>

            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Smartphone size={16} className="text-primary animate-pulse" />
              <div className="text-left">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-100">Rider App Simulator Panel</h4>
                <p className="text-[9px] text-slate-400">Interact as the assigned driver Rohan Thakur</p>
              </div>
            </div>

            <p className="text-[10px] text-slate-300 leading-normal">
              Execute location telemetry GPS triggers directly to advance the customer's viewport immediately.
            </p>

            <div className="flex flex-wrap gap-1.5">
              {activeOrderTrack.status === "Order Confirmed" && (
                <button
                  onClick={() => handleRiderTrigger("Looking For Rider")}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 rounded-lg flex items-center gap-1 cursor-pointer active:scale-95 transition-all text-left"
                >
                  🔍 Advance to looking for rider
                </button>
              )}

              {activeOrderTrack.status === "Looking For Rider" && (
                <button
                  onClick={() => handleRiderTrigger("Rider Accepted")}
                  className="px-2.5 py-2 bg-[#1E6B3D] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer active:scale-95 transition-all text-left"
                >
                  🚴 Accept Order (Match Rohan Thakur)
                </button>
              )}

              {activeOrderTrack.status === "Rider Accepted" && (
                <button
                  onClick={() => handleRiderTrigger("Rider Reached Store")}
                  className="px-2.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer active:scale-95 transition-all text-left"
                >
                  📏 Enter Store Geofence Radius (50m)
                </button>
              )}

              {activeOrderTrack.status === "Rider Reached Store" && (
                <button
                  onClick={() => handleRiderTrigger("Order Picked Up")}
                  className="px-2.5 py-2 bg-emerald-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer active:scale-95 transition-all text-left"
                >
                  📦 Mark Order Collected & Sourced
                </button>
              )}

              {activeOrderTrack.status === "Order Picked Up" && (
                <button
                  onClick={() => handleRiderTrigger("Out For Delivery")}
                  className="px-2.5 py-2 bg-[#1E6B3D] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer active:scale-95 transition-all text-left"
                >
                  🚀 Leave Store and Trigger Live GPS
                </button>
              )}

              {activeOrderTrack.status === "Out For Delivery" && (
                <div className="w-full text-center py-1 border border-dashed border-slate-700 rounded-lg text-slate-400 text-[9.5px]">
                  Rider is driving. Coordinate streaming matches: <strong>{gpsProgress}%</strong> complete...
                </div>
              )}

              {activeOrderTrack.status === "Arriving Soon" && (
                <button
                  onClick={() => handleRiderTrigger("Delivered")}
                  className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer active:scale-95 transition-all text-left w-full text-center Block font-black"
                >
                  🎁 Hand Over package to Customer
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[24px] p-6 text-center shadow-sm border border-dashed border-border-custom mb-6 py-10 animate-fade-in text-left flex flex-col items-center">
          <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mb-3 text-primary">
            <Package size={22} />
          </div>
          <h3 className="text-sm font-bold text-text-primary text-center">No Active Orders Trackable</h3>
          <p className="text-xs text-text-secondary text-center mt-1">
            Prepaid orders you place from Chamba stores appear here instantly! Choose some groceries, medicals, or foods, then check out securely via instant UPI.
          </p>
        </div>
      )}

      {/* HISTORICAL PAST DELIVERIES */}
      {pastOrders.length > 0 && (
        <div className="mt-6 text-left">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5">Historical Log Entries</p>
          <div className="space-y-3">
            {pastOrders.map((order) => {
              const setup = getIconForType(order.type);
              const isCompleted = order.status === "Delivered";

              return (
                <div key={order.id} className="bg-white p-4 rounded-[20px] shadow-sm hover:scale-[1.01] transition-transform border border-border-custom/35 text-left">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`${setup.bg} ${setup.color} p-2 rounded-xl`}>
                        <setup.icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text-primary">{order.merchantName}</h4>
                        <p className="text-[10px] text-text-secondary mt-0.5">{order.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-text-primary">₹{order.total}</p>
                      <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        isCompleted ? "bg-[#EDF7EF] text-primary" : "bg-red-50 text-red-600"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-[10.5px] text-text-secondary flex justify-between items-center bg-canvas/35 p-2.5 rounded-xl border border-border-custom/20">
                    <span className="truncate max-w-[210px] font-medium">{order.itemsSummary}</span>
                    <span className="font-mono text-[9px] font-bold text-text-secondary shrink-0">{order.id}</span>
                  </div>

                  {/* Reorder section for purchases */}
                  {(order.type === "Food" || order.type === "Grocery" || order.type === "Medicine") && onReorder && (
                    <div className="mt-3.5 pt-3 border-t border-dashed border-border-custom/30 flex justify-end">
                      <button
                        onClick={() => onReorder(order)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1E6B3D]/[0.08] hover:bg-[#1E6B3D]/[0.12] border border-[#1E6B3D]/[0.1] text-[#1E6B3D] hover:scale-[1.02] active:scale-[0.98] transition-all text-[10.5px] font-bold rounded-lg cursor-pointer"
                      >
                        <RotateCcw size={12} className="stroke-[2.5]" />
                        <span>Reorder Items</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SIMULATED IN-APP CHAT VIEW */}
      {isChatOpen && activeOrderTrack && (
        <div className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-surface rounded-3xl w-full max-w-sm h-[420px] shadow-2xl flex flex-col overflow-hidden animate-[zoomIn_120ms_ease-out]">
            {/* Header info */}
            <div className="bg-primary p-4 text-white flex justify-between items-center text-left shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden border border-white/20">
                  <ImageComponent 
                    src={activeOrderTrack.riderPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"} 
                    alt={activeOrderTrack.riderName} 
                    fallbackName={activeOrderTrack.riderName}
                    fallbackType="avatar"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h4 className="text-xs font-black">{activeOrderTrack.riderName}</h4>
                  <p className="text-[9px] text-white/80 uppercase font-bold tracking-widest">Active Rider • Direct Chat</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-canvas/40 space-y-3 flex flex-col">
              {chatMessages.map((msg, idx) => {
                const isRider = msg.sender === "rider";
                return (
                  <div 
                    key={idx} 
                    className={`max-w-[80%] rounded-[20px] p-3 text-xs leading-normal shadow-xs ${
                      isRider 
                        ? "bg-white text-text-primary self-start rounded-bl-none text-left" 
                        : "bg-primary text-white self-end rounded-br-none text-left"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className={`text-[8px] mt-1 block text-right font-medium opacity-60`}>
                      {msg.time}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-border-custom flex gap-2 shrink-0">
              <input 
                type="text" 
                placeholder="Type your message for skipper..."
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-canvas text-xs px-3 py-2.5 rounded-xl border border-border-custom focus:outline-none focus:border-primary text-text-primary"
              />
              <button 
                onClick={handleSendMessage}
                className="bg-primary hover:bg-primary/95 text-white text-xs font-black px-4.5 rounded-xl active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
