"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffConsole } from "@/components/staff/StaffConsole";

export default function StaffPage() {
  return (
    <ProtectedRoute roles={["staff"]}>
      <StaffConsole />
    </ProtectedRoute>
  );
}
