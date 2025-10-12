import React from "react";

export default function PaymentCancel() {
  return (
    <div className="min-h-[calc(100vh-80px)] grid place-items-center p-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Payment Cancelled</h1>
        <p className="text-muted-foreground">Your cart is saved. You can try again anytime.</p>
      </div>
    </div>
  );
}
