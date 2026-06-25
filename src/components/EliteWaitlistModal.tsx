import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Compass, CheckCircle, Mail, Phone, ChevronRight } from "lucide-react";
import { safeStorage } from "../utils/safeStorage";

interface EliteWaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string; phone: string; interests: string[] }) => void;
  initialData: { email: string; phone: string; interests: string[] } | null;
}

const AVAILABLE_INTERESTS = [
  { id: "cafe", label: "Café & Dessert Dates", desc: "Share sweet conversations over hot tea & hill-top desserts." },
  { id: "shopping", label: "Shopping Companion", desc: "Have a helpful companion to carry bags and offer great fashion feedback." },
  { id: "walks", label: "Scenic & Sunset Walks", desc: "Enjoy strolls around the Chaugan or scenic trails in Chamba." },
  { id: "events", label: "Social Partner & Events Guide", desc: "Secure a polished plus-one for weddings, family functions, or local fairs." },
  { id: "assistance", label: "Errand & Travel Support", desc: "A reliable gentleman assistant to help navigate transit, luggage, and chores." }
];

export const EliteWaitlistModal: React.FC<EliteWaitlistModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialData?.interests || []);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [errors, setErrors] = useState<{ email?: string; phone?: string; interests?: string }>({});

  const handleToggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(prev => prev.filter(item => item !== id));
    } else {
      setSelectedInterests(prev => [...prev, id]);
    }
    setErrors(prev => ({ ...prev, interests: undefined }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (phone.length < 10) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (selectedInterests.length === 0) {
      newErrors.interests = "Please choose at least one lifestyle interest";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    // Luxury animation simulation delay
    setTimeout(() => {
      setStatus("success");
      onSubmit({ email, phone, interests: selectedInterests });
    }, 1800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Elegant Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#07080a]/90 backdrop-blur-md"
          />

          {/* Luxury Card Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="relative w-full max-w-lg bg-[#0F1012] border border-white/[0.08] text-white rounded-[32px] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.8)] z-10 flex flex-col max-h-[90vh]"
          >
            {/* Elegant light bar at top */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-slate-500/20 to-transparent"></div>

            {/* Close button */}
            <button
              onClick={onClose}
              type="button"
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/[0.05] text-slate-400 hover:text-white transition-all cursor-pointer border-none"
            >
              <X size={16} />
            </button>

            {/* Scrollable Content wrapper */}
            <div className="p-8 overflow-y-auto no-scrollbar space-y-6">
              {status !== "success" ? (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Header */}
                  <div className="space-y-2 text-center pt-3">
                    <span className="inline-flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] text-slate-300 text-[8.5px] font-extrabold uppercase tracking-[0.25em] px-3.5 py-1 rounded-full">
                      <Sparkles size={9} className="text-slate-300" />
                      Elite Membership
                    </span>
                    <h2 className="text-xl font-extrabold text-white tracking-tight font-sans">
                      Join "Rent a Friend" Waitlist
                    </h2>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      A delightful companion concierge curated for café dates, movie outings, local shopping walks, events, and supportive assistance.
                    </p>
                  </div>

                  {status === "submitting" ? (
                    /* Elegant loading state */
                    <div className="py-16 flex flex-col items-center justify-center space-y-5">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border border-white/5 animate-ping"></div>
                        <div className="w-10 h-10 rounded-full border-[1.5px] border-slate-700/50 border-t-white animate-[spin_1.2s_linear_infinite]"></div>
                      </div>
                      <div className="space-y-1 text-center animate-pulse">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-300">BLUBER Elite Concierge</p>
                        <p className="text-xs text-slate-500">Securing your spot on the private roster...</p>
                      </div>
                    </div>
                  ) : (
                    /* Initial Input Form */
                    <div className="space-y-5 text-left">
                      {/* Identity inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-[0.15em] font-black text-slate-400 block">Email Address</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Mail size={13} /></span>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="you@domain.com"
                              className="w-full bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] focus:border-white/35 focus:bg-white/[0.04] text-xs font-sans rounded-xl py-3 pl-10 pr-4 outline-none text-white transition-all placeholder:text-slate-600 shadow-inner"
                            />
                          </div>
                          {errors.email && <p className="text-[10px] font-bold text-red-400/90 leading-none">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-[0.15em] font-black text-slate-400 block">Phone Number</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"><Phone size={13} /></span>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="9816X XXXXX"
                              className="w-full bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] focus:border-white/35 focus:bg-white/[0.04] text-xs font-sans rounded-xl py-3 pl-10 pr-4 outline-none text-white transition-all placeholder:text-slate-600 shadow-inner"
                            />
                          </div>
                          {errors.phone && <p className="text-[10px] font-bold text-red-400/90 leading-none">{errors.phone}</p>}
                        </div>
                      </div>

                      {/* Select Lifestyle Interests */}
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-[0.15em] font-black text-slate-400 block">Select Preferred Companion Interests</label>
                        <div className="space-y-2">
                          {AVAILABLE_INTERESTS.map((interest) => {
                            const isSelected = selectedInterests.includes(interest.id);
                            return (
                              <div
                                key={interest.id}
                                onClick={() => handleToggleInterest(interest.id)}
                                className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer text-left flex items-start gap-3 select-none ${
                                  isSelected 
                                    ? "bg-white/[0.04] border-white/20 shadow-md" 
                                    : "bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.02] hover:border-white/[0.08]"
                                }`}
                              >
                                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected ? "bg-white border-white text-black" : "border-slate-700 bg-transparent"
                                }`}>
                                  {isSelected && <CheckCircle size={10} className="stroke-[3] text-black" />}
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="text-xs font-bold text-slate-100">{interest.label}</h4>
                                  <p className="text-[10.5px] text-slate-400 leading-normal">{interest.desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {errors.interests && <p className="text-[10px] font-bold text-red-400/90 leading-none mt-1">{errors.interests}</p>}
                      </div>

                      {/* Action Submission */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full bg-white hover:bg-slate-200 text-neutral-950 text-xs font-black py-4 rounded-2xl tracking-[0.1em] uppercase transition-all shadow-[0_10px_25px_rgba(255,255,255,0.05)] cursor-pointer hover:shadow-[0_12px_30px_rgba(255,255,255,0.1)] hover:-translate-y-[1px] active:translate-y-0 border-none flex items-center justify-center gap-1.5"
                        >
                          <span>Secure My Position</span>
                          <ChevronRight size={14} className="stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                /* Success screen */
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 space-y-6 text-center"
                >
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-[0_8px_20px_rgba(52,211,153,0.1)]">
                    <CheckCircle size={26} className="stroke-[2.5]" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-[0.25em] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 px-3 py-1 rounded-full">Spot Secured</span>
                    <h2 className="text-xl font-extrabold text-white tracking-tight leading-tight">Welcome to BLUBER Elite</h2>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Your waitlist registration is complete. We are vetting premium gentlemen companions inside Chamba for launch.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-left max-w-xs mx-auto space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Waitlist Position:</span>
                      <strong className="text-white font-extrabold">#247</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Verified Email:</span>
                      <strong className="text-white font-bold truncate max-w-[150px]">{email}</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Launch Location:</span>
                      <strong className="text-slate-400 font-bold">Chamba Municipal, HP</strong>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                    You'll receive an invitation shortly once companion screening and security protocol checks are finalized.
                  </p>

                  <button
                    onClick={onClose}
                    type="button"
                    className="w-full bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold py-3.5 rounded-2xl tracking-wider uppercase transition-all cursor-pointer border border-white/[0.05]"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
