import React from "react";
import { useCart } from "@/state/cart";
import { useAuth } from "@/state/auth";

const PaymentsCartPage: React.FC = () => {
  const { items, count, clear } = useCart();
  const { user } = useAuth();

  const total = items.reduce((a, b) => a + (b.price || 0) * (b.qty || 0), 0);

  const onPayNow = async () => {
    if (items.length === 0) return;

    // Store cart items for post-payment enrollment
    if (user?.uid) {
      localStorage.setItem(`pending_purchase_${user.uid}`, JSON.stringify(items));
      console.log("💾 Saved pending purchase for post-payment enrollment");
    }

    const payload = {
      items: items.map((i) => ({ id: i.id, title: i.title, price: i.price, qty: i.qty })),
      customerEmail: user?.email ?? null,
      successPath: "/payments/success",
      cancelPath: "/payments",   // ← cart page
    };

    // Helper: fetch JSON and throw if HTML came back
    const fetchJson = async (url: string) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const ctype = res.headers.get("content-type") || "";
      if (!ctype.includes("application/json")) {
        const text = await res.text();
        throw new Error(
          `Non-JSON response from ${url}. Check that the Stripe server is running and Vite proxy is configured.\n\n` +
          text.slice(0, 200)
        );
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create checkout session");
      return data;
    };

    try {
      // 1) Try via Vite proxy
      let data;
      try {
        data = await fetchJson("/api/create-checkout-session");
      } catch (e) {
        // 2) Fallback directly to server (useful if proxy not picked up)
        data = await fetchJson("http://localhost:8787/api/create-checkout-session");
      }
      if (!data?.url) throw new Error("Server did not return a checkout URL");
      window.location.href = data.url; // go to Stripe
    } catch (e: any) {
      alert(e?.message ?? "Failed to start checkout");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>

      {items.length === 0 ? (
        <p className="text-muted-foreground">Your cart is empty.</p>
      ) : (
        <>
          <ul className="divide-y border rounded-md mb-4">
            {items.map((it) => (
              <li key={it.id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{it.title || `Item ${it.id}`}</div>
                  <div className="text-sm text-muted-foreground">Qty: {it.qty}</div>
                </div>
                <div className="text-sm">
                  {it.price != null ? `$${(it.price * it.qty).toFixed(2)}` : "—"}
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-muted-foreground">Items: {count}</div>
            <div className="text-lg font-semibold">Total: {isFinite(total) ? `$${total.toFixed(2)}` : "—"}</div>
          </div>

          <div className="flex gap-2">
            <button onClick={onPayNow} className="px-4 py-2 rounded-md bg-primary text-primary-foreground">Pay Now</button>
            <button onClick={clear} className="px-4 py-2 rounded-md border">Clear Cart</button>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentsCartPage;
