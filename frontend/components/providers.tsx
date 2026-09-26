"use client";

import { createContext, useContext, ReactNode } from "react";
import { AuthProvider, useAuthContext } from "./auth-provider";
import { CartProvider, useCart } from "./cart-provider";

export { useAuthContext, useCart };

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  );
}
