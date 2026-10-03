"use client";

import type {
  AccessNotice,
  Business,
  CartItem,
  CoverageRule,
  Delivery,
  EarningRecord,
  MenuItem,
  Notification,
  Order,
  OrderStatus,
  Run,
  RunnerAccessPreference,
  StaffMessage,
  User,
} from "../../types/index";
import { getSupabaseClient } from "./client";
import { isSupabaseConfigured } from "./config";
import { staffTitleFromValue } from "./user";
import {
  offersForRunner,
  parseAccessNotice,
  parseBuildingAccess,
  parseRunnerAccess,
  trimAccessNote,
  type AccessHold,
} from "../delivery-access";
export interface MarketplaceSnapshot {
  businesses: Business[];
  orders: Order[];
  scheduledRuns: Run[];
  runHistory: Run[];
  activeRun: Run | null;
  pendingDelivery: Delivery | null;
  activeDelivery: Delivery | null;
  earnings: EarningRecord[];
  notifications: Notification[];
  favoriteBusinessIds: string[];
  profiles: User[];
  staffMessages: StaffMessage[];
  accessHold: AccessHold | null;
}

function asNumber(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mapBusiness(
  row: Record<string, unknown>,
  rules: CoverageRule[],
  runs: Run[],
  menu: MenuItem[]
): Business {
  return {
    id: String(row.id),
    ownerId: String(row.owner_id ?? ""),
    name: String(row.name),
    cuisine: String(row.cuisine ?? ""),
    category: String(row.category ?? "Restaurant"),
    rating: asNumber(row.rating, 4.8),
    reviewCount: asNumber(row.review_count, 0),
    location: { lat: asNumber(row.lat, 37.7749), lng: asNumber(row.lng, -122.4194) },
    address: String(row.address ?? ""),
    city: String(row.city ?? ""),
    zip: String(row.zip ?? ""),
    deliveryRadiusMiles: asNumber(row.delivery_radius_miles, 5),
    operatingHours: String(row.operating_hours ?? ""),
    deliveryFee: asNumber(row.delivery_fee, 2.99),
    etaMinutes: asNumber(row.eta_minutes, 28),
    demandLevel: (row.demand_level as Business["demandLevel"]) ?? "moderate",
    coverageRules: rules,
    scheduledRuns: runs,
    menu,
  };
}

function mapRun(row: Record<string, unknown>): Run {
  return {
    id: String(row.id),
    runrId: String(row.runr_id),
    businessId: String(row.business_id),
    startTime: String(row.start_time),
    endTime: String(row.end_time),
    status: row.status as Run["status"],
    checkInTime: row.check_in_time ? String(row.check_in_time) : undefined,
    checkOutTime: row.check_out_time ? String(row.check_out_time) : undefined,
    deliveryCount: asNumber(row.delivery_count, 0),
    earnings: asNumber(row.earnings, 0),
  };
}

function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row.id),
    customerId: String(row.customer_id),
    businessId: String(row.business_id),
    items: (Array.isArray(row.items) ? row.items : []) as CartItem[],
    subtotal: asNumber(row.subtotal),
    deliveryFee: asNumber(row.delivery_fee),
    serviceFee: asNumber(row.service_fee),
    tax: asNumber(row.tax),
    tip: asNumber(row.tip),
    total: asNumber(row.total),
    status: row.status as OrderStatus,
    runrId: row.runr_id ? String(row.runr_id) : undefined,
    createdAt: String(row.created_at),
    deliveryAddress: row.delivery_address ? String(row.delivery_address) : undefined,
    fulfillment: row.fulfillment === "pickup" || row.fulfillment === "delivery" ? row.fulfillment : undefined,
    buildingAccess: parseBuildingAccess(row.building_access),
    accessNote: row.access_note ? String(row.access_note) : undefined,
    accessNotice: parseAccessNotice(row.access_notice) ?? null,
  };
}

