/** Sheet tabs and header rows, in order. Shared by the API and scripts. */
export const TABLES = {
  profiles: ["id", "email", "name", "role", "is_founder", "avatar_url", "access_preference", "password_hash", "created_at", "updated_at"],
  businesses: ["id", "owner_id", "name", "cuisine", "category", "rating", "review_count", "lat", "lng", "address", "city", "zip", "delivery_radius_miles", "operating_hours", "delivery_fee", "eta_minutes", "demand_level", "created_at", "updated_at"],
  menu_items: ["id", "business_id", "name", "description", "price", "category", "popular", "updated_at"],
  coverage_rules: ["id", "business_id", "start_time", "end_time", "max_runrs", "updated_at"],
  orders: ["id", "customer_id", "business_id", "runr_id", "items", "subtotal", "delivery_fee", "service_fee", "tax", "tip", "total", "status", "created_at", "delivery_address", "building_access", "access_note", "access_notice", "updated_at"],
  runs: ["id", "runr_id", "business_id", "start_time", "end_time", "status", "check_in_time", "check_out_time", "delivery_count", "earnings", "updated_at"],
  deliveries: ["id", "order_id", "business_id", "runr_id", "pickup_lat", "pickup_lng", "dropoff_lat", "dropoff_lng", "distance_miles", "status", "base_pay", "distance_pay", "tip", "total_earnings", "estimated_minutes", "customer_name", "building_access", "access_note", "access_notice", "updated_at"],
  earnings: ["id", "runr_id", "business_id", "business_name", "delivery_id", "base_pay", "distance_pay", "tip", "total", "completed_at", "updated_at"],
  notifications: ["id", "user_id", "title", "body", "type", "read", "created_at", "updated_at"],
  favorites: ["user_id", "business_id", "updated_at"],
  staff_messages: ["id", "author_id", "author_name", "body", "created_at", "updated_at"],
  meta: ["key", "value"],
};

/** Columns stored as JSON text. */
export const JSON_COLUMNS = new Set(["items", "access_notice"]);

/** Primary key columns per tab. */
export const KEYS = {
  favorites: ["user_id", "business_id"],
  meta: ["key"],
};
export const keyOf = (table) => KEYS[table] ?? ["id"];

/** Tabs live in the shared "TMBC Apps Database" as "<prefix> - <table>". */
export const tabPrefix = () => process.env.TAB_PREFIX || "FoodDelivery";
export const tabName = (table) => `${tabPrefix()} - ${table}`;
/** A1 range on a prefixed tab, e.g. rangeOf("orders", "A2:R") -> 'FoodDelivery - orders'!A2:R */
export const rangeOf = (table, a1) => `'${tabName(table).replace(/'/g, "''")}'!${a1}`;
