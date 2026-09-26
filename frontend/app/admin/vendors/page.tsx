import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminVendorsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Vendors</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="font-medium">Store: John's Electronics</p>
                <p className="text-sm text-muted-foreground">john@example.com</p>
              </div>
              <Badge variant="warning">Pending</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
