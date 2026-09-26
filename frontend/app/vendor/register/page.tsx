import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function VendorOnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 text-2xl font-bold">Vendor Registration</h1>
          <p className="mb-6 text-muted-foreground">
            Register your store to start selling on MV-Commerce.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input id="storeName" placeholder="e.g., Johns Electronics" />
                </div>

                <div>
                  <Label htmlFor="description">Store Description</Label>
                  <Textarea id="description" placeholder="Tell us about your store..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ktp">KTP Number</Label>
                    <Input id="ktp" placeholder="1234567890123456" />
                  </div>
                  <div>
                    <Label htmlFor="npwp">NPWP Number</Label>
                    <Input id="npwp" placeholder="01.234.567.8-901.234" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input id="bankName" placeholder="e.g., BCA, BNI, Mandiri" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input id="accountNumber" placeholder="1234567890" />
                  </div>
                  <div>
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input id="accountName" placeholder="John Doe" />
                  </div>
                </div>

                <Button className="w-full">Submit for Review</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
