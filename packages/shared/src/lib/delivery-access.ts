import type {
  AccessNotice,
  BuildingAccess,
  Delivery,
  Order,
  RunnerAccessPreference,
} from "../types/index";

export const ACCESS_NOTE_MAX = 160;

export const BUILDING_ACCESS_CHOICES: {
  value: BuildingAccess;
  label: string;
  hint: string;
}[] = [
  {
    value: "elevator",
    label: "🛗 Elevator available",
    hint: "An elevator can reach this drop-off.",
  },
  {
    value: "stairs",
    label: "🪜 Stairs available",
    hint: "Stairs can reach this drop-off.",
  },
  {
    value: "both",
    label: "🛗🪜 Both available",
    hint: "Elevator and stairs both reach this drop-off.",
  },
  {
    value: "ground",
    label: "🚪 Ground-level / no stairs or elevator",
    hint: "No stairs or elevator on the way in.",
  },
  {
    value: "requires_stairs",
    label: "⚠️ Delivery requires stairs",
    hint: "The Runner has to use stairs.",
  },
  {
    value: "requires_elevator",
    label: "⚠️ Delivery requires elevator",
    hint: "The Runner has to use an elevator.",
  },
];

export const RUNNER_ACCESS_CHOICES: { value: RunnerAccessPreference; label: string }[] = [
  { value: "elevators", label: "🛗 I take elevators" },
  { value: "stairs", label: "🪜 I take stairs" },
  { value: "both", label: "🛗🪜 I take both" },
  { value: "no_elevators", label: "🚫 No elevators" },
  { value: "no_stairs", label: "🚫 No stairs" },
];

export type AccessDecision =
  | { assign: true; notice: AccessNotice | null }
  | { assign: false; notice: null; reason: "stairs_required" | "elevator_required" };

export interface AccessHold {
  count: number;
  stairs: number;
  elevators: number;
}

const BUILDING_VALUES = new Set<string>(BUILDING_ACCESS_CHOICES.map((choice) => choice.value));
const RUNNER_VALUES = new Set<string>(RUNNER_ACCESS_CHOICES.map((choice) => choice.value));

export function parseBuildingAccess(value: unknown): BuildingAccess | undefined {
  if (typeof value !== "string" || !BUILDING_VALUES.has(value)) return undefined;
  return value as BuildingAccess;
}

export function parseRunnerAccess(value: unknown): RunnerAccessPreference | undefined {
  if (typeof value !== "string" || !RUNNER_VALUES.has(value)) return undefined;
  return value as RunnerAccessPreference;
}

export function parseAccessNotice(value: unknown): AccessNotice | undefined {
  if (value === "stairs_may_be_required" || value === "elevator_may_be_required") return value;
  return undefined;
}

export function buildingAccessLabel(value: BuildingAccess): string {
  return BUILDING_ACCESS_CHOICES.find((choice) => choice.value === value)?.label ?? value;
}

export function runnerAccessLabel(value: RunnerAccessPreference): string {
  return RUNNER_ACCESS_CHOICES.find((choice) => choice.value === value)?.label ?? value;
}

export function customerAccessNotice(notice: AccessNotice): string {
  if (notice === "stairs_may_be_required") {
    return "Stairs are an option. Your Runner may need stair access.";
  }
  return "An elevator is an option. Your Runner may need elevator access.";
}

export function runnerAccessNotice(notice: AccessNotice): string {
  if (notice === "stairs_may_be_required") {
    return "Stairs are an option. The customer will know you may need stair access.";
  }
  return "An elevator is an option. The customer will know you may need elevator access.";
}

/** What this preference can physically use. Refusal options are the same capabilities as the matching “I take” choice. */
function capabilities(preference: RunnerAccessPreference): { elevator: boolean; stairs: boolean } {
  switch (preference) {
    case "elevators":
    case "no_stairs":
      return { elevator: true, stairs: false };
    case "stairs":
    case "no_elevators":
      return { elevator: false, stairs: true };
    case "both":
      return { elevator: true, stairs: true };
  }
}

/**
 * Match a customer's building access to a Runner's preference.
 * Missing either side does not block — older orders and Runners who have not chosen yet stay assignable.
 * Hard stops: stairs are required and the Runner does not take stairs, or an elevator is required and they do not take elevators.
 * Soft stops: the customer listed one option, and the Runner needs the other. The delivery can still be assigned, with a notice.
 */
