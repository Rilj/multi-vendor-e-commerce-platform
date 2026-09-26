"use client";

import Link from "next/link";
import { ShoppingCart, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/components/providers";
import { useCart } from "@/components/cart-provider";

export function Header() {
  const { user, isLoading } = useAuthContext();
  const { cart } = useCart();

  const itemCount = cart?.itemCount || 0;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold">
            MV-Commerce
          </Link>
        </div>

        <div className="flex-1 max-w-2xl">
          <form onSubmit={(e) => e.preventDefault()} className="relative">
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </form>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/cart" className="relative">
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
              <Badge
                variant="error"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
              >
                {itemCount}
              </Badge>
            )}
          </Link>

          {isLoading ? null : user ? (
            <Link href="/profile">
              <User className="h-6 w-6 cursor-pointer" />
            </Link>
          ) : (
            <Link href="/login">
              <User className="h-6 w-6 cursor-pointer" />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
