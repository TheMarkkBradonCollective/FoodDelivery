import { Hono } from "hono";
import { getSql, rows, type ProfileRow } from "./db";
import { bearerToken, loadProfile, verifyToken } from "./auth";
import { isStaff, ownsBusiness } from "./roles";

type CampaignEnv = { DATABASE_URL: string; JWT_SECRET: string; FILES: R2Bucket; PAGES_URL?: string };
type CampaignVars = { profile: ProfileRow; userId: string };
const campaigns = new Hono<{ Bindings: CampaignEnv; Variables: CampaignVars }>();

async function auth(c: import("hono").Context<{ Bindings: CampaignEnv; Variables: CampaignVars }>) {
  const token = bearerToken(c.req.header("Authorization"));
  if (!token) return c.json({ error: "Unauthorized" }, 401);
  const verified = await verifyToken(token, c.env.JWT_SECRET);
  if (!verified) return c.json({ error: "Invalid token" }, 401);
  const profile = await loadProfile(getSql(c.env.DATABASE_URL), verified.userId);
  if (!profile) return c.json({ error: "Profile not found" }, 401);
  c.set("profile", profile);
  c.set("userId", profile.id);
  return null;
}

const campaignSelect = `
  select c.*,
    (select count(*)::int from campaign_members m where m.campaign_id=c.id and m.status='joined') as joined_members,
    c.member_capacity - (select count(*)::int from campaign_members m where m.campaign_id=c.id and m.status='joined') as member_slots_available,
    (select count(*)::int from campaign_presence p where p.campaign_id=c.id and p.went_offline_at is null) as active_runrs_count,
    exists(select 1 from campaign_members mine where mine.campaign_id=c.id and mine.runr_id=$1::uuid and mine.status='joined') as is_member,
    exists(select 1 from campaign_presence here where here.campaign_id=c.id and here.runr_id=$1::uuid and here.went_offline_at is null) as is_online
  from campaigns c
`;

campaigns.get("/", async (c) => {
  const err = await auth(c); if (err) return err;
  const profile = c.get("profile");
  const sql = getSql(c.env.DATABASE_URL);
  const result = rows(await sql`
    select c.*,
      (select count(*)::int from campaign_members m where m.campaign_id=c.id and m.status='joined') as joined_members,
      c.member_capacity - (select count(*)::int from campaign_members m where m.campaign_id=c.id and m.status='joined') as member_slots_available,
      (select count(*)::int from campaign_presence p where p.campaign_id=c.id and p.went_offline_at is null) as active_runrs_count,
      exists(select 1 from campaign_members mine where mine.campaign_id=c.id and mine.runr_id=${profile.id}::uuid and mine.status='joined') as is_member,
      exists(select 1 from campaign_presence here where here.campaign_id=c.id and here.runr_id=${profile.id}::uuid and here.went_offline_at is null) as is_online
    from campaigns c
    where c.status not in ('draft','cancelled') or ${isStaff(profile)}
    order by c.starts_at asc
  `);
  return c.json({ campaigns: result });
});

campaigns.post("/", async (c) => {
  const err = await auth(c); if (err) return err;
  const profile = c.get("profile");
  const body = await c.req.json<Record<string, unknown>>();
  const companyId = String(body.company_business_id ?? "");
  const sql = getSql(c.env.DATABASE_URL);
  if (!isStaff(profile) && (!companyId || !(await ownsBusiness(sql, profile.id, companyId)))) {
    return c.json({ error: "Only Portr staff or the owning company can create a campaign." }, 403);
  }
  const name = String(body.name ?? "").trim();
  const startsAt = String(body.starts_at ?? "");
  const endsAt = String(body.ends_at ?? "");
  const deadline = String(body.enrollment_deadline ?? "");
  const memberCapacity = Number(body.member_capacity);
  const minimumMembers = Number(body.minimum_members ?? 1);
  const maxActive = Number(body.max_active_runrs);
  if (!name || !startsAt || !endsAt || !deadline || !Number.isInteger(memberCapacity) || !Number.isInteger(maxActive) || memberCapacity < 1 || maxActive < 1 || minimumMembers < 1 || minimumMembers > memberCapacity) {
    return c.json({ error: "Campaign name, dates, enrollment deadline, member capacity, minimum membership, and active Runner limit are required." }, 400);
  }
  if (!(new Date(endsAt) > new Date(startsAt)) || new Date(deadline) > new Date(startsAt)) {
    return c.json({ error: "End date must follow start date and enrollment must close no later than launch." }, 400);
  }
  const created = rows<{ id: string }>(await sql`
    insert into campaigns (
      company_business_id, created_by, name, description, campaign_type, city, service_area,
      starts_at, ends_at, enrollment_deadline, operating_schedule, member_capacity,
      minimum_members, max_active_runrs, status, funding_amount, refundable_amount, payment_reference, terms
    ) values (
      ${companyId || null}::uuid, ${profile.id}::uuid, ${name},
      ${String(body.description ?? "")}, ${String(body.campaign_type ?? "brand")},
      ${String(body.city ?? "")}, ${String(body.service_area ?? "")},
      ${startsAt}::timestamptz, ${endsAt}::timestamptz, ${deadline}::timestamptz,
      ${JSON.stringify(body.operating_schedule ?? { mode: "always", days: {} })}::jsonb,
      ${memberCapacity}, ${minimumMembers}, ${maxActive},
      ${String(body.status ?? "draft")}, ${Number(body.funding_amount ?? 0)},
      ${Number(body.refundable_amount ?? body.funding_amount ?? 0)},
      ${body.payment_reference ? String(body.payment_reference) : null},
      ${JSON.stringify(body.terms ?? {})}::jsonb
    ) returning id
  `);
  return c.json({ ok: true, id: created[0]?.id }, 201);
});

