import { Hono } from "hono";
import { cors } from "hono/cors";
import { getSql, firstRow, rows, type ProfileRow } from "./db";
import {
  bearerToken,
  hashPassword,
  loadProfile,
  signToken,
  verifyPassword,
  verifyToken,
} from "./auth";
import { buildMarketplaceSnapshot, hasUpdatesSince } from "./snapshot";
import { canReadOrder, isStaff, ownsBusiness } from "./roles";

export type Env = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  FILES: R2Bucket;
  PAGES_URL?: string;
};

type Variables = {
  profile: ProfileRow;
  userId: string;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

function corsOrigins(pagesUrl?: string) {
  const origins = ["capacitor://localhost", "https://localhost", "http://localhost:3000"];
  if (pagesUrl) origins.push(pagesUrl.replace(/\/$/, ""));
  return origins;
}

app.use("*", async (c, next) => {
  const middleware = cors({
    origin: (origin) => {
      const allowed = corsOrigins(c.env.PAGES_URL);
      if (!origin) return allowed[0];
      if (allowed.includes(origin)) return origin;
      if (origin.endsWith(".pages.dev")) return origin;
      return allowed[0];
    },
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  });
  return middleware(c, next);
});

app.get("/health", (c) => c.json({ ok: true }));

async function requireAuth(c: import("hono").Context<{ Bindings: Env; Variables: Variables }>) {
  const token = bearerToken(c.req.header("Authorization"));
  if (!token) return c.json({ error: "Unauthorized" }, 401);
  const verified = await verifyToken(token, c.env.JWT_SECRET);
  if (!verified) return c.json({ error: "Invalid token" }, 401);
  const sql = getSql(c.env.DATABASE_URL);
  const profile = await loadProfile(sql, verified.userId);
  if (!profile) return c.json({ error: "Profile not found" }, 401);
  c.set("profile", profile);
  c.set("userId", profile.id);
  return null;
}

function profileToUser(profile: ProfileRow) {
  const staffTitle = ["support", "moderator", "administrator", "manager", "director", "founder"].includes(
    profile.role,
  )
    ? profile.role
    : undefined;
  return {
    id: profile.id,
    name: profile.name ?? profile.email ?? "User",
    email: profile.email ?? "",
    role: staffTitle ? "staff" : profile.role,
    staffTitle,
    avatarUrl: profile.avatar_url ?? undefined,
    accessPreference: profile.access_preference ?? undefined,
  };
}

app.post("/auth/signup", async (c) => {
  const body = await c.req.json<{
    email?: string;
    password?: string;
    name?: string;
    role?: string;
  }>();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const name = body.name?.trim() || email?.split("@")[0] || "User";
  const role = body.role ?? "customer";
  if (!email || password.length < 8) {
    return c.json({ error: "Email and password (8+ chars) required" }, 400);
  }
  const sql = getSql(c.env.DATABASE_URL);
  const existing = rows(await sql`select id from profiles where lower(email) = ${email} limit 1`);
  if (existing.length) return c.json({ error: "Email already registered" }, 409);
  const passwordHash = await hashPassword(password);
  const inserted = rows<{ id: string }>(await sql`
    insert into profiles (email, personal_email, name, role, password_hash)
    values (${email}, ${email}, ${name}, ${role}, ${passwordHash})
    returning id
  `);
  const userId = String(inserted[0]?.id);
  const token = await signToken(userId, c.env.JWT_SECRET);
  const profile = await loadProfile(sql, userId);
  return c.json({
    token,
    user: profile ? profileToUser(profile) : { id: userId, email, name, role },
  });
});

app.post("/auth/login", async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) return c.json({ error: "Email and password required" }, 400);
  const sql = getSql(c.env.DATABASE_URL);
  const found = rows<{ id: string; password_hash: string | null }>(await sql`
    select id, password_hash from profiles where lower(email) = ${email} limit 1
  `);
  if (!found.length) return c.json({ error: "Invalid email or password" }, 401);
  const row = found[0];
  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) return c.json({ error: "Invalid email or password" }, 401);
  const token = await signToken(String(row.id), c.env.JWT_SECRET);
  const profile = await loadProfile(sql, String(row.id));
  return c.json({ token, user: profile ? profileToUser(profile) : null });
});

