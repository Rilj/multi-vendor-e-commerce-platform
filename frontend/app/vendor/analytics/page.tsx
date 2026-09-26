import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, DollarSign } from "lucide-react";

export default function VendorAnalyticsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sales data will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
