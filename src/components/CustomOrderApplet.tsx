import React, { useState } from "react";
import { 
  ArrowLeft,  
  CheckCircle,
  Package,
  Wrench,
  Book,
  Send,
  MessageSquare,
  Sparkles
} from "lucide-react";

interface CustomOrderAppletProps {
  onAddCustomOrder: (desc: string) => void;
  onBack: () => void;
  user?: any;
}

export const CustomOrderApplet: React.FC<CustomOrderAppletProps> = ({
  onAddCustomOrder,
  onBack,
  user
}) => {
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    if (!user) {
      onAddCustomOrder(description);
      return;
    }
    onAddCustomOrder(description);
    setIsSubmitted(true);
    setDescription("");
  };

  const itemSuggestions = [
    { text: "Need 10 shipping cardboard cartons for apples packing", icon: "📦" },
    { text: "Hardware supplies: M10 bolts and a heavy screw-driver", icon: "🔧" },
    { text: "High school chemistry text-books from Court road stationery", icon: "📚" },
    { text: "Get pure organic Himalayan flower-honey from Chamba bazaar", icon: "🍯" }
  ];

  return (
    <div id="custom-order-root" className="px-5 py-5 animate-fade-in pb-28 text-left">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-6">
        <button 
          onClick={onBack}
          className="p-3 bg-white rounded-full text-text-primary hover:scale-105 active:scale-95 transition-all shadow-sm border border-border-custom/50"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-text-primary">Custom Market Request</h2>
          <p className="text-xs text-text-secondary">Anything from Chamba sourced & delivered</p>
        </div>
      </div>

      {isSubmitted ? (
        <div className="bg-white rounded-3xl p-6 text-center border border-emerald-100 shadow-custom animate-fade-in space-y-4">
          <div className="w-14 h-14 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto mb-2 scale-110">
            <CheckCircle size={36} className="text-[#1E6B3D]" />
          </div>
          <h3 className="text-base font-bold text-text-primary">Request Lodged Successfully!</h3>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            Your custom request has been transmitted directly to our Chief Dispatcher in Chamba. We will review the specifications and update your booking status in the orders tab.
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <a 
              href="https://wa.me/919816402487?text=Regarding%20My%20Custom%20Market%20Request%20Booking..."
              className="bg-primary hover:bg-[#1E6B3D] text-white py-3 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 border-none"
            >
              <MessageSquare size={16} />
              Contact Support Desk
            </a>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="bg-canvas border border-border-custom text-text-primary py-3 rounded-2xl text-xs font-bold hover:bg-surface transition-all cursor-pointer"
            >
              Request Something Else
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Main order form */}
          <form id="custom-request-form" onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 shadow-custom border border-border-custom/40 space-y-4">
            <div>
              <label className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider block mb-1">
                What do you need?
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe exactly what product, quantity, and market shop location you want... (e.g. '3 wooden cartons from Gandhi Chowk fruit vendor and 2 meters of copper wire from Verma Hardware')"
                rows={4}
                required
                className="w-full text-xs font-medium bg-canvas border border-border-custom rounded-2xl p-4 focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed placeholder:opacity-50 text-left"
              />
            </div>

            {/* Suggesters */}
            <div>
              <p className="text-[10px] font-bold text-text-secondary mb-2 uppercase tracking-wide">Common Requests:</p>
              <div className="space-y-1.5">
                {itemSuggestions.map((sug, i) => (
                  <div 
                    key={i}
                    onClick={() => setDescription(sug.text)}
                    className="p-2.5 bg-canvas hover:bg-[#EDF7EF]/50 rounded-xl flex items-center gap-2.5 cursor-pointer text-[11px] font-medium text-text-primary transition-colors border border-transparent hover:border-primary/20"
                  >
                    <span>{sug.icon}</span>
                    <span className="truncate">{sug.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-3 border-t border-border-custom/40 space-y-2.5">
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-[#1E6B3D] text-white py-3.5 rounded-2xl text-xs font-black tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 border-none"
              >
                <Send size={16} />
                Submit Custom Request
              </button>

              <a 
                href="https://wa.me/919816402487?text=Hello%20Bluber%20Support%2C%20I%20have%20questions%20about%20ordering%20a%20custom%20item%20in%20Chamba"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-1.5 active:scale-95 transition-all text-sm block"
              >
                <MessageSquare size={14} />
                WhatsApp Chamba Helpline
              </a>
            </div>
          </form>

          {/* Philosophy info banner */}
          <div className="bg-[#EDF7EF] p-4.5 rounded-2xl flex items-start gap-3">
            <span className="text-xl">🏔️</span>
            <div>
              <h4 className="text-xs font-bold text-primary flex items-center gap-1">
                <Sparkles size={12} className="text-[#1E6B3D]" />
                Owner Sourced & Verified
              </h4>
              <p className="text-[10px] text-text-secondary leading-relaxed mt-1">
                At Bluber, we don't make you search stores. Just specify what you require. Our core logistics driver team will buy the pristine quality directly from hand-picked local Chamba markets and deliver to your doorstep.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
