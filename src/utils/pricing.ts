export interface PricingTier {
  name: string;
  rate: number;
  startMinutes: number; // minutes from midnight
  endMinutes: number;
  icon: string;
  timeLabel: string;
}

export const PRICING_TIERS: PricingTier[] = [
  { name: "Night Tariff", rate: 250, startMinutes: 0, endMinutes: 390, icon: "🌃", timeLabel: "12:00 AM - 06:30 AM" },
  { name: "Early Morning Tariff", rate: 150, startMinutes: 390, endMinutes: 480, icon: "🌅", timeLabel: "06:30 AM - 08:00 AM" },
  { name: "Morning Peak Rush", rate: 80, startMinutes: 480, endMinutes: 600, icon: "🎒", timeLabel: "08:00 AM - 10:00 AM" },
  { name: "Standard Daytime Tariff", rate: 40, startMinutes: 600, endMinutes: 1140, icon: "☀️", timeLabel: "10:00 AM - 07:00 PM" },
  { name: "Evening Rush Tariff", rate: 80, startMinutes: 1140, endMinutes: 1260, icon: "🌉", timeLabel: "07:00 PM - 09:00 PM" },
  { name: "Late Night Surcharge", rate: 80, startMinutes: 1260, endMinutes: 1440, icon: "🌌", timeLabel: "09:00 PM - 11:59 PM" }
];

export function getPricingTier(date: Date): PricingTier {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  for (const tier of PRICING_TIERS) {
    if (totalMinutes >= tier.startMinutes && totalMinutes < tier.endMinutes) {
      return tier;
    }
  }
  return PRICING_TIERS[PRICING_TIERS.length - 1]; // fallback Midnight
}

export function getRatePerKm(date: Date): number {
  return getPricingTier(date).rate;
}
