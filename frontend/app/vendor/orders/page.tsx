import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function VendorOrdersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>

      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No orders yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
