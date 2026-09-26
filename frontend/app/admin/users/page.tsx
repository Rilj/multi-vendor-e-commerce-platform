import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Manage all users, vendors, and admin accounts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
