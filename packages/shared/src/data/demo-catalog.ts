import type { Business, Delivery, Notification, Order, Run } from "../types/index";
import type { MarketplaceSnapshot } from "../lib/supabase/marketplace";
import { offersForRunner } from "../lib/delivery-access";
import type { RunnerAccessPreference } from "../types/index";

const TONY = "c1000000-0000-4000-8000-000000000001";
const BURGERS = "c1000000-0000-4000-8000-000000000002";
const TACOS = "c1000000-0000-4000-8000-000000000003";
const VENDR_OWNER = "b1000000-0000-4000-8000-000000000003";
const PORTER_ID = "b1000000-0000-4000-8000-000000000001";
const RUNR_ID = "b1000000-0000-4000-8000-000000000002";

function rule(id: string, businessId: string, startTime: string, endTime: string, maxRunrs: number) {
  return { id, businessId, startTime, endTime, maxRunrs };
}

function run(partial: Run): Run {
  return partial;
}

export const DEMO_BUSINESSES: Business[] = [
  {
    id: TONY,
    ownerId: VENDR_OWNER,
    name: "Tony's Pizza",
    cuisine: "Pizza",
    category: "Restaurant",
    rating: 4.7,
    reviewCount: 312,
    location: { lat: 37.7849, lng: -122.4094 },
    address: "450 Mission St",
    city: "San Francisco",
    zip: "94105",
    deliveryRadiusMiles: 5,
    operatingHours: "11:00 AM – 11:00 PM",
    deliveryFee: 2.99,
    etaMinutes: 25,
    demandLevel: "high",
    coverageRules: [
      rule("e1000000-0000-4000-8000-000000000011", TONY, "00:00", "23:59", 4),
      rule("e1000000-0000-4000-8000-000000000001", TONY, "11:00", "14:00", 4),
      rule("e1000000-0000-4000-8000-000000000002", TONY, "17:00", "22:00", 6),
    ],
    scheduledRuns: [
      run({
        id: "r1000000-0000-4000-8000-000000000001",
        runrId: RUNR_ID,
        businessId: TONY,
        startTime: "00:00",
        endTime: "23:59",
        status: "checked_in",
      }),
      run({
        id: "r1000000-0000-4000-8000-000000000002",
        runrId: "preview-porter-2",
        businessId: TONY,
        startTime: "00:00",
        endTime: "23:59",
        status: "scheduled",
      }),
    ],
    menu: [
      { id: "d1000000-0000-4000-8000-000000000001", name: "Margherita Pizza", description: "San Marzano tomato, mozzarella, basil", price: 16.5, category: "Pizza", popular: true },
      { id: "d1000000-0000-4000-8000-000000000002", name: "Pepperoni Pizza", description: "Cup-and-char pepperoni, mozzarella", price: 18, category: "Pizza", popular: true },
      { id: "d1000000-0000-4000-8000-000000000003", name: "Caesar Salad", description: "Romaine, parmesan, croutons", price: 11, category: "Salads" },
      { id: "d1000000-0000-4000-8000-000000000004", name: "Garlic Knots", description: "Six knots, house marinara", price: 7.5, category: "Sides" },
    ],
  },
  {
    id: BURGERS,
    ownerId: VENDR_OWNER,
    name: "Golden Gate Burgers",
    cuisine: "Burgers",
    category: "Restaurant",
    rating: 4.5,
    reviewCount: 188,
    location: { lat: 37.7699, lng: -122.4314 },
    address: "1200 Market St",
    city: "San Francisco",
    zip: "94102",
    deliveryRadiusMiles: 4.5,
    operatingHours: "10:00 AM – 10:00 PM",
    deliveryFee: 1.99,
    etaMinutes: 22,
    demandLevel: "moderate",
    coverageRules: [
      rule("e1000000-0000-4000-8000-000000000012", BURGERS, "00:00", "23:59", 3),
      rule("e1000000-0000-4000-8000-000000000003", BURGERS, "10:00", "15:00", 3),
      rule("e1000000-0000-4000-8000-000000000004", BURGERS, "17:00", "21:00", 5),
    ],
    scheduledRuns: [],
    menu: [
      { id: "d1000000-0000-4000-8000-000000000005", name: "Cheeseburger", description: "Chuck patty, american, pickles", price: 14, category: "Burgers", popular: true },
      { id: "d1000000-0000-4000-8000-000000000006", name: "Double Smash", description: "Two smash patties, secret sauce", price: 17.5, category: "Burgers", popular: true },
      { id: "d1000000-0000-4000-8000-000000000007", name: "Fries", description: "Crispy russet fries, sea salt", price: 4.5, category: "Sides" },
      { id: "d1000000-0000-4000-8000-000000000008", name: "Shake", description: "Vanilla, chocolate, or strawberry", price: 6, category: "Drinks" },
    ],
  },
  {
    id: TACOS,
    ownerId: VENDR_OWNER,
    name: "Mission Tacos",
    cuisine: "Mexican",
    category: "Restaurant",
    rating: 4.8,
    reviewCount: 421,
    location: { lat: 37.7599, lng: -122.4194 },
    address: "2400 Mission St",
    city: "San Francisco",
    zip: "94110",
    deliveryRadiusMiles: 5,
    operatingHours: "10:00 AM – 12:00 AM",
    deliveryFee: 2.49,
    etaMinutes: 20,
    demandLevel: "busy",
    coverageRules: [
      rule("e1000000-0000-4000-8000-000000000013", TACOS, "00:00", "23:59", 5),
      rule("e1000000-0000-4000-8000-000000000005", TACOS, "11:00", "23:00", 5),
    ],
    scheduledRuns: [],
    menu: [
      { id: "d1000000-0000-4000-8000-000000000009", name: "Carne Asada Tacos", description: "Three street tacos, salsa verde", price: 13.5, category: "Tacos", popular: true },
      { id: "d1000000-0000-4000-8000-00000000000a", name: "Al Pastor Bowl", description: "Pastor, rice, beans, pineapple", price: 15, category: "Bowls", popular: true },
      { id: "d1000000-0000-4000-8000-00000000000b", name: "Guacamole", description: "Tableside-style, chips", price: 8, category: "Sides" },
      { id: "d1000000-0000-4000-8000-00000000000c", name: "Horchata", description: "Cinnamon rice milk", price: 4, category: "Drinks" },
    ],
  },
];

