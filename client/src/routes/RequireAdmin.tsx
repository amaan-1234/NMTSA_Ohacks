import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/state/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { authReady, user } = useAuth();
  const [checked, setChecked] = React.useState(false);
  const [allowed, setAllowed] = React.useState(false);
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!authReady) return;

    if (!user) {
      setLocation("/auth/login?redirect=/admin");
      return;
    }

    (async () => {
      try {
        const email = (user.email ?? "").trim().toLowerCase();
        const snap = await getDoc(doc(db, "approved_emails", email));
        const ok = snap.exists() && snap.data()?.approved === true && snap.data()?.role === "admin";
        setAllowed(ok);
        setChecked(true);
        if (!ok) setLocation("/courses");
      } catch {
        // If we can't read approvals, default to non-admin
        setChecked(true);
        setAllowed(false);
        setLocation("/courses");
      }
    })();
  }, [authReady, user, setLocation]);

  if (!checked) return null; // wait until we know
  if (!allowed) return null;
  return <>{children}</>;
}
