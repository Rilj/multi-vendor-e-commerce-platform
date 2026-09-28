import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";
import { CartSummary } from "@/types/api";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto py-8">
        <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>
        <Suspense fallback={<div>Loading cart...</div>}>
          <CartContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

async function CartContent() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
    credentials: "include",
    next: { tags: ["cart"] },
  });

  if (!res.ok) {
    return <div className="text-muted-foreground">Unable to load cart</div>;
  }

  const json = await res.json();
  const cart: CartSummary = json.data.data || json.data;

  if (!cart.vendors || cart.vendors.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Your cart is empty</p>
        <Button asChild className="mt-4">
          <a href="/products">Continue Shopping</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {cart.vendors.map((vendor) => (
        <Card key={vendor.vendorId}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">{vendor.vendorStoreName}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vendor.items.map((item) => (
                <CartItemRow key={item.variantId} item={item} vendorId={vendor.vendorId} />
              ))}
            </div>
            <div className="mt-4 flex justify-end border-t pt-4">
              <span className="font-semibold">Subtotal: ${vendor.subtotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
          </div>
          <Button asChild className="mt-6 w-full" size="lg">
            <a href="/checkout">Proceed to Checkout</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CartItemRow({ item, vendorId }: { item: any; vendorId: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {item.image ? (
          <Image src={item.image} alt={item.productName} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-medium">{item.productName}</h3>
        <p className="text-sm text-muted-foreground">
          {Object.entries(item.variantAttributes).map(([k, v]) => `${k}: ${v}`).join(", ")}
        </p>
        <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
      </div>

      <div className="flex items-center gap-2">
        <button className="rounded-lg border border-input p-1 hover:bg-muted">
          <Minus className="h-4 w-4" />
        </button>
        <Input type="number" value={item.quantity} className="w-12 text-center" />
        <button className="rounded-lg border border-input p-1 hover:bg-muted">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="w-20 text-right">
        <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
        <button className="mt-2 text-red-500 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
