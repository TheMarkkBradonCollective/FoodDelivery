import assert from "node:assert/strict";
import test from "node:test";
import { hasPrivilegedProfileFields, resolveSignupRole, validateSignupBody } from "./signup-role.ts";

test("resolveSignupRole allows customer, runr, and business", () => {
  for (const role of ["customer", "runr", "business"] as const) {
    const result = resolveSignupRole(role);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.role, role);
  }
});

test("resolveSignupRole rejects staff and management roles", () => {
  for (const role of ["staff", "founder", "administrator", "support", "moderator"]) {
    const result = resolveSignupRole(role);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 403);
  }
});

test("resolveSignupRole defaults unknown roles to customer", () => {
  const result = resolveSignupRole("not-a-real-role");
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.role, "customer");
});

test("validateSignupBody rejects is_founder and staffTitle escalation", () => {
  assert.equal(validateSignupBody({ role: "customer", is_founder: true }).ok, false);
  assert.equal(validateSignupBody({ role: "runr", isFounder: true }).ok, false);
  assert.equal(validateSignupBody({ role: "customer", staffTitle: "founder" }).ok, false);
});

test("hasPrivilegedProfileFields flags role-related patch keys", () => {
  assert.equal(hasPrivilegedProfileFields({ access_preference: "stairs" }), false);
  assert.equal(hasPrivilegedProfileFields({ role: "founder" }), true);
  assert.equal(hasPrivilegedProfileFields({ is_founder: false }), true);
});
