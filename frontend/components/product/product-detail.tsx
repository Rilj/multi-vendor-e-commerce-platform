"use client";

import { Product, ProductVariant, ProductImage } from "@/types/api";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/components/cart-provider";
import { useState } from "react";
import { HeartIcon } from "lucide-react";

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0],
  );
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(
    product.variants?.[0]?.images?.[0] ?? null,
  );
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setIsAddingToCart(true);
    try {
      await addItem(selectedVariant.id, 1);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const images = selectedVariant?.images || [];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {selectedImage?.url ? (
            <Image
              src={selectedImage.url}
              alt={selectedImage.alt || product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <div
                key={img.id || i}
                className="relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border"
                onClick={() => setSelectedImage(img)}
              >
                <Image
                  src={img.url}
                  alt={img.alt || product.name}
                  fill
                  className="object-cover"
                />
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
          <span className="text-2xl font-bold">
            ${selectedVariant?.price || product.basePrice}
          </span>
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
                <button
                  key={variant.id}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setSelectedImage(variant.images?.[0] ?? null);
                  }}
                  className="cursor-pointer rounded-lg border border-input px-3 py-1 text-sm hover:bg-muted"
                >
                  {Object.entries(variant.attributes)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ")}{" - $" + variant.price}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <Button
            size="lg"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={isAddingToCart || !selectedVariant}
          >
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
          <Button
            variant={isWishlisted ? "default" : "secondary"}
            size="lg"
            onClick={handleWishlist}
          >
            <HeartIcon className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              {product.viewCount} views |{" "}
              {product.reviewCount || product.reviews?.length || 0} reviews
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
