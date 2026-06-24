import React, { useState } from "react";
import { 
  ArrowLeft, 
  TrendingUp, 
  Coins, 
  ShoppingBag, 
  Car, 
  MessageSquare, 
  CheckCircle, 
  X, 
  FolderOpen,
  AlertTriangle,
  Eye,
  Package,
  Wrench,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Info,
  MapPin,
  Lock,
  Settings
} from "lucide-react";
import { Order } from "../types";
import { safeStorage } from "../utils/safeStorage";

const MAPPING_PROVIDER = "OpenStreetMap / Leaflet";

interface AdminPanelProps {
  orders: Order[];
  onAdvanceOrderStatus: (id: string, customStatus?: string) => void;
  onCancelOrder: (id: string) => void;
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  orders,
  onAdvanceOrderStatus,
  onCancelOrder,
  onBack
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"analytics" | "orders" | "rides" | "customs" | "feedback" | "enquiries" | "developer">("analytics");

  // Load from LocalStorage
  const getFeedbackStats = () => {
    try {
      const saved = safeStorage.getItem("bluber_ride_demand_v1");
      return saved ? JSON.parse(saved) : { yes: 14, no: 3 };
    } catch {
      return { yes: 14, no: 3 };
    }
  };

  // Load custom orders from LocalStorage mapped to React State
  const [customOrders, setCustomOrders] = useState<any[]>(() => {
    try {
      const saved = safeStorage.getItem("bluber_custom_orders");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { 
        id: "CUST-304", 
        customerName: "Rahul Sharma", 
        phoneNumber: "+91-98160-22101", 
        description: "Requesting 6 custom local wood packaging boxes for Chamba Apples shipping", 
        status: "Accepted", 
        timestamp: "2026-06-22 10:15 AM", 
        date: "Today, 10:15 AM" 
      },
      { 
        id: "CUST-112", 
        customerName: "Sunita Sharma", 
        phoneNumber: "+91-94180-88334", 
        description: "Sourcing 250g premium local Chamba Honey & Traditional Gahat Dal", 
        status: "Completed", 
        timestamp: "2026-06-21 04:30 PM", 
        date: "Yesterday, 04:30 PM" 
      }
    ];
  });

