import React, { useState } from "react";
import { 
  Coins, 
  Plus, 
  QrCode, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle,
  Clock,
  Tag
} from "lucide-react";

interface WalletTabProps {
  balance: number;
  onAddBalance: (amount: number) => void;
}

export const WalletTab: React.FC<WalletTabProps> = ({ balance, onAddBalance }) => {
  const [topupAmount, setTopupAmount] = useState<number>(500);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [addedAmount, setAddedAmount] = useState(0);

  // Dynamic transaction log based on operations
  const [transactions] = useState([
    { id: "TXN-8812", title: "Cashback Promo Card", desc: "Local Chamba campaign incentive", amount: 50, type: "credit", date: "Today" },
    { id: "TXN-8700", title: "Topped-up Wallet", desc: "Net Banking (SBI Chamba)", amount: 1000, type: "credit", date: "Yesterday" },
    { id: "TXN-8119", title: "Ride to Court Road", desc: "Bluber Ride Captain #776", amount: -120, type: "debit", date: "2 days ago" },
  ]);

  const handleTopupSubmit = () => {
    onAddBalance(topupAmount);
    setAddedAmount(topupAmount);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  return (
    <div id="wallet-tab-root" className="px-5 py-5 animate-fade-in pb-28 text-left">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Bluber Pay Balance</h2>
        <p className="text-xs text-text-secondary">Chamba's local wallet & payments hub</p>
      </div>

      {/* Credit Card-inspired Visual Card with Primary Green background */}
      <div className="w-full bg-[#1E6B3D] text-white rounded-[28px] p-6 shadow-custom relative overflow-hidden mb-6">
        {/* Glow circles */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-emerald-300/10 rounded-full blur-2xl"></div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#a3e635]">Personal Card</span>
            <h3 className="text-sm font-semibold tracking-wide opacity-90 mt-1">GUEST TRAVELER</h3>
          </div>
          <div className="bg-white/20 p-2.5 rounded-xl">
            <Coins size={22} className="text-[#a3e635]" />
          </div>
        </div>

        <div className="mb-6">
          <span className="text-[10px] uppercase tracking-widest opacity-75">Available Balance</span>
          <p className="text-3xl font-bold tracking-tight mt-1">₹{balance.toLocaleString('en-IN')}</p>
        </div>

        <div className="flex justify-between items-end border-t border-white/10 pt-4 text-xs opacity-80">
          <div>
            <p className="text-[9px] uppercase tracking-wider opacity-60">Card Identifier</p>
            <p className="font-mono mt-0.5 font-bold">BLUB-CARD-XXXX-4412</p>
          </div>
          <span className="bg-[#a3e635] text-[#1E6B3D] text-[10px] font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
        </div>
      </div>

      {/* Instant Action buttons: Scan QR or Preset Add */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setShowQRModal(true)}
          className="flex items-center justify-center gap-2 py-3.5 bg-surface rounded-2xl border border-border-custom font-bold text-xs text-text-primary hover:bg-canvas transition-colors shadow-sm cursor-pointer"
        >
          <QrCode size={18} className="text-primary" /> Scan Merchant QR
        </button>

        <button
          onClick={() => {
            setTopupAmount(200);
            handleTopupSubmit();
          }}
          className="flex items-center justify-center gap-2 py-3.5 bg-[#EDF7EF] rounded-2xl font-bold text-xs text-primary hover:opacity-90 transition-opacity shadow-sm cursor-pointer border-none"
        >
          <Plus size={16} /> Quick Add ₹200
        </button>
      </div>

      {/* Manual balance Top Up slider frame */}
      <div className="bg-surface rounded-[24px] p-5 shadow-custom mb-6">
        <h4 className="text-sm font-bold text-text-primary mb-3">Refuel Wallet Account</h4>
        
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[100, 200, 500, 1000].map((amt) => (
            <button
              key={amt}
              onClick={() => setTopupAmount(amt)}
              className={`py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                topupAmount === amt 
                  ? "bg-primary text-white scale-102" 
                  : "bg-canvas border border-border-custom text-text-secondary"
              }`}
            >
              +₹{amt}
            </button>
          ))}
        </div>

        <button
          onClick={handleTopupSubmit}
          className="w-full py-3 bg-[#1E6B3D] hover:bg-[#154627] text-white rounded-xl text-xs font-bold tracking-wide shadow-md active:scale-98 transition-all border-none cursor-pointer"
        >
          Proceed to Refuel ₹{topupAmount}
        </button>
      </div>

      {/* Transaction History log */}
      <div>
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 flex items-center justify-between">
          <span>Transactions History</span>
          <span className="text-[10px] text-primary lowercase font-semibold">view statement</span>
        </h3>

        <div className="space-y-2.5 text-left">
          {transactions.map((t) => (
            <div key={t.id} className="bg-surface p-3.5 rounded-[18px] shadow-sm flex justify-between items-center hover:bg-canvas/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${t.type === "credit" ? "bg-[#EDF7EF] text-primary" : "bg-[#FFF0F0] text-rose-500"}`}>
                  {t.type === "credit" ? (
                    <ArrowDownLeft size={16} />
                  ) : (
                    <ArrowUpRight size={16} />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary">{t.title}</p>
                  <p className="text-[10px] text-text-secondary font-medium">{t.desc} • {t.date}</p>
                </div>
              </div>
              <p className={`text-xs font-bold ${t.type === "credit" ? "text-primary" : "text-text-primary"}`}>
                {t.type === "credit" ? "+" : "-"}₹{Math.abs(t.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Success Slide Up Toast popups */}
      {showSuccessToast && (
        <div className="fixed bottom-24 inset-x-0 mx-6 bg-emerald-800 text-white p-4 rounded-xl flex items-center justify-between shadow-xl z-50 animate-[slideUp_200ms_ease-out]">
          <div className="flex items-center gap-2.5">
            <CheckCircle size={22} className="text-[#a3e635]" />
            <div>
              <p className="text-xs font-bold text-white">Refuel Succeeded!</p>
              <p className="text-[10px] text-white/80">₹{addedAmount} instantly credited via SBI Chamba NetBanking.</p>
            </div>
          </div>
        </div>
      )}

      {/* QR scanner full modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6 bg-opacity-70 pointer-events-auto">
          <div className="bg-surface rounded-[28px] p-6 max-w-xs w-full text-center shadow-2xl relative">
            <h4 className="text-sm font-bold text-text-primary mb-3">Pay Chamba Merchant</h4>
            
            {/* Visual focus box */}
            <div className="relative w-40 h-40 mx-auto bg-canvas rounded-2xl flex items-center justify-center p-4 border border-border-custom mb-4 overflow-hidden">
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
              
              <QrCode size={110} className="text-text-primary shrink-0 opacity-80" />
              {/* Scan guiding line */}
              <div className="absolute left-0 right-0 h-0.5 bg-primary animate-[scanLine_2s_ease-in-out_infinite]"></div>
            </div>

            <p className="text-[11px] text-text-secondary leading-normal mb-5 font-semibold">
              Align client-side or merchant code inside scanner grid. Works at Chowgan, Gandhi Chowk, and all partnered Chamba merchants.
            </p>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 bg-canvas border border-border-custom text-text-primary font-bold text-xs rounded-xl cursor-pointer"
            >
              Dismiss Scanner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
