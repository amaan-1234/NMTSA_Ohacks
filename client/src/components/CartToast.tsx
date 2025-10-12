import React from "react";
import { useCart } from "@/state/cart";

const CartToast: React.FC = () => {
  const { toast } = useCart();
  if (!toast.visible) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]">
      <div className="rounded-lg border bg-white text-black shadow-lg px-4 py-2 text-sm">
        {toast.message}
      </div>
    </div>
  );
};

export default CartToast;
