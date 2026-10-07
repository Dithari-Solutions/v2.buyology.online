"use client";

import dynamic from "next/dynamic";
import { useCart } from "@/components/cart/cart-provider";

const CartDrawerPanel = dynamic(
  () => import("./CartDrawerPanel").then(module => module.CartDrawer),
  { ssr: false },
);

/** A closed drawer needs no panel code, product lookup or payment artwork at first paint. */
export function CartDrawer() {
  const { isOpen } = useCart();
  return isOpen ? <CartDrawerPanel /> : null;
}
