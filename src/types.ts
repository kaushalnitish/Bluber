export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "Veg" | "Non-Veg" | "None";
  rating?: number;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  eta: string;
  avgCost: string;
  image: string;
  items: MenuItem[];
}

export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  category: string;
}

export interface Store {
  id: string;
  name: string;
  category: string;
  rating: number;
  eta: string;
  distance: string;
  image: string;
  products: StoreProduct[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  storeOrRestaurantId: string;
  storeOrRestaurantName: string;
  type: "food" | "grocery" | "medicine";
}

export interface Order {
  id: string;
  type: "Ride" | "Food" | "Grocery" | "Medicine" | "Courier";
  merchantName: string;
  itemsSummary: string;
  total: number;
  status: "Pending Payment" | "Payment Processing" | "Payment Successful" | "Order Confirmed" | "Looking For Rider" | "Rider Assigned" | "Rider Accepted" | "Rider Reached Store" | "Order Picked Up" | "Out For Delivery" | "Arriving Soon" | "Delivered" | "Cancelled";
  date: string;
  estimatedTime?: string;
  riderName?: string;
  riderPhone?: string;
  riderPhoto?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  txnId?: string;
  upiRef?: string;
  paymentTimestamp?: string;
}

export interface RideState {
  step: "idle" | "requesting" | "searching" | "accepted" | "arrived" | "ongoing" | "completed";
  pickup: string;
  dropoff: string;
  price: number;
  vehicleType: "Moto" | "Cab Premium" | "Chamba Shuttle" | "Auto Local";
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
}

export interface CourierState {
  pickup: string;
  dropoff: string;
  senderName: string;
  receiverName: string;
  receiverPhone: string;
  packageType: string;
  weight: string;
  notes: string;
  price: number;
}

export interface LiveChambaInfo {
  weatherTemp: number;
  weatherCondition: string;
  trafficLevel: "Light" | "Moderate" | "Busy";
  roadJotPassStatus: "Clear" | "Heavy Snow" | "Blocked" | "Restricted";
  roadSachPassStatus: "Closed" | "Clear" | "Restricted";
  deliveryStatus: "Normal" | "High Demand";
}
