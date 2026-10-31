import type { Sql } from "./db";
import { firstRow, rows } from "./db";

function asNumber(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const STAFF_TITLES = [
  "support",
  "moderator",
  "administrator",
  "manager",
  "director",
  "founder",
] as const;

function staffTitleFromValue(value: unknown) {
  if (typeof value !== "string") return undefined;
  const title = value.toLowerCase();
  return (STAFF_TITLES as readonly string[]).includes(title) ? title : undefined;
}

export async function buildMarketplaceSnapshot(
  sql: Sql,
  userId?: string,
  accessPreference?: string,
) {
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
    sql`select * from businesses`,
    sql`select * from menu_items`,
    sql`select * from coverage_rules`,
    sql`select * from runs`,
    sql`select * from orders order by created_at desc`,
    sql`select * from deliveries`,
    sql`select * from earnings order by completed_at desc`,
    sql`select * from notifications order by created_at desc`,
    userId
      ? sql`select business_id from favorites where user_id = ${userId}::uuid`
      : Promise.resolve([]),
    sql`select id, name, email, role, avatar_url, access_preference from profiles`,
    sql`select * from staff_messages order by created_at asc limit 200`,
  ]);

  type RunRow = Record<string, unknown>;
  const runs = rows<RunRow>(runsRes).map((row) => ({
    id: String(row.id),
    runrId: String(row.runr_id),
    businessId: String(row.business_id),
    startTime: String(row.start_time),
    endTime: String(row.end_time),
    status: row.status,
    checkInTime: row.check_in_time ? String(row.check_in_time) : undefined,
    checkOutTime: row.check_out_time ? String(row.check_out_time) : undefined,
    deliveryCount: asNumber(row.delivery_count, 0),
    earnings: asNumber(row.earnings, 0),
  }));

  const menus = rows<Record<string, unknown>>(menusRes);
  const rules = rows<Record<string, unknown>>(rulesRes);

  const businesses = rows<Record<string, unknown>>(businessesRes).map((rec) => {
    const id = String(rec.id);
    return {
      id,
      ownerId: String(rec.owner_id ?? ""),
      name: String(rec.name),
      cuisine: String(rec.cuisine ?? ""),
      category: String(rec.category ?? "Restaurant"),
      rating: asNumber(rec.rating, 4.8),
      reviewCount: asNumber(rec.review_count, 0),
      location: { lat: asNumber(rec.lat, 37.7749), lng: asNumber(rec.lng, -122.4194) },
      address: String(rec.address ?? ""),
      city: String(rec.city ?? ""),
      zip: String(rec.zip ?? ""),
      deliveryRadiusMiles: asNumber(rec.delivery_radius_miles, 5),
      operatingHours: String(rec.operating_hours ?? ""),
      deliveryFee: asNumber(rec.delivery_fee, 2.99),
      etaMinutes: asNumber(rec.eta_minutes, 28),
      demandLevel: rec.demand_level ?? "moderate",
      coverageRules: rules
        .filter((r) => String(r.business_id) === id)
        .map((r) => ({
          id: String(r.id),
          businessId: id,
          startTime: String(r.start_time),
          endTime: String(r.end_time),
          maxRunrs: asNumber(r.max_runrs, 4),
        })),
      scheduledRuns: runs.filter((r) => r.businessId === id && r.status !== "cancelled"),
      menu: menus
        .filter((m) => String(m.business_id) === id)
        .map((m) => ({
          id: String(m.id),
          name: String(m.name),
          description: String(m.description ?? ""),
          price: asNumber(m.price),
          category: String(m.category ?? "Mains"),
          popular: Boolean(m.popular),
        })),
    };
  });

  const orders = rows<Record<string, unknown>>(ordersRes).map((row) => ({
    id: String(row.id),
    customerId: String(row.customer_id),
    businessId: String(row.business_id),
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: asNumber(row.subtotal),
    deliveryFee: asNumber(row.delivery_fee),
    serviceFee: asNumber(row.service_fee),
    tax: asNumber(row.tax),
    tip: asNumber(row.tip),
    total: asNumber(row.total),
    status: row.status,
    runrId: row.runr_id ? String(row.runr_id) : undefined,
    createdAt: String(row.created_at),
    fulfillment:
      row.fulfillment === "pickup" || row.fulfillment === "delivery" ? row.fulfillment : undefined,
    deliveryAddress: row.delivery_address ? String(row.delivery_address) : undefined,
    buildingAccess: row.building_access ?? undefined,
    accessNote: row.access_note ? String(row.access_note) : undefined,
    accessNotice: row.access_notice ?? null,
  }));

  const deliveries = rows<Record<string, unknown>>(deliveriesRes).map((row) => ({
    id: String(row.id),
    orderId: String(row.order_id),
    businessId: String(row.business_id),
    runrId: row.runr_id ? String(row.runr_id) : undefined,
    pickup: { lat: asNumber(row.pickup_lat), lng: asNumber(row.pickup_lng) },
    dropoff: { lat: asNumber(row.dropoff_lat), lng: asNumber(row.dropoff_lng) },
    distanceMiles: asNumber(row.distance_miles, 1.2),
    status: row.status,
    basePay: asNumber(row.base_pay, 4.5),
    distancePay: asNumber(row.distance_pay, 1.8),
    tip: asNumber(row.tip, 5),
    totalEarnings: asNumber(row.total_earnings, 11.3),
    estimatedMinutes: asNumber(row.estimated_minutes, 18),
    customerName: String(row.customer_name ?? "Customer"),
    buildingAccess: row.building_access ?? undefined,
    accessNote: row.access_note ? String(row.access_note) : undefined,
    accessNotice: row.access_notice ?? null,
  }));

  const myRuns = userId ? runs.filter((r) => r.runrId === userId) : runs;
  const activeRun =
    myRuns.find((r) => r.status === "checked_in" || r.status === "active") ?? null;
  const scheduledRuns = myRuns.filter((r) => r.status === "scheduled");
  const runHistory = myRuns.filter((r) => r.status === "completed" || r.status === "cancelled");

  const pendingDelivery =
    deliveries.find(
      (d) =>
        d.status === "offered" &&
        (!d.runrId || d.runrId === userId) &&
        (!accessPreference || true),
    ) ?? null;

  const activeDelivery =
    deliveries.find(
      (d) =>
        d.runrId === userId &&
        d.status !== "completed" &&
        d.status !== "cancelled" &&
        d.status !== "offered",
    ) ?? null;

  return {
    businesses,
    orders,
    deliveries,
    scheduledRuns,
    runHistory,
    activeRun,
    pendingDelivery,
    activeDelivery,
    earnings: rows<Record<string, unknown>>(earningsRes).map((rec) => ({
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
    })),
    notifications: rows<Record<string, unknown>>(notificationsRes).map((rec) => ({
      id: String(rec.id),
      title: String(rec.title),
      body: String(rec.body ?? ""),
      type: rec.type,
      read: Boolean(rec.read),
      createdAt: String(rec.created_at),
    })),
    favoriteBusinessIds: rows<{ business_id: string }>(favoritesRes).map((r) =>
      String(r.business_id),
    ),
    staffMessages: rows<Record<string, unknown>>(messagesRes).map((rec) => ({
      id: String(rec.id),
      authorId: String(rec.author_id ?? ""),
      authorName: String(rec.author_name ?? "Staff"),
      body: String(rec.body ?? ""),
      createdAt: String(rec.created_at),
    })),
    profiles: rows<Record<string, unknown>>(profilesRes).map((rec) => ({
      id: String(rec.id),
      name: String(rec.name ?? rec.email ?? "User"),
      email: String(rec.email ?? ""),
      role: staffTitleFromValue(rec.role) ? "staff" : rec.role,
      staffTitle: staffTitleFromValue(rec.role),
      avatarUrl: rec.avatar_url ? String(rec.avatar_url) : undefined,
      accessPreference: rec.access_preference ?? undefined,
    })),
    accessHold: null,
    serverTime: new Date().toISOString(),
  };
}

export async function hasUpdatesSince(sql: Sql, since: string): Promise<boolean> {
  const row = firstRow<{ latest: string }>(
    await sql`
      select greatest(
        coalesce((select max(updated_at) from profiles), 'epoch'::timestamptz),
        coalesce((select max(updated_at) from businesses), 'epoch'::timestamptz),
        coalesce((select max(created_at) from orders), 'epoch'::timestamptz),
        coalesce((select max(created_at) from deliveries), 'epoch'::timestamptz),
        coalesce((select max(created_at) from runs), 'epoch'::timestamptz),
        coalesce((select max(created_at) from staff_messages), 'epoch'::timestamptz)
      ) as latest
    `,
  );
  if (!row?.latest) return true;
  return new Date(String(row.latest)).getTime() > new Date(since).getTime();
}
