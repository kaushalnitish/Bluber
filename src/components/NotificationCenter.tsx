import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Bell, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Rocket, 
  Check, 
  BellOff,
  Trash2
} from "lucide-react";

export interface NotificationItem {
  id: string;
  emoji: string;
  title: string;
  message: string;
  status?: string;
  category?: string;
  isRead?: boolean;
  createdAt: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onClearAll: () => void;
  isVMartReleased: boolean;
  onToggleReleaseVMart: () => void;
  onResetVMartBanner: () => void;
  isNotifiedVMart: boolean;
  isNotifiedEliteBuddy: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  isVMartReleased,
  onToggleReleaseVMart,
  onResetVMartBanner,
  isNotifiedVMart,
  isNotifiedEliteBuddy
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 pointer-events-auto"
          />

          {/* Premium Bottom Sheet / Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-[32px] shadow-[0_-16px_48px_rgba(0,0,0,0.12)] z-50 pointer-events-auto flex flex-col overflow-hidden text-left"
          >
            {/* Top Indicator bar */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-3 shrink-0" />

            {/* Header */}
            <div className="px-6 pb-4 pt-2 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-[#EDF7EF] text-primary rounded-2xl relative">
                  <Bell size={20} className="animate-swing" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-text-primary font-sans tracking-tight">Notification Hub</h3>
                  <p className="text-xs text-text-secondary">Track registrations & premium launches</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearAll}
                    className="p-2 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-full transition-colors border-none cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Clear All"
                  >
                    <Trash2 size={15} />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2.5 bg-gray-100 hover:bg-gray-200 text-text-secondary hover:text-text-primary rounded-full transition-colors border-none cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar">
              
              {notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 border border-dashed border-gray-200">
                    <BellOff size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-text-primary">No new alerts</p>
                    <p className="text-xs text-text-secondary max-w-[240px]">
                      Subscribe to upcoming features like V-Mart or Rent a Friend to receive live status updates!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                        item.id === "vmart-waitlist" && isVMartReleased
                          ? "bg-emerald-50/50 border-emerald-100 shadow-[0_4px_16px_rgba(16,185,129,0.06)]"
                          : item.id === "vmart-waitlist"
                          ? "bg-indigo-50/40 border-indigo-100/70"
                          : "bg-gray-50/50 border-gray-100"
                      }`}
                    >
                      {item.id === "vmart-waitlist" && isVMartReleased && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
                      )}

                      <div className="flex gap-3.5">
                        <span className="text-2xl select-none shrink-0">{item.emoji}</span>
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h4 className="text-xs font-black text-text-primary font-sans leading-none tracking-tight">
                              {item.title}
                            </h4>
                            <span className="text-[9px] text-text-secondary font-mono">
                              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-[11.5px] text-text-secondary leading-relaxed font-sans">
                            {item.message}
                          </p>

                          {/* Extra Metadata Cards */}
                          {(item.status || item.category) && (
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                              {item.category && (
                                <span className="bg-gray-100 text-gray-600 border border-gray-200/50 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-tight">
                                  {item.category}
                                </span>
                              )}
                              {item.status && (
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-tight uppercase ${
                                  item.status === "Waiting"
                                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                                    : item.status === "Released"
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200 animate-pulse"
                                    : "bg-gray-100 text-gray-700 border border-gray-200"
                                }`}>
                                  Status: {item.status}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Developer Testing / Simulated Control Panel */}
              <div className="mt-8 pt-5 border-t border-gray-100 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles size={14} className="text-amber-500" />
                  <p className="text-[10px] font-black text-text-primary uppercase tracking-widest font-sans">
                    Premium Interactive Controls
                  </p>
                </div>
                
                <p className="text-[10.5px] text-text-secondary leading-relaxed mb-4">
                  Experience Apple-level transitions! Toggle the live launch of V-Mart or reset the home banner to test the custom notify animations.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={onToggleReleaseVMart}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all active:scale-97 cursor-pointer ${
                      isVMartReleased
                        ? "bg-amber-100 hover:bg-amber-200/80 text-amber-800 border border-amber-200"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm border-none"
                    }`}
                  >
                    {isVMartReleased ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Unrelease V-Mart</span>
                      </>
                    ) : (
                      <>
                        <Rocket size={13} />
                        <span>Officially Launch V-Mart!</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onResetVMartBanner}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-text-primary rounded-xl text-xs font-black transition-all active:scale-97 cursor-pointer shadow-xs"
                  >
                    <RefreshCw size={13} />
                    <span>Reset Home Banner</span>
                  </button>
                </div>

                {/* Debug info */}
                <div className="mt-3 pt-3 border-t border-gray-100/70 flex justify-between text-[9px] font-mono text-gray-400">
                  <span>V-Mart Waitlist: {isNotifiedVMart ? "Yes" : "No"}</span>
                  <span>Friend Waitlist: {isNotifiedEliteBuddy ? "Yes" : "No"}</span>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