app.post("/auth/reset-request", async (c) => {
  const body = await c.req.json<{ email?: string }>();
  const email = body.email?.trim().toLowerCase();
  if (!email) return c.json({ error: "Email required" }, 400);
  const sql = getSql(c.env.DATABASE_URL);
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 3600_000).toISOString();
  await sql`
    update profiles
    set password_reset_token = ${token}, password_reset_expires = ${expires}::timestamptz
    where lower(email) = ${email}
  `;
  return c.json({ ok: true, resetToken: token });
});

app.post("/auth/reset", async (c) => {
  const body = await c.req.json<{ token?: string; password?: string }>();
  const token = body.token?.trim();
  const password = body.password ?? "";
  if (!token || password.length < 8) {
    return c.json({ error: "Token and new password (8+ chars) required" }, 400);
  }
  const sql = getSql(c.env.DATABASE_URL);
  const resetRows = rows<{ id: string }>(await sql`
    select id from profiles
    where password_reset_token = ${token}
      and password_reset_expires > now()
    limit 1
  `);
  if (!resetRows.length) return c.json({ error: "Invalid or expired reset token" }, 400);
  const userId = String(resetRows[0].id);
  const passwordHash = await hashPassword(password);
  await sql`
    update profiles
    set password_hash = ${passwordHash},
        password_reset_token = null,
        password_reset_expires = null,
        updated_at = now()
    where id = ${userId}::uuid
  `;
  return c.json({ ok: true });
});

app.get("/auth/me", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;
  return c.json({ user: profileToUser(c.get("profile")) });
});

app.get("/marketplace", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;
  const since = c.req.query("updated_since");
  const accessPreference = c.req.query("access_preference") ?? undefined;
  const sql = getSql(c.env.DATABASE_URL);
  if (since && !(await hasUpdatesSince(sql, since))) {
    return c.json({ unchanged: true, serverTime: new Date().toISOString() });
  }
  const snapshot = await buildMarketplaceSnapshot(sql, c.get("userId"), accessPreference);
  return c.json(snapshot);
});

app.put("/orders/:id", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;
  const profile = c.get("profile");
  const order = await c.req.json<Record<string, unknown>>();
  const sql = getSql(c.env.DATABASE_URL);
  if (order.customer_id && order.customer_id !== profile.id && !isStaff(profile)) {
    return c.json({ error: "Forbidden" }, 403);
  }
  await sql`
    insert into orders (
      id, customer_id, business_id, runr_id, items, subtotal, delivery_fee,
      service_fee, tax, tip, total, status, created_at, delivery_address,
      building_access, access_note, access_notice, fulfillment
    ) values (
      ${String(order.id ?? c.req.param("id"))}::uuid,
      ${String(order.customer_id ?? profile.id)}::uuid,
      ${String(order.business_id)}::uuid,
      ${order.runr_id ? String(order.runr_id) : null}::uuid,
      ${JSON.stringify(order.items ?? [])}::jsonb,
      ${Number(order.subtotal ?? 0)},
      ${Number(order.delivery_fee ?? 0)},
      ${Number(order.service_fee ?? 0)},
      ${Number(order.tax ?? 0)},
      ${Number(order.tip ?? 0)},
      ${Number(order.total ?? 0)},
      ${String(order.status ?? "new")},
      ${order.created_at ? String(order.created_at) : new Date().toISOString()}::timestamptz,
      ${order.delivery_address ? String(order.delivery_address) : null},
      ${order.building_access ? String(order.building_access) : null},
      ${order.access_note ? String(order.access_note) : null},
      ${order.access_notice ? String(order.access_notice) : null},
      ${order.fulfillment ? String(order.fulfillment) : null}
    )
    on conflict (id) do update set
      runr_id = excluded.runr_id,
      items = excluded.items,
      subtotal = excluded.subtotal,
      delivery_fee = excluded.delivery_fee,
      service_fee = excluded.service_fee,
      tax = excluded.tax,
      tip = excluded.tip,
      total = excluded.total,
      status = excluded.status,
      delivery_address = excluded.delivery_address,
      building_access = excluded.building_access,
      access_note = excluded.access_note,
      access_notice = excluded.access_notice,
      fulfillment = excluded.fulfillment
  `;
  return c.json({ ok: true });
});

