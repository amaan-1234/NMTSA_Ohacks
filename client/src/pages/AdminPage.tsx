import React from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldCheck, Clock, Search, Mail, Download, Send, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

type Row = { id: string; email: string | null; name: string; role: string };
type NewsletterSubscriber = { email: string; subscribedAt: string };

const AdminPage: React.FC = () => {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [newsletterSubscribers, setNewsletterSubscribers] = React.useState<NewsletterSubscriber[]>([]);
  const [newsletterLoading, setNewsletterLoading] = React.useState(false);
  const [newsletterSubject, setNewsletterSubject] = React.useState("");
  const [newsletterContent, setNewsletterContent] = React.useState("");
  const [sendingNewsletter, setSendingNewsletter] = React.useState(false);
  const { toast } = useToast();

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

  // Fetch newsletter subscribers
  React.useEffect(() => {
    const fetchNewsletterSubscribers = async () => {
      setNewsletterLoading(true);
      try {
        const response = await fetch("/api/newsletter/subscribers");
        const data = await response.json();
        if (data.success) {
          setNewsletterSubscribers(data.subscribers);
        }
      } catch (error) {
        console.error("Failed to fetch newsletter subscribers:", error);
      } finally {
        setNewsletterLoading(false);
      }
    };

    fetchNewsletterSubscribers();
  }, []);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => (r.name || "").toLowerCase().includes(q) || (r.email || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const stats = React.useMemo(() => ({
    total: rows.length,
    admins: rows.filter(r => r.role === "admin").length,
    caregivers: rows.filter(r => r.role === "caregiver").length,
    pending: rows.filter(r => r.role === "pending").length,
  }), [rows]);

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "default",
      caregiver: "secondary",
      pending: "outline",
    } as const;
    return (
      <Badge variant={variants[role as keyof typeof variants] || "outline"} className="capitalize">
        {role}
      </Badge>
    );
  };

  const exportNewsletterSubscribers = () => {
    const csvContent = [
      "Email,Subscribed Date",
      ...newsletterSubscribers.map(sub => 
        `"${sub.email}","${new Date(sub.subscribedAt).toLocaleDateString()}"`
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const sendNewsletter = async () => {
    if (!newsletterSubject.trim() || !newsletterContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and content.",
        variant: "destructive",
      });
      return;
    }

    setSendingNewsletter(true);
    try {
      const response = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: newsletterSubject,
          content: newsletterContent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Newsletter Sent!",
          description: data.message,
        });
        setNewsletterSubject("");
        setNewsletterContent("");
      } else {
        toast({
          title: "Failed to Send",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Newsletter sending error:", error);
      toast({
        title: "Error",
        description: "Failed to send newsletter. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSendingNewsletter(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, monitor analytics, and oversee system activity
          </p>
          {notice && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900">
              <Clock className="h-4 w-4" />
              {notice}
            </div>
          )}
        </div>

        {/* Analytics Dashboard */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Analytics Dashboard</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Comprehensive insights into platform performance
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AnalyticsDashboard />
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {!loading && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Admins
                </CardTitle>
                <ShieldCheck className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.admins}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Caregivers
                </CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">{stats.caregivers}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending
                </CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Users</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  All registered users from Firebase Authentication
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="pl-9 w-full md:w-64"
        />
      </div>
            </div>
          </CardHeader>
          <CardContent>
      {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left px-4 py-3 font-medium">Name</th>
                        <th className="text-left px-4 py-3 font-medium">Email</th>
                        <th className="text-left px-4 py-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                          <td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p className="font-medium">No users found</p>
                            <p className="text-xs mt-1">
                              {search ? "Try a different search term" : "No users registered yet"}
                            </p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                          <tr key={r.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="px-4 py-3 font-medium">{r.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">{r.email || "—"}</td>
                            <td className="px-4 py-3">{getRoleBadge(r.role)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {filtered.length > 0 && (
                  <div className="px-4 py-3 bg-muted/30 text-xs text-muted-foreground border-t">
                    Showing {filtered.length} of {rows.length} users
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Newsletter Subscribers */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold">Newsletter Subscribers</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage newsletter subscriptions and export subscriber lists
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {newsletterSubscribers.length} subscribers
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportNewsletterSubscribers}
                  disabled={newsletterSubscribers.length === 0}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {newsletterLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left px-4 py-3 font-medium">Email</th>
                        <th className="text-left px-4 py-3 font-medium">Subscribed Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsletterSubscribers.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-4 py-12 text-center text-muted-foreground">
                            <Mail className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p className="font-medium">No subscribers yet</p>
                            <p className="text-xs mt-1">
                              Newsletter subscribers will appear here
                            </p>
                          </td>
                        </tr>
                      ) : (
                        newsletterSubscribers.map((subscriber, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="px-4 py-3 font-medium">{subscriber.email}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(subscriber.subscribedAt).toLocaleDateString()}
                            </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
                </div>
                {newsletterSubscribers.length > 0 && (
                  <div className="px-4 py-3 bg-muted/30 text-xs text-muted-foreground border-t">
                    Showing {newsletterSubscribers.length} newsletter subscribers
                  </div>
                )}
        </div>
      )}
          </CardContent>
        </Card>

        {/* Send Newsletter */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Send className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Send Newsletter</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Create and send newsletters to all subscribers
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Newsletter subject"
                value={newsletterSubject}
                onChange={(e) => setNewsletterSubject(e.target.value)}
                disabled={sendingNewsletter}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                placeholder="Write your newsletter content here..."
                value={newsletterContent}
                onChange={(e) => setNewsletterContent(e.target.value)}
                rows={8}
                disabled={sendingNewsletter}
              />
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                This will be sent to {newsletterSubscribers.length} subscribers
              </div>
              <Button
                onClick={sendNewsletter}
                disabled={sendingNewsletter || !newsletterSubject.trim() || !newsletterContent.trim() || newsletterSubscribers.length === 0}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {sendingNewsletter ? "Sending..." : "Send Newsletter"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
