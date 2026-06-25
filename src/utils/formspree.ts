export interface FormspreePayload {
  name?: string;
  phone?: string;
  email?: string;
  serviceType: string;
  subject: string;
  message?: string;
  pickupLocation?: string;
  destination?: string;
  estimatedFare?: string;
  orderDetails?: string;
  productList?: string;
  timestamp?: string;
  deviceType?: string;
  [key: string]: any;
}

const getDeviceDetails = () => {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return {
      deviceType: "Unknown Device",
      userAgent: "Server/Unknown",
      screenResolution: "Unknown"
    };
  }
  const ua = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  return {
    deviceType: isMobile ? "Mobile Device" : "Desktop Computer",
    userAgent: ua,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
  };
};

export const submitToFormspree = async (data: Partial<FormspreePayload>) => {
  const endpoint = "https://formspree.io/f/mjgqygdz";
  const device = getDeviceDetails();
  
  const payload = {
    ...data,
    deviceType: data.deviceType || device.deviceType,
    browserInfo: device.userAgent,
    screenResolution: device.screenResolution,
    timestamp: data.timestamp || new Date().toLocaleString(),
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || "Failed to submit form to Formspree");
  }

  return await response.json();
};