app.patch("/orders/:id", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;
  const profile = c.get("profile");
  const patch = await c.req.json<Record<string, unknown>>();
  const id = c.req.param("id");
  const sql = getSql(c.env.DATABASE_URL);
  const existing = rows(await sql`select * from orders where id = ${id}::uuid limit 1`);
  if (!existing.length) return c.json({ error: "Not found" }, 404);
  const row = existing[0] as Record<string, unknown>;
  if (!(await canReadOrder(sql, profile, row as never))) {
    return c.json({ error: "Forbidden" }, 403);
  }
  await sql`
    update orders set
      status = coalesce(${patch.status ? String(patch.status) : null}, status),
      runr_id = coalesce(${patch.runr_id ? String(patch.runr_id) : null}::uuid, runr_id),
      access_notice = coalesce(${patch.access_notice ? String(patch.access_notice) : null}, access_notice)
    where id = ${id}::uuid
  `;
  return c.json({ ok: true });
});

app.put("/runs/:id", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;
  const profile = c.get("profile");
  const run = await c.req.json<Record<string, unknown>>();
  if (run.runr_id !== profile.id && !isStaff(profile)) {
    return c.json({ error: "Forbidden" }, 403);
  }
  const sql = getSql(c.env.DATABASE_URL);
  await sql`
    insert into runs (
      id, runr_id, business_id, start_time, end_time, status,
      check_in_time, check_out_time, delivery_count, earnings
    ) values (
      ${String(run.id ?? c.req.param("id"))}::uuid,
      ${String(run.runr_id)}::uuid,
      ${String(run.business_id)}::uuid,
      ${String(run.start_time)},
      ${String(run.end_time)},
      ${String(run.status ?? "scheduled")},
      ${run.check_in_time ? String(run.check_in_time) : null}::timestamptz,
      ${run.check_out_time ? String(run.check_out_time) : null}::timestamptz,
      ${Number(run.delivery_count ?? 0)},
      ${Number(run.earnings ?? 0)}
    )
    on conflict (id) do update set
      status = excluded.status,
      check_in_time = excluded.check_in_time,
      check_out_time = excluded.check_out_time,
      delivery_count = excluded.delivery_count,
      earnings = excluded.earnings
  `;
  return c.json({ ok: true });
});

app.put("/deliveries/:id", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;
  const profile = c.get("profile");
  const delivery = await c.req.json<Record<string, unknown>>();
  const id = String(delivery.id ?? c.req.param("id"));
  const sql = getSql(c.env.DATABASE_URL);
  const accepting =
    delivery.status === "accepted" &&
    delivery.runr_id &&
    String(delivery.runr_id) === profile.id;

  if (accepting) {
    const updated = rows(await sql`
      update deliveries set
        runr_id = ${profile.id}::uuid,
        status = 'accepted'
      where id = ${id}::uuid and runr_id is null
      returning id
    `);
    if (!updated.length) return c.json({ error: "Delivery already claimed" }, 409);
    return c.json({ ok: true });
  }

  await sql`
    insert into deliveries (
      id, order_id, business_id, runr_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng,
      distance_miles, status, base_pay, distance_pay, tip, total_earnings, estimated_minutes,
      customer_name, building_access, access_note, access_notice
    ) values (
      ${id}::uuid,
      ${String(delivery.order_id)}::uuid,
      ${String(delivery.business_id)}::uuid,
      ${delivery.runr_id ? String(delivery.runr_id) : null}::uuid,
      ${Number(delivery.pickup_lat ?? 0)},
      ${Number(delivery.pickup_lng ?? 0)},
      ${Number(delivery.dropoff_lat ?? 0)},
      ${Number(delivery.dropoff_lng ?? 0)},
      ${Number(delivery.distance_miles ?? 1.2)},
      ${String(delivery.status ?? "offered")},
      ${Number(delivery.base_pay ?? 4.5)},
      ${Number(delivery.distance_pay ?? 1.8)},
      ${Number(delivery.tip ?? 0)},
      ${Number(delivery.total_earnings ?? 0)},
      ${Number(delivery.estimated_minutes ?? 18)},
      ${String(delivery.customer_name ?? "Customer")},
      ${delivery.building_access ? String(delivery.building_access) : null},
      ${delivery.access_note ? String(delivery.access_note) : null},
      ${delivery.access_notice ? String(delivery.access_notice) : null}
    )
    on conflict (id) do update set
      runr_id = excluded.runr_id,
      status = excluded.status,
      building_access = excluded.building_access,
      access_note = excluded.access_note,
      access_notice = excluded.access_notice
  `;
  return c.json({ ok: true });
});

