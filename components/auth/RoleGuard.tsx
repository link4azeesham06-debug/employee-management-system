"use client";

import { ReactNode } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

type Role = "admin" | "employee";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Role[];
}

export default function RoleGuard({
  children,
  allowedRoles,
}: RoleGuardProps) {
  return <ProtectedRoute allowedRoles={allowedRoles}>{children}</ProtectedRoute>;
}
