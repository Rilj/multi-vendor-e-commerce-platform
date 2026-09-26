import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Store, Package, ShoppingCart, DollarSign } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value="551" icon={Users} />
        <StatCard title="Active Vendors" value="42" icon={Store} />
        <StatCard title="Total Products" value="2,000" icon={Package} />
        <StatCard title="Total Orders" value="1,000" icon={ShoppingCart} />
        <StatCard title="Total Revenue" value="$452,340" icon={DollarSign} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <OrderItem order="#ORD240926ABC" amount="$84.99" status="delivered" />
            <OrderItem order="#ORD240926DEF" amount="$127.50" status="processing" />
            <OrderItem order="#ORD240925GHI" amount="$45.00" status="shipped" />
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

function OrderItem({ order, amount, status }: { order: string; amount: string; status: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
      <div className="space-y-1">
        <p className="font-medium">{order}</p>
        <p className="text-sm text-muted-foreground">{amount}</p>
      </div>
      <Badge variant="success">{status}</Badge>
    </div>
  );
}
