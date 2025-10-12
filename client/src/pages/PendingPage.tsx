import React from "react";

export default function PendingPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] grid place-items-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Account pending approval</h1>
        <p className="text-muted-foreground mt-2">We'll email you once you're approved.</p>
      </div>
    </div>
  );
}
