import React, { useState } from "react";
import { 
  User, 
  MapPin, 
  HelpCircle, 
  CheckCircle, 
  ArrowRight, 
  ChevronRight, 
  Wrench, 
  Coins,
  ShieldCheck,
  Cpu,
  Sliders,
  Car,
  ShoppingBag,
  Clock
} from "lucide-react";

interface ProfileTabProps {
  walletBalance: number;
  onTopUpWallet: (amount: number) => void;
  onEnterAdmin: () => void;
  orders: any[];
  onViewAllOrders: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  walletBalance,
  onTopUpWallet,
  onEnterAdmin,
  orders,
  onViewAllOrders
}) => {
  const [supportText, setSupportText] = useState("");
  const [supportCategory, setSupportCategory] = useState("Rides");
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportText.trim()) return;

    const generatedId = `TKT-${Math.floor(100 + Math.random() * 900)}`;
    setTicketId(generatedId);
    setSupportText("");
  };

  const handleQuickRecharge = (amount: number) => {
    onTopUpWallet(amount);
    alert(`Successfully credited ₹${amount} into your Bluber Pay wallet balance! App state saved locally.`);
  };

  return (
    <div id="profile-tab-root" className="px-5 py-5 animate-fade-in pb-28 text-left">
      {/* Visual Header */}
      <div className="flex items-center gap-4 border-b border-border-custom pb-6 mb-6">
        <div className="relative">
          <div className="w-16 h-16 bg-[#1E6B3D] rounded-full text-white flex items-center justify-center font-bold text-xl uppercase shadow-md">
            GT
          </div>
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></span>
        </div>
        <div>
          <h2 className="text-base font-bold text-text-primary">Guest Chamba Member</h2>
          <p className="text-xs text-text-secondary">NitishKaushal17@gmail.com</p>
          <span className="inline-block mt-1 bg-primary-light text-primary text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Elite Resident Tier
          </span>
        </div>
      </div>

      {/* Admin Panel Entry Link */}
      <div className="bg-indigo-50 border border-indigo-200/60 rounded-3xl p-5 mb-6 flex items-start gap-3.5 shadow-sm text-left">
        <div className="bg-indigo-600 text-white p-2.5 rounded-2xl">
          <Sliders size={20} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">Operations Desk</h4>
          <p className="text-[10px] text-indigo-800/80 leading-relaxed font-semibold">
            Monitor and process active shopping dispatch logs, ride-matching analytics, custom inquiries, and customer sentiment feedback polls.
          </p>
          <button 
            type="button"
            onClick={onEnterAdmin}
            className="text-[11px] font-black hover:opacity-95 text-white bg-indigo-600 px-4 py-2 rounded-xl flex items-center gap-1 active:scale-95 transition-transform cursor-pointer border-none"
          >
            Launch Dispatch Panel ➔
          </button>
        </div>
      </div>

      {/* Wallet Balance & Instant Recharge */}
      <div className="bg-white rounded-[28px] p-5 shadow-custom border border-border-custom/40 mb-6 text-left space-y-4">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <Coins size={16} className="text-amber-500" />
          Bluber Pay Wallet Cash
        </h3>
        
        <div className="flex justify-between items-center bg-canvas p-4 rounded-2xl border border-border-custom/30">
          <div>
            <p className="text-[10px] font-bold text-text-secondary uppercase">Available Balance</p>
            <p className="text-2xl font-black text-primary mt-1">₹{walletBalance}</p>
          </div>
          <span className="bg-[#EDF7EF] text-[9px] font-black text-primary px-3 py-1 rounded-full uppercase tracking-widest border border-primary/10">
            Secure Wallet
          </span>
        </div>

        <div>
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wide mb-2">Instant Recharge Amount:</p>
          <div className="grid grid-cols-3 gap-2">
            {[100, 500, 1000].map(amt => (
              <button
                key={amt}
                onClick={() => handleQuickRecharge(amt)}
                className="bg-white hover:bg-[#EDF7EF]/30 border border-border-custom text-text-primary text-[11px] font-extrabold py-2.5 rounded-xl transition-all cursor-pointer select-none active:scale-95 text-center block border-none"
              >
                + ₹{amt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white rounded-[28px] p-5 shadow-custom border border-border-custom/40 mb-6 text-left">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
            <Clock size={16} className="text-primary animate-pulse" />
            Recent Activity Log
          </h3>
          <button 
            type="button"
            onClick={onViewAllOrders}
            className="text-[10px] font-extrabold text-primary hover:underline cursor-pointer bg-primary-light/35 px-2.5 py-0.75 rounded-full border-none"
          >
            Detailed View ➔
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-6 bg-canvas rounded-2xl border border-dashed border-border-custom/80 text-xs text-text-secondary font-medium">
            No recent activity found. Make a delivery request to start!
          </div>
        ) : (
          <div className="grid gap-2.5">
            {orders.slice(0, 3).map((ord) => (
              <div 
                key={ord.id} 
                onClick={onViewAllOrders}
                className="bg-canvas/50 hover:bg-[#EDF7EF]/30 p-3.5 rounded-2xl flex justify-between items-center cursor-pointer transition-all border border-border-custom/25 active:scale-99"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#EDF7EF] text-primary p-2 rounded-xl shrink-0">
                    {ord.type === "Ride" ? <Car size={18} /> : <ShoppingBag size={18} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-text-primary leading-tight truncate">{ord.merchantName}</h4>
                    <p className="text-[9.5px] text-text-secondary leading-none mt-1 truncate">{ord.date} • {ord.id}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-text-primary block">₹{ord.total}</span>
                  <span className={`text-[8.5px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block border ${
                    ord.status === "Delivered" || ord.status === "Completed" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                      : ord.status === "Cancelled" || ord.status === "Rejected"
                      ? "bg-rose-50 text-rose-600 border-rose-100 animate-none"
                      : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                  }`}>
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Coordinates */}
      <div className="bg-surface rounded-[24px] p-5 shadow-custom mb-6 text-left">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">Saved Coordinates</h3>
        
        <div className="space-y-3">
          {[
            { label: "Home Base Chamba", detail: "Near Chowgan square, Chamba Town, Himachal Pradesh" },
            { label: "Tourist Residency", detail: "Chamba Vista Resort, Khajjiar Lake Road" },
            { label: "Local Hub", detail: "Gandhi Chowk market gateway" }
          ].map((addr, index) => (
            <div key={index} className="flex items-start gap-3 text-xs">
              <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-text-primary leading-tight">{addr.label}</p>
                <p className="text-[11px] text-text-secondary mt-0.5 leading-tight">{addr.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Center form */}
      <div className="bg-surface rounded-[24px] p-5 shadow-custom mb-6 text-left">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
          <HelpCircle size={16} className="text-primary" />
          Partner Support & Ticket Center
        </h3>
        <p className="text-[11px] text-text-secondary leading-relaxed mb-4">
          Encountering challenges with custom rides, fresh food, or local honey deliveries? Log a ticket instantly.
        </p>

        {ticketId ? (
          <div className="p-4 bg-[#EDF7EF] rounded-xl text-center">
            <CheckCircle size={32} className="text-primary mx-auto mb-2" />
            <h4 className="text-xs font-bold text-text-primary">Ticket Registered Successfully!</h4>
            <p className="text-[10px] text-text-secondary leading-normal mt-1 mb-2">
              Lodge Case ID is <span className="font-mono font-bold text-primary">{ticketId}</span>. The Bluber dispatcher on Court road is reviewing this case.
            </p>
            <button 
              type="button"
              onClick={() => setTicketId(null)}
              className="text-[10px] text-primary font-bold hover:underline border-none bg-transparent cursor-pointer"
            >
              Log Another Ticket
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitTicket} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-text-secondary uppercase leading-none block mb-1">Issue Category</label>
              <select 
                value={supportCategory}
                onChange={(e) => setSupportCategory(e.target.value)}
                className="w-full bg-canvas text-xs px-3 py-2 border border-border-custom rounded-xl focus:outline-none focus:border-primary appearance-none cursor-pointer font-bold"
              >
                <option value="Rides">Elite Scooty Bookings</option>
                <option value="Food">Local Eating Joints Menu</option>
                <option value="Grocery">Apples & Honey Stocks</option>
                <option value="Wallet">Wallet Payments Surcharges</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-secondary uppercase leading-none block mb-1">Message Details</label>
              <textarea 
                rows={2}
                required
                placeholder="Briefly state your concern..."
                value={supportText}
                onChange={(e) => setSupportText(e.target.value)}
                className="w-full bg-canvas text-xs p-3 border border-border-custom rounded-xl focus:outline-none focus:border-primary resize-none placeholder:opacity-50"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-[#154627] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer active:scale-95 border-none"
            >
              Submit Case File
            </button>
          </form>
        )}
      </div>

      {/* Operations details, credentials */}
      <div className="text-center space-y-1.5 opacity-65 text-[11px] text-text-secondary">
        <p className="font-bold text-text-primary">BLUBER LOCAL COMMERCE v1.5.0</p>
        <p>Licensed for Chamba operations under Himachali Super App networks.</p>
        <div className="flex justify-center gap-4 pt-1 text-[10px]">
          <span className="hover:underline cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
        </div>
      </div>
    </div>
  );
};