app.patch("/coverage/:id", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;
  const profile = c.get("profile");
  const { max_runrs } = await c.req.json<{ max_runrs?: number }>();
  const id = c.req.param("id");
  const sql = getSql(c.env.DATABASE_URL);
  const rules = rows<{ business_id: string }>(await sql`select business_id from coverage_rules where id = ${id}::uuid limit 1`);
  if (!rules.length) return c.json({ error: "Not found" }, 404);
  const businessId = String(rules[0].business_id);
  if (!(await ownsBusiness(sql, profile.id, businessId)) && !isStaff(profile)) {
    return c.json({ error: "Forbidden" }, 403);
  }
  await sql`update coverage_rules set max_runrs = ${Number(max_runrs ?? 0)} where id = ${id}::uuid`;
  return c.json({ ok: true });
});

app.put("/favorites", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;
  const { business_id, liked } = await c.req.json<{ business_id?: string; liked?: boolean }>();
  const sql = getSql(c.env.DATABASE_URL);
  const userId = c.get("userId");
  if (liked) {
    await sql`
      insert into favorites (user_id, business_id) values (${userId}::uuid, ${business_id}::uuid)
      on conflict do nothing
    `;
  } else {
    await sql`
      delete from favorites where user_id = ${userId}::uuid and business_id = ${business_id}::uuid
    `;
  }
  return c.json({ ok: true });
});

app.patch("/profiles/:id/access", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;
  const profile = c.get("profile");
  const id = c.req.param("id");
  if (id !== profile.id && !isStaff(profile)) return c.json({ error: "Forbidden" }, 403);
  const { access_preference } = await c.req.json<{ access_preference?: string }>();
  const sql = getSql(c.env.DATABASE_URL);
  await sql`
    update profiles set access_preference = ${access_preference ?? null}, updated_at = now()
    where id = ${id}::uuid
  `;
  return c.json({ ok: true });
});

app.put("/earnings/:id", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;
  const profile = c.get("profile");
  const rec = await c.req.json<Record<string, unknown>>();
  if (rec.runr_id !== profile.id && !isStaff(profile)) return c.json({ error: "Forbidden" }, 403);
  const sql = getSql(c.env.DATABASE_URL);
  await sql`
    insert into earnings (
      id, runr_id, business_id, business_name, delivery_id,
      base_pay, distance_pay, tip, total, completed_at
    ) values (
      ${String(rec.id ?? c.req.param("id"))}::uuid,
      ${String(rec.runr_id)}::uuid,
      ${String(rec.business_id)}::uuid,
      ${String(rec.business_name ?? "")},
      ${rec.delivery_id ? String(rec.delivery_id) : null}::uuid,
      ${Number(rec.base_pay ?? 0)},
      ${Number(rec.distance_pay ?? 0)},
      ${Number(rec.tip ?? 0)},
      ${Number(rec.total ?? 0)},
      ${rec.completed_at ? String(rec.completed_at) : new Date().toISOString()}::timestamptz
    )
    on conflict (id) do update set total = excluded.total
  `;
  return c.json({ ok: true });
});

app.put("/notifications/:id", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;
  const profile = c.get("profile");
  const note = await c.req.json<Record<string, unknown>>();
  const sql = getSql(c.env.DATABASE_URL);
  if (note.user_id !== profile.id && !isStaff(profile)) {
    return c.json({ error: "Forbidden" }, 403);
  }
  await sql`
    insert into notifications (id, user_id, title, body, type, read, created_at)
    values (
      ${String(note.id ?? c.req.param("id"))}::uuid,
      ${String(note.user_id ?? profile.id)}::uuid,
      ${String(note.title ?? "")},
      ${String(note.body ?? "")},
      ${String(note.type ?? "order")},
      ${Boolean(note.read)},
      ${note.created_at ? String(note.created_at) : new Date().toISOString()}::timestamptz
    )
    on conflict (id) do update set read = excluded.read, body = excluded.body
  `;
  return c.json({ ok: true });
});