campaigns.post("/:id/join", async (c) => {
  const err = await auth(c); if (err) return err;
  const profile = c.get("profile");
  if (profile.role !== "runr" && !isStaff(profile)) return c.json({ error: "Runner account required." }, 403);
  const id = c.req.param("id");
  const sql = getSql(c.env.DATABASE_URL);
  const result = rows(await sql`
    select id from campaigns
    where id=${id}::uuid and status in ('recruiting','upcoming')
      and now() < enrollment_deadline and starts_at > now()
      and (select count(*) from campaign_members where campaign_id=${id}::uuid and status='joined') < member_capacity
  `);
  if (!result.length) return c.json({ error: "Enrollment is closed or campaign membership is full." }, 409);
  await sql`
    insert into campaign_members(campaign_id, runr_id, status)
    values (${id}::uuid, ${profile.id}::uuid, 'joined')
    on conflict (campaign_id, runr_id) do update set status='joined', joined_at=now()
  `;
  return c.json({ ok: true, message: "Joined campaign. Membership does not reserve a live working slot." });
});

campaigns.post("/:id/online", async (c) => {
  const err = await auth(c); if (err) return err;
  const profile = c.get("profile");
  if (profile.role !== "runr" && !isStaff(profile)) return c.json({ error: "Runner account required." }, 403);
  const id = c.req.param("id");
  const sql = getSql(c.env.DATABASE_URL);
  const membership = rows(await sql`
    select 1 from campaign_members where campaign_id=${id}::uuid and runr_id=${profile.id}::uuid and status='joined'
  `);
  if (!membership.length) return c.json({ error: "Join this campaign before going online." }, 403);
  const campaign = rows<{ starts_at: string; ends_at: string; status: string; operating_schedule: Record<string, unknown> }>(await sql`
    select starts_at, ends_at, status, operating_schedule from campaigns where id=${id}::uuid
  `);
  if (!campaign.length) return c.json({ error: "Campaign not found." }, 404);
  const item = campaign[0];
  const now = new Date();
  if (item.status !== "live" || now < new Date(item.starts_at) || now >= new Date(item.ends_at)) {
    return c.json({ error: "This campaign is not currently live." }, 409);
  }
  // Capacity is reserved atomically on the campaign row; joining alone never increments it.
  const reserved = rows(await sql`
    update campaigns set active_runrs=active_runrs+1, updated_at=now()
    where id=${id}::uuid and status='live' and active_runrs < max_active_runrs
    returning id
  `);
  if (!reserved.length) return c.json({ error: "All live Runner positions are currently occupied." }, 409);
  try {
    await sql`insert into campaign_presence(campaign_id, runr_id) values (${id}::uuid, ${profile.id}::uuid)`;
  } catch (e) {
    await sql`update campaigns set active_runrs=greatest(0,active_runrs-1) where id=${id}::uuid`;
    throw e;
  }
  return c.json({ ok: true, message: "You are now active on this campaign." });
});

campaigns.post("/:id/offline", async (c) => {
  const err = await auth(c); if (err) return err;
  const profile = c.get("profile");
  const id = c.req.param("id");
  const sql = getSql(c.env.DATABASE_URL);
  const closed = rows(await sql`
    update campaign_presence set went_offline_at=now()
    where campaign_id=${id}::uuid and runr_id=${profile.id}::uuid and went_offline_at is null
    returning id
  `);
  if (closed.length) await sql`update campaigns set active_runrs=greatest(0,active_runrs-1), updated_at=now() where id=${id}::uuid`;
  return c.json({ ok: true, wasOnline: closed.length > 0 });
});

campaigns.post("/:id/void", async (c) => {
  const err = await auth(c); if (err) return err;
  const profile = c.get("profile");
  if (!isStaff(profile)) return c.json({ error: "Portr staff approval required." }, 403);
  const id = c.req.param("id");
  const sql = getSql(c.env.DATABASE_URL);
  const result = rows<{ id: string; minimum_members: number; joined_members: number; refundable_amount: string; payment_reference: string | null }>(await sql`
    select c.id, c.minimum_members, c.refundable_amount, c.payment_reference,
      (select count(*)::int from campaign_members m where m.campaign_id=c.id and m.status='joined') as joined_members
    from campaigns c where c.id=${id}::uuid and c.status in ('draft','upcoming','recruiting')
  `);
  if (!result.length) return c.json({ error: "Campaign cannot be voided from its current state." }, 409);
  const campaign = result[0];
  if (campaign.joined_members >= campaign.minimum_members) return c.json({ error: "Minimum Runner membership was met. Review the campaign instead of voiding it for insufficient enrollment." }, 409);
  await sql`
    update campaigns set status='void', refund_status=case when refundable_amount > 0 then 'pending' else 'not_required' end, updated_at=now()
    where id=${id}::uuid
  `;
  if (Number(campaign.refundable_amount) > 0) {
    await sql`
      insert into campaign_refund_ledger(campaign_id, amount, payment_reference, status)
      values (${id}::uuid, ${Number(campaign.refundable_amount)}, ${campaign.payment_reference}, 'pending')
    `;
  }
  return c.json({
    ok: true, status: "void",
    refund: Number(campaign.refundable_amount) > 0 ? "pending" : "not_required",
    note: "The refundable balance is recorded for payment-provider reconciliation. A real Stripe refund must be processed and confirmed before marking it refunded."
  });
});

export default campaigns;
