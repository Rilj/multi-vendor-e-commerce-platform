"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/auth-provider";

interface Vendor {
  id: string;
  storeName: string;
  status: "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";
  createdAt: string;
  user: { name: string; email: string };
  commissionRate?: number | null;
  rating?: number | null;
  _count?: { products: number };
}

export default function AdminVendorsPage() {
  const { user } = useAuthContext();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vendors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVendors(data.data?.data || data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (vendorId: string, status: string) => {
    setActionLoading(vendorId);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/vendors/${vendorId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchVendors();
      }
    } catch (error) {
      console.error("Failed to approve vendor:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingVendors = vendors.filter((v) => v.status === "PENDING");

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Vendor Management</h1>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Loading vendors...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals ({pendingVendors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingVendors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending vendor approvals</p>
                ) : (
                  pendingVendors.map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">{vendor.storeName}</p>
                        <p className="text-sm text-muted-foreground">{vendor.user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="warning">Pending</Badge>
                        <Button
                          size="sm"
                          variant="default"
                          disabled={actionLoading === vendor.id}
                          onClick={() => handleApprove(vendor.id, "APPROVED")}
                        >
                          {actionLoading === vendor.id ? "Approving..." : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === vendor.id}
                          onClick={() => handleApprove(vendor.id, "REJECTED")}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Vendors ({vendors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Store Name</th>
                      <th className="text-left py-2">Owner</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Products</th>
                      <th className="text-right py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((vendor) => (
                      <tr key={vendor.id} className="border-b">
                        <td className="py-2">{vendor.storeName}</td>
                        <td className="py-2">{vendor.user.email}</td>
                        <td className="py-2">
                          <Badge
                            variant={
                              vendor.status === "APPROVED" ? "success" :
                              vendor.status === "PENDING" ? "warning" :
                              vendor.status === "SUSPENDED" ? "destructive" : "secondary"
                            }
                          >
                            {vendor.status}
                          </Badge>
                        </td>
                        <td className="py-2">{vendor._count?.products || 0}</td>
                        <td className="py-2 text-right">
                          {vendor.status === "PENDING" && (
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={actionLoading === vendor.id}
                                onClick={() => handleApprove(vendor.id, "APPROVED")}
                              >
                                Approve
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