function mapDelivery(row: Record<string, unknown>): Delivery {
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    businessId: String(row.business_id),
    runrId: row.runr_id ? String(row.runr_id) : undefined,
    pickup: { lat: asNumber(row.pickup_lat), lng: asNumber(row.pickup_lng) },
    dropoff: { lat: asNumber(row.dropoff_lat), lng: asNumber(row.dropoff_lng) },
    distanceMiles: asNumber(row.distance_miles, 1.2),
    status: row.status as Delivery["status"],
    basePay: asNumber(row.base_pay, 4.5),
    distancePay: asNumber(row.distance_pay, 1.8),
    tip: asNumber(row.tip, 5),
    totalEarnings: asNumber(row.total_earnings, 11.3),
    estimatedMinutes: asNumber(row.estimated_minutes, 18),
    customerName: String(row.customer_name ?? "Customer"),
    instructions: row.instructions ? String(row.instructions) : undefined,
    buildingAccess: parseBuildingAccess(row.building_access),
    accessNote: row.access_note ? String(row.access_note) : undefined,
    accessNotice: parseAccessNotice(row.access_notice) ?? null,
  };
}

export async function fetchMarketplace(
  userId?: string,
  accessPreference?: RunnerAccessPreference,
): Promise<MarketplaceSnapshot> {
  const empty: MarketplaceSnapshot = {
    businesses: [],
    orders: [],
    scheduledRuns: [],
    runHistory: [],
    activeRun: null,
    pendingDelivery: null,
    activeDelivery: null,
    earnings: [],
    notifications: [],
    favoriteBusinessIds: [],
    profiles: [],
    staffMessages: [],
    accessHold: null,
  };

  if (!isSupabaseConfigured()) return empty;

  const supabase = getSupabaseClient();

  const [
    businessesRes,
    menusRes,
    rulesRes,
    runsRes,
    ordersRes,
    deliveriesRes,
    earningsRes,
    notificationsRes,
    favoritesRes,
    profilesRes,
    messagesRes,
  ] = await Promise.all([
    supabase.from("businesses").select("*"),
    supabase.from("menu_items").select("*"),
    supabase.from("coverage_rules").select("*"),
    supabase.from("runs").select("*"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("deliveries").select("*"),
    supabase.from("earnings").select("*").order("completed_at", { ascending: false }),
    supabase.from("notifications").select("*").order("created_at", { ascending: false }),
    userId
      ? supabase.from("favorites").select("business_id").eq("user_id", userId)
      : Promise.resolve({ data: [] as { business_id: string }[], error: null }),
    supabase.from("profiles").select("id, name, email, role, avatar_url"),
    supabase.from("staff_messages").select("*").order("created_at", { ascending: true }).limit(200),
  ]);

  if (businessesRes.error) {
    console.warn("marketplace businesses", businessesRes.error.message);
    return empty;
  }

  const runs = (runsRes.data ?? []).map((row) => mapRun(row as Record<string, unknown>));
  const menus = (menusRes.data ?? []) as Record<string, unknown>[];
  const rules = (rulesRes.data ?? []) as Record<string, unknown>[];

  const businesses = (businessesRes.data ?? []).map((row) => {
    const rec = row as Record<string, unknown>;
    const id = String(rec.id);
    return mapBusiness(
      rec,
      rules
        .filter((r) => String(r.business_id) === id)
        .map((r) => ({
          id: String(r.id),
          businessId: id,
          startTime: String(r.start_time),
          endTime: String(r.end_time),
          maxRunrs: asNumber(r.max_runrs, 4),
        })),
      runs.filter((r) => r.businessId === id && r.status !== "cancelled"),
      menus
        .filter((m) => String(m.business_id) === id)
        .map((m) => ({
          id: String(m.id),
          name: String(m.name),
          description: String(m.description ?? ""),
          price: asNumber(m.price),
          category: String(m.category ?? "Mains"),
          popular: Boolean(m.popular),
        }))
    );
  });

  const deliveries = (deliveriesRes.data ?? []).map((row) =>
    mapDelivery(row as Record<string, unknown>)
  );
  const orders = (ordersRes.data ?? []).map((row) => mapOrder(row as Record<string, unknown>));

  const myRuns = userId ? runs.filter((r) => r.runrId === userId) : runs;
  const activeRun =
    myRuns.find((r) => r.status === "checked_in" || r.status === "active") ?? null;
  const scheduledRuns = myRuns.filter((r) => r.status === "scheduled");
  const runHistory = myRuns.filter((r) => r.status === "completed" || r.status === "cancelled");

  const offerMatch = offersForRunner(deliveries, orders, accessPreference, userId);
  const pendingDelivery = offerMatch.pending;
  const activeDelivery =
    deliveries.find(
      (d) =>
        d.runrId === userId &&
        !["completed", "cancelled"].includes(d.status) &&
        d.status !== "offered"
    ) ?? null;

  return {
    businesses,
    orders,
    scheduledRuns,
    runHistory,
    activeRun,
    pendingDelivery,
    activeDelivery,
    earnings: (earningsRes.data ?? []).map((row) => {
      const rec = row as Record<string, unknown>;
      return {
        id: String(rec.id),
        runrId: String(rec.runr_id),
        businessId: String(rec.business_id),
        businessName: String(rec.business_name ?? ""),
        deliveryId: String(rec.delivery_id ?? ""),
        basePay: asNumber(rec.base_pay),
        distancePay: asNumber(rec.distance_pay),
        tip: asNumber(rec.tip),
        total: asNumber(rec.total),
        completedAt: String(rec.completed_at),
      };
    }),
    notifications: (notificationsRes.data ?? []).map((row) => {
      const rec = row as Record<string, unknown>;
      return {
        id: String(rec.id),
        title: String(rec.title),
        body: String(rec.body ?? ""),
        type: rec.type as Notification["type"],
        read: Boolean(rec.read),
        createdAt: String(rec.created_at),
      };
    }),
    favoriteBusinessIds: ((favoritesRes.data ?? []) as { business_id: string }[]).map(
      (r) => r.business_id
    ),
    staffMessages: (messagesRes.error ? [] : messagesRes.data ?? []).map((row) => {
      const rec = row as Record<string, unknown>;
      return {
        id: String(rec.id),
        authorId: String(rec.author_id ?? ""),
        authorName: String(rec.author_name ?? "Staff"),
        body: String(rec.body ?? ""),
        createdAt: String(rec.created_at),
      };
    }),
    profiles: (profilesRes.data ?? []).map((row) => {
      const rec = row as Record<string, unknown>;
      return {
        id: String(rec.id),
        name: String(rec.name ?? rec.email ?? "User"),
        email: String(rec.email ?? ""),
        role: staffTitleFromValue(rec.role) ? "staff" : (rec.role as User["role"]),
        staffTitle: staffTitleFromValue(rec.role),
        avatarUrl: rec.avatar_url ? String(rec.avatar_url) : undefined,
        accessPreference: parseRunnerAccess(rec.access_preference),
      };
    }),
    accessHold: offerMatch.hold,
  };
}

function missingColumn(message: string) {
  return /column|schema cache|PGRST204/i.test(message);
}

export async function persistOrder(order: Order) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  const base = {
    id: order.id,
    customer_id: order.customerId,
    business_id: order.businessId,
    runr_id: order.runrId ?? null,
    items: order.items,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    service_fee: order.serviceFee,
    tax: order.tax,
    tip: order.tip,
    total: order.total,
    status: order.status,
    created_at: order.createdAt,
    delivery_address: order.deliveryAddress ?? null,
  };
  const withAccess = {
    ...base,
    building_access: order.buildingAccess ?? null,
    access_note: trimAccessNote(order.accessNote) ?? null,
    access_notice: order.accessNotice ?? null,
  };
  const { error } = await supabase.from("orders").upsert(withAccess);
  if (error && missingColumn(error.message)) {
    const retry = await supabase.from("orders").upsert(base);
    if (retry.error) console.warn("persistOrder", retry.error.message);
    return;
  }
  if (error) console.warn("persistOrder", error.message);
}

