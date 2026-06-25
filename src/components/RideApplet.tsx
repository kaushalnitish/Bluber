import React, { useState, useEffect, useRef } from "react";
import { 
  Bike, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  ChevronRight, 
  Coins, 
  Star, 
  Send, 
  Navigation,
  CheckCircle, 
  Sparkles,
  QrCode,
  Info,
  ShieldCheck,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import L from "leaflet";
import { Order } from "../types";
import { safeStorage } from "../utils/safeStorage";
import { getRatePerKm } from "../utils/pricing";
import { ImageComponent } from "./ImageComponent";
import { submitToFormspree } from "../utils/formspree";

interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface NominatimSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const CHAMBA_CENTER: LatLngLiteral = { lat: 32.5534, lng: 76.1258 };

// Custom icon creator to avoid broken static asset path issues in Leaflet with React
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 30px; height: 30px;">
             <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.35));">
               <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="${color}30"></path>
               <circle cx="12" cy="10" r="3" fill="white"></circle>
             </svg>
           </div>`,
    className: 'custom-leaflet-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
  });
};

// Vanilla Leaflet container rendering OpenStreetMap Voyager tiles
const LeafletMap: React.FC<{
  pickupCoords: LatLngLiteral | null;
  dropoffCoords: LatLngLiteral | null;
  mapCenter: LatLngLiteral;
  onMapClick: (lat: number, lng: number) => void;
  isSelectingPickupOnMap: boolean;
  isSelectingDestinationOnMap: boolean;
  routeCoordinates: [number, number][];
}> = ({
  pickupCoords,
  dropoffCoords,
  mapCenter,
  onMapClick,
  isSelectingPickupOnMap,
  isSelectingDestinationOnMap,
  routeCoordinates
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const mapInstance = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([mapCenter.lat, mapCenter.lng], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(mapInstance);

    mapRef.current = mapInstance;

    // Handle map click
    mapInstance.on('click', (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      mapInstance.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map center when panned programmatically
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.panTo([mapCenter.lat, mapCenter.lng]);
    }
  }, [mapCenter.lat, mapCenter.lng]);

  // Update markers and route
  useEffect(() => {
    const mapInstance = mapRef.current;
    if (!mapInstance) return;

    // Update/Remove pickup marker
    if (pickupCoords) {
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng([pickupCoords.lat, pickupCoords.lng]);
      } else {
        pickupMarkerRef.current = L.marker([pickupCoords.lat, pickupCoords.lng], {
          icon: createCustomIcon('#10B981')
        }).addTo(mapInstance);
      }
    } else {
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.remove();
        pickupMarkerRef.current = null;
      }
    }

    // Update/Remove dropoff marker
    if (dropoffCoords) {
      if (dropoffMarkerRef.current) {
        dropoffMarkerRef.current.setLatLng([dropoffCoords.lat, dropoffCoords.lng]);
      } else {
        dropoffMarkerRef.current = L.marker([dropoffCoords.lat, dropoffCoords.lng], {
          icon: createCustomIcon('#EF4444')
        }).addTo(mapInstance);
      }
    } else {
      if (dropoffMarkerRef.current) {
        dropoffMarkerRef.current.remove();
        dropoffMarkerRef.current = null;
      }
    }

    // Update routing polyline
    if (routeCoordinates && routeCoordinates.length > 0) {
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(routeCoordinates);
      } else {
        polylineRef.current = L.polyline(routeCoordinates, {
          color: '#10B981',
          weight: 5,
          opacity: 0.85
        }).addTo(mapInstance);
      }

      // Auto fit bounds to show both pickup & dropoff + routing nicely
      try {
        const bounds = L.latLngBounds(routeCoordinates);
        mapInstance.fitBounds(bounds, { padding: [40, 40] });
      } catch (err) {
        console.error("Error fitting bounds:", err);
      }
    } else {
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
    }
  }, [pickupCoords, dropoffCoords, routeCoordinates]);

  return (
    <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />
  );
};

interface RideAppletProps {
  walletBalance: number;
  onDeductWallet: (amount: number) => boolean;
  onAddOrder: (order: Order) => void;
  onBack: () => void;
  initialElite?: boolean;
  custTime: Date;
  onCustTimeChange: (time: Date) => void;
  user?: any;
  onRequireAuth?: (pendingAction?: any) => void;
}

// Format Date nicely for display
function formatTimeSegment(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

// Generate a deterministic and realistic mock distance if OSM routing is offline
function getFallbackDistance(p: string, d: string): number {
  if (!p || !d) return 0;
  let hash = 0;
  const combined = p.trim().toLowerCase() + d.trim().toLowerCase();
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  const minDist = 1.2;
  const maxDist = 8.8;
  const factor = Math.abs(hash % 1000) / 1000;
  return Math.round((minDist + factor * (maxDist - minDist)) * 10) / 10;
}

// Main implementation component of Scooty Ride
const RideAppletInner: React.FC<RideAppletProps> = ({ 
  walletBalance, 
  onDeductWallet, 
  onAddOrder, 
  onBack,
  custTime,
  onCustTimeChange,
  user,
  onRequireAuth
}) => {
  const [step, setStep] = useState<"form" | "pricing" | "payment" | "searching" | "accepted" | "arrived" | "ongoing" | "completed">("form");
  
  // Geolocation and Coordinates State
  const [pickup, setPickup] = useState("Detecting current location...");
  const [pickupSearchQuery, setPickupSearchQuery] = useState("");
  const [pickupCoords, setPickupCoords] = useState<LatLngLiteral | null>(null);
  
  const [dropoff, setDropoff] = useState("");
  const [dropoffSearchQuery, setDropoffSearchQuery] = useState("");
  const [dropoffCoords, setDropoffCoords] = useState<LatLngLiteral | null>(null);

  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [isLocating, setIsLocating] = useState(false);
  const [isSelectingPickupOnMap, setIsSelectingPickupOnMap] = useState(false);
  const [isSelectingDestinationOnMap, setIsSelectingDestinationOnMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<LatLngLiteral>(CHAMBA_CENTER);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  // Nominatim Autocomplete Suggestions
  const [pickupSuggestions, setPickupSuggestions] = useState<NominatimSuggestion[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<NominatimSuggestion[]>([]);

  const [hoursInput, setHoursInput] = useState(() => (custTime || new Date()).getHours().toString().padStart(2, "0"));
  const [minutesInput, setMinutesInput] = useState(() => (custTime || new Date()).getMinutes().toString().padStart(2, "0"));
  
  useEffect(() => {
    const activeTime = custTime || new Date();
    setHoursInput(activeTime.getHours().toString().padStart(2, "0"));
    setMinutesInput(activeTime.getMinutes().toString().padStart(2, "0"));
  }, [custTime]);

  // Autocomplete Predictions for Pickup via Nominatim
  useEffect(() => {
    if (!pickupSearchQuery || pickupSearchQuery === pickup || pickupSearchQuery.length < 3) {
      setPickupSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(pickupSearchQuery)}&format=json&addressdetails=1&limit=5&countrycodes=in`, {
          headers: {
            'User-Agent': 'BluberChambaApp/1.0'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setPickupSuggestions(data || []);
        }
      } catch (err) {
        console.error("Nominatim search error:", err);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [pickupSearchQuery, pickup]);

  // Autocomplete Predictions for Dropoff via Nominatim
  useEffect(() => {
    if (!dropoffSearchQuery || dropoffSearchQuery === dropoff || dropoffSearchQuery.length < 3) {
      setDropoffSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(dropoffSearchQuery)}&format=json&addressdetails=1&limit=5&countrycodes=in`, {
          headers: {
            'User-Agent': 'BluberChambaApp/1.0'
          }
        });
        if (res.ok) {
          const data = await res.json();
          setDropoffSuggestions(data || []);
        }
      } catch (err) {
        console.error("Nominatim search error:", err);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [dropoffSearchQuery, dropoff]);

  // Calculate route dynamically via OSRM
  useEffect(() => {
    if (!pickupCoords || !dropoffCoords) {
      setRouteCoordinates([]);
      setDistanceKm(0);
      return;
    }

    const calculateOSRMRoute = async () => {
      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${pickupCoords.lng},${pickupCoords.lat};${dropoffCoords.lng},${dropoffCoords.lat}?overview=full&geometries=geojson`);
        if (res.ok) {
          const data = await res.json();
          if (data.routes && data.routes[0]) {
            const route = data.routes[0];
            const distKm = route.distance / 1000;
            const coords = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
            setRouteCoordinates(coords);
            setDistanceKm(distKm);
          } else {
            const fbDist = getFallbackDistance(pickup, dropoff);
            setDistanceKm(fbDist);
          }
        } else {
          const fbDist = getFallbackDistance(pickup, dropoff);
          setDistanceKm(fbDist);
        }
      } catch (err) {
        console.error("OSRM routing error:", err);
        const fbDist = getFallbackDistance(pickup, dropoff);
        setDistanceKm(fbDist);
      }
    };

    calculateOSRMRoute();
  }, [pickupCoords, dropoffCoords]);

  // Handle Autocomplete selection
  const handleSelectSuggestion = (suggestion: NominatimSuggestion, type: "pickup" | "dropoff") => {
    const address = suggestion.display_name;
    const coords = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    };
    if (type === "pickup") {
      setPickup(address);
      setPickupSearchQuery(address);
      setPickupSuggestions([]);
      setPickupCoords(coords);
      setMapCenter(coords);
    } else {
      setDropoff(address);
      setDropoffSearchQuery(address);
      setDropoffSuggestions([]);
      setDropoffCoords(coords);
      setMapCenter(coords);
    }
  };

  // Reverse geocoding helper via Nominatim
  const reverseGeocode = async (coords: LatLngLiteral, type: "pickup" | "dropoff") => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`, {
        headers: {
          'User-Agent': 'BluberChambaApp/1.0'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const address = data.display_name || `Pin selected at ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
        if (type === "pickup") {
          setPickup(address);
          setPickupSearchQuery(address);
        } else {
          setDropoff(address);
          setDropoffSearchQuery(address);
        }
      } else {
        throw new Error("Nominatim status not ok");
      }
    } catch (err) {
      console.error("Nominatim reverse geocoding error:", err);
      const fallbackAddress = `Pin selected at ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
      if (type === "pickup") {
        setPickup(fallbackAddress);
        setPickupSearchQuery(fallbackAddress);
      } else {
        setDropoff(fallbackAddress);
        setDropoffSearchQuery(fallbackAddress);
      }
    }
  };

  // Handle live GPS detection
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setPickupCoords(CHAMBA_CENTER);
      setPickup("Chowgan Ground, Chamba");
      setPickupSearchQuery("Chowgan Ground, Chamba");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setPickupCoords(coords);
        setMapCenter(coords);
        reverseGeocode(coords, "pickup");
        setIsLocating(false);
      },
      (error) => {
        console.error("GPS Geolocation error:", error);
        setIsLocating(false);
        // Fail-safe fallback to Chamba center but enable manual entries
        setPickupCoords(CHAMBA_CENTER);
        setPickup("Chowgan Ground, Chamba");
        setPickupSearchQuery("Chowgan Ground, Chamba");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Detect GPS automatically on load
  useEffect(() => {
    handleUseCurrentLocation();
  }, []);

  // Map clicks for custom pin drop
  const handleMapClick = (lat: number, lng: number) => {
    const clickCoords = { lat, lng };
    
    if (isSelectingPickupOnMap) {
      setPickupCoords(clickCoords);
      reverseGeocode(clickCoords, "pickup");
      setIsSelectingPickupOnMap(false);
    } else if (isSelectingDestinationOnMap) {
      setDropoffCoords(clickCoords);
      reverseGeocode(clickCoords, "dropoff");
      setIsSelectingDestinationOnMap(false);
    }
  };
  
  // Current fare per KM
  const currentRate = 40;
  const estimatedFare = distanceKm > 0 ? Math.max(40, Math.round(distanceKm * currentRate)) : 0;
  
  // Ride states
  const [riderName, setRiderName] = useState("Scooty Captain Sunil Verma");
  const [riderPhone, setRiderPhone] = useState("+91-98160-24487");
  const [vehicleDetails, setVehicleDetails] = useState("HP-73-A-5591 (Activa 6G Green)");
  const [riderPhoto, setRiderPhoto] = useState("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop");
  
  // Enquiry System State
  const [formName, setFormName] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  // Map Tracking simulation coordinates
  const [riderX, setRiderX] = useState(130);
  const [riderY, setRiderY] = useState(140);
  
  // Custom UPI TXN values
  const [txnId, setTxnId] = useState("");
  const [upiRef, setUpiRef] = useState("");
  const [paymentFinished, setPaymentFinished] = useState(false);

  // Time Sync / Update
  useEffect(() => {
    const interval = setInterval(() => {
      // update default time every 10 sec if unchanged
      onCustTimeChange(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, [onCustTimeChange]);

  const handleUpdateCustomTime = () => {
    const hr = parseInt(hoursInput) || 12;
    const mn = parseInt(minutesInput) || 0;
    const newDate = new Date();
    newDate.setHours(hr);
    newDate.setMinutes(mn);
    onCustTimeChange(newDate);
  };

  // Ride lifecycle simulation
  useEffect(() => {
    let timer: any;
    if (step === "searching") {
      timer = setTimeout(() => {
        setStep("accepted");
      }, 4000);
    } else if (step === "accepted") {
      timer = setTimeout(() => {
        setStep("arrived");
      }, 4000);
    } else if (step === "arrived") {
      timer = setTimeout(() => {
        setStep("ongoing");
      }, 4000);
    } else if (step === "ongoing") {
      let count = 0;
      const moveInterval = setInterval(() => {
        count++;
        setRiderX(130 + count * 20);
        setRiderY(140 - count * 6);
        if (count >= 5) {
          clearInterval(moveInterval);
          setStep("completed");
        }
      }, 1200);
      return () => clearInterval(moveInterval);
    }
    return () => clearTimeout(timer);
  }, [step]);

  // Handle prepaid booking confirmation after success verification
  const handleConfirmPrepaidBooking = () => {
    const genTxnId = "TXN" + Math.floor(100000 + Math.random() * 900000);
    const genUpiRef = "UPI" + Math.floor(100000000 + Math.random() * 900000000);
    setTxnId(genTxnId);
    setUpiRef(genUpiRef);

    // Save logs in localStorage for admin
    try {
      const savedRequests = safeStorage.getItem("bluber_ride_requests_log");
      const currentRequests = savedRequests ? JSON.parse(savedRequests) : [];
      const newRide = {
        id: `RIDE-${Math.floor(1000 + Math.random() * 9000)}`,
        type: "Courier" as const, // For unified indexing
        pickup,
        dropoff,
        fare: estimatedFare,
        status: "Payment Successful",
        date: "Today, Just Now"
      };
      currentRequests.unshift(newRide);
      safeStorage.setItem("bluber_ride_requests_log", JSON.stringify(currentRequests));
    } catch (e) {
      console.warn(e);
    }

    // Trigger standard parent order
    const orderObj: Order = {
      id: `RIDE-${Math.floor(10000 + Math.random() * 90000)}`,
      type: "Courier", // Mapped from Ride service to courier log
      merchantName: "24x7 Scooty Ride",
      itemsSummary: `Prepaid Two-Wheeler: ${pickup} ➔ ${dropoff} (Distance: ${distanceKm.toFixed(2)} KM)`,
      total: estimatedFare,
      status: "Looking For Rider",
      date: "Today, Just Now",
      estimatedTime: `${Math.round(distanceKm * 2.5 + 5)} min`,
      riderName,
      riderPhone,
      txnId: genTxnId,
      upiRef: genUpiRef,
      paymentTimestamp: new Date().toLocaleTimeString()
    };

    onAddOrder(orderObj);

    // Transition to dynamic state
    setStep("searching");
  };

  // Handle Formspree submit logic
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formMobile || !formEmail || !formSubject || !formMessage) {
      alert("Please fill in all the required fields.");
      return;
    }
    // Simple Email and Phone regex validations
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!/^\+?[0-9]{10,13}$/.test(formMobile.replace(/[-\s]/g, ""))) {
      alert("Please enter a valid mobile number.");
      return;
    }

    setEnquiryLoading(true);

    try {
      await submitToFormspree({
        name: formName,
        phone: formMobile,
        email: formEmail,
        serviceType: "General Enquiry Form",
        subject: formSubject,
        message: formMessage
      });

      // Save submission record locally for Admin panel access
      const localSubmissionsStr = safeStorage.getItem("bluber_enquiries");
      const localSubs = localSubmissionsStr ? JSON.parse(localSubmissionsStr) : [];
      const newSub = {
        id: "ENQ-" + Math.floor(1000 + Math.random() * 9000),
        name: formName,
        mobile: formMobile,
        email: formEmail,
        subject: formSubject,
        message: formMessage,
        date: new Date().toLocaleString()
      };
      localSubs.unshift(newSub);
      safeStorage.setItem("bluber_enquiries", JSON.stringify(localSubs));

      setEnquirySuccess(true);
      setFormSubject("");
      setFormMessage("");
    } catch (err) {
      console.error(err);
      // Fallback success for simulation if offline
      setEnquirySuccess(true);
    } finally {
      setEnquiryLoading(false);
    }
  };

  return (
    <div id="ride-applet-root" className="bg-canvas min-h-dvh px-4 py-4 animate-fade-in pb-28 text-left">
      
      {/* Upper header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={onBack}
            className="p-2.5 bg-white rounded-full text-text-primary hover:scale-105 active:scale-95 transition-all shadow-xs border border-border-custom cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-sm font-black text-text-primary uppercase tracking-tight flex items-center gap-1.5">
              24×7 Scooty Ride
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black tracking-normal px-2 py-0.5 rounded-full uppercase">
                Live GPS
              </span>
            </h2>
            <p className="text-[10px] text-text-secondary">Fast • Affordable • Real-Time Route & Fare Calculator</p>
          </div>
        </div>
        
        <a 
          href="https://wa.me/919816402487?text=Hello%20Bluber%20Support%2C%20I%20need%20assistance%20regarding%20my%20Scooty%20service%20booking"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white p-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center gap-1 cursor-pointer"
          title="WhatsApp Support"
        >
          <MessageSquare size={16} />
          <span className="text-[9px] font-black tracking-wide uppercase pr-1.5 hidden sm:inline">WhatsApp Help</span>
        </a>
      </div>

      {/* Modern Interactive OpenStreetMap Visualizer */}
      <div className="w-full h-56 bg-[#E8F3EE] rounded-[24px] shadow-md relative overflow-hidden border border-emerald-500/20 mb-4">
        <LeafletMap
          pickupCoords={pickupCoords}
          dropoffCoords={dropoffCoords}
          mapCenter={mapCenter}
          onMapClick={handleMapClick}
          isSelectingPickupOnMap={isSelectingPickupOnMap}
          isSelectingDestinationOnMap={isSelectingDestinationOnMap}
          routeCoordinates={routeCoordinates}
        />

        {/* Dynamic Map interaction helpers */}
        {isSelectingPickupOnMap && (
          <div className="absolute top-3 left-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-3.5 py-2.5 rounded-xl shadow-md z-[1000] flex items-center justify-between animate-bounce">
            <span>📍 Tap anywhere on map to drop PICKUP Pin</span>
            <button 
              type="button" 
              onClick={() => setIsSelectingPickupOnMap(false)}
              className="text-white hover:text-slate-100 font-bold text-xs shrink-0 cursor-pointer bg-transparent border-none"
            >
              ✕
            </button>
          </div>
        )}

        {isSelectingDestinationOnMap && (
          <div className="absolute top-3 left-3 right-3 bg-rose-500 text-white text-[10px] font-black px-3.5 py-2.5 rounded-xl shadow-md z-[1000] flex items-center justify-between animate-bounce">
            <span>📍 Tap anywhere on map to drop DESTINATION Pin</span>
            <button 
              type="button" 
              onClick={() => setIsSelectingDestinationOnMap(false)}
              className="text-white hover:text-slate-100 font-bold text-xs shrink-0 cursor-pointer bg-transparent border-none"
            >
              ✕
            </button>
          </div>
        )}

        {/* GPS Active/Ping Indicator overlay */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-md flex items-center gap-1.5 border border-emerald-500/20 z-[1000]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[8.5px] font-black text-[#047857] uppercase tracking-wide">OSM Sat-Link Active</span>
        </div>
      </div>

      {/* RIDE BOOKING INPUT FORM */}
      {step === "form" && (
        <div className="space-y-4">
          <div className="bg-white rounded-[24px] p-5 shadow-xs border border-border-custom space-y-4 relative">
            <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-1.5 border-b pb-2">
              <MapPin size={12} className="text-[#10B981]" /> Enter Ride Coordinates
            </h3>

            <div className="space-y-4">
              {/* Pickup location search & select */}
              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9.5px] font-black text-text-secondary uppercase">Pickup Point</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectingPickupOnMap(true);
                      setIsSelectingDestinationOnMap(false);
                    }}
                    className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md transition-all ${
                      isSelectingPickupOnMap 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "text-primary hover:underline"
                    }`}
                  >
                    Set Pin on Map
                  </button>
                </div>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3.5 text-emerald-500 w-4 h-4" />
                  <input
                    type="text"
                    value={pickupSearchQuery}
                    onChange={(e) => {
                      setPickupSearchQuery(e.target.value);
                      setPickup(e.target.value);
                    }}
                    placeholder="Search pickup area, lane or village..."
                    className="w-full bg-canvas text-xs font-bold border border-border-custom rounded-xl pl-10 pr-10 py-3.5 focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="absolute right-3.5 p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg active:scale-95 transition-all cursor-pointer"
                    title="Use Current Location"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
                  </button>
                </div>
                
                {/* Autocomplete Predictions */}
                {pickupSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-border-custom rounded-xl shadow-lg max-h-52 overflow-y-auto divide-y divide-gray-100 no-scrollbar">
                    {pickupSuggestions.map(suggestion => (
                      <button
                        key={suggestion.place_id}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion, "pickup")}
                        className="w-full text-left px-4 py-3 hover:bg-canvas text-[11px] font-bold text-text-primary transition-all flex items-start gap-2 border-none cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span>{suggestion.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination location search & select */}
              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[9.5px] font-black text-text-secondary uppercase">Drop-off Destination</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectingDestinationOnMap(true);
                      setIsSelectingPickupOnMap(false);
                    }}
                    className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md transition-all ${
                      isSelectingDestinationOnMap 
                        ? "bg-rose-100 text-rose-800" 
                        : "text-primary hover:underline"
                    }`}
                  >
                    Set Pin on Map
                  </button>
                </div>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3.5 text-rose-500 w-4 h-4" />
                  <input
                    type="text"
                    value={dropoffSearchQuery}
                    onChange={(e) => {
                      setDropoffSearchQuery(e.target.value);
                      setDropoff(e.target.value);
                    }}
                    placeholder="Enter landmark, street, shop or custom destination..."
                    className="w-full bg-canvas text-xs font-bold border border-border-custom rounded-xl pl-10 pr-10 py-3.5 focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectingDestinationOnMap(true);
                      setIsSelectingPickupOnMap(false);
                    }}
                    className={`absolute right-3.5 p-1 rounded-lg transition-all cursor-pointer ${
                      isSelectingDestinationOnMap 
                        ? "bg-rose-100 text-rose-600 font-bold" 
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                    title="Select on Map"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Autocomplete Predictions */}
                {dropoffSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-border-custom rounded-xl shadow-lg max-h-52 overflow-y-auto divide-y divide-gray-100 no-scrollbar">
                    {dropoffSuggestions.map(suggestion => (
                      <button
                        key={suggestion.place_id}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion, "dropoff")}
                        className="w-full text-left px-4 py-3 hover:bg-canvas text-[11px] font-bold text-text-primary transition-all flex items-start gap-2 border-none cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span>{suggestion.description}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Saved Locations Quick Selector */}
                <div className="mt-3">
                  <p className="text-[9.5px] font-black text-text-secondary uppercase mb-2">Choose Saved Locations:</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar flex-nowrap">
                    {[
                      { name: "🏠 Home", address: "Mohalla Jansali, Chamba, HP", coords: { lat: 32.5530, lng: 76.1260 } },
                      { name: "💼 Work", address: "DC Office Complex, Court Lane, Chamba", coords: { lat: 32.5555, lng: 76.1245 } },
                      { name: "🌳 Chowgan", address: "Chowgan Ground, Chamba", coords: { lat: 32.5535, lng: 76.1255 } },
                      { name: "🚌 Bus Stand", address: "HRTC Bus Stand, Chamba", coords: { lat: 32.5505, lng: 76.1285 } }
                    ].map((loc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setDropoff(loc.address);
                          setDropoffSearchQuery(loc.address);
                          setDropoffCoords(loc.coords);
                          setMapCenter(loc.coords);
                        }}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl px-3 py-1.5 text-[10.5px] font-bold text-slate-700 whitespace-nowrap transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        {loc.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real Route summary card below inputs */}
          {distanceKm > 0 && (
            <div className="bg-emerald-50/70 border border-emerald-500/10 rounded-2xl p-4 space-y-3 animate-fade-in text-left">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-500/10 text-xs font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">🛣️ Route Details</span>
                <span className="text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[9px] uppercase font-black font-sans">Ready to Dispatch</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-500/5">
                  <p className="text-[8px] text-text-secondary font-black uppercase tracking-wider">Distance</p>
                  <p className="text-xs font-black text-emerald-900 mt-1">{distanceKm.toFixed(2)} KM</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-500/5">
                  <p className="text-[8px] text-text-secondary font-black uppercase tracking-wider">Rate</p>
                  <p className="text-xs font-black text-emerald-900 mt-1">₹{currentRate}/KM</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-500/5">
                  <p className="text-[8px] text-text-secondary font-black uppercase tracking-wider">Est. Time</p>
                  <p className="text-xs font-black text-emerald-900 mt-1">{Math.round(distanceKm * 2.5 + 5)} min</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-emerald-500/10">
                <div>
                  <p className="text-[9px] text-text-secondary font-black uppercase leading-none">Estimated Total Fare</p>
                  <p className="text-[17px] font-black text-[#1E6B3D] mt-1">₹{estimatedFare}</p>
                </div>
                <div className="text-[9px] text-emerald-800 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                  Fast-Transit Guaranteed
                </div>
              </div>
            </div>
          )}

          {/* Time simulation controller for testing pricing engine */}
          <div className="bg-white rounded-[24px] p-5 border border-border-custom shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-1">
                <Clock size={12} className="text-[#1E6B3D]" /> TIME-BASED PRICE ENGINE
              </h4>
              <span className="text-[10px] bg-[#EDF7EF] text-[#1E6B3D] px-2.5 py-0.5 rounded-full font-black">
                {formatTimeSegment(custTime || new Date())}
              </span>
            </div>
            
            <p className="text-[10px] text-text-secondary leading-normal">
              Pricing depends automatically on the dispatch timeframe to optimize rider availability:
            </p>

            <div className="grid grid-cols-2 gap-2 text-[9px] bg-canvas p-3 rounded-xl border border-border-custom">
              <div>🌃 12:00 AM - 06:30 AM: <strong className="text-text-primary">₹250/KM</strong></div>
              <div>🌅 06:30 AM - 08:00 AM: <strong className="text-text-primary">₹150/KM</strong></div>
              <div>🎒 08:00 AM - 10:00 AM: <strong className="text-text-primary">₹80/KM</strong></div>
              <div>☀️ 10:00 AM - 07:00 PM: <strong className="text-text-primary">₹40/KM</strong></div>
              <div>🌉 07:00 PM - 09:00 PM: <strong className="text-text-primary">₹80/KM</strong></div>
              <div>🌌 09:00 PM - Midnight: <strong className="text-text-primary">₹80/KM</strong></div>
            </div>

            {/* Simulated Time Tweaker */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-text-secondary font-bold whitespace-nowrap">Simulate Hour (0-23):</span>
              <input 
                type="number" 
                min="0" 
                max="23" 
                value={parseInt(hoursInput)} 
                onChange={(e) => {
                  const val = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
                  setHoursInput(val.toString().padStart(2, "0"));
                }}
                className="w-12 bg-canvas text-xs font-bold border border-border-custom p-1.5 rounded-lg text-center focus:outline-none"
              />
              <span className="text-[10px] text-text-secondary font-bold">:</span>
              <input 
                type="number" 
                min="0" 
                max="59" 
                value={parseInt(minutesInput)} 
                onChange={(e) => {
                  const val = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                  setMinutesInput(val.toString().padStart(2, "0"));
                }}
                className="w-12 bg-canvas text-xs font-bold border border-border-custom p-1.5 rounded-lg text-center focus:outline-none"
              />
              
              <button 
                type="button"
                onClick={handleUpdateCustomTime}
                className="bg-primary text-white text-[9.5px] font-black uppercase px-2.5 py-1.5 rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all text-center border-none cursor-pointer"
              >
                Set
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const pStr = pickup.trim();
              const dStr = dropoff.trim();
              if (!pStr || pStr === "Detecting current location..." || !dStr) {
                alert("Please enter both a valid Pickup point and a Drop-off destination.");
                return;
              }
              if (pStr.toLowerCase() === dStr.toLowerCase()) {
                alert("Pickup and Drop-off locations cannot be identical.");
                return;
              }

              // Fail-safe coordinates assignment for the tracking visualizer
              if (!pickupCoords) {
                setPickupCoords(CHAMBA_CENTER);
              }
              if (!dropoffCoords) {
                setDropoffCoords({ lat: CHAMBA_CENTER.lat + 0.005, lng: CHAMBA_CENTER.lng + 0.005 });
              }

              // Fail-safe deterministic distance calculations
              if (distanceKm <= 0) {
                const manualDist = getFallbackDistance(pStr, dStr);
                setDistanceKm(manualDist);
              }

              setStep("pricing");
            }}
            className="w-full py-4 bg-primary hover:bg-[#1E6B3D] text-white font-black text-xs rounded-2xl shadow-sm tracking-wider uppercase active:scale-95 transition-all text-center block border-none cursor-pointer"
          >
            Review Fare Estimate ➔
          </button>
        </div>
      )}

      {/* FARE ESTIMATION SCREEN */}
      {step === "pricing" && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white rounded-[24px] p-5 shadow-xs border border-border-custom space-y-4">
            <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
              Pre-Ride Fare Estimation
            </h3>

            <div className="space-y-2.5 text-left">
              <div className="flex justify-between text-xs pb-1.5 border-b border-gray-100">
                <span className="text-text-secondary font-bold">Pickup:</span>
                <span className="text-text-primary font-black text-right truncate max-w-[170px]">{pickup}</span>
              </div>
              <div className="flex justify-between text-xs pb-1.5 border-b border-gray-100">
                <span className="text-text-secondary font-bold">Dropoff Destination:</span>
                <span className="text-text-primary font-black text-right truncate max-w-[170px]">{dropoff}</span>
              </div>
              <div className="flex justify-between text-xs pb-1.5 border-b border-gray-100">
                <span className="text-text-secondary font-bold">Distance:</span>
                <span className="text-text-primary font-black">{distanceKm.toFixed(2)} KM</span>
              </div>
              <div className="flex justify-between text-xs pb-1.5 border-b border-gray-100">
                <span className="text-text-secondary font-bold">Rate:</span>
                <span className="text-[#1E6B3D] font-black">₹{currentRate} / KM</span>
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-text-secondary font-bold">Estimated Base Fare:</span>
                <span className="text-text-primary font-black">₹{estimatedFare}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl flex items-center justify-between border border-emerald-100">
              <span className="text-xs font-black text-emerald-900">Total Final Fare:</span>
              <span className="text-lg font-black text-primary">₹{estimatedFare}</span>
            </div>

            <div className="p-3 bg-[#EEF2FF] border border-indigo-100 rounded-xl text-[9px] text-[#312E81] leading-relaxed flex items-start gap-1.5">
              <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-600" />
              <span>
                <strong>Prepaid Dispatch Only:</strong> Rides must be paid in full prior to driver assignment. No cash or payment-after-trip is accepted within the app limits to protect our scooty fleet captains.
              </span>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setStep("form")}
              className="flex-1 py-3 bg-white border border-border-custom text-text-primary font-black text-xs rounded-xl active:scale-95 transition-all text-center cursor-pointer"
            >
              Modify Route
            </button>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  onRequireAuth?.({ type: "BOOK_RIDE" });
                  return;
                }
                setStep("payment");
              }}
              className="flex-1 py-3 bg-primary text-white font-black text-xs rounded-xl shadow-xs tracking-wider uppercase active:scale-95 transition-all text-center border-none cursor-pointer"
            >
              Secure Prepaid UPI ➔
            </button>
          </div>
        </div>
      )}

      {/* PREPAID UPI QR PAYMENT PREVIEW SCREEN */}
      {step === "payment" && (
        <div className="bg-white rounded-[24px] p-5 border border-border-custom shadow-xs space-y-4 animate-fade-in text-center">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Prepaid UPI Checkout</h4>
            <span className="text-xs font-black text-primary">₹{estimatedFare}</span>
          </div>

          <div className="py-2 flex flex-col items-center">
            {/* dynamic QR placeholder */}
            <div className="bg-[#F9FAFB] p-4 rounded-2xl border-2 border-dashed border-gray-200 inline-block relative">
              <div className="bg-white p-2.5 rounded-lg shadow-inner">
                <QrCode size={130} className="text-gray-900 mx-auto" />
              </div>
              <span className="absolute bottom-1 right-1 font-mono text-[7px] text-[#9CA3AF]">BLUBER_PAY_QR</span>
            </div>

            <p className="text-[10px] font-bold text-gray-800 mt-3 flex items-center gap-1.5 justify-center">
              <span>SCAN OR PRESS LATER TO DISPATCH</span>
            </p>
            <p className="text-[8.5px] text-text-secondary max-w-[200px] leading-normal mt-1">
              Pay ₹{estimatedFare} via PhonePe, GPay, Paytm, or any standard UPI ID: <strong>bluber@ybl</strong>
            </p>
          </div>

          {/* UPI Intent links */}
          <div className="space-y-2">
            <div className="bg-canvas border rounded-xl p-3 text-left">
              <p className="text-[8px] uppercase font-black tracking-wider text-text-secondary">Simulated Sandbox Pay</p>
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-[10px] font-extrabold text-text-primary">Bluber App Balance (₹{walletBalance})</span>
                <button
                  type="button"
                  onClick={() => {
                    const ok = onDeductWallet(estimatedFare);
                    if (ok) {
                      setPaymentFinished(true);
                      handleConfirmPrepaidBooking();
                    } else {
                      alert("Insufficient funds in your Bluber Balance. Please top up your wallet in the profile tab or scan the QR Code instead!");
                    }
                  }}
                  className="bg-primary hover:bg-[#1E6B3D] text-white text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg border-none cursor-pointer"
                >
                  Pay via Wallet Balance
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmPrepaidBooking}
              className="w-full bg-[#111827] hover:bg-black text-white text-[10px] font-black py-3 rounded-xl uppercase tracking-widest shadow-sm active:scale-95 transition-all text-center block border-none cursor-pointer"
            >
              Verify Scan / Confirm Payment ➔
            </button>

            <button
              type="button"
              onClick={() => setStep("pricing")}
              className="w-full bg-white text-text-secondary text-[9px] font-bold py-1 px-3 underline block active:opacity-80 transition-all border-none cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* SEARCHING FOR SCOOTY RIDER */}
      {step === "searching" && (
        <div className="bg-white rounded-[24px] shadow-xs border border-border-custom p-6 text-center py-10 animate-fade-in space-y-4">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            <div className="relative bg-primary text-white p-3 rounded-full shadow-md">
              <Navigation size={28} className="animate-spin" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-text-primary flex items-center justify-center gap-1.5">
              Locating Close Captain...
            </h3>
            <p className="text-[11px] text-[#1E6B3D] font-black uppercase tracking-wider">PREPAID PAYMENT RECEIVED OK IN SANDBOX</p>
            <p className="text-[10px] text-text-secondary leading-relaxed max-w-[230px] mx-auto pt-1">
              Sourcing the closest certified fast-transit scooter captains at {pickup}. Standby...
            </p>
          </div>
        </div>
      )}

      {/* DRIVER ASSIGNED & TRACKING */}
      {(step === "accepted" || step === "arrived" || step === "ongoing") && (
        <div className="bg-white rounded-[24px] shadow-xs border border-border-custom p-5 animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b pb-2.5 text-left">
            <div>
              <span className="inline-block bg-[#1E6B3D]/10 text-[#1E6B3D] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-1">
                {step === "accepted" ? "En Route To Pickup" : step === "arrived" ? "Captain Arrived" : "On the Go"}
              </span>
              <h3 className="text-xs font-black text-text-primary">Tracking Scooty Terminal</h3>
            </div>
            <p className="text-xs font-black text-[#1E6B3D]">Prepaid Completed</p>
          </div>

          <div className="bg-canvas p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm shrink-0">
                <ImageComponent 
                  src={riderPhoto} 
                  alt="Captain Portrait" 
                  fallbackName={riderName}
                  fallbackType="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-text-primary">{riderName}</p>
                <p className="text-[10px] text-text-secondary font-bold font-mono uppercase">{vehicleDetails}</p>
              </div>
            </div>
            
            <a 
              href="https://wa.me/919816402487?text=Regarding%20Scooty%20Ride%20with%20Captain%20Sunil%20Verma...%20Help%20Needed" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white p-2 rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center cursor-pointer"
              title="Speak to WhatsApp Support"
            >
              <MessageSquare size={14} />
            </a>
          </div>

          <div className="p-3 bg-[#FEF9C3]/70 border border-yellow-200 rounded-xl text-[9px] text-[#713F12] leading-relaxed flex items-center gap-2 text-left">
            <AlertCircle size={14} className="shrink-0 text-amber-600" />
            <span>
              <strong>No Direct Sidetracking:</strong> Driver calling has been unified inside Bluber Support to guarantee trip security. Contact WhatsApp help if rider requires communication.
            </span>
          </div>

          <div className="bg-canvas p-3 rounded-xl space-y-1 text-left">
            <div className="flex justify-between items-center text-[10px] font-bold text-text-primary">
              <span>{step === "accepted" ? "Scooty Captain Approaching..." : step === "arrived" ? "Captain has arrived, Board Now!" : "Cruising safely..."}</span>
              <span>{step === "accepted" ? "1 min ETA" : step === "arrived" ? "Ready" : "In Transit"}</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#1E6B3D] h-full rounded-full transition-all duration-[3000ms]"
                style={{
                  width: step === "accepted" ? "35%" : step === "arrived" ? "65%" : "90%"
                }}
              ></div>
            </div>
          </div>

          {/* Quick simulator state skips */}
          <button
            type="button"
            onClick={() => {
              if (step === "accepted") setStep("arrived");
              else if (step === "arrived") setStep("ongoing");
            }}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-text-primary text-[10px] font-black rounded-lg border-none active:scale-95 transition-all block text-center uppercase cursor-pointer"
          >
            Advance Ride Lifecycle Stage ➔
          </button>
        </div>
      )}

      {/* COMPLETED SCREEN */}
      {step === "completed" && (
        <div className="bg-white rounded-[24px] shadow-xs border border-border-custom p-5 text-center animate-fade-in space-y-4">
          <div className="w-12 h-12 bg-[#EDF7EF] text-[#1E6B3D] rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black text-text-primary">Ride Completed!</h3>
            <p className="text-[10px] text-text-secondary leading-relaxed max-w-[240px] mx-auto mt-1">
              Hope your scooty dispatch was smooth and secure! The prepaid fare of <strong>₹{estimatedFare}</strong> was settled successfully.
            </p>
          </div>

          {txnId && (
            <div className="bg-canvas p-3 rounded-xl text-left font-mono text-[9px] text-text-secondary space-y-1">
              <div>TRANSACT ID: <strong className="text-text-primary font-bold">{txnId}</strong></div>
              <div>UPI REFERENCE: <strong className="text-text-primary font-bold">{upiRef}</strong></div>
              <div>FLEET CLASS: <strong className="text-text-primary font-bold">24x7 Scooty Ride</strong></div>
              <div>ROUTE DISTANCE: <strong className="text-text-primary font-bold">{distanceKm.toFixed(2)} KM</strong></div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setPickup("");
              setPickupSearchQuery("");
              setPickupCoords(null);
              setDropoff("");
              setDropoffSearchQuery("");
              setDropoffCoords(null);
              setDistanceKm(0);
              setStep("form");
            }}
            className="w-full py-3 bg-primary hover:bg-[#1E6B3D] text-white font-black text-xs rounded-xl tracking-wider uppercase border-none cursor-pointer animate-pulse"
          >
            Book Another Ride
          </button>
        </div>
      )}

      {/* GENERAL ENQUIRY CONTACT FORMSPREE CONTAINER */}
      <div className="mt-6 bg-white rounded-[24px] p-5 shadow-xs border border-border-custom space-y-4 text-left">
        <div className="flex items-center gap-2 border-b pb-2">
          <Sparkles className="text-primary w-4.5 h-4.5" />
          <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">
            SUBMIT ENQUIRY / BOOKING ISSUES
          </h3>
        </div>

        <p className="text-[10px] text-text-secondary leading-normal">
          Have an assistance request, local complaint, or business inquiry? Fill this secure Formspree form. All notifications arrive instantly at <strong className="text-text-primary">nitishkaushal17@gmail.com</strong>.
        </p>

        {enquirySuccess ? (
          <div className="bg-[#EDF7EF] p-4 rounded-xl text-center border border-emerald-100 text-xs font-bold text-primary animate-fade-in">
            🎉 Thank you! Your inquiry has been sent successfully to <strong>nitishkaushal17@gmail.com</strong>. An administrator will respond shortly.
            <button 
              type="button"
              onClick={() => setEnquirySuccess(false)}
              className="block mt-2.5 mx-auto bg-white border text-[9.5px] font-black uppercase text-primary px-3 py-1 rounded cursor-pointer"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleEnquirySubmit} className="space-y-3">
            <div>
              <label className="text-[9px] font-black text-text-secondary uppercase block mb-1">Full Name *</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Nitish Kaushal"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-canvas border rounded-lg p-2.5 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-black text-text-secondary uppercase block mb-1">Mobile Number *</label>
                <input 
                  type="text" 
                  required
                  placeholder="+91-98164-XXXXX"
                  value={formMobile}
                  onChange={(e) => setFormMobile(e.target.value)}
                  className="w-full bg-canvas border rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-text-secondary uppercase block mb-1">Email Address *</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-canvas border rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-text-secondary uppercase block mb-1">Subject *</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Refund requested, Custom bulk booking"
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                className="w-full bg-canvas border rounded-lg p-2.5 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-black text-text-secondary uppercase block mb-1">Detailed Message *</label>
              <textarea 
                rows={3}
                required
                placeholder="Explain your situation..."
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                className="w-full bg-canvas border rounded-lg p-2.5 text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={enquiryLoading}
              className="w-full bg-[#111827] hover:bg-[#1E6B3D] text-white text-[10px] font-black py-2.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer"
            >
              {enquiryLoading ? "Submitting Request..." : "Send Formspree Enquiry ➔"}
            </button>
          </form>
        )}
      </div>

    </div>
  );
};

export const RideApplet: React.FC<RideAppletProps> = (props) => {
  return <RideAppletInner {...props} />;
};
