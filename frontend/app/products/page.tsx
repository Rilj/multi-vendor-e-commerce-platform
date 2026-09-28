import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductsView } from "@/components/product/products-view";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const dynamic = "force-dynamic";
export const revalidate = 60;

async function getProducts(filters: Record<string, string>) {
  const params = new URLSearchParams(filters).toString();
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${params}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { data: [], meta: { total: 0 } };
    const json = await res.json();
    return { data: json.data?.data ?? json.data, meta: json.data?.meta || {} };
  } catch {
    return { data: [], meta: { total: 0 } };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      query[key] = value;
    }
  }

  const result = await getProducts(query);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Products</h1>
          <Select defaultValue={query.sortBy || "createdAt"}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="viewCount">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ProductsView
          products={result.data || []}
          currentPage={Number(query.page) || 1}
          totalPages={Math.ceil(result.meta?.total / 20) || 1}
          total={result.meta?.total || 0}
        />
      </main>

      <Footer />
    </div>
  );
}
