import React, { useState } from "react";
import { 
  Send,  
  Sparkles, 
  Info, 
  Package, 
  MessageSquare
} from "lucide-react";

interface CustomRequestsHomeWidgetProps {
  onAddCustomRequest: (desc: string, name: string, phone: string) => void;
}

export const CustomRequestsHomeWidget: React.FC<CustomRequestsHomeWidgetProps> = ({
  onAddCustomRequest
}) => {
  const [description, setDescription] = useState("");
  const [customerName, setCustomerName] = useState("Nitish Kaushal");
  const [phoneNumber, setPhoneNumber] = useState("+91-98782-99015");
  const [submitted, setSubmitted] = useState(false);
  const [errorWord, setErrorWord] = useState("");

  const examples = [
    { label: "🍔 Specific Restaurant Food", desc: "Need food from a specific restaurant in upper Chamba" },
    { label: "🍎 Custom Grocery Item", desc: "Need a custom grocery item (Yak cheese & traditional spices)" },
    { label: "📦 Courier Pickup", desc: "Need courier pickup from court road and deliver to bus stand" },
    { label: "🪵 Wood Packaging Boxes", desc: "Need local traditional wood packaging boxes for fruit shipping" },
    { label: "🛠️ Hardware Supplies", desc: "Need custom brass screws and traditional lock from main market" },
    { label: "🏍️ Elite Scooty Assistance", desc: "Need assistance with a customized scooty delivery routing" },
    { label: "💊 Specific Pharmacy Medicine", desc: "Need medicine from specific Sharma Medical Store on Main Street" },
    { label: "✏️ Something Else", desc: "Need a custom mountain item not listed in the app catalog" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorWord("Please describe your custom request first.");
      return;
    }
    setErrorWord("");

    // Submit request to main state & localStorage
    onAddCustomRequest(description, customerName, phoneNumber);
    setSubmitted(true);
    
    // Reset form helper
    setTimeout(() => {
      setDescription("");
      setSubmitted(false);
    }, 4500);
  };

  return (
    <div id="home-custom-requests-widget" className="mt-6 bg-gradient-to-br from-[#F5F8F6] to-white border border-[#1E6B3D]/15 rounded-[28px] p-5 shadow-sm text-left space-y-4">
      
      {/* Concierge Illustration Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 bg-[#1E6B3D]/10 text-[#1E6B3D] px-2.5 py-0.75 rounded-full text-[9px] font-black uppercase tracking-wider">
            <Sparkles size={10} className="animate-spin text-[#1E6B3D]" />
            <span>Concierge dispatch</span>
          </div>
          <h3 className="text-sm font-black text-[#111827] mt-1 tracking-tight">Can't find what you need?</h3>
          <p className="text-[10.5px] text-text-secondary leading-normal">
            Tell us what you're looking for and we'll do our best to arrange it for you.
          </p>
        </div>
        
        {/* Delivery + Search illustration */}
        <div className="relative w-14 h-14 bg-gradient-to-br from-[#E8F5EC] to-[#EDF7EF] rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100 shrink-0 select-none overflow-hidden">
          <svg 
            width="22" 
            height="22" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="text-emerald-700 drop-shadow-sm"
          >
            {/* Rear Wheel */}
            <circle cx="6" cy="17" r="2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="17" r="0.75" fill="currentColor" />
            
            {/* Front Wheel */}
            <circle cx="18" cy="17" r="2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="18" cy="17" r="0.75" fill="currentColor" />
            
            {/* Floorboard / Deck */}
            <path d="M8.5 17h6.5c0.8 0 1.2-0.4 1.2-1.2v-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Chassis / Body */}
            <path d="M6 14.5c0-2.5 1.5-3.5 3.5-3.5h3c1 0 1.5 0.5 1.5 1.5v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Premium Seat */}
            <path d="M7.5 11h4.5c0.8 0 1.2-0.4 1.2-1v-0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Steering Fork & Front Fender */}
            <path d="M18 14.5l-2.5-7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Front Cowl & Handlebar */}
            <path d="M15.5 7h-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12.5 6h4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="absolute -top-1.5 -right-1.5 bg-[#1E6B3D] text-white p-1 rounded-md text-[9px]">
            ✨
          </div>
          <div className="absolute -bottom-1 -left-1 bg-white border border-border-custom px-1.5 py-0.5 rounded text-[8px] font-black shadow-xs flex items-center gap-0.5">
            <span>🔎</span>
            <span>FIND</span>
          </div>
        </div>
      </div>

      {submitted ? (
        <div className="bg-[#EDF7EF] text-[#1E6B3D] p-5 rounded-2xl border border-[#1E6B3D]/20 text-center space-y-3 animate-fade-in">
          <span className="text-2xl block">🏔️ Courier En-route</span>
          <h4 className="text-xs font-black uppercase">Request Dispatched Successfully!</h4>
          <p className="text-[10px] text-text-secondary leading-normal">
            Founder Nitish and the Bluber team have received your request <strong>"{description}"</strong>. We will contact you at <strong>{phoneNumber}</strong> shortly to align dispatch rates!
          </p>
          <div className="text-[10px] font-bold text-[#1E6B3D] bg-white/60 py-1.5 px-3 rounded-xl inline-block mt-1">
            Check details inside the "Orders" and "Admin" tabs.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Quick chip examples */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-text-secondary">Tap examples to fill instantly:</label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-nowrap shrink-0">
              {examples.map((item, id) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => {
                    setDescription(item.desc);
                    setErrorWord("");
                  }}
                  className="px-3 py-1.5 bg-white border border-border-custom hover:border-primary rounded-full text-[10px] font-bold text-text-primary whitespace-nowrap active:scale-95 transition-all text-left block cursor-pointer select-none"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description Text area */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Describe your request:</label>
              {errorWord && <span className="text-[9.5px] text-rose-500 font-extrabold">{errorWord}</span>}
            </div>
            <textarea
              rows={3}
              placeholder="Describe your request... (e.g. Please pick up custom wooden boxes, milk packets from Chamba Central Warehouse, etc.)"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if(errorWord) setErrorWord("");
              }}
              className="w-full text-xs font-medium p-3.5 bg-white border border-border-custom rounded-2xl focus:outline-none focus:border-[#1E6B3D] focus:ring-1 focus:ring-[#1E6B3D] placeholder:text-text-secondary/60 leading-relaxed resize-none shadow-xs text-left"
            ></textarea>
          </div>

          {/* User information details */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-extrabold text-text-secondary">Your Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full text-xs font-semibold px-3.5 py-2.5 bg-white border border-border-custom rounded-xl focus:outline-none focus:border-[#1E6B3D]"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-extrabold text-text-secondary">WhatsApp / Phone</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full text-xs font-semibold px-3.5 py-2.5 bg-white border border-border-custom rounded-xl focus:outline-none focus:border-[#1E6B3D]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-1.5">
            <button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-[#1E6B3D] text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer border-none"
            >
              <Send size={15} />
              <span>Send Request</span>
            </button>
            
            <a
              href="https://wa.me/919816402487?text=Hello%20Bluber%20Support%2C%20I%20have%20a%20custom%20request%20concierge%20inquiry"
              target="_blank"
              rel="noreferrer"
              className="h-10 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <MessageSquare size={14} />
              <span>Contact Support Desk</span>
            </a>
          </div>
        </form>
      )}

      {/* Info Notice Box */}
      <div className="bg-[#EDF7EF]/60 p-3.5 rounded-2xl border border-[#1E6B3D]/10 flex items-start gap-2.5 text-[9.5px] text-text-secondary leading-normal">
        <Info size={14} className="text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-left">
          <p className="font-extrabold text-[#1E6B3D] uppercase text-[8.5px]">early launch phase notice</p>
          <p>BLUBER is currently in its early launch phase. While we try our best to help, some requests may not be available immediately. New services, products and delivery options are being added regularly. Thank you for helping us build a better experience for Chamba.</p>
        </div>
      </div>

    </div>
  );
};
