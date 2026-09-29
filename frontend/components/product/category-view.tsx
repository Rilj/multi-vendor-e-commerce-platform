"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { ProductGrid } from "@/components/product/product-grid";
import { Product } from "@/types/api";

interface CategoryViewProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  total: number;
}

export function CategoryView({
  products,
  currentPage = 1,
  totalPages = 1,
  total = 0,
}: CategoryViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <Suspense fallback={<div>Loading products...</div>}>
        <ProductGrid products={products} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          pageSize={20}
          onPageChange={handlePageChange}
        />
      </Suspense>
    </>
  );
}
