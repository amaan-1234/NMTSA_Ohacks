import React from "react";
import { useRoute } from "wouter";

const PaymentsPage: React.FC = () => {
  const [, params] = useRoute("/payments/:courseId");
  return (
    <div className="min-h-[calc(100vh-80px)] grid place-items-center p-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Payments (stub)</h1>
        <p className="text-muted-foreground">Proceed to pay for course ID: <span className="font-mono">{params?.courseId ?? "N/A"}</span></p>
      </div>
    </div>
  );
};

export default PaymentsPage;
