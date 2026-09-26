import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Orders</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Manage all orders across all vendors.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
