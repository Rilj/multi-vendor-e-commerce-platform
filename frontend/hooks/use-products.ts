import { useState, useCallback } from "react";
import api from "@/lib/api";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  });

  return debouncedValue;
}

export function useProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchProducts = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/products?search=${encodeURIComponent(query)}`);
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Product search failed:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async (filters: Record<string, any> = {}) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/products?${params}`);
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Product fetch failed:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { products, isLoading, searchProducts, fetchProducts };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/products/slug/${slug}`);
      setProduct(response.data.data);
    } catch (error) {
      console.error("Product fetch failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  return { product, isLoading };
}
