"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

type Props = {
  children: React.ReactNode;
  role?: "admin" | "employee";
  allowedRoles?: ("admin" | "employee")[];
};

export default function ProtectedRoute({

  children,
  role,
  allowedRoles,
}: Props) {

  const router = useRouter();

  const {

    user,

    loading,

  } = useAuth();

  useEffect(() => {

    if (loading) return;

    if (!user) {

      router.replace("/login");

      return;

    }

    const roles = allowedRoles ?? (role ? [role] : undefined);

    if (roles && !roles.includes(user.role)) {

      router.replace("/dashboard");

    }

  }, [

    user,

    loading,

    router,

    role,
    allowedRoles,

  ]);

  if (loading) {

    return (

      <div className="flex items-center justify-center min-h-screen">

        <h2 className="text-2xl font-bold">

          Loading...

        </h2>

      </div>

    );

  }

  if (!user) return null;

  const roles = allowedRoles ?? (role ? [role] : undefined);

  if (roles && !roles.includes(user.role))

    return null;

  return <>{children}</>;

}
