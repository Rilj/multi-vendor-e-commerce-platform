import { createContext, useContext, ReactNode, useState, useEffect } from "react";

interface CartContextType {
  cart: any;
  isLoading: boolean;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data.data);
      }
    } catch (error) {
      console.error("Cart fetch failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addItem = async (variantId: string, quantity: number = 1) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/add/${variantId}?quantity=${quantity}`, {
      method: "POST",
      credentials: "include",
    });
    await refreshCart();
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/update/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ quantity }),
    });
    await refreshCart();
  };

  const removeItem = async (itemId: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/remove/${itemId}`, {
      method: "DELETE",
      credentials: "include",
    });
    await refreshCart();
  };

  const clearCart = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/clear`, {
      method: "DELETE",
      credentials: "include",
    });
    await refreshCart();
  };

  return (
    <CartContext.Provider value={{ cart, isLoading, addItem, updateQuantity, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