const now = () => new Date().toISOString();

export const DEMO_ORDERS: Order[] = [
  {
    id: "o1000000-0000-4000-8000-000000000001",
    customerId: PORTER_ID,
    businessId: TONY,
    items: [{ menuItemId: "d1000000-0000-4000-8000-000000000002", name: "Pepperoni Pizza", price: 18, quantity: 1 }],
    subtotal: 18,
    deliveryFee: 2.99,
    serviceFee: 1.5,
    tax: 1.58,
    tip: 5,
    total: 29.07,
    status: "preparing",
    createdAt: now(),
    deliveryAddress: "1 Market St, San Francisco",
    buildingAccess: "requires_stairs",
    accessNote: "4th floor — stairs required.",
  },
  {
    id: "o1000000-0000-4000-8000-000000000002",
    customerId: PORTER_ID,
    businessId: TONY,
    items: [{ menuItemId: "d1000000-0000-4000-8000-000000000001", name: "Margherita Pizza", price: 16.5, quantity: 1 }],
    subtotal: 16.5,
    deliveryFee: 2.99,
    serviceFee: 1.5,
    tax: 1.44,
    tip: 3,
    total: 25.43,
    status: "delivering",
    runrId: RUNR_ID,
    createdAt: now(),
    deliveryAddress: "1 Market St, San Francisco",
    buildingAccess: "elevator",
    accessNote: "Elevator is around the back of the building.",
  },
  {
    id: "o1000000-0000-4000-8000-000000000003",
    customerId: PORTER_ID,
    businessId: BURGERS,
    items: [{ menuItemId: "d1000000-0000-4000-8000-000000000005", name: "Cheeseburger", price: 14, quantity: 2 }],
    subtotal: 28,
    deliveryFee: 1.99,
    serviceFee: 1.5,
    tax: 2.45,
    tip: 5,
    total: 38.94,
    status: "new",
    createdAt: now(),
    deliveryAddress: "1 Market St, San Francisco",
  },
];

