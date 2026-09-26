import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminPayoutsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2b font-bold">Payout Requests</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pending Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="font-medium">Store: Anna's Fashion</p>
                <p className="text-sm text-muted-foreground">Amount: $2,500.00</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Reject</Button>
                <Button size="sm">Approve</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
