import { useState, useCallback } from "react";
import api from "@/lib/api";

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useApi<T>(url: string, options?: RequestInit) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, isLoading: true, error: null });
    try {
      const response = await api.get(url);
      setState({ data: response.data.data?.data ?? response.data.data, isLoading: false, error: null });
    } catch (error: any) {
      setState({ data: null, isLoading: false, error: error });
    }
  }, [url]);

  return { ...state, execute };
}
