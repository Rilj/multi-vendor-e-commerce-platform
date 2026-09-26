import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp } from "lucide-react";

export default function VendorDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Sales" value="$24,589" icon={DollarSign} />
        <StatCard title="Orders" value="184" icon={ShoppingCart} />
        <StatCard title="Products" value="56" icon={Package} />
        <StatCard title="Wallet Balance" value="$3,245" icon={DollarSign} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <OrderItem />
            <OrderItem />
            <OrderItem />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderItem() {
  return (
    <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
      <div className="space-y-1">
        <p className="font-medium">#ORD240926ABC</p>
        <p className="text-sm text-muted-foreground">2 items • $84.99</p>
      </div>
      <Badge variant="success">Delivered</Badge>
    </div>
  );
}
