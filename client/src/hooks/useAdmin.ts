// src/hooks/useAdmin.ts
import { useEffect, useMemo, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, getIdTokenResult, User } from "firebase/auth";

const ALLOWLIST = (
  (import.meta.env.VITE_ADMIN_EMAILS as string | undefined) || ""
)
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function useAdmin() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [hasClaim, setHasClaim] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setHasClaim(false);
        setLoading(false);
        return;
      }
      try {
        const res = await getIdTokenResult(u, true);
        setHasClaim(Boolean(res.claims?.admin));
      } catch {
        setHasClaim(false);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    if (hasClaim) return true; // secure path
    const email = user.email?.toLowerCase() || "";
    return ALLOWLIST.includes(email);
  }, [user, hasClaim]);

  return { user, isAdmin, loading };
}