export function matchDeliveryAccess(
  building: BuildingAccess | undefined,
  preference: RunnerAccessPreference | undefined,
): AccessDecision {
  if (!building || !preference) return { assign: true, notice: null };

  const caps = capabilities(preference);

  switch (building) {
    case "ground":
    case "both":
      return { assign: true, notice: null };
    case "requires_stairs":
      return caps.stairs
        ? { assign: true, notice: null }
        : { assign: false, notice: null, reason: "stairs_required" };
    case "requires_elevator":
      return caps.elevator
        ? { assign: true, notice: null }
        : { assign: false, notice: null, reason: "elevator_required" };
    case "elevator":
      return caps.elevator
        ? { assign: true, notice: null }
        : { assign: true, notice: "stairs_may_be_required" };
    case "stairs":
      return caps.stairs
        ? { assign: true, notice: null }
        : { assign: true, notice: "elevator_may_be_required" };
  }
}

export function accessHoldMessage(hold: AccessHold | null | undefined): string | null {
  if (!hold || hold.count === 0) return null;
  if (hold.stairs > 0 && hold.elevators > 0) {
    return "Some deliveries need stairs or an elevator you don’t take, so they stay unassigned.";
  }
  if (hold.stairs === 1) return "A delivery requires stairs, so it isn’t offered to you.";
  if (hold.stairs > 1) {
    return `${hold.stairs} deliveries require stairs, so they aren’t offered to you.`;
  }
  if (hold.elevators === 1) return "A delivery requires an elevator, so it isn’t offered to you.";
  return `${hold.elevators} deliveries require an elevator, so they aren’t offered to you.`;
}

function isOpenOffer(delivery: Delivery, userId?: string) {
  const open = delivery.status === "offered" || delivery.status === "pending";
  if (!open) return false;
  return !delivery.runrId || delivery.runrId === userId;
}

function buildingFor(delivery: Delivery, orders: Order[]): BuildingAccess | undefined {
  const order = orders.find((item) => item.id === delivery.orderId);
  return order?.buildingAccess ?? delivery.buildingAccess;
}

/** First offer this Runner can take, plus a count of offers held back. */
export function offersForRunner(
  deliveries: Delivery[],
  orders: Order[],
  preference?: RunnerAccessPreference,
  userId?: string,
): { pending: Delivery | null; hold: AccessHold } {
  const hold: AccessHold = { count: 0, stairs: 0, elevators: 0 };
  let pending: Delivery | null = null;

  for (const delivery of deliveries) {
    if (!isOpenOffer(delivery, userId)) continue;
    const decision = matchDeliveryAccess(buildingFor(delivery, orders), preference);
    if (!decision.assign) {
      hold.count += 1;
      if (decision.reason === "stairs_required") hold.stairs += 1;
      else hold.elevators += 1;
      continue;
    }
    if (!pending) pending = delivery;
  }

  return { pending, hold };
}

export function trimAccessNote(note: string | undefined): string | undefined {
  const trimmed = note?.trim() ?? "";
  if (!trimmed) return undefined;
  return trimmed.slice(0, ACCESS_NOTE_MAX);
}

const ACCESS_PACK = /\n\[\[portr-access:(.*)\]\]\s*$/;

/** Keep access on delivery_address when the dedicated columns are not in the database yet. */
export function packDeliveryAddress(
  address: string | undefined,
  building?: BuildingAccess,
  note?: string,
  notice?: AccessNotice | null,
): string | null {
  const base = address?.replace(ACCESS_PACK, "").trim() ?? "";
  const trimmedNote = trimAccessNote(note);
  if (!building && !trimmedNote && !notice) return base || null;
  const payload = JSON.stringify({
    building: building ?? null,
    note: trimmedNote ?? null,
    notice: notice ?? null,
  });
  return `${base}\n[[portr-access:${payload}]]`;
}

export function unpackDeliveryAddress(raw: string | undefined): {
  address?: string;
  buildingAccess?: BuildingAccess;
  accessNote?: string;
  accessNotice?: AccessNotice;
} {
  if (!raw) return {};
  const match = raw.match(ACCESS_PACK);
  if (!match) return { address: raw };
  const address = raw.slice(0, match.index).trim() || undefined;
  try {
    const data = JSON.parse(match[1]) as { building?: unknown; note?: unknown; notice?: unknown };
    return {
      address,
      buildingAccess: parseBuildingAccess(data.building),
      accessNote: typeof data.note === "string" && data.note.trim() ? data.note : undefined,
      accessNotice: parseAccessNotice(data.notice),
    };
  } catch {
    return { address };
  }
}
