import { notFound } from "next/navigation";
import { Product } from "@/types/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductDetail } from "@/components/product/product-detail";

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.data ?? data.data;
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto py-8">
        <nav className="mb-4 text-sm text-muted-foreground">
          <a href="/">Home</a> &gt;{" "}
          <a href={`/categories/${product.category?.slug || ""}`}>
            {product.category?.name || "Products"}
          </a>{" > "}
          <span>{product.name}</span>
        </nav>

        <ProductDetail product={product} />
      </main>
      <Footer />
    </div>
  );
}
