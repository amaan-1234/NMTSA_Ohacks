import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import bcrypt from "bcryptjs";

type Role = "admin" | "caregiver" | "pending" | null;
type UserLite = { id: string; email?: string | null; username?: string | null; name?: string | null; mobile?: string | null; role: Role };

type Credentials = { email?: string; password: string; name?: string; mobile?: string; username?: string };
type Result = { ok: true; message?: string } | { ok: false; message: string };

type AuthContextType = {
  user: UserLite | null;
  authReady: boolean;
  isAuthenticated: boolean;
  getDisplayName: () => string;
  login: (c: Credentials) => Promise<Result>;
  signup: (c: Credentials) => Promise<Result>;
  logout: () => Promise<void>;
};

const PROFILES = "profiles";
const CREDS = "login_credentials";
const APPROVALS = "approved_emails";
const AuthContext = createContext<AuthContextType | null>(null);

const emailKey = (e?: string | null) => (e ?? "").trim().toLowerCase();

async function fetchRoleFromApprovals(email?: string | null): Promise<"admin" | "caregiver" | null> {
  if (!email) return null;
  try {
    const snap = await getDoc(doc(db, APPROVALS, emailKey(email)));
    if (!snap.exists()) return null;
    const d = snap.data() as any;
    if (d?.approved === true && (d.role === "admin" || d.role === "caregiver")) return d.role;
    return null;
  } catch {
    return null; // offline/rules → treat as not approved
  }
}

async function safeGetProfile(uid: string): Promise<Partial<UserLite>> {
  try {
    const snap = await getDoc(doc(db, PROFILES, uid));
    if (!snap.exists()) return {};
    const p = snap.data() as any;
    return {
      username: p?.username ?? null,
      name: p?.full_name ?? null,
      mobile: p?.mobile ?? null,
      role: (p?.role as Role) ?? null,
    };
  } catch {
    return {};
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserLite | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Single source of truth: Firebase onAuthStateChanged
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setAuthReady(true);
        return;
      }
      const base: UserLite = { id: fbUser.uid, email: fbUser.email ?? null, username: null, name: fbUser.displayName ?? null, mobile: null, role: null };
      setUser(base);
      // Enrich in background
      const extra = await safeGetProfile(fbUser.uid);
      const finalRole = extra.role ?? (await fetchRoleFromApprovals(base.email));
      setUser({ ...base, ...extra, role: finalRole });
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const getDisplayName = () => {
    const n = (user?.name ?? "").trim();
    const u = (user?.username ?? "").trim();
    const em = (user?.email ?? "").trim();
    return n || u || (em ? em.split("@")[0] : "");
  };

  const login = async ({ email, password }: Credentials): Promise<Result> => {
    try {
      if (!email) return { ok: false, message: "Email is required." };

      const res = await signInWithEmailAndPassword(auth, email, password);

      // (optional) mirror hash without blocking UI
      void (async () => {
        try {
          const hash = await bcrypt.hash(password, 8);
          await setDoc(
            doc(db, CREDS, res.user.uid),
            {
              email,
              username: res.user.displayName ?? email.split("@")[0],
              password_hash: hash,
              created_at: serverTimestamp(),
              updated_at: serverTimestamp(),
            },
            { merge: true }
          );
        } catch {}
      })();

      // NEW: decide destination by approval role
      let dest = "/courses?greet=1";
      const role = await fetchRoleFromApprovals(email);
      if (role === "admin") dest = "/admin";

      // Persist role on *your own* profile so rules can authorize admin reads
      await setDoc(
        doc(db, "profiles", res.user.uid),
        { role: role ?? "pending", email: email, updated_at: serverTimestamp() },
        { merge: true }
      );

      setLocation(dest); // go now

      return { ok: true, message: "Login successful" };
    } catch (e: any) {
      return { ok: false, message: e?.message ?? "Login failed" };
    }
  };

  const signup = async ({ email, password, name, mobile, username }: Credentials): Promise<Result> => {
    try {
      if (!email) return { ok: false, message: "Email is required." };
      if (!password || password.length < 6) return { ok: false, message: "Password must be at least 6 characters." };

      const uc = await createUserWithEmailAndPassword(auth, email, password);

      // displayName is non-critical; do not block
      if (name || username) updateProfile(uc.user, { displayName: name || username || undefined }).catch(() => {});
      const uname = username || (email ? email.split("@")[0] : undefined);

      // store profile (await this to ensure it's saved)
      await setDoc(doc(db, PROFILES, uc.user.uid), {
        email,
        username: uname ?? null,
        full_name: name ?? null,
        mobile: mobile ?? null,
        role: "pending",
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      }, { merge: true });

      // mirror creds in background (optional)
      void (async () => {
        try {
          const hash = await bcrypt.hash(password, 8);
          await setDoc(doc(db, CREDS, uc.user.uid),
            { email, username: uname ?? null, password_hash: hash, created_at: serverTimestamp(), updated_at: serverTimestamp() },
            { merge: true }
          );
        } catch {}
      })();

      // IMPORTANT: do NOT keep the user signed in after signup
      await signOut(auth);

      // NEW: send them to login page to sign in explicitly
      setLocation("/auth/login?signup=1");

      return { ok: true, message: "Sign up successful" };
    } catch (e: any) {
      return { ok: false, message: e?.message ?? "Sign up failed" };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setAuthReady(true);
    setLocation("/"); // back to home (or /courses) on logout
  };

  const value = useMemo(
    () => ({
      user,
      authReady,
      isAuthenticated: Boolean(user),
      getDisplayName,
      login,
      signup,
      logout,
    }),
    [user, authReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};