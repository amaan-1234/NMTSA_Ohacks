import React from "react";
import { useAuth } from "@/state/auth";
import { useLocation } from "wouter";

export default function RequireRole({ role, children }: { role: "admin" | "caregiver"; children: React.ReactNode }) {
  const { user } = useAuth();
  const [loc, setLocation] = useLocation();

  React.useEffect(() => {
    if (!user) {
      setLocation(`/auth/login?redirect=${encodeURIComponent(loc)}`);
      return;
    }
    if (user.role && user.role !== role) {
      setLocation("/pending");
    }
  }, [user, role, loc, setLocation]);

  if (!user || (user.role && user.role !== role)) return null;
  return <>{children}</>;
}
