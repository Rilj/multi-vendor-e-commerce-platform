import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/tree`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data?.data ?? data.data) || [];
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto py-8">
        <h1 className="mb-6 text-2xl font-bold">All Categories</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`}>
              <Card className="cursor-pointer transition-transform hover:shadow-lg">
                <CardContent className="p-6">
                  <CardTitle className="text-xl">{cat.name}</CardTitle>
                  {cat.children && cat.children.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {cat.children.map((child: any) => (
                        <Badge key={child.id} variant="outline">
                          {child.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
