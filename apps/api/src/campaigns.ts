import { Hono } from "hono";
import { getSql, rows, type ProfileRow } from "./db";
import { bearerToken, loadProfile, verifyToken } from "./auth";
import { isStaff, ownsBusiness } from "./roles";

type CampaignEnv = { DATABASE_URL: string; JWT_SECRET: string; FILES: R2Bucket; PAGES_URL?: string; STRIPE_SECRET_KEY?: string };
type CampaignVars = { profile: ProfileRow; userId: string };
const campaigns = new Hono<{ Bindings: CampaignEnv; Variables: CampaignVars }>();

type Schedule = { mode?: string; timezone?: string; days?: Record<string, { enabled?: boolean; intervals?: Array<{ start: string; end: string }> }> };

function isWithinOperatingHours(schedule: Schedule, now: Date): boolean {
  if (!schedule || schedule.mode === "always") return true;
  const timezone = schedule.timezone || "America/Los_Angeles";
  let parts: Record<string, string> = {};
  try {
    for (const part of new Intl.DateTimeFormat("en-US", {
      timeZone: timezone, weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(now)) parts[part.type] = part.value;
  } catch { return false; }
  const days = schedule.days || {};
  const today = (parts.weekday || "").toLowerCase();
  const names = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  const dayIndex = names.indexOf(today);
  if (dayIndex < 0) return false;
  const minute = Number(parts.hour) * 60 + Number(parts.minute);
  const previous = names[(dayIndex + 6) % 7];
  const matches = (dayName: string, previousDay = false) => {
    const config = days[dayName];
    if (!config?.enabled) return false;
    return (config.intervals || []).some(interval => {
      const [sh, sm] = interval.start.split(":").map(Number);
      const [eh, em] = interval.end.split(":").map(Number);
      const start = sh * 60 + sm, end = eh * 60 + em;
      if (![start, end].every(Number.isFinite) || start === end) return false;
      if (end > start) return !previousDay && minute >= start && minute < end;
      return previousDay ? minute < end : minute >= start;
    });
  };
  return matches(today) || matches(previous, true);
}


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
    where c.status not in ('draft','cancelled') or ${isStaff(profile)} or c.created_by=${profile.id}::uuid or exists(select 1 from businesses b where b.id=c.company_business_id and b.owner_id=${profile.id}::uuid)
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
  const existing = rows<{ status: string }>(await sql`
    select status from campaign_members where campaign_id=${id}::uuid and runr_id=${profile.id}::uuid
  `);
  if (existing[0]?.status === "joined") {
    return c.json({ ok: true, alreadyMember: true, message: "Already enrolled. Membership does not reserve a live working slot." });
  }
  const enrolled = rows(await sql`
    with capacity as (
      update campaigns set member_count=member_count+1, updated_at=now()
      where id=${id}::uuid and status in ('recruiting','upcoming')
        and now() < enrollment_deadline and starts_at > now()
        and member_count < member_capacity
      returning id
    )
    insert into campaign_members(campaign_id, runr_id, status)
    select id, ${profile.id}::uuid, 'joined' from capacity
    on conflict (campaign_id, runr_id) do update set status='joined', joined_at=now()
    returning id
  `);
  if (!enrolled.length) return c.json({ error: "Enrollment is closed or campaign membership is full." }, 409);
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
  if (!isWithinOperatingHours(item.operating_schedule as Schedule, now)) {
    return c.json({ error: "This campaign is currently outside its operating hours." }, 409);
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


// Staff launch control: enrollment must have closed and the campaign start time must have arrived.
campaigns.post("/:id/launch", async (c) => {
  const err = await auth(c); if (err) return err;
  const profile = c.get("profile");
  if (!isStaff(profile)) return c.json({ error: "Portr staff approval required." }, 403);
  const id = c.req.param("id");
  const sql = getSql(c.env.DATABASE_URL);
  const result = rows<{ id:string; minimum_members:number; joined_members:number; refundable_amount:string; payment_reference:string|null }>(await sql`
    select c.id,c.minimum_members,c.refundable_amount,c.payment_reference,
      (select count(*)::int from campaign_members m where m.campaign_id=c.id and m.status='joined') as joined_members
    from campaigns c where c.id=${id}::uuid and c.status in ('draft','upcoming','recruiting')
      and c.enrollment_deadline <= now() and c.starts_at <= now()
  `);
  if (!result.length) return c.json({ error: "Campaign is not ready to launch. Enrollment must be closed and its start time must have arrived." }, 409);
  const item=result[0];
  if (item.joined_members < item.minimum_members) {
    await sql`update campaigns set status='void',refund_status=case when refundable_amount>0 then 'pending' else 'not_required' end,updated_at=now() where id=${id}::uuid`;
    if (Number(item.refundable_amount)>0) await sql`
      insert into campaign_refund_ledger(campaign_id,amount,payment_reference,status)
      values (${id}::uuid,${Number(item.refundable_amount)},${item.payment_reference},'pending')
      on conflict do nothing
    `;
    return c.json({ok:true,status:"void",reason:"minimum_members_not_met",refund:"pending"});
  }
  await sql`update campaigns set status='live',updated_at=now() where id=${id}::uuid`;
  return c.json({ok:true,status:"live",joined_members:item.joined_members});
});

// Stripe refunds are only finalized after Stripe confirms success.
campaigns.post("/:id/refund", async (c) => {
  const err = await auth(c); if (err) return err;
  if (!isStaff(c.get("profile"))) return c.json({error:"Portr staff approval required."},403);
  if (!c.env.STRIPE_SECRET_KEY) return c.json({error:"Stripe refund processing is not configured. Add STRIPE_SECRET_KEY to the Worker environment."},503);
  const id=c.req.param("id"), sql=getSql(c.env.DATABASE_URL);
  const pending=rows<{id:string;amount:string;payment_reference:string|null}>(await sql`
    update campaign_refund_ledger set status='processing'
    where id=(select id from campaign_refund_ledger where campaign_id=${id}::uuid and status='pending' order by created_at for update skip locked limit 1)
    returning id,amount,payment_reference
  `);
  if(!pending.length) return c.json({error:"No pending refund is available."},409);
  const refund=pending[0];
  if(!refund.payment_reference || !refund.payment_reference.startsWith("pi_")) {
    await sql`update campaign_refund_ledger set status='failed' where id=${refund.id}::uuid`;
    return c.json({error:"A valid Stripe PaymentIntent reference (pi_...) is required before a refund can be sent."},422);
  }
  const form=new URLSearchParams({payment_intent:refund.payment_reference,amount:String(Math.round(Number(refund.amount)*100))});
  let response: Response;
  try {
    response=await fetch("https://api.stripe.com/v1/refunds",{method:"POST",headers:{Authorization:"Bearer "+c.env.STRIPE_SECRET_KEY,"Content-Type":"application/x-www-form-urlencoded","Idempotency-Key":"portr-campaign-refund-"+refund.id},body:form});
  } catch {
    await sql`update campaign_refund_ledger set status='pending' where id=${refund.id}::uuid`;
    return c.json({error:"Stripe could not be reached. Refund remains pending for safe retry."},502);
  }
  const payload=await response.json() as {id?:string;status?:string;error?:{message?:string}};
  if(!response.ok) {
    await sql`update campaign_refund_ledger set status='failed' where id=${refund.id}::uuid`;
    return c.json({error:payload.error?.message || "Stripe rejected the refund."},502);
  }
  const completed=payload.status==="succeeded";
  await sql`
    update campaign_refund_ledger set status=${completed?"refunded":"processing"},refund_reference=${payload.id ?? null},processed_at=case when ${completed} then now() else null end
    where id=${refund.id}::uuid
  `;
  await sql`
    update campaigns set refund_status=${completed?"refunded":"processing"},refund_reference=${payload.id ?? null},updated_at=now()
    where id=${id}::uuid
  `;
  return c.json({ok:true,status:payload.status,refund_reference:payload.id});
});

export default campaigns;
