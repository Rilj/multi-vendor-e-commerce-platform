import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { notFound } from "next/navigation";
import { Product } from "@/types/api";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
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
          <Link href="/">Home</Link> &gt;{" "}
          <Link href={`/categories/${product.category?.slug || ""}`}>
            {product.category?.name || "Products"}
          </Link>{" > "}
          <span>{product.name}</span>
        </nav>

        <ProductDetail product={product} />
      </main>

      <Footer />
    </div>
  );
}

function ProductDetail({ product }: { product: Product }) {
  const primaryVariant = product.variants?.[0];
  const primaryImage = primaryVariant?.images?.[0]?.url || primaryVariant?.images?.[0]?.url;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {primaryImage ? (
            <Image src={primaryImage} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>

        {primaryVariant?.images && (
          <div className="flex gap-2 overflow-x-auto">
            {primaryVariant.images.map((img, i) => (
              <div key={i} className="relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border">
                <Image src={img.url} alt={img.alt || product.name} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">{product.vendor?.storeName}</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold">${primaryVariant?.price || product.basePrice}</span>
          <Badge variant={product.status === "ACTIVE" ? "success" : "warning"}>
            {product.status}
          </Badge>
          {product.avgRating && (
            <div className="flex items-center">
              <span className="text-sm font-medium">{product.avgRating.toFixed(1)}</span>
              <StarRating rating={Math.round(product.avgRating)} />
            </div>
          )}
        </div>

        {product.variants && product.variants.length > 1 && (
          <div className="space-y-2">
            <h3 className="font-medium">Variants</h3>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <Badge key={variant.id} variant="outline">
                  {Object.entries(variant.attributes).map(([k, v]) => `${k}: ${v}`).join(", ")}
                  {" - $" + variant.price}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <Button size="lg" className="flex-1">
            Add to Cart
          </Button>
          <Button variant="secondary" size="lg">
            Add to Wishlist
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              {product.viewCount} views | {product.reviewCount || product.reviews?.length || 0} reviews
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="ml-2 flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={star <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={star <= rating ? "text-amber-500" : "text-muted"}
        >
          <polygon points="12 2 15 11 22 12 15 13 12 22 9 13 2 11" />
        </svg>
      ))}
    </div>
  );
}