  const handleUpdateCustomOrderStatus = (id: string, newStatus: string) => {
    const updated = customOrders.map(cust => {
      if (cust.id === id) {
        return { ...cust, status: newStatus };
      }
      return cust;
    });
    setCustomOrders(updated);
    try {
      safeStorage.setItem("bluber_custom_orders", JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage update error", e);
    }
  };

  const getRideRequests = () => {
    try {
      const saved = safeStorage.getItem("bluber_ride_requests_log");
      return saved ? JSON.parse(saved) : [
        { id: "RIDE-5812", type: "Elite Scooty Service", pickup: "Chamba Bus Stand", dropoff: "Near Chowgan Ground", fare: 120, status: "Submitted", date: "Today" },
        { id: "RIDE-9021", type: "Elite Scooty Service", pickup: "Court Road Chamba", dropoff: "Khajjiar Road Resort", fare: 1500, status: "Active", date: "Today" }
      ];
    } catch {
      return [];
    }
  };

  // Sourced Formspree local database check
  const getEnquiries = () => {
    try {
      const saved = safeStorage.getItem("bluber_enquiries");
      return saved ? JSON.parse(saved) : [
        { id: "ENQ-901", name: "Sunil Thakur", mobile: "9816401011", email: "sunil.th@gmail.com", subject: "Vendor Integration Request", message: "We want to list our organic apples store with Chamba Bluber hub", date: "Today, 10:15 AM" }
      ];
    } catch {
      return [];
    }
  };

  const feedback = getFeedbackStats();
  const rideRequests = getRideRequests();
  const enquiries = getEnquiries();

  // Statistics calculation
  const totalCompletedOrders = orders.filter(o => o.status === "Delivered").length;
  const totalRevenue = orders
    .filter(o => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.total, 0) + rideRequests.reduce((sum, r) => sum + Number(r.fare || 0), 0);

  const pendingCount = orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length;

  const handleClearAllData = () => {
    if (confirm("Reset application local simulator records back to factory defaults?")) {
      safeStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div id="admin-panel-root" className="px-5 py-5 animate-fade-in pb-28 bg-[#FAFAF9] text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-custom pb-4 mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-3 bg-white rounded-full text-text-primary hover:scale-105 active:scale-95 transition-all shadow-sm border border-border-custom/50 cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-base font-black text-text-primary">Owner Dispatch Desk</h2>
            <p className="text-[10px] uppercase font-bold tracking-widest text-primary">Bluber Operations Admin</p>
          </div>
        </div>
        <button 
          onClick={handleClearAllData}
          className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors border-none cursor-pointer"
        >
          Reset Logs
        </button>
      </div>

      {/* Sub Tabs Selection row */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 mb-5 no-scrollbar">
        {[
          { id: "analytics", label: "📊 Analytics" },
          { id: "orders", label: "🛒 Store Orders" },
          { id: "rides", label: "🏍️ Elite Rides" },
          { id: "customs", label: "📦 Customs" },
          { id: "feedback", label: "💬 Poll Responses" },
          { id: "enquiries", label: "📩 Formspree Inbox" },
          { id: "developer", label: "🛠️ Dev Tools" }
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubTab(sub.id as any)}
            className={`px-4 py-2 text-xs font-bold shrink-0 rounded-full transition-all border-none ${
              activeSubTab === sub.id 
                ? "bg-primary text-white shadow-sm" 
                : "bg-white text-text-secondary border border-border-custom/60 hover:bg-canvas cursor-pointer"
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE DESK PANELS */}

      {activeSubTab === "analytics" && (
        <div className="space-y-4">
          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4.5 rounded-[24px] border border-border-custom/40 shadow-sm text-left">
              <div className="bg-emerald-50 text-primary w-9 h-9 rounded-xl flex items-center justify-center mb-2">
                <Coins size={18} />
              </div>
              <p className="text-[10px] font-bold text-text-secondary uppercase">Gross Revenue</p>
              <h3 className="text-xl font-bold text-text-primary mt-1">₹{totalRevenue}</h3>
              <p className="text-[8px] text-emerald-600 mt-1 flex items-center gap-0.5 font-bold">
                <TrendingUp size={10} /> +24% vs yesterday
              </p>
            </div>

            <div className="bg-white p-4.5 rounded-[24px] border border-border-custom/40 shadow-sm text-left">
              <div className="bg-sky-50 text-sky-600 w-9 h-9 rounded-xl flex items-center justify-center mb-2">
                <ShoppingBag size={18} />
              </div>
              <p className="text-[10px] font-bold text-text-secondary uppercase">Total Procured</p>
              <h3 className="text-xl font-bold text-text-primary mt-1">{orders.length + customOrders.length + rideRequests.length}</h3>
              <p className="text-[8px] text-text-secondary mt-1 font-semibold">Live MVP cycles</p>
            </div>
          </div>

          {/* Demand metrics */}
          <div className="bg-white p-5 rounded-[24px] border border-border-custom/40 shadow-sm text-left">
            <h3 className="text-xs font-bold text-text-secondary uppercase mb-3">Live Fleet Dispatcher</h3>
            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-bold text-text-primary mb-1">
                  <span>Elite Scooty Pilot Pool</span>
                  <span className="text-[#22C55E]">8 Active Captains</span>
                </div>
                <div className="w-full bg-canvas h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#22C55E] h-1.5 rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-text-primary mb-1">
                  <span>Custom Courier Availability</span>
                  <span className="text-indigo-600">4 Runners Active</span>
                </div>
                <div className="w-full bg-canvas h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: "65%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Banner */}
          <div className="bg-[#EDF7EF] p-4.5 rounded-[24px] flex items-start gap-3">
            <span className="text-xl">🏔️</span>
            <div>
              <h4 className="text-xs font-bold text-[#1E6B3D]">Founder Self-Fulfillment Active</h4>
              <p className="text-[10px] text-text-secondary leading-relaxed mt-0.5 font-medium">
                Because this is Chamba's early MVP rollout, no external multi-driver marketplace is initialized. You can advance orders, approve ride inquiries, and review custom procurement requests directly.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "orders" && (
        <div className="space-y-3.5 text-left">
          <div className="flex justify-between items-center">
            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Active Bookings ({pendingCount})</p>
            <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">Prepaid Verified</span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center bg-white p-8 rounded-3xl border border-dashed border-border-custom text-text-secondary text-sm">
              No orders registered yet. Go place one in the Shop or Cart Tab!
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(ord => (
                <div key={ord.id} className="bg-white p-4.5 rounded-[24px] shadow-sm border border-border-custom/40 space-y-3 text-xs text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-text-primary text-sm">{ord.merchantName}</p>
                      <p className="text-[10px] text-text-secondary font-mono mt-0.5">ID: {ord.id} • {ord.type}</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                      ord.status === "Delivered" ? "bg-emerald-50 text-primary" : "bg-primary-light text-primary animate-pulse"
                    }`}>
                      {ord.status}
                    </span>
                  </div>

                  <div className="bg-canvas/50 p-2.5 rounded-xl text-[11px] text-text-secondary leading-relaxed font-semibold">
                    {ord.itemsSummary}
                  </div>

                  {ord.txnId && (
                    <div className="bg-canvas/80 p-2.5 rounded-xl text-[9.5px] text-text-secondary font-mono space-y-0.5 leading-relaxed">
                      <div>SECURITY TXN: <strong className="text-text-primary">{ord.txnId}</strong></div>
                      {ord.upiRef && <div>UPI REFERENCE: <strong className="text-text-primary">{ord.upiRef}</strong></div>}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span className="font-bold text-text-primary">Receipt Total: ₹{ord.total}</span>
                    <span className="text-text-secondary font-semibold">{ord.date}</span>
                  </div>

                  {ord.status !== "Delivered" && ord.status !== "Cancelled" && (
                    <div className="pt-2 border-t border-border-custom/40 flex justify-end gap-2 text-xs">
                      <button
                        onClick={() => onCancelOrder(ord.id)}
                        className="px-3.5 py-1.5 bg-rose-50 text-rose-600 rounded-xl font-bold active:scale-95 transition-all cursor-pointer border-none"
                      >
                        Cancel Order
                      </button>
                      <button
                        onClick={() => onAdvanceOrderStatus(ord.id)}
                        className="px-4 py-1.5 bg-primary text-white rounded-xl font-bold active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer hover:bg-[#1E6B3D] border-none"
                      >
                        Advance Cycle ➔
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === "rides" && (
        <div className="space-y-3.5 text-left">
          <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Logged Scooty Service Requests</p>
          
          {rideRequests.length === 0 ? (
            <p className="text-center text-xs text-text-secondary py-10 bg-white rounded-3xl border border-dashed border-border-custom">No ride requests found.</p>
          ) : (
            <div className="space-y-2.5">
              {rideRequests.map((ride: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-border-custom/50 text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Elite Scooty Service
                    </span>
                    <span className="text-[11px] font-black text-primary">₹{ride.fare}</span>
                  </div>
                  
                  <div className="space-y-0.5 text-[11px] text-text-secondary">
                    <p><strong className="text-text-primary font-bold">Pickup:</strong> {ride.pickup}</p>
                    <p><strong className="text-text-primary font-bold">Dropoff:</strong> {ride.dropoff}</p>
                  </div>
                  
                  <p className="text-[9px] text-text-secondary mt-2.5 pt-1.5 border-t border-border-custom/30 font-mono text-right">
                    Prepaid Dispatch Verified • Auto-Logged
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === "customs" && (
        <div className="space-y-3.5 text-left">
          <div className="flex justify-between items-center">
            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Custom Procurement Inquiries</p>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">Concierge Service Log</span>
          </div>
          
          {customOrders.length === 0 ? (
            <p className="text-center text-xs text-text-secondary py-10 bg-white rounded-3xl border border-dashed border-border-custom">No custom requests logged yet.</p>
          ) : (
            <div className="space-y-3.5">
              {customOrders.map((cust: any, index: number) => {
                const statusColors: any = {
                  Pending: "bg-amber-50 text-amber-700 border-amber-200",
                  Accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  Rejected: "bg-rose-50 text-rose-700 border-rose-100",
                  Completed: "bg-indigo-50 text-indigo-700 border-indigo-200"
                };
                const currentStatus = cust.status || "Pending";
                const badgeStyle = statusColors[currentStatus] || "bg-gray-50 text-gray-700 border-gray-200";

                return (
                  <div key={index} className="bg-white p-4.5 rounded-3xl shadow-sm border border-border-custom/50 text-xs space-y-3">
                    {/* Top Row: Case ID & Status */}
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[9px] font-bold text-text-secondary bg-canvas px-2.25 py-1 rounded-md">
                        🎫 {cust.id || `CUST-${Math.floor(100 + index * 10)}`}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${badgeStyle}`}>
                        {currentStatus}
                      </span>
                    </div>

                    {/* Customer Details info block */}
                    <div className="bg-[#FAFAF9]/90 p-3 rounded-2xl border border-border-custom/30 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary text-[10px]">Contact Person:</span>
                        <span className="font-extrabold text-text-primary text-[10px]">{cust.customerName || "Precompiled Guest"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary text-[10px]">Phone Number:</span>
                        <a href={`tel:${cust.phoneNumber}`} className="font-bold text-primary hover:underline text-[10px]">{cust.phoneNumber || "+91-98782-99015"}</a>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-border-custom/20 text-[9px]">
                        <span className="text-text-secondary">Created:</span>
                        <span className="font-mono text-text-primary font-bold">{cust.timestamp || cust.date || "Just now"}</span>
                      </div>
                    </div>

                    {/* Request Description */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-text-secondary">Description:</span>
                      <p className="text-text-primary text-[11px] font-medium leading-relaxed bg-indigo-50/20 p-3 rounded-xl border border-indigo-100/30 italic">
                        "{cust.description}"
                      </p>
                    </div>

                    {/* Status Modifiers Row */}
                    <div className="pt-2.5 border-t border-border-custom/30 flex flex-wrap justify-end gap-1.5 align-middle">
                      <span className="text-[9.5px] font-bold text-text-secondary self-center mr-auto text-[8.5px] uppercase">Mark Action:</span>
                      
                      {currentStatus !== "Accepted" && currentStatus !== "Completed" && (
                        <button
                          onClick={() => handleUpdateCustomOrderStatus(cust.id, "Accepted")}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition-colors cursor-pointer border-none"
                        >
                          Accept
                        </button>
                      )}

                      {currentStatus !== "Rejected" && currentStatus !== "Completed" && (
                        <button
                          onClick={() => handleUpdateCustomOrderStatus(cust.id, "Rejected")}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg transition-colors cursor-pointer border-none"
                        >
                          Reject
                        </button>
                      )}

                      {currentStatus !== "Completed" && (
                        <button
                          onClick={() => handleUpdateCustomOrderStatus(cust.id, "Completed")}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors cursor-pointer border-none"
                        >
                          Complete ✓
                        </button>
                      )}
                      
                      {currentStatus === "Completed" && (
                        <span className="text-[10px] text-emerald-600 font-bold py-1 flex items-center gap-1">
                          ✓ Fulfilled & Settled
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeSubTab === "feedback" && (
        <div className="space-y-4 text-left">
          <div className="bg-white rounded-3xl p-5 border border-border-custom/40 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-text-secondary uppercase">
               "Ride Demand Poll" (Coming Soon Popup responses)
            </h3>
            
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              We capture whether Chamba visitors & locals would utilize local ride-sharing. Here are the live simulated responses:
            </p>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="bg-[#EDF7EF] p-4 rounded-2xl text-center">
                <ThumbsUp size={24} className="text-primary mx-auto mb-1" />
                <h4 className="text-lg font-black text-primary">{feedback.yes}</h4>
                <p className="text-[9px] font-extrabold uppercase text-text-secondary mt-0.5">Voted YES</p>
              </div>

              <div className="bg-rose-50 p-4 rounded-2xl text-center">
                <ThumbsDown size={24} className="text-rose-600 mx-auto mb-1" />
                <h4 className="text-lg font-black text-rose-600">{feedback.no}</h4>
                <p className="text-[9px] font-extrabold uppercase text-text-secondary mt-0.5">Voted NO</p>
              </div>
            </div>

            {/* Simulated bar chart representation */}
            <div className="pt-2">
              <div className="flex justify-between text-[10px] font-bold text-text-secondary mb-1">
                <span>YES ({Math.round((feedback.yes / (feedback.yes + feedback.no || 1)) * 100)}%)</span>
                <span>NO ({Math.round((feedback.no / (feedback.yes + feedback.no || 1)) * 100)}%)</span>
              </div>
              <div className="w-full bg-rose-200 h-3 rounded-full flex overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all" 
                  style={{ width: `${(feedback.yes / (feedback.yes + feedback.no || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "enquiries" && (
        <div className="space-y-3.5 text-left">
          <div className="flex justify-between items-center">
            <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Formspree Direct Submissions Inbox</p>
            <span className="text-[9px] bg-emerald-50 text-primary px-2 py-0.5 rounded-full font-bold">Destination: nitishkaushal17@gmail.com</span>
          </div>

          {enquiries.length === 0 ? (
            <p className="text-center text-xs text-text-secondary py-10 bg-white rounded-3xl border border-dashed border-border-custom">No enquiries submitted via Formspree yet.</p>
          ) : (
            <div className="space-y-3">
              {enquiries.map((enq: any, i: number) => (
                <div key={i} className="bg-white p-4.5 rounded-[24px] border border-border-custom/40 shadow-xs space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-extrabold text-[10px] text-text-primary">{enq.name}</span>
                    <span className="text-[9px] font-mono text-text-secondary">{enq.date}</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-text-secondary bg-canvas p-2 rounded-xl">
                      <div>📞 {enq.mobile}</div>
                      <div>✉️ {enq.email}</div>
                    </div>
                    <div className="pt-1.5">
                      <p className="font-black text-text-primary text-[11px] uppercase">SUBJ: {enq.subject}</p>
                      <p className="text-text-secondary text-[11px] italic mt-1 leading-relaxed bg-[#F5F8F6] p-3 rounded-xl border border-emerald-500/10">
                        "{enq.message}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === "developer" && (
        <div className="space-y-4 text-left animate-fade-in">
          <div className="bg-white rounded-[24px] p-5 shadow-xs border border-border-custom space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Settings className="text-primary w-4.5 h-4.5 animate-[spin_5s_linear_infinite]" />
              <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">System Settings & Mapping Diagnostics</h3>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border bg-slate-50 border-emerald-500/10">
              <div className="p-2 rounded-full bg-emerald-100 text-emerald-700">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-text-primary">
                  Status: ✅ Active & Production-Ready
                </p>
                <p className="text-[10px] text-text-secondary mt-0.5">
                  The application has been successfully migrated to open-source geolocation services. No API key or credit card is required.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <p className="text-[10px] font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[9px]">✓</span>
                  Map Engine
                </p>
                <p className="text-[11px] text-text-secondary ml-5 mt-0.5">
                  Leaflet.js v1.9.4 rendering CartoDB Voyager raster tiles. Responsive zoom and pan controls.
                </p>
              </div>

              <div className="border-t border-border-custom/55 pt-3">
                <p className="text-[10px] font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[9px]">✓</span>
                  Geocoding & Autocomplete API
                </p>
                <p className="text-[11px] text-text-secondary ml-5 mt-0.5">
                  Nominatim OpenStreetMap Geocoding API. Performs reverse-geocoding of map clicks and real-time query suggestions.
                </p>
              </div>

              <div className="border-t border-border-custom/55 pt-3">
                <p className="text-[10px] font-black text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[9px]">✓</span>
                  Route Calculations
                </p>
                <p className="text-[11px] text-text-secondary ml-5 mt-0.5">
                  OSRM (Open Source Routing Machine). Computes driving distance and route paths between pickup and destination dynamically.
                </p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-[10px] text-emerald-800 text-left leading-relaxed flex gap-2">
              <Info size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Maintenance:</strong> The Leaflet + OSM stack eliminates pricing limits and billing accounts. Customers enjoy continuous, uninterrupted booking services.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
