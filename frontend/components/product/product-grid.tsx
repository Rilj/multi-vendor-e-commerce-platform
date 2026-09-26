"use client";

import { Product } from "@/types/api";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <Link key={product.id} href={`/product/${product.slug}`}>
          <Card className="group cursor-pointer transition-shadow hover:shadow-lg">
            <CardContent className="p-0">
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                {product.variants?.[0]?.images?.[0]?.url ? (
                  <Image
                    src={product.variants[0].images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
                {product.isFeatured && (
                  <Badge variant="secondary" className="absolute left-2 top-2">
                    Featured
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.vendor?.storeName}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-semibold">${product.variants?.[0]?.price || product.basePrice}</span>
                  {product.avgRating && (
                    <span className="text-xs text-muted-foreground">
                      ({product.avgRating.toFixed(1)})
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
