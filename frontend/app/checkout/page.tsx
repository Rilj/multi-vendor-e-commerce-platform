import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CartSummary } from "@/types/api";

export default async function CheckoutPage() {
  let cart: CartSummary | null = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
      credentials: "include",
      next: { tags: ["cart"] },
    });
    if (res.ok) {
      const data = await res.json();
      cart = data.data;
    }
  } catch {
    cart = null;
  }

  if (!cart || !cart.vendors || cart.vendors.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container mx-auto py-16 text-center">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto py-8">
        <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+6281234567890" />
                  </div>
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" placeholder="Jl. Example Street No. 123" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="Jakarta" />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input id="postalCode" placeholder="10000" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup defaultValue="standard">
                  <div className="flex items-center justify-between border p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard">Standard Shipping (3-5 days)</Label>
                    </div>
                    <span className="font-medium">$5.00</span>
                  </div>
                  <div className="flex items-center justify-between border p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="express" id="express" />
                      <Label htmlFor="express">Express Shipping (1-2 days)</Label>
                    </div>
                    <span className="font-medium">$15.00</span>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup defaultValue="stripe">
                  <div className="flex items-center gap-2 border p-3 rounded-lg">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe">Credit Card (Stripe)</Label>
                  </div>
                  <div className="flex items-center gap-2 border p-3 rounded-lg">
                    <RadioGroupItem value="midtrans" id="midtrans" />
                    <Label htmlFor="midtrans">Bank Transfer / E-Wallet (Midtrans)</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.vendors.map((vendor) => (
                    <div key={vendor.vendorId}>
                      <p className="font-medium">{vendor.vendorStoreName}</p>
                      {vendor.items.map((item) => (
                        <div key={item.variantId} className="flex justify-between text-sm">
                          <span>{item.productName} x {item.quantity}</span>
                          <span>${item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-medium">
                        <span>Subtotal</span>
                        <span>${vendor.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>$10.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                </div>
                <form action="/checkout/complete" method="POST" className="mt-6">
                  <Button type="submit" className="w-full" size="lg">
                    Place Order
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
