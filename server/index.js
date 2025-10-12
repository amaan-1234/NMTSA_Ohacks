require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

app.use(cors({ origin: true }));
app.use(express.json());

// Create a Checkout Session from cart items
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { items = [], customerEmail = null, successPath = "/payments/success", cancelPath = "/payments/cancel" } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    // Build Stripe line_items; fallback to $10 if price missing.
    const line_items = items.map((it) => {
      const unit_amount = Math.max(50, Math.round(((it.price ?? 10) * 100))); // cents
      const quantity = Math.max(1, it.qty ?? 1);
      const name = (it.title || `Course ${it.id}`).toString().slice(0, 100);
      return {
        price_data: {
          currency: "usd",
          product_data: { name },
          unit_amount,
        },
        quantity,
      };
    });

    const origin = req.headers.origin || "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      customer_email: customerEmail || undefined,
      // On success/cancel, Stripe returns here:
      success_url: `${origin}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${cancelPath}`,
    });

    return res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("[stripe] create session error:", err.message);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`Stripe server running on http://localhost:${PORT}`));
