"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const vendorNavItems = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/products", label: "Products", icon: Package },
  { href: "/vendor/orders", label: "Orders", icon: ShoppingCart },
  { href: "/vendor/wallet", label: "Wallet", icon: DollarSign },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/vendor/settings", label: "Settings", icon: Settings },
];

export function VendorSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="lg:hidden p-2"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform border-r border-border bg-card transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-4">
          <Link href="/vendor/dashboard" className="text-lg font-bold">
            Vendor Dashboard
          </Link>
        </div>
        <nav className="py-4">
          {vendorNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export function VendorHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <h1 className="text-lg font-semibold">Vendor Dashboard</h1>
      </div>
    </header>
  );
}
