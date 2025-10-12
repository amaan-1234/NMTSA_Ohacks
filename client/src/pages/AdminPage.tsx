import React from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

type Row = { id: string; email: string | null; name: string; role: string };

const AdminPage: React.FC = () => {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    let off: (() => void) | null = null;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const token = await auth.currentUser?.getIdToken(true);
        if (!token) throw new Error("Not authenticated");

        const res = await fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

        if (cancelled) return;

        const list: Row[] = (data.users || []).map((u: any) => ({
          id: u.uid,
          email: u.email,
          name: u.name,
          role: u.role || "pending",
        }));
        setRows(list);
        setLoading(false);
      } catch (e: any) {
        // try to pull server JSON with error details
        try {
          const token = await auth.currentUser?.getIdToken(true);
          const res2 = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });
          const j = await res2.json().catch(() => ({}));
          console.warn("[AdminPage] users endpoint failed:", res2.status, j);
          setNotice(`Could not load full roster from server (HTTP ${res2.status}${j?.error ? `: ${j.error}` : ""}). Showing Firestore profiles instead.`);
        } catch {
          setNotice("Could not load full roster from server. Showing Firestore profiles instead.");
        }
        // Fallback: live Firestore profiles (may be partial if sync hasn't run)
        const q = query(collection(db, "profiles"), orderBy("email"));
        off = onSnapshot(
          q,
          (snap) => {
            const list: Row[] = snap.docs.map((d) => {
              const v = d.data() as any;
              const email = v?.email ?? null;
              const name = v?.full_name || v?.username || (email ? email.split("@")[0] : "—");
              return { id: d.id, email, name, role: v?.role || "pending" };
            });
            setRows(list);
            setLoading(false);
          },
          (err) => {
            console.error("[AdminPage] Firestore fallback failed:", err);
            setRows([]);
            setLoading(false);
          }
        );
      }
    })();

    return () => {
      cancelled = true;
      if (off) off();
    };
  }, []);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => (r.name || "").toLowerCase().includes(q) || (r.email || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">All signed-up users (from Firebase Auth) with roles</p>
          {notice && <p className="text-xs text-amber-600 mt-1">{notice}</p>}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="h-9 w-64 rounded-md border px-3 text-sm"
        />
      </div>

      {loading ? (
        <div className="animate-pulse h-24 rounded-md bg-muted" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Name</th>
                <th className="text-left px-4 py-2 font-medium">Email</th>
                <th className="text-left px-4 py-2 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-2">{r.name}</td>
                    <td className="px-4 py-2">{r.email || "—"}</td>
                    <td className="px-4 py-2 capitalize">{r.role}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