export async function persistRun(run: Run) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  await supabase.from("runs").upsert({
    id: run.id,
    runr_id: run.runrId,
    business_id: run.businessId,
    start_time: run.startTime,
    end_time: run.endTime,
    status: run.status,
    check_in_time: run.checkInTime ?? null,
    check_out_time: run.checkOutTime ?? null,
    delivery_count: run.deliveryCount ?? 0,
    earnings: run.earnings ?? 0,
  });
}

export async function persistCoverage(ruleId: string, maxRunrs: number) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  await supabase.from("coverage_rules").update({ max_runrs: maxRunrs }).eq("id", ruleId);
}

export async function persistOrderStatus(
  orderId: string,
  status: OrderStatus,
  runrId?: string,
  accessNotice?: AccessNotice | null,
) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  const patch: Record<string, unknown> = { status };
  if (runrId) patch.runr_id = runrId;
  if (accessNotice) patch.access_notice = accessNotice;
  const { error } = await supabase.from("orders").update(patch).eq("id", orderId);
  if (error && accessNotice && missingColumn(error.message)) {
    delete patch.access_notice;
    await supabase.from("orders").update(patch).eq("id", orderId);
  }
}

export async function persistFavorite(userId: string, businessId: string, liked: boolean) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (liked) {
    await supabase.from("favorites").upsert({ user_id: userId, business_id: businessId });
  } else {
    await supabase.from("favorites").delete().eq("user_id", userId).eq("business_id", businessId);
  }
}

