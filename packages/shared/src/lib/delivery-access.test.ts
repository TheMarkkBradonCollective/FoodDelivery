import assert from "node:assert/strict";
import test from "node:test";
import type { Delivery, Order } from "../types/index";
import { matchDeliveryAccess, offersForRunner, packDeliveryAddress, unpackDeliveryAddress } from "./delivery-access";

test("stairs required and no stairs is not assigned", () => {
  const decision = matchDeliveryAccess("requires_stairs", "no_stairs");
  assert.equal(decision.assign, false);
  if (!decision.assign) assert.equal(decision.reason, "stairs_required");
});

test("elevator available and no elevators still assigns, with a stairs notice", () => {
  const decision = matchDeliveryAccess("elevator", "no_elevators");
  assert.equal(decision.assign, true);
  if (decision.assign) assert.equal(decision.notice, "stairs_may_be_required");
});

test("the same notice applies when the Runner only takes stairs", () => {
  const decision = matchDeliveryAccess("elevator", "stairs");
  assert.deepEqual(decision, { assign: true, notice: "stairs_may_be_required" });
});

test("stairs available and no stairs warns that an elevator may be required", () => {
  const decision = matchDeliveryAccess("stairs", "no_stairs");
  assert.deepEqual(decision, { assign: true, notice: "elevator_may_be_required" });
});

test("elevator required and no elevators is not assigned", () => {
  const decision = matchDeliveryAccess("requires_elevator", "no_elevators");
  assert.equal(decision.assign, false);
  if (!decision.assign) assert.equal(decision.reason, "elevator_required");
});

test("both available and ground level match every preference", () => {
  for (const preference of ["elevators", "stairs", "both", "no_elevators", "no_stairs"] as const) {
    assert.deepEqual(matchDeliveryAccess("both", preference), { assign: true, notice: null });
    assert.deepEqual(matchDeliveryAccess("ground", preference), { assign: true, notice: null });
  }
});

test("a Runner who takes both can take a required stair or elevator drop", () => {
  assert.deepEqual(matchDeliveryAccess("requires_stairs", "both"), { assign: true, notice: null });
  assert.deepEqual(matchDeliveryAccess("requires_elevator", "both"), { assign: true, notice: null });
});

test("missing access does not block", () => {
  assert.deepEqual(matchDeliveryAccess(undefined, "no_stairs"), { assign: true, notice: null });
  assert.deepEqual(matchDeliveryAccess("requires_stairs", undefined), { assign: true, notice: null });
});

test("address packing round-trips access without changing the street line", () => {
  const packed = packDeliveryAddress(
    "1 Market St, San Francisco",
    "elevator",
    "Elevator is around the back of the building.",
    null,
  );
  const unpacked = unpackDeliveryAddress(packed ?? undefined);
  assert.equal(unpacked.address, "1 Market St, San Francisco");
  assert.equal(unpacked.buildingAccess, "elevator");
  assert.equal(unpacked.accessNote, "Elevator is around the back of the building.");
  assert.equal(unpackDeliveryAddress("1 Market St").address, "1 Market St");
});

test("offers skip a stair-only drop for a Runner who takes no stairs", () => {
  const orders = [
    order("stairs-job", "requires_stairs"),
    order("elevator-job", "elevator"),
  ];
  const deliveries = [
    delivery("d-stairs", "stairs-job", "requires_stairs"),
    delivery("d-elevator", "elevator-job", "elevator"),
  ];
  const result = offersForRunner(deliveries, orders, "no_stairs", "runner-1");
  assert.equal(result.pending?.id, "d-elevator");
  assert.deepEqual(result.hold, { count: 1, stairs: 1, elevators: 0 });
});

function order(id: string, building: Order["buildingAccess"]): Order {
  return {
    id,
    customerId: "customer",
    businessId: "biz",
    items: [],
    subtotal: 1,
    deliveryFee: 1,
    serviceFee: 1,
    tax: 1,
    tip: 1,
    total: 5,
    status: "ready",
    createdAt: "2026-10-02T00:00:00.000Z",
    buildingAccess: building,
  };
}

function delivery(id: string, orderId: string, building: Delivery["buildingAccess"]): Delivery {
  return {
    id,
    orderId,
    businessId: "biz",
    pickup: { lat: 0, lng: 0 },
    dropoff: { lat: 1, lng: 1 },
    distanceMiles: 1,
    status: "offered",
    basePay: 1,
    distancePay: 1,
    tip: 1,
    totalEarnings: 3,
    estimatedMinutes: 10,
    customerName: "Customer",
    buildingAccess: building,
  };
}
