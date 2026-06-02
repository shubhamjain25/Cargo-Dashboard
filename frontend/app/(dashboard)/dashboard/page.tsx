"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut, Package, Shield, User } from "lucide-react";
import type { CargoItem } from "@/lib/types";

interface CargoResponse {
  data: CargoItem[];
  meta: {
    total: number;
    userRole: string;
  };
}

export default function DashboardPage() {
  const { user, token, isLoading: authLoading, isAdmin, logout } = useAuth();
  const router = useRouter();

  // Fetcher function with auth token
  const fetcher = async (url: string): Promise<CargoResponse> => {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch cargo data");
    }
    return res.json();
  };

  // Fetch cargo data with SWR
  const {
    data: cargoResponse,
    error,
    isLoading: dataLoading,
    mutate,
  } = useSWR<CargoResponse>(token ? "/api/cargo" : null, fetcher, {
    revalidateOnFocus: false,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleUploadSuccess = () => {
    mutate(); // Refetch cargo data
  };

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen bg-background">
      <p>Dashboard</p>
    </main>
  );
}
