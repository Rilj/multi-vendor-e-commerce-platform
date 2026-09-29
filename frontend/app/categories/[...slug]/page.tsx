import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CategoryView } from "@/components/product/category-view";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getCategory(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/slug/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.data ?? data.data;
  } catch {
    return null;
  }
}

async function getProducts(categorySlug: string, page: number = 1) {
  try {
    const params = new URLSearchParams({ category: categorySlug, page: page.toString() });
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${params}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { data: [], meta: { total: 0 } };
    const json = await res.json();
    return { data: json.data?.data ?? json.data ?? [], meta: json.data?.meta || {} };
  } catch {
    return { data: [], meta: { total: 0 } };
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const slug = params.slug.join("/");
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const page = Number(searchParams.page) || 1;
  const result = await getProducts(slug, page);
  const pageSize = 20;
  const totalPages = Math.ceil((result.meta?.total || 0) / pageSize) || 1;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{category.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {result.meta?.total || 0} products
            </p>
          </div>
          {category.parent && (
            <Badge variant="secondary">{category.parent.name}</Badge>
          )}
        </div>

        <CategoryView
          products={result.data || []}
          currentPage={page}
          totalPages={totalPages}
          total={result.meta?.total || 0}
        />
      </main>

      <Footer />
    </div>
  );
}
