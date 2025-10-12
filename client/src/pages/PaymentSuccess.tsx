import React from "react";
import { useCart } from "@/state/cart";
import { useSearch } from "wouter";

const PaymentSuccess: React.FC = () => {
  const { clear } = useCart();
  const search = useSearch();

  React.useEffect(() => {
    clear(); // empty cart on success
    // (Optionally read session_id from query for your records)
    // const sid = new URLSearchParams(search || "").get("session_id");
  }, [clear, search]);

  return (
    <div className="min-h-[calc(100vh-80px)] grid place-items-center p-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Payment Successful 🎉</h1>
        <p className="text-muted-foreground">You'll also receive an email receipt from Stripe.</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
