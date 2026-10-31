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
import { apiFetch } from "./client";
import { isApiConfigured } from "./config";
import {
  offersForRunner,
  packDeliveryAddress,
  parseAccessNotice,
  parseBuildingAccess,
  parseRunnerAccess,
  trimAccessNote,
  unpackDeliveryAddress,
  type AccessHold,
} from "../delivery-access";
import { staffTitleFromValue } from "./user";

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

export type MarketplacePollResult =
  | { kind: "full"; snapshot: MarketplaceSnapshot; serverTime: string }
  | { kind: "unchanged"; serverTime: string };

export async function fetchMarketplace(
  userId?: string,
  accessPreference?: RunnerAccessPreference,
  updatedSince?: string,
): Promise<MarketplacePollResult> {
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

  if (!isApiConfigured()) {
    return { kind: "full", snapshot: empty, serverTime: new Date().toISOString() };
  }

  const params = new URLSearchParams();
  if (updatedSince) params.set("updated_since", updatedSince);
  if (accessPreference) params.set("access_preference", accessPreference);
  const qs = params.toString();

  const data = await apiFetch<
    MarketplaceSnapshot & { unchanged?: boolean; serverTime?: string }
  >(`/marketplace${qs ? `?${qs}` : ""}`);

  if (data.unchanged) {
    return { kind: "unchanged", serverTime: data.serverTime ?? updatedSince ?? new Date().toISOString() };
  }

  const orders = (data.orders ?? []) as Order[];
  const deliveries = ((data as { deliveries?: Delivery[] }).deliveries ?? []) as Delivery[];
  const offerMatch = offersForRunner(deliveries, orders, accessPreference, userId);
  const activeDelivery =
    deliveries.find(
      (d) =>
        d.runrId === userId &&
        !["completed", "cancelled"].includes(d.status) &&
        d.status !== "offered",
    ) ?? null;

  const snapshot: MarketplaceSnapshot = {
    businesses: (data.businesses ?? []) as Business[],
    orders,
    scheduledRuns: (data.scheduledRuns ?? []) as Run[],
    runHistory: (data.runHistory ?? []) as Run[],
    activeRun: (data.activeRun ?? null) as Run | null,
    pendingDelivery: offerMatch.pending,
    activeDelivery,
    earnings: (data.earnings ?? []) as EarningRecord[],
    notifications: (data.notifications ?? []) as Notification[],
    favoriteBusinessIds: data.favoriteBusinessIds ?? [],
    profiles: (data.profiles ?? []).map((p) => ({
      ...(p as User),
      staffTitle: staffTitleFromValue((p as User & { staffTitle?: string }).staffTitle ?? p.role),
      accessPreference: parseRunnerAccess((p as User).accessPreference),
    })),
    staffMessages: (data.staffMessages ?? []) as StaffMessage[],
    accessHold: offerMatch.hold,
  };

  const serverTime = data.serverTime ?? new Date().toISOString();
  return { kind: "full", snapshot, serverTime };
}

function orderPayload(order: Order) {
  return {
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
    building_access: order.buildingAccess ?? null,
    access_note: trimAccessNote(order.accessNote) ?? null,
    access_notice: order.accessNotice ?? null,
    fulfillment: order.fulfillment ?? null,
  };
}

export async function persistOrder(order: Order) {
  if (!isApiConfigured()) return;
  await apiFetch(`/orders/${order.id}`, {
    method: "PUT",
    body: JSON.stringify(orderPayload(order)),
  });
}

export async function persistRun(run: Run) {
  if (!isApiConfigured()) return;
  await apiFetch(`/runs/${run.id}`, {
    method: "PUT",
    body: JSON.stringify({
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
    }),
  });
}

export async function persistCoverage(ruleId: string, maxRunrs: number) {
  if (!isApiConfigured()) return;
  await apiFetch(`/coverage/${ruleId}`, {
    method: "PATCH",
    body: JSON.stringify({ max_runrs: maxRunrs }),
  });
}

export async function persistOrderStatus(
  orderId: string,
  status: OrderStatus,
  runrId?: string,
  accessNotice?: AccessNotice | null,
) {
  if (!isApiConfigured()) return;
  await apiFetch(`/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      runr_id: runrId ?? null,
      access_notice: accessNotice ?? null,
    }),
  });
}

export async function persistFavorite(userId: string, businessId: string, liked: boolean) {
  if (!isApiConfigured()) return;
  await apiFetch("/favorites", {
    method: "PUT",
    body: JSON.stringify({ business_id: businessId, liked }),
  });
  void userId;
}

export async function persistDelivery(delivery: Delivery) {
  if (!isApiConfigured()) return;
  await apiFetch(`/deliveries/${delivery.id}`, {
    method: "PUT",
    body: JSON.stringify({
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
      building_access: delivery.buildingAccess ?? null,
      access_note: trimAccessNote(delivery.accessNote) ?? null,
      access_notice: delivery.accessNotice ?? null,
    }),
  });
}

export async function persistAccessPreference(userId: string, preference: RunnerAccessPreference) {
  if (!isApiConfigured()) return;
  await apiFetch(`/profiles/${userId}/access`, {
    method: "PATCH",
    body: JSON.stringify({ access_preference: preference }),
  });
}

export async function persistEarning(record: EarningRecord) {
  if (!isApiConfigured()) return;
  await apiFetch(`/earnings/${record.id}`, {
    method: "PUT",
    body: JSON.stringify({
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
    }),
  });
}

export async function persistNotification(userId: string, note: Notification) {
  if (!isApiConfigured()) return;
  await apiFetch(`/notifications/${note.id}`, {
    method: "PUT",
    body: JSON.stringify({
      id: note.id,
      user_id: userId,
      title: note.title,
      body: note.body,
      type: note.type,
      read: note.read,
      created_at: note.createdAt,
    }),
  });
}

export async function persistNotificationRead(id: string) {
  if (!isApiConfigured()) return;
  await apiFetch(`/notifications/${id}/read`, { method: "PATCH", body: "{}" });
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
  if (!isApiConfigured()) return;
  await apiFetch("/staff_messages", {
    method: "POST",
    body: JSON.stringify({
      id: message.id,
      author_id: message.authorId,
      author_name: message.authorName,
      body: message.body,
      created_at: message.createdAt,
    }),
  });
}
