import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { CategoryNav } from "@/components/layout/category-nav";

export const revalidate = 300;

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?featured=true&limit=12`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.data || [];
  } catch {
    return [];
  }
}

async function getBanners() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banners?activeOnly=true`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();
  const banners = await getBanners();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="container mx-auto py-6">
          {banners.length > 0 && (
            <div className="relative mb-8 h-64 overflow-hidden rounded-xl">
              <Image
                src={banners[0].imageUrl || "/placeholder-banner.jpg"}
                alt={banners[0].title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute left-8 top-1/2 -translate-y-1/2 text-white">
                <h2 className="text-3xl font-bold">{banners[0].title}</h2>
                <p className="mt-2 text-lg">Premium products from verified sellers</p>
                <Button asChild className="mt-4">
                  <Link href="/products">Shop Now</Link>
                </Button>
              </div>
            </div>
          )}

          <CategoryNav />

          <section className="my-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">
                View all products
              </Link>
            </div>
            <Suspense fallback={<div>Loading products...</div>}>
              <ProductGrid products={featuredProducts} />
            </Suspense>
          </section>

          <section className="my-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Top Categories</h2>
              <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground">
                View all categories
              </Link>
            </div>
            <CategoryGrid />
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function CategoryGrid() {
  const categories = [
    { name: "Electronics", slug: "electronics", color: "bg-neutral-100" },
    { name: "Fashion", slug: "fashion", color: "bg-neutral-100" },
    { name: "Home & Living", slug: "home-living", color: "bg-neutral-100" },
    { name: "Sports & Outdoors", slug: "sports-outdoors", color: "bg-neutral-100" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {categories.map((cat) => (
        <Link key={cat.slug} href={`/categories/${cat.slug}`}>
          <Card className="cursor-pointer transition-transform hover:scale-[1.02]">
            <CardContent className="flex flex-col items-center py-6">
              <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full ${cat.color}`}>
                <CategoryIcon slug={cat.slug} />
              </div>
              <span className="font-medium">{cat.name}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function CategoryIcon({ slug }: { slug: string }) {
  const iconPaths: Record<string, JSX.Element> = {
    electronics: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
    ),
    fashion: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line><line x1="15" y1="15" x2="15.01" y2="15"></line><circle cx="10" cy="10" r="3"></circle></svg>
    ),
    "home-living": (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M9 22V12h6v10"></path></svg>
    ),
    "sports-outdoors": (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
    ),
  };
  return iconPaths[slug] || iconPaths.electronics;
}
