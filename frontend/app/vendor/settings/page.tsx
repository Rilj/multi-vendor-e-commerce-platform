import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function VendorSettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Store Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Store Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="storeName">Store Name</Label>
              <Input id="storeName" placeholder="My Store" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Store description..." />
            </div>
            <Button>Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
