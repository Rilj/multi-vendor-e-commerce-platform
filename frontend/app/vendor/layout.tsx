import { VendorSidebar, VendorHeader } from "@/components/layout/vendor-layout";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <VendorHeader />
      <div className="flex flex-1">
        <VendorSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
