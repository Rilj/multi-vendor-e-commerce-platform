import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function VendorWalletPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Wallet</h1>

      <Card>
        <CardHeader>
          <CardTitle>Available Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">$3,245.00</div>
          <Button className="mt-4">Request Payout</Button>
        </CardContent>
      </Card>
    </div>
  );
}
