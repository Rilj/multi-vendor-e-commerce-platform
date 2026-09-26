import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Platform Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Commission Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="globalCommission">Global Commission (%)</Label>
              <Input id="globalCommission" type="number" defaultValue="10" />
            </div>
            <Button>Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
