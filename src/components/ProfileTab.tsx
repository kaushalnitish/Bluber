import React, { useState, useEffect } from "react";
import { submitToFormspree } from "../utils/formspree";
import { 
  User, 
  MapPin, 
  HelpCircle, 
  CheckCircle, 
  ArrowRight, 
  ChevronRight, 
  Coins,
  ShieldCheck,
  ShoppingBag,
  Clock,
  Mail,
  Award,
  Edit2,
  Plus,
  History,
  Gift,
  Utensils,
  Bike,
  FileText,
  Home,
  Briefcase,
  PlusCircle,
  Gem,
  Users,
  Ticket,
  Phone,
  AlertTriangle,
  FileQuestion,
  Lock,
  Languages,
  LogOut,
  ChevronDown,
  ChevronUp,
  Copy,
  Info
} from "lucide-react";

interface ProfileTabProps {
  walletBalance: number;
  onTopUpWallet: (amount: number) => void;
  onEnterAdmin?: () => void; // Made optional to clean operations/analytics from client
  orders: any[];
  onViewAllOrders: () => void;
  userProfile: { name: string; phone: string; email: string };
  onUpdateProfile: (profile: { name: string; phone: string; email: string }) => void;
  savedAddresses: Array<{ id: string; type: string; label: string; detail: string }>;
  onUpdateAddresses: (addresses: Array<{ id: string; type: string; label: string; detail: string }>) => void;
  user?: { uid: string; name: string; email: string; phone: string; photoURL?: string } | null;
  onRequireAuth?: (pendingAction?: any) => void;
  onLogout?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  walletBalance,
  onTopUpWallet,
  orders,
  onViewAllOrders,
  userProfile,
  onUpdateProfile,
  savedAddresses,
  onUpdateAddresses,
  user,
  onRequireAuth,
  onLogout
}) => {
  // 1. Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(userProfile.name);
  const [profileEmail, setProfileEmail] = useState(userProfile.email);
  const [profilePhone, setProfilePhone] = useState(userProfile.phone);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  useEffect(() => {
    setProfileName(userProfile.name || user?.name || "");
    setProfileEmail(userProfile.email || user?.email || "");
    setProfilePhone(userProfile.phone || user?.phone || "");
  }, [userProfile, user]);


  // 3. Wallet State
  const [customRechargeAmount, setCustomRechargeAmount] = useState("");
  const [walletTxns, setWalletTxns] = useState<any[]>([
    { id: "TXN-882", type: "Recharge", amount: 1000, date: "Today, 10:45 AM", method: "UPI Pay" },
    { id: "TXN-711", type: "Ride Fare", amount: -120, date: "Yesterday, 06:12 PM", method: "Wallet" },
    { id: "TXN-405", type: "Grocery Order", amount: -450, date: "22 Jun 2026, 01:22 PM", method: "Wallet" }
  ]);
  const [cashbackBalance, setCashbackBalance] = useState(140);
  const [walletSuccessMsg, setWalletSuccessMsg] = useState("");

  // 4. Order segmentation
  const [selectedOrderTab, setSelectedOrderTab] = useState<"all" | "groceries" | "food" | "rides" | "custom">("all");

  // 5. Saved Addresses State
  const addresses = savedAddresses;
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState("");
  const [newAddrType, setNewAddrType] = useState("Home");
  const [newAddrDetail, setNewAddrDetail] = useState("");

  // 6. Support Center State
  const [supportText, setSupportText] = useState("");
  const [supportCategory, setSupportCategory] = useState("Rides");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState("");

  // 7. Rewards and Loyalty
  const [loyaltyPoints, setLoyaltyPoints] = useState(1420);
  const [referralCopied, setReferralCopied] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // 8. Settings & Preferences
  const [notifSms, setNotifSms] = useState(true);
  const [notifProgress, setNotifProgress] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);
  const [privacyHistory, setPrivacyHistory] = useState(true);
  const [privacyAnalytics, setPrivacyAnalytics] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [logoutSimulated, setLogoutSimulated] = useState(false);

  // Handlers
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name: profileName, email: profileEmail, phone: profilePhone });
    setIsEditingProfile(false);
    setProfileSuccessMsg("Profile saved successfully!");
    setTimeout(() => setProfileSuccessMsg(""), 3500);
  };

  const handleCustomRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(customRechargeAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid numeric recharge amount.");
      return;
    }
    onTopUpWallet(amt);
    setWalletTxns(prev => [
      { id: `TXN-${Math.floor(100 + Math.random() * 900)}`, type: "Recharge", amount: amt, date: "Just Now", method: "UPI Pay" },
      ...prev
    ]);
    setCustomRechargeAmount("");
    setWalletSuccessMsg(`Credited ₹${amt} successfully!`);
    setTimeout(() => setWalletSuccessMsg(""), 3500);
  };

  const handleQuickRecharge = (amount: number) => {
    onTopUpWallet(amount);
    setWalletTxns(prev => [
      { id: `TXN-${Math.floor(100 + Math.random() * 900)}`, type: "Recharge", amount, date: "Just Now", method: "UPI" },
      ...prev
    ]);
    setWalletSuccessMsg(`Credited ₹${amount} successfully!`);
    setTimeout(() => setWalletSuccessMsg(""), 3500);
  };

  const handleRedeemCashback = () => {
    if (cashbackBalance <= 0) return;
    onTopUpWallet(cashbackBalance);
    setWalletTxns(prev => [
      { id: `TXN-${Math.floor(100 + Math.random() * 900)}`, type: "Redeemed Cashback", amount: cashbackBalance, date: "Just Now", method: "Cashback" },
      ...prev
    ]);
    setWalletSuccessMsg(`Successfully redeemed ₹${cashbackBalance} Cashback to Wallet!`);
    setCashbackBalance(0);
    setTimeout(() => setWalletSuccessMsg(""), 4000);
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrLabel.trim() || !newAddrDetail.trim()) {
      alert("Please enter both an address label and details.");
      return;
    }
    const newAddr = {
      id: `addr-${Date.now()}`,
      type: newAddrType,
      label: newAddrLabel,
      detail: newAddrDetail
    };
    onUpdateAddresses([...savedAddresses, newAddr]);
    setNewAddrLabel("");
    setNewAddrDetail("");
    setShowAddAddress(false);
  };

  const handleDeleteAddress = (id: string) => {
    onUpdateAddresses(savedAddresses.filter(addr => addr.id !== id));
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportText.trim()) return;

    // Check profile info exists
    if (!profileName.trim()) {
      setTicketError("Please specify your Full Name in the profile form above first.");
      return;
    }
    if (!profileEmail.trim() || !/\S+@\S+\.\S+/.test(profileEmail)) {
      setTicketError("Please enter a valid Email Address in the profile form above first.");
      return;
    }
    const cleanPhone = profilePhone.replace(/[-\s+()]/g, "");
    if (!profilePhone.trim() || cleanPhone.length < 10) {
      setTicketError("Please enter a valid Phone Number in the profile form above first.");
      return;
    }

    setTicketLoading(true);
    setTicketError("");

    try {
      await submitToFormspree({
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        serviceType: "Helpdesk Ticket",
        subject: `[Support Case] Category: ${supportCategory}`,
        message: supportText
      });

      const generatedId = `TKT-${Math.floor(100 + Math.random() * 900)}`;
      setTicketId(generatedId);
      setSupportText("");
    } catch (err) {
      setTicketError("Failed to submit support request. Please try again.");
    } finally {
      setTicketLoading(false);
    }
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText("BLUBER50");
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2500);
  };

  const handleApplyCoupon = (code: string) => {
    setAppliedCoupon(code);
    alert(`Coupon "${code}" applied successfully! You'll receive this discount automatically on your next eligible order.`);
  };

  const filteredOrders = orders.filter(ord => {
    if (selectedOrderTab === "all") return true;
    if (selectedOrderTab === "groceries" && ord.merchantName?.toLowerCase().includes("grocery")) return true;
    if (selectedOrderTab === "food" && ord.merchantName?.toLowerCase().includes("restaurant")) return true;
    if (selectedOrderTab === "rides" && ord.id?.startsWith("RIDE")) return true;
    if (selectedOrderTab === "custom" && ord.type === "Custom") return true;
    return false;
  });

  const displayNameToUse = user ? (profileName || user.name || "Verified User") : "Guest Resident";
  const displayEmailToUse = profileEmail || user?.email || "";
  const displayPhoneToUse = profilePhone || user?.phone || "";

  console.log("[DEBUG] Rendering ProfileTab. User authenticated:", !!user, "UID:", user?.uid, "DisplayName:", displayNameToUse);

  return (
    <div id="profile-tab-root" className="px-5 py-5 animate-fade-in pb-28 text-left space-y-6 max-w-2xl mx-auto">
      
      {/* 1. USER PROFILE HEADER */}
      <div className="bg-white rounded-[28px] p-6 shadow-custom border border-border-custom/30 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={displayNameToUse} 
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white"
                />
              ) : (
                <div className="w-16 h-16 bg-[#1E6B3D] rounded-full text-white flex items-center justify-center font-bold text-xl uppercase shadow-md border-2 border-white">
                  {displayNameToUse.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                </div>
              )}
              <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${user ? "bg-emerald-500" : "bg-gray-300"}`}></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-text-primary">{displayNameToUse}</h2>
                <span className={`text-[9px] font-black tracking-normal px-2.5 py-0.5 rounded-full uppercase ${user ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-500"}`}>
                  {user ? "Verified" : "Guest"}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                {user ? `${displayEmailToUse || "No email"} • ${displayPhoneToUse || "No phone"}` : "Sign in to unlock support & addresses"}
              </p>
              
              <div className="flex items-center gap-1.5 mt-2.5">
                <Award size={13} className="text-amber-500" />
                <span className="bg-primary-light text-primary text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {user ? "Elite Resident Tier" : "Bronze tier browser"}
                </span>
              </div>
            </div>
          </div>

          {user ? (
            <button
              type="button"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="self-start sm:self-center bg-canvas hover:bg-slate-100 text-text-primary text-[11px] font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all border border-border-custom/50 cursor-pointer"
            >
              <Edit2 size={12} />
              <span>{isEditingProfile ? "Cancel" : "Edit Profile"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onRequireAuth?.({ type: "PROFILE" })}
              className="self-start sm:self-center bg-primary hover:bg-[#154627] text-white text-[11px] font-black px-4 py-2.5 rounded-xl shadow-md cursor-pointer active:scale-95 transition-all border-none"
            >
              Secure Login / Register
            </button>
          )}
        </div>

        {profileSuccessMsg && (
          <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold text-center">
            {profileSuccessMsg}
          </div>
        )}

        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="mt-5 pt-5 border-t border-dashed border-gray-100 space-y-3.5 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-black text-text-secondary uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-canvas text-xs font-bold border border-border-custom p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-text-secondary uppercase block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full bg-canvas text-xs font-bold border border-border-custom p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-text-secondary uppercase block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full bg-canvas text-xs font-bold border border-border-custom p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-[#154627] text-white text-xs font-black px-4 py-2.5 rounded-xl active:scale-95 transition-transform cursor-pointer border-none"
            >
              Save Profile Details
            </button>
          </form>
        )}
      </div>

      {/* 2. BLUBER WALLET */}
      <div className="bg-white rounded-[28px] p-6 shadow-custom border border-border-custom/30 text-left space-y-4">
        <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest flex items-center gap-1.5 border-b pb-2">
          <Coins size={16} className="text-amber-500" />
          BLUBER PAY WALLET
        </h3>
        
        {walletSuccessMsg && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold text-center animate-fade-in">
            {walletSuccessMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-canvas p-4 rounded-2xl border border-border-custom/30 flex flex-col justify-between">
            <div>
              <p className="text-[9px] font-black text-text-secondary uppercase">Available Balance</p>
              <p className="text-2xl font-black text-primary mt-1">₹{walletBalance}</p>
            </div>
            <span className="self-start mt-2 bg-emerald-50 text-[8.5px] font-black text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-primary/10">
              Active Secure
            </span>
          </div>

          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/40 flex flex-col justify-between">
            <div>
              <p className="text-[9px] font-black text-amber-800 uppercase flex items-center gap-1">
                <Gift size={11} /> Cashback Rewards
              </p>
              <p className="text-2xl font-black text-amber-900 mt-1">₹{cashbackBalance}</p>
            </div>
            <button
              type="button"
              disabled={cashbackBalance <= 0}
              onClick={handleRedeemCashback}
              className={`mt-2 text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg border-none text-center select-none active:scale-95 transition-transform ${
                cashbackBalance > 0 
                  ? "bg-amber-600 hover:bg-amber-700 text-white cursor-pointer" 
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Redeem to Wallet Balance
            </button>
          </div>
        </div>

        {/* Add Money Form */}
        <form onSubmit={handleCustomRecharge} className="space-y-3 pt-2">
          <div>
            <label className="text-[9.5px] font-black text-text-secondary uppercase block mb-1">Add Money (Custom Amount)</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                placeholder="Enter amount (₹)"
                value={customRechargeAmount}
                onChange={(e) => setCustomRechargeAmount(e.target.value)}
                className="flex-1 bg-canvas text-xs font-bold border border-border-custom px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-[#1E6B3D] text-white text-xs font-black px-5 rounded-xl flex items-center gap-1 active:scale-95 transition-all border-none cursor-pointer"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-black text-text-secondary uppercase tracking-wider mb-1.5">Quick Recharge amounts:</p>
            <div className="grid grid-cols-3 gap-2">
              {[200, 500, 1000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickRecharge(amt)}
                  className="bg-canvas hover:bg-emerald-50 border border-border-custom text-text-primary hover:text-primary text-[10px] font-extrabold py-2 rounded-xl transition-all cursor-pointer select-none text-center block"
                >
                  + ₹{amt}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Transaction History Subsegment */}
        <div className="pt-2">
          <p className="text-[9.5px] font-black text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
            <History size={12} /> Transaction History
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar border border-border-custom/30 rounded-xl bg-canvas/30 p-2.5">
            {walletTxns.map((txn, idx) => (
              <div key={idx} className="flex justify-between items-center text-[10.5px] pb-1.5 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="text-left">
                  <p className="font-bold text-text-primary">{txn.type}</p>
                  <p className="text-[8.5px] text-text-secondary mt-0.5">{txn.date} • {txn.method}</p>
                </div>
                <div className="text-right">
                  <span className={`font-black ${txn.amount > 0 ? "text-emerald-700" : "text-text-primary"}`}>
                    {txn.amount > 0 ? "+" : ""}₹{Math.abs(txn.amount)}
                  </span>
                  <span className="block text-[7.5px] font-mono text-text-secondary mt-0.5">{txn.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. MY ORDERS */}
      <div className="bg-white rounded-[28px] p-6 shadow-custom border border-border-custom/30 text-left space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
            <ShoppingBag size={16} className="text-primary" />
            MY ORDERS & RIDES
          </h3>
          <button
            type="button"
            onClick={onViewAllOrders}
            className="text-[10px] font-extrabold text-primary hover:underline bg-primary-light/40 px-2.5 py-1 rounded-full cursor-pointer border-none"
          >
            Expanded Log ➔
          </button>
        </div>

        {/* Categorized Filter Pills */}
        <div className="flex flex-wrap gap-1.5 bg-canvas p-1 rounded-xl">
          {[
            { id: "all", label: "All Logs" },
            { id: "groceries", label: "Grocery" },
            { id: "food", label: "Food Menu" },
            { id: "rides", label: "Scooty Rides" },
            { id: "custom", label: "Custom Requests" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedOrderTab(tab.id as any)}
              className={`text-[9.5px] font-black px-2.5 py-1.5 rounded-lg transition-all border-none cursor-pointer ${
                selectedOrderTab === tab.id 
                  ? "bg-primary text-white shadow-sm" 
                  : "text-text-secondary hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-7 bg-canvas/60 rounded-2xl border border-dashed border-border-custom/70 text-[11px] text-text-secondary font-bold">
            No active orders matching this filter type.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.slice(0, 4).map((ord) => (
              <div 
                key={ord.id} 
                onClick={onViewAllOrders}
                className="bg-canvas hover:bg-emerald-50/20 p-3.5 rounded-2xl flex justify-between items-center cursor-pointer transition-all border border-border-custom/30 active:scale-99"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-white text-primary p-2 rounded-xl shrink-0 border border-border-custom/20">
                    {ord.id?.startsWith("RIDE") ? <Bike size={16} /> : ord.merchantName?.toLowerCase().includes("restaurant") ? <Utensils size={16} /> : <ShoppingBag size={16} />}
                  </div>
                  <div className="min-w-0 text-left">
                    <h4 className="text-xs font-black text-text-primary truncate">{ord.merchantName}</h4>
                    <p className="text-[9px] text-text-secondary truncate mt-0.5">{ord.itemsSummary || ord.id}</p>
                    <p className="text-[8px] text-[#9CA3AF] mt-0.5">{ord.date}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-xs font-black text-text-primary block">₹{ord.total}</span>
                  <span className={`text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1.5 inline-block border ${
                    ord.status === "Delivered" || ord.status === "Completed" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                      : ord.status === "Cancelled" || ord.status === "Rejected"
                      ? "bg-rose-50 text-rose-600 border-rose-100"
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

      {/* 4. SAVED ADDRESSES */}
      <div className="bg-white rounded-[28px] p-6 shadow-custom border border-border-custom/30 text-left space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
            <MapPin size={16} className="text-primary" />
            SAVED ADDRESSES
          </h3>
          <button
            type="button"
            onClick={() => setShowAddAddress(!showAddAddress)}
            className="text-[10px] font-extrabold text-primary hover:underline flex items-center gap-1 bg-primary-light/40 px-2.5 py-1 rounded-full cursor-pointer border-none"
          >
            <PlusCircle size={11} /> Add New
          </button>
        </div>

        {showAddAddress && (
          <form onSubmit={handleAddAddressSubmit} className="bg-canvas p-4 rounded-2xl border border-border-custom/40 space-y-3 animate-fade-in">
            <p className="text-[9.5px] font-black text-text-primary uppercase">Add New Coordinates</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[8.5px] font-black text-text-secondary uppercase">Label Name</label>
                <input
                  type="text"
                  placeholder="e.g. Gym, Library"
                  value={newAddrLabel}
                  onChange={(e) => setNewAddrLabel(e.target.value)}
                  className="w-full bg-white text-xs font-bold border border-border-custom p-2 rounded-lg mt-0.5 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[8.5px] font-black text-text-secondary uppercase">Type Icon</label>
                <select
                  value={newAddrType}
                  onChange={(e) => setNewAddrType(e.target.value)}
                  className="w-full bg-white text-xs font-bold border border-border-custom p-2 rounded-lg mt-0.5 focus:outline-none"
                >
                  <option value="Home">🏠 Home</option>
                  <option value="Work">💼 Work</option>
                  <option value="Other">📍 Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[8.5px] font-black text-text-secondary uppercase">Detailed Address</label>
              <textarea
                rows={2}
                placeholder="Street address, colony, landmarks, Chamba HP"
                value={newAddrDetail}
                onChange={(e) => setNewAddrDetail(e.target.value)}
                className="w-full bg-white text-xs p-2 rounded-lg mt-0.5 border border-border-custom focus:outline-none resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-primary text-white text-[10px] font-black px-3.5 py-2 rounded-lg border-none cursor-pointer active:scale-95"
              >
                Save Address
              </button>
              <button
                type="button"
                onClick={() => setShowAddAddress(false)}
                className="bg-gray-100 text-text-primary text-[10px] font-black px-3.5 py-2 rounded-lg border-none cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="flex items-start justify-between bg-canvas/40 p-3.5 rounded-2xl border border-border-custom/25">
              <div className="flex items-start gap-3">
                <div className="bg-white p-2 rounded-xl border border-border-custom/20 text-primary mt-0.5">
                  {addr.type === "Home" ? <Home size={15} /> : addr.type === "Work" ? <Briefcase size={15} /> : <MapPin size={15} />}
                </div>
                <div>
                  <p className="font-extrabold text-xs text-text-primary leading-tight">{addr.label}</p>
                  <p className="text-[10.5px] text-text-secondary mt-1 leading-relaxed max-w-[210px] sm:max-w-md">{addr.detail}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteAddress(addr.id)}
                className="text-[9.5px] text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg border-none cursor-pointer"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. REWARDS & MEMBERSHIP */}
      <div className="bg-white rounded-[28px] p-6 shadow-custom border border-border-custom/30 text-left space-y-4">
        <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest flex items-center gap-1.5 border-b pb-2">
          <Gem size={16} className="text-[#1E6B3D]" />
          REWARDS & MEMBERSHIP STATUS
        </h3>

        {/* Status progress bar */}
        <div className="bg-canvas p-4 rounded-2xl border border-border-custom/25 text-left space-y-2.5">
          <div className="flex justify-between items-center text-[10px] font-black">
            <span className="text-text-secondary">Gold Level Status</span>
            <span className="text-primary font-bold">1,420 / 2,000 Points to Platinum</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div className="bg-[#1E6B3D] h-full rounded-full" style={{ width: "71%" }}></div>
          </div>
          <p className="text-[10px] text-text-secondary leading-relaxed">
            Unlock Platinum VIP for <strong>free deliveries</strong> on orders above ₹150 across Court Road markets.
          </p>
        </div>

        {/* Loyalty points action */}
        <div className="flex items-center justify-between p-3 bg-[#FEF9C3]/50 border border-yellow-200 rounded-xl">
          <div className="flex items-center gap-2">
            <Award className="text-amber-600 w-5 h-5" />
            <div className="text-left">
              <p className="text-[11px] font-black text-amber-900">Loyalty Points: {loyaltyPoints}</p>
              <p className="text-[8.5px] text-amber-800">Earned via direct dispatches</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (loyaltyPoints >= 500) {
                setLoyaltyPoints(p => p - 500);
                alert("Redeemed 500 Loyalty points! Check your notifications section for the applied premium coupon.");
              } else {
                alert("You need at least 500 loyalty points to redeem coupons.");
              }
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg border-none cursor-pointer"
          >
            Redeem 500 Pts
          </button>
        </div>

        {/* Referral System */}
        <div className="bg-canvas p-3 rounded-xl border border-border-custom/20">
          <p className="text-[9px] font-black text-text-secondary uppercase">Referral Rewards</p>
          <div className="flex justify-between items-center mt-1.5 bg-white p-2 rounded-lg border border-border-custom/50">
            <div className="text-left">
              <span className="text-[10px] text-text-secondary block">Your Code:</span>
              <span className="font-mono text-xs font-black text-text-primary">BLUBER50</span>
            </div>
            <button
              type="button"
              onClick={handleCopyReferral}
              className="bg-primary text-white text-[10.5px] font-black px-3 py-1.5 rounded-md flex items-center gap-1 active:scale-95 border-none cursor-pointer"
            >
              {referralCopied ? <CheckCircle size={12} /> : <Copy size={12} />}
              <span>{referralCopied ? "Copied" : "Copy Code"}</span>
            </button>
          </div>
          <p className="text-[9px] text-text-secondary leading-relaxed mt-1.5">
            Share with friends and earn <strong>₹50 cashback instantly</strong> in your wallet when they book their first ride or grocery delivery.
          </p>
        </div>

        {/* Coupons list */}
        <div>
          <p className="text-[9.5px] font-black text-text-secondary uppercase mb-2 flex items-center gap-1">
            <Ticket size={12} /> Available Coupons & Offers
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { code: "CHAMBAFREE", desc: "Free Delivery on groceries & items", label: "Special Offer" },
              { code: "SCOOTY20", desc: "20% off on your first scooty ride", label: "Ride Promo" }
            ].map(cp => (
              <div key={cp.code} className="bg-canvas p-3 rounded-xl border border-dashed border-border-custom flex flex-col justify-between text-left">
                <div>
                  <span className="bg-primary/10 text-primary text-[8px] font-black uppercase px-2 py-0.5 rounded mb-1 inline-block">
                    {cp.label}
                  </span>
                  <p className="font-mono text-xs font-black text-text-primary">{cp.code}</p>
                  <p className="text-[9.5px] text-text-secondary leading-tight mt-1">{cp.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyCoupon(cp.code)}
                  className="bg-white hover:bg-emerald-50 border border-primary text-primary text-[9px] font-black py-1.5 rounded-lg mt-2 cursor-pointer text-center select-none active:scale-95 transition-all"
                >
                  {appliedCoupon === cp.code ? "Applied ✓" : "Apply Coupon"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. SUPPORT CENTER */}
      <div className="bg-white rounded-[28px] p-6 shadow-custom border border-border-custom/30 text-left space-y-4">
        <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest flex items-center gap-1.5 border-b pb-2">
          <HelpCircle size={16} className="text-primary" />
          CUSTOMER SUPPORT CENTER
        </h3>

        {/* Contact numbers, fast support */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a 
            href="https://wa.me/919816402487?text=Hello%20Bluber%20Support%2C%20I%20need%20assistance%20regarding%20my%20service"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#25D366]/10 hover:bg-[#25D366]/15 border border-[#25D366]/20 p-3 rounded-2xl cursor-pointer text-text-primary"
          >
            <div className="bg-[#25D366] text-white p-2 rounded-xl">
              <Phone size={15} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black">WhatsApp Chat Help</p>
              <p className="text-[9.5px] text-text-secondary leading-none mt-0.5">Online 24/7 Available</p>
            </div>
          </a>

          <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 p-3 rounded-2xl">
            <div className="bg-indigo-600 text-white p-2 rounded-xl">
              <Mail size={15} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black">Email Escalations</p>
              <p className="text-[9.5px] text-text-secondary leading-none mt-0.5">support@bluber.in</p>
            </div>
          </div>
        </div>

        {/* Log ticket form */}
        <div className="bg-canvas/50 p-4 rounded-2xl border border-border-custom/30">
          <p className="text-[9.5px] font-black text-text-primary uppercase mb-1.5">Lodge Helpdesk Ticket</p>
          <p className="text-[10px] text-text-secondary leading-normal mb-3">
            Having trouble with custom requests, orders or payment checkouts? File a support case.
          </p>

          {ticketId ? (
            <div className="p-4 bg-white rounded-xl text-center border border-[#1E6B3D]/30 shadow-sm animate-fade-in space-y-2">
              <CheckCircle size={30} className="text-primary mx-auto" />
              <h4 className="text-xs font-bold text-text-primary">Your request has been submitted successfully. Our team will contact you shortly.</h4>
              <p className="text-[10px] text-text-secondary leading-normal">
                Case ID is <span className="font-mono font-bold text-primary">{ticketId}</span>. The Bluber dispatcher on Court road is reviewing this case.
              </p>
              <button 
                type="button"
                onClick={() => setTicketId(null)}
                className="text-[9.5px] text-primary font-black hover:underline border-none bg-transparent cursor-pointer mt-1"
              >
                Log Another Ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-3">
              {ticketError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-[10.5px] font-bold text-left leading-normal animate-fade-in">
                  ⚠️ {ticketError}
                </div>
              )}

              <div>
                <label className="text-[8.5px] font-black text-text-secondary uppercase mb-1 block">Issue Category</label>
                <select 
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value)}
                  className="w-full bg-white text-xs px-3 py-2 border border-border-custom rounded-xl focus:outline-none focus:border-primary appearance-none cursor-pointer font-bold"
                  disabled={ticketLoading}
                >
                  <option value="Rides">Elite Scooty Bookings</option>
                  <option value="Food">Local Restaurant Delivery</option>
                  <option value="Grocery">Apples & Honey Stocks</option>
                  <option value="Wallet">Wallet Payments Surcharges</option>
                </select>
              </div>

              <div>
                <label className="text-[8.5px] font-black text-text-secondary uppercase mb-1 block">Describe the issue</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Briefly state your concern..."
                  value={supportText}
                  onChange={(e) => setSupportText(e.target.value)}
                  className="w-full bg-white text-xs p-3 border border-border-custom rounded-xl focus:outline-none focus:border-primary resize-none placeholder:opacity-50"
                  disabled={ticketLoading}
                />
              </div>

              <button 
                type="submit"
                disabled={ticketLoading}
                className="w-full py-2.5 bg-primary hover:bg-[#154627] text-white text-xs font-black rounded-xl shadow-md cursor-pointer active:scale-95 border-none flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ticketLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Submitting to Support...</span>
                  </>
                ) : (
                  <span>Submit Case File</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* FAQs list accordion */}
        <div className="pt-2">
          <p className="text-[9.5px] font-black text-text-secondary uppercase mb-2 flex items-center gap-1">
            <FileQuestion size={12} /> Frequently Asked Questions
          </p>
          <div className="space-y-2">
            {[
              { q: "What is Bluber's standard scooty base fare?", a: "The base fare starts at ₹40/KM during daytime hours (10 AM to 7 PM). Surcharges apply during early morning or late night hours depending on driver availability." },
              { q: "How long do custom requests take to process?", a: "We purchase and deliver items instantly! Most deliveries within Chamba town limits are fulfilled in under 45 minutes." },
              { q: "Is cash on delivery accepted?", a: "To ensure absolute fleet safety and avoid dispatch delays, we operate strictly on a secure prepaid model using UPI or your Bluber Balance." }
            ].map((faq, idx) => (
              <div key={idx} className="border border-border-custom/25 rounded-xl bg-canvas/30 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full text-left px-3 py-2.5 flex justify-between items-center text-[10.5px] font-bold text-text-primary hover:bg-slate-50 border-none cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {expandedFaq === idx ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
                {expandedFaq === idx && (
                  <div className="px-3 pb-3 pt-0 text-[10px] text-text-secondary leading-relaxed border-t border-gray-100 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. ACCOUNT SETTINGS */}
      <div className="bg-white rounded-[28px] p-6 shadow-custom border border-border-custom/30 text-left space-y-4">
        <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest flex items-center gap-1.5 border-b pb-2">
          <Lock size={16} className="text-primary" />
          ACCOUNT SETTINGS & PREFERENCES
        </h3>

        {/* Notifications and Privacy Toggles */}
        <div className="space-y-3">
          <p className="text-[9px] font-black text-text-secondary uppercase">Notification Controls</p>
          <div className="space-y-2 bg-canvas/40 p-3 rounded-2xl border border-border-custom/20 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-text-primary">SMS & WhatsApp Alerts</span>
              <button
                type="button"
                onClick={() => setNotifSms(!notifSms)}
                className={`w-9 h-5 rounded-full p-0.5 transition-all border-none cursor-pointer ${notifSms ? "bg-primary" : "bg-gray-200"}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-all transform ${notifSms ? "translate-x-4" : "translate-x-0"}`}></div>
              </button>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-2">
              <span className="font-semibold text-text-primary">Order Progress Milestones</span>
              <button
                type="button"
                onClick={() => setNotifProgress(!notifProgress)}
                className={`w-9 h-5 rounded-full p-0.5 transition-all border-none cursor-pointer ${notifProgress ? "bg-primary" : "bg-gray-200"}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-all transform ${notifProgress ? "translate-x-4" : "translate-x-0"}`}></div>
              </button>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-2">
              <span className="font-semibold text-text-primary">Weekly Promo Discounts</span>
              <button
                type="button"
                onClick={() => setNotifPromo(!notifPromo)}
                className={`w-9 h-5 rounded-full p-0.5 transition-all border-none cursor-pointer ${notifPromo ? "bg-primary" : "bg-gray-200"}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-all transform ${notifPromo ? "translate-x-4" : "translate-x-0"}`}></div>
              </button>
            </div>
          </div>

          <p className="text-[9px] font-black text-text-secondary uppercase">Privacy Settings</p>
          <div className="space-y-2 bg-canvas/40 p-3 rounded-2xl border border-border-custom/20 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-text-primary">Store Geolocation History</span>
              <button
                type="button"
                onClick={() => setPrivacyHistory(!privacyHistory)}
                className={`w-9 h-5 rounded-full p-0.5 transition-all border-none cursor-pointer ${privacyHistory ? "bg-primary" : "bg-gray-200"}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-all transform ${privacyHistory ? "translate-x-4" : "translate-x-0"}`}></div>
              </button>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-2">
              <span className="font-semibold text-text-primary">Anonymize App Analytics</span>
              <button
                type="button"
                onClick={() => setPrivacyAnalytics(!privacyAnalytics)}
                className={`w-9 h-5 rounded-full p-0.5 transition-all border-none cursor-pointer ${privacyAnalytics ? "bg-primary" : "bg-gray-200"}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-all transform ${privacyAnalytics ? "translate-x-4" : "translate-x-0"}`}></div>
              </button>
            </div>
          </div>

          {/* Language Selector */}
          <div>
            <label className="text-[9px] font-black text-text-secondary uppercase block mb-1">App Language</label>
            <div className="relative flex items-center">
              <Languages size={14} className="absolute left-3 text-slate-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-canvas text-xs px-9 py-2.5 border border-border-custom rounded-xl font-bold appearance-none focus:outline-none"
              >
                <option value="English">🇬🇧 English (Global)</option>
                <option value="Hindi">🇮🇳 हिन्दी (Hindi)</option>
                <option value="Himachali">🏔️ हिमाचली (Himachali / Pahadi)</option>
              </select>
            </div>
          </div>

          {/* Simulated Logout */}
          {user && (
            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to log out from BLUBER? Your local cart and address book will be preserved.")) {
                    if (onLogout) {
                      onLogout();
                    }
                  }
                }}
                className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all border-none cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out from Account</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding details */}
      <div className="text-center space-y-1.5 opacity-65 text-[11px] text-text-secondary pt-4">
        <p className="font-bold text-text-primary">BLUBER CONNECT • {user ? "CERTIFIED RESIDENT ACCOUNT" : "GUEST ACCOUNT"}</p>
        <p>Licensed for resident commerce inside Chamba municipal boundaries.</p>
        <div className="flex justify-center gap-4 pt-1 text-[10px]">
          <span className="hover:underline cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
        </div>
      </div>
    </div>
  );
};
