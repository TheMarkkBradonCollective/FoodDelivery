export type UserRole = "customer" | "runr" | "business" | "staff";

/** Positions inside Portr Command. Stored on the profile; the app still treats them as staff. */
export const STAFF_TITLES = [
  "support",
  "moderator",
  "administrator",
  "manager",
  "director",
  "founder",
] as const;

export type StaffTitle = (typeof STAFF_TITLES)[number];

export type CoverageStatus = "full" | "low" | "gap" | "over_capacity";

export type RunStatus =
  | "scheduled"
  | "active"
  | "checked_in"
  | "completed"
  | "cancelled";

export type DeliveryStatus =
  | "pending"
  | "offered"
  | "accepted"
  | "pickup"
  | "picked_up"
  | "delivering"
  | "arrived"
  | "completed"
  | "cancelled";

export type OrderStatus =
  | "new"
  | "accepted"
  | "preparing"
  | "ready"
  | "runr_assigned"
  | "picked_up"
  | "delivering"
  | "delivered"
  | "cancelled";

export type DemandLevel = "low" | "moderate" | "high" | "busy";

/** What the customer says about getting to the door. */
export type BuildingAccess =
  | "elevator"
  | "stairs"
  | "both"
  | "ground"
  | "requires_stairs"
  | "requires_elevator";

/** What a Runner is willing to use. No medical detail — access only. */
export type RunnerAccessPreference =
  | "elevators"
  | "stairs"
  | "both"
  | "no_elevators"
  | "no_stairs";

/** Soft match: the drop can still be assigned, and the customer should be told. */
export type AccessNotice = "stairs_may_be_required" | "elevator_may_be_required";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** support, moderator, administrator, manager, director, or founder */
  staffTitle?: StaffTitle;
  avatarUrl?: string;
  /** Runner only. Elevators, stairs, both, or a refusal. */
  accessPreference?: RunnerAccessPreference;
}

export interface CoverageRule {
  id: string;
  businessId: string;
  startTime: string;
  endTime: string;
  maxRunrs: number;
}

export interface CoverageInterval {
  startTime: string;
  endTime: string;
  maxRunrs: number;
  scheduledRunrs: number;
  status: CoverageStatus;
  gap: number;
}

export interface Run {
  id: string;
  runrId: string;
  businessId: string;
  startTime: string;
  endTime: string;
  status: RunStatus;
  checkInTime?: string;
  checkOutTime?: string;
  deliveryCount?: number;
  earnings?: number;
}

export interface Business {
  id: string;
  ownerId?: string;
  name: string;
  cuisine: string;
  category: string;
  rating: number;
  reviewCount: number;
  location: Coordinates;
  address: string;
  city: string;
  zip: string;
  deliveryRadiusMiles: number;
  operatingHours: string;
  heroImage?: string;
  logoUrl?: string;
  deliveryFee: number;
  etaMinutes: number;
  demandLevel: DemandLevel;
  coverageRules: CoverageRule[];
  scheduledRuns: Run[];
  menu?: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  popular?: boolean;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  businessId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  tip: number;
  total: number;
  status: OrderStatus;
  runrId?: string;
  createdAt: string;
  deliveryAddress?: string;
  fulfillment?: "delivery" | "pickup";
  scheduledFor?: string;
  buildingAccess?: BuildingAccess;
  accessNote?: string;
  accessNotice?: AccessNotice | null;
}

export interface Delivery {
  id: string;
  orderId: string;
  businessId: string;
  runrId?: string;
  pickup: Coordinates;
  dropoff: Coordinates;
  distanceMiles: number;
  status: DeliveryStatus;
  basePay: number;
  distancePay: number;
  tip: number;
  totalEarnings: number;
  estimatedMinutes: number;
  instructions?: string;
  customerName: string;
  buildingAccess?: BuildingAccess;
  accessNote?: string;
  accessNotice?: AccessNotice | null;
}

export interface EarningRecord {
  id: string;
  runrId: string;
  businessId: string;
  businessName: string;
  deliveryId: string;
  basePay: number;
  distancePay: number;
  tip: number;
  total: number;
  completedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "run" | "delivery" | "earnings" | "coverage" | "order";
  read: boolean;
  createdAt: string;
}

export interface RunrProfile {
  userId: string;
  vehicle: string;
  rating: number;
  completedDeliveries: number;
  reliability: number;
  favoriteBusinessIds: string[];
}

export interface StaffMessage {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface BusinessOperations {
  businessId: string;
  activeOrders: number;
  activeDeliveries: number;
  activeRunrs: number;
  neededRunrs: number;
  coverageStatus: CoverageStatus;
}