app.patch("/notifications/:id/read", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;
  const profile = c.get("profile");
  const id = c.req.param("id");
  const sql = getSql(c.env.DATABASE_URL);
  if (isStaff(profile)) {
    await sql`update notifications set read = true where id = ${id}::uuid`;
  } else {
    await sql`
      update notifications set read = true
      where id = ${id}::uuid and user_id = ${profile.id}::uuid
    `;
  }
  return c.json({ ok: true });
});

app.post("/staff_messages", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;
  const profile = c.get("profile");
  if (!isStaff(profile)) return c.json({ error: "Forbidden" }, 403);
  const msg = await c.req.json<Record<string, unknown>>();
  const sql = getSql(c.env.DATABASE_URL);
  await sql`
    insert into staff_messages (id, author_id, author_name, body, created_at)
    values (
      ${String(msg.id ?? crypto.randomUUID())}::uuid,
      ${profile.id}::uuid,
      ${String(msg.author_name ?? profile.name ?? "Staff")},
      ${String(msg.body ?? "")},
      ${msg.created_at ? String(msg.created_at) : new Date().toISOString()}::timestamptz
    )
  `;
  return c.json({ ok: true });
});

app.put("/businesses/:id", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;
  const profile = c.get("profile");
  const id = c.req.param("id");
  const biz = await c.req.json<Record<string, unknown>>();
  if (biz.owner_id !== profile.id && !(await ownsBusiness(getSql(c.env.DATABASE_URL), profile.id, id)) && !isStaff(profile)) {
    return c.json({ error: "Forbidden" }, 403);
  }
  const sql = getSql(c.env.DATABASE_URL);
  await sql`
    update businesses set
      name = coalesce(${biz.name ? String(biz.name) : null}, name),
      cuisine = coalesce(${biz.cuisine ? String(biz.cuisine) : null}, cuisine),
      demand_level = coalesce(${biz.demand_level ? String(biz.demand_level) : null}, demand_level),
      updated_at = now()
    where id = ${id}::uuid
  `;
  return c.json({ ok: true });
});

app.put("/menu_items/:id", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;
  const profile = c.get("profile");
  const item = await c.req.json<Record<string, unknown>>();
  const sql = getSql(c.env.DATABASE_URL);
  const businessId = String(item.business_id);
  if (!(await ownsBusiness(sql, profile.id, businessId)) && !isStaff(profile)) {
    return c.json({ error: "Forbidden" }, 403);
  }
  await sql`
    insert into menu_items (id, business_id, name, description, price, category, popular)
    values (
      ${String(item.id ?? c.req.param("id"))}::uuid,
      ${businessId}::uuid,
      ${String(item.name ?? "")},
      ${String(item.description ?? "")},
      ${Number(item.price ?? 0)},
      ${String(item.category ?? "Mains")},
      ${Boolean(item.popular)}
    )
    on conflict (id) do update set
      name = excluded.name,
      price = excluded.price,
      description = excluded.description,
      popular = excluded.popular
  `;
  return c.json({ ok: true });
});

app.post("/files", async (c) => {
  const err = await requireAuth(c);
  if (err) return err;
  const form = await c.req.formData();
  const raw = form.get("file") as unknown;
  if (!raw || typeof raw === "string" || typeof (raw as Blob).stream !== "function") {
    return c.json({ error: "file required" }, 400);
  }
  const blob = raw as Blob & { name?: string };
  const fileName = typeof blob.name === "string" ? blob.name : "upload";
  const key = `${c.get("userId")}/${crypto.randomUUID()}-${fileName}`;
  await c.env.FILES.put(key, blob.stream(), {
    httpMetadata: { contentType: blob.type || "application/octet-stream" },
  });
  return c.json({ key, url: `/files/${encodeURIComponent(key)}` });
});

app.get("/files/*", async (c) => {
  const key = c.req.path.replace(/^\/files\//, "");
  const object = await c.env.FILES.get(decodeURIComponent(key));
  if (!object) return c.json({ error: "Not found" }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=86400");
  return new Response(object.body, { headers });
});

export default app;