export async function persistDelivery(delivery: Delivery) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  const base = {
    id: delivery.id,
    order_id: delivery.orderId,
    business_id: delivery.businessId,
    runr_id: delivery.runrId ?? null,
    pickup_lat: delivery.pickup.lat,
    pickup_lng: delivery.pickup.lng,
    dropoff_lat: delivery.dropoff.lat,
    dropoff_lng: delivery.dropoff.lng,
    distance_miles: delivery.distanceMiles,
    status: delivery.status,
    base_pay: delivery.basePay,
    distance_pay: delivery.distancePay,
    tip: delivery.tip,
    total_earnings: delivery.totalEarnings,
    estimated_minutes: delivery.estimatedMinutes,
    customer_name: delivery.customerName,
  };
  const withAccess = {
    ...base,
    building_access: delivery.buildingAccess ?? null,
    access_note: trimAccessNote(delivery.accessNote) ?? null,
    access_notice: delivery.accessNotice ?? null,
  };
  const { error } = await supabase.from("deliveries").upsert(withAccess);
  if (error && missingColumn(error.message)) {
    await supabase.from("deliveries").upsert(base);
  }
}

export async function persistAccessPreference(userId: string, preference: RunnerAccessPreference) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("profiles")
    .update({ access_preference: preference })
    .eq("id", userId);
  if (error) console.warn("access preference", error.message);
}

export async function persistEarning(record: EarningRecord) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  await supabase.from("earnings").upsert({
    id: record.id,
    runr_id: record.runrId,
    business_id: record.businessId,
    business_name: record.businessName,
    delivery_id: record.deliveryId,
    base_pay: record.basePay,
    distance_pay: record.distancePay,
    tip: record.tip,
    total: record.total,
    completed_at: record.completedAt,
  });
}

export async function persistNotification(userId: string, note: Notification) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  await supabase.from("notifications").upsert({
    id: note.id,
    user_id: userId,
    title: note.title,
    body: note.body,
    type: note.type,
    read: note.read,
    created_at: note.createdAt,
  });
}

export async function persistNotificationRead(id: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  if (error) console.warn("notifications read", error.message);
}

export async function offerDeliveryForOrder(order: Order, business: Business, customerName: string) {
  const delivery: Delivery = {
    id: crypto.randomUUID(),
    orderId: order.id,
    businessId: business.id,
    pickup: business.location,
    dropoff: {
      lat: business.location.lat + 0.008,
      lng: business.location.lng + 0.006,
    },
    distanceMiles: 1.4,
    status: "offered",
    basePay: 4.5,
    distancePay: 1.85,
    tip: order.tip,
    totalEarnings: 4.5 + 1.85 + order.tip,
    estimatedMinutes: business.etaMinutes,
    customerName,
    buildingAccess: order.buildingAccess,
    accessNote: trimAccessNote(order.accessNote),
    accessNotice: order.accessNotice ?? null,
  };
  await persistDelivery(delivery);
  return delivery;
}

export async function persistStaffMessage(message: StaffMessage) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("staff_messages").insert({
    id: message.id,
    author_id: message.authorId,
    author_name: message.authorName,
    body: message.body,
    created_at: message.createdAt,
  });
  if (error) console.warn("staff_messages", error.message);
}
