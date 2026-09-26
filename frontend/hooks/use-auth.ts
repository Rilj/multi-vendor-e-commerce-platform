import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export function useAuth() {
  const router = useRouter();

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const response = await api.post("/auth/register", { name, email, password });
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    router.push("/");
  }, [router]);

  const forgotPassword = useCallback(async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    const response = await api.post("/auth/reset-password", { token, password });
    return response.data;
  }, []);

  return { login, register, logout, forgotPassword, resetPassword };
}
