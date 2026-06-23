import React from "react";
import { 
  CloudSun, 
  Car, 
  Compass, 
  TrendingUp, 
  ChevronRight, 
  X,
  CloudRain,
  Snowflake,
  Sun,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { LiveChambaInfo } from "../types";
import { getPricingTier } from "../utils/pricing";

interface ChambaSimulatorProps {
  info: LiveChambaInfo;
  onChange: (newInfo: LiveChambaInfo) => void;
  isOpen: boolean;
  onClose: () => void;
  custTime: Date;
  onCustTimeChange: (time: Date) => void;
}

export const ChambaSimulator: React.FC<ChambaSimulatorProps> = ({ info, onChange, isOpen, onClose, custTime, onCustTimeChange }) => {
  return (
    <>
      {/* Live Chamba Bar - High-fidelity single wide card */}
      <div 
        id="live-chamba-bar"
        onClick={onClose} // Toggle open/close on click
        className="w-full h-[72px] bg-[#F3F6F1] rounded-[24px] px-5 py-3 flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="bg-[#EDF7EF] p-2 rounded-xl text-primary">
            {info.weatherCondition === "Rainy" ? (
              <CloudRain size={24} className="fill-current" />
            ) : info.weatherCondition === "Snowy" ? (
              <Snowflake size={24} />
            ) : info.weatherCondition === "Sunny" ? (
              <Sun size={24} className="fill-current" />
            ) : (
              <CloudSun size={24} className="fill-current" />
            )}
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-text-primary tracking-tight">Live in Chamba</p>
            <p className="text-[11px] text-text-secondary">{info.weatherTemp}°C • {info.weatherCondition}</p>
          </div>
        </div>

        {/* Traffic Status */}
        <div className="flex items-center gap-3 border-l border-white/45 pl-4 text-left">
          <div className="bg-[#E0F2FE] p-2 rounded-xl text-blue-600">
            <Car size={24} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Traffic</p>
            <p className={`text-xs font-bold ${info.trafficLevel === "Light" ? "text-primary" : info.trafficLevel === "Moderate" ? "text-orange-500" : "text-rose-600"}`}>
              {info.trafficLevel}
            </p>
          </div>
        </div>

        {/* Roads Pass Status */}
        <div className="flex items-center gap-3 border-l border-white/45 pl-4 text-left">
          <div className="bg-[#FEF3C7] p-2 rounded-xl text-amber-600">
            <Compass size={24} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Jot Pass</p>
            <p className={`text-xs font-bold ${info.roadJotPassStatus === "Clear" ? "text-primary" : "text-rose-500"}`}>
              {info.roadJotPassStatus}
            </p>
          </div>
        </div>

        <ChevronRight size={20} className="text-text-secondary" />
      </div>

      {/* Simulator Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center pointer-events-auto p-4 backdrop-blur-xs">
          <div className="bg-surface w-full max-w-md rounded-[32px] shadow-custom p-6 pb-8 transition-transform animate-[slideUp_200ms_ease-out]">
            <div className="flex items-center justify-between mb-6">
              <div className="text-left">
                <h3 className="text-xl font-bold text-text-primary">Chamba Town Operations</h3>
                <p className="text-xs text-text-secondary">Simulate live alpine & delivery conditions</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-canvas rounded-full text-text-secondary hover:text-text-primary transition-colors border-none cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Weather selector */}
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2 text-left">Weather Condition</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "Partly Cloudy", icon: CloudSun, label: "Cloudy", temp: 22 },
                    { value: "Sunny", icon: Sun, label: "Sunny", temp: 30 },
                    { value: "Rainy", icon: CloudRain, label: "Rainy", temp: 16 },
                    { value: "Snowy", icon: Snowflake, label: "Snowy", temp: -1 }
                  ].map((w) => (
                    <button
                      type="button"
                      key={w.value}
                      onClick={() => onChange({ 
                        ...info, 
                        weatherCondition: w.value,
                        weatherTemp: w.temp
                      })}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                        info.weatherCondition === w.value 
                          ? "border-primary bg-primary-light text-primary font-medium" 
                          : "border-border-custom bg-canvas text-text-secondary"
                      }`}
                    >
                      <w.icon size={22} className="mb-1" />
                      <span className="text-[11px]">{w.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Traffic level */}
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2 text-left">Chamba Center Traffic</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "Light", label: "Light", desc: "Fast Riders" },
                    { value: "Moderate", label: "Moderate", desc: "No delays" },
                    { value: "Busy", label: "Busy", desc: "+5 Mins ETA" }
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.value}
                      onClick={() => onChange({ ...info, trafficLevel: t.value as any })}
                      className={`flex flex-col items-center p-3 rounded-2xl border transition-all cursor-pointer ${
                        info.trafficLevel === t.value 
                          ? "border-primary bg-primary-light text-primary font-medium" 
                          : "border-border-custom bg-canvas text-text-secondary"
                      }`}
                    >
                      <span className="text-xs font-black">{t.label}</span>
                      <span className="text-[9px] text-text-secondary mt-0.5">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Road Status (Jot Pass & Sach Pass) */}
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2 text-left">Mountain Passes Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-border-custom bg-canvas rounded-2xl p-3 text-left">
                    <p className="text-[11px] font-bold text-text-primary mb-1">Jot Pass (Chamba Entrance)</p>
                    <div className="flex gap-1.5 mt-2">
                      {["Clear", "Heavy Snow"].map((status) => (
                        <button
                          type="button"
                          key={status}
                          onClick={() => onChange({ ...info, roadJotPassStatus: status as any })}
                          className={`flex-1 text-[11px] py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                            info.roadJotPassStatus === status 
                              ? status === "Clear" ? "bg-primary text-white" : "bg-red-600 text-white"
                              : "bg-white border border-border-custom text-text-secondary"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border border-border-custom bg-canvas rounded-2xl p-3 text-left">
                    <p className="text-[11px] font-bold text-text-primary mb-1">Sach Pass (Pangi Road)</p>
                    <div className="flex gap-1.5 mt-2">
                      {["Clear", "Closed"].map((status) => (
                        <button
                          type="button"
                          key={status}
                          onClick={() => onChange({ ...info, roadSachPassStatus: status as any })}
                          className={`flex-1 text-[11px] py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                            info.roadSachPassStatus === status 
                              ? status === "Clear" ? "bg-primary text-white" : "bg-red-600 text-white"
                              : "bg-white border border-border-custom text-text-secondary"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Demand */}
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2 text-left">Town Surcharge Level</label>
                <div className="flex gap-3">
                  {[
                    { value: "Normal", label: "Standard Rates", bonus: "Free delivery" },
                    { value: "High Demand", label: "Rain Surcharge Enabled", bonus: "₹20 Peak fee" }
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.value}
                      onClick={() => onChange({ ...info, deliveryStatus: s.value as any })}
                      className={`flex-1 flex flex-col items-start p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                        info.deliveryStatus === s.value 
                          ? "border-primary bg-primary-light text-primary" 
                          : "border-border-custom bg-canvas text-text-secondary"
                      }`}
                    >
                      <span className="text-xs font-bold text-text-primary">{s.label}</span>
                      <span className="text-[10px] mt-0.5">{s.bonus}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Ride Tariff Time */}
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2 text-left">
                  Simulated Time & Tariff Preset
                </label>
                <div className="bg-canvas border border-border-custom rounded-2xl p-4 text-left space-y-3">
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-[#1E6B3D]" />
                      <span className="text-xs font-black text-text-primary">
                        {(custTime || new Date()).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </span>
                    </div>
                    <span className="text-[10px] bg-[#EDF7EF] text-[#1E6B3D] py-1 px-2.5 rounded-full font-black flex items-center gap-1">
                      <span>{getPricingTier(custTime || new Date()).icon}</span>
                      <span>{getPricingTier(custTime || new Date()).name}</span>
                      <span className="opacity-60">•</span>
                      <span>₹{getPricingTier(custTime || new Date()).rate}/KM</span>
                    </span>
                  </div>

                  <p className="text-[10px] text-text-secondary leading-normal font-medium">
                    Tap a time preset below to simulate local tariff tier transitions in real-time and trigger live notifications:
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Night", timeStr: "03:00 AM", hour: 3, min: 0, icon: "🌃" },
                      { label: "Early Morning", timeStr: "07:30 AM", hour: 7, min: 30, icon: "🌅" },
                      { label: "Morning Peak", timeStr: "09:00 AM", hour: 9, min: 0, icon: "🎒" },
                      { label: "Daytime", timeStr: "12:00 PM", hour: 12, min: 0, icon: "☀️" },
                      { label: "Evening Rush", timeStr: "08:00 PM", hour: 20, min: 0, icon: "🌉" },
                      { label: "Late Night", timeStr: "10:30 PM", hour: 22, min: 30, icon: "🌌" }
                    ].map((p) => {
                      const activeTime = custTime || new Date();
                      const isActive = activeTime.getHours() === p.hour && activeTime.getMinutes() === p.min;
                      return (
                        <button
                          type="button"
                          key={p.label}
                          onClick={() => {
                            const newDate = new Date();
                            newDate.setHours(p.hour);
                            newDate.setMinutes(p.min);
                            onCustTimeChange(newDate);
                          }}
                          className={`py-2 px-1 rounded-xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center ${
                            isActive 
                              ? "border-[#1E6B3D] bg-[#EDF7EF] text-[#1E6B3D] font-black shadow-sm scale-[1.02]" 
                              : "border-border-custom bg-white hover:bg-gray-50 text-text-secondary hover:border-gray-300"
                          }`}
                        >
                          <span className="text-xs">{p.icon}</span>
                          <span className="text-[9px] mt-0.5 leading-tight font-bold w-full truncate">{p.label}</span>
                          <span className="text-[8px] text-text-secondary mt-0.5 font-medium">{p.timeStr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Simulated Live Alert ticker */}
            <div className="mt-6 p-3 bg-primary-light rounded-xl flex items-start gap-2.5 text-left animate-fade-in border border-emerald-500/10">
              <AlertTriangle size={18} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-black text-primary">Live Operations Status Update</p>
                <p className="text-[10px] text-text-secondary leading-normal mt-0.5">
                  {info.roadJotPassStatus === "Heavy Snow" 
                    ? "Warning: Jot Pass has severe snow accumulation. Courier deliveries outside Chamba valley will face 1-day lag."
                    : info.weatherCondition === "Rainy" 
                    ? "Active weather advisory. Rain gear provided to all Bluber riders. Delivery speeds restricted for wet Chamba road safety."
                    : "Ideal operations weather in Chamba. 60 FPS courier matching with Chamba Chowgan hub."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full py-3.5 bg-primary text-white rounded-[20px] font-bold text-sm tracking-wide shadow-lg hover:opacity-90 active:scale-[0.98] transition-all border-none cursor-pointer"
            >
              Apply Weather & Road Metrics
            </button>
          </div>
        </div>
      )}
    </>
  );
};