export const DEMO_DELIVERIES: Delivery[] = [
  {
    id: "l1000000-0000-4000-8000-000000000001",
    orderId: "o1000000-0000-4000-8000-000000000002",
    businessId: TONY,
    runrId: RUNR_ID,
    pickup: { lat: 37.7849, lng: -122.4094 },
    dropoff: { lat: 37.7749, lng: -122.4194 },
    distanceMiles: 1.2,
    status: "delivering",
    basePay: 4.5,
    distancePay: 1.85,
    tip: 3,
    totalEarnings: 9.35,
    estimatedMinutes: 18,
    customerName: "Portr Tester",
    buildingAccess: "elevator",
    accessNote: "Elevator is around the back of the building.",
  },
  {
    id: "l1000000-0000-4000-8000-000000000002",
    orderId: "o1000000-0000-4000-8000-000000000001",
    businessId: TONY,
    pickup: { lat: 37.7849, lng: -122.4094 },
    dropoff: { lat: 37.7749, lng: -122.4194 },
    distanceMiles: 1.4,
    status: "offered",
    basePay: 4.5,
    distancePay: 1.85,
    tip: 5,
    totalEarnings: 11.35,
    estimatedMinutes: 22,
    customerName: "Portr Tester",
    buildingAccess: "requires_stairs",
    accessNote: "4th floor — stairs required.",
  },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "n1000000-0000-4000-8000-000000000001",
    title: "Coverage gap",
    body: "Golden Gate Burgers needs 3 Runners right now.",
    type: "coverage",
    read: false,
    createdAt: now(),
  },
  {
    id: "n1000000-0000-4000-8000-000000000002",
    title: "Live order",
    body: "Tony's Pizza has a pepperoni pie in prep.",
    type: "order",
    read: false,
    createdAt: now(),
  },
];

export function buildPreviewSnapshot(user?: {
  id: string;
  role: string;
  accessPreference?: RunnerAccessPreference;
}): MarketplaceSnapshot {
  const userId = user?.id;
  const role = user?.role;

  const businesses = DEMO_BUSINESSES.map((b) => ({
    ...b,
    ownerId: role === "business" && userId ? userId : b.ownerId,
    scheduledRuns: b.scheduledRuns.map((r) => {
      const mine = role === "runr" && userId && r.runrId === RUNR_ID;
      return {
        ...r,
        runrId: mine ? userId : r.runrId,
        status: r.status === "checked_in" || r.status === "active" ? ("scheduled" as const) : r.status,
      };
    }),
  }));

  const orders = DEMO_ORDERS.map((o) => ({
    ...o,
    customerId: role === "customer" && userId ? userId : o.customerId,
    runrId: undefined,
    status: o.status === "delivering" || o.status === "picked_up" ? ("ready" as const) : o.status,
  }));

  const deliveries = DEMO_DELIVERIES.map((d) => ({
    ...d,
    runrId: undefined,
    status: "offered" as const,
  }));

  const myRuns = businesses.flatMap((b) => b.scheduledRuns).filter((r) => !userId || r.runrId === userId);
  const activeRun =
    role === "runr" && myRuns[0]
      ? { ...myRuns[0], status: "checked_in" as const }
      : null;
  const offerMatch =
    role === "runr"
      ? offersForRunner(deliveries, orders, user?.accessPreference, userId)
      : { pending: null, hold: { count: 0, stairs: 0, elevators: 0 } };
  const pendingDelivery = offerMatch.pending;

  return {
    businesses,
    orders,
    scheduledRuns: myRuns.filter((r) => r.id !== activeRun?.id && r.status === "scheduled"),
    runHistory: [],
    activeRun,
    pendingDelivery,
    activeDelivery: null,
    earnings: [],
    notifications: DEMO_NOTIFICATIONS,
    favoriteBusinessIds: [],
    profiles: [],
    accessHold: role === "runr" ? offerMatch.hold : null,
    staffMessages: [
      {
        id: "m1000000-0000-4000-8000-000000000001",
        authorId: "b1000000-0000-4000-8000-000000000004",
        authorName: "Staff",
        body: "Evening coverage is thin at Golden Gate Burgers. Flagging for desktop.",
        createdAt: now(),
      },
    ],
  };
}
