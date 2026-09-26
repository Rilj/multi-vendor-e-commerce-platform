import "./globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Multi-Vendor E-Commerce",
  description: "Enterprise-grade multi-vendor e-commerce platform",
  keywords: "e-commerce, marketplace, multi-vendor, shopping",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
