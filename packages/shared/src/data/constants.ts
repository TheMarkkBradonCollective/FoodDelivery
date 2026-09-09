/** Shared constants. Marketplace entities load from Supabase. */

export const DEFAULT_LOCATION = { lat: 37.7749, lng: -122.4194 };

export const cuisineCategories = [
  "Pizza",
  "Burgers",
  "Wings",
  "Mexican",
  "Sushi",
  "Thai",
  "Coffee",
  "Desserts",
];

export const CUISINE_PLATES: Record<string, { emoji: string; from: string; to: string }> = {
  Pizza: { emoji: "🍕", from: "#7048F8", to: "#A0F878" },
  Burgers: { emoji: "🍔", from: "#5C36E0", to: "#F6C945" },
  Wings: { emoji: "🍗", from: "#2A1478", to: "#F97316" },
  Mexican: { emoji: "🌮", from: "#7048F8", to: "#22C55E" },
  Sushi: { emoji: "🍣", from: "#1A1224", to: "#7048F8" },
  Thai: { emoji: "🍜", from: "#DC2626", to: "#F59E0B" },
  Coffee: { emoji: "☕", from: "#3D3550", to: "#C4A574" },
  Desserts: { emoji: "🍰", from: "#EC4899", to: "#A0F878" },
  Salads: { emoji: "🥗", from: "#6B8F5A", to: "#A0F878" },
  Sides: { emoji: "🥖", from: "#7048F8", to: "#F6F1E8" },
  Drinks: { emoji: "🥤", from: "#2A1478", to: "#8B6BFF" },
  Tacos: { emoji: "🌮", from: "#7048F8", to: "#22C55E" },
  Bowls: { emoji: "🍱", from: "#5C36E0", to: "#A0F878" },
  Restaurant: { emoji: "🍽️", from: "#7048F8", to: "#2A1478" },
  All: { emoji: "🍽️", from: "#7048F8", to: "#A0F878" },
};

export const DEFAULT_ADDRESS = "1 Market St, San Francisco";

export const PROMO_CODES: Record<string, { label: string; amount: number; percent?: boolean }> = {
  RUNR5: { label: "$5 off", amount: 5 },
  PORTER10: { label: "10% off", amount: 10, percent: true },
};
