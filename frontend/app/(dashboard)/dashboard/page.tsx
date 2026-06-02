"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { CargoTable } from "@/components/cargo-table";
import { FileUploadButton } from "@/components/file-upload-button";

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
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6" />
            <h1 className="text-xl font-bold">Cargo Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              {isAdmin ? (
                <Shield className="h-4 w-4 text-primary" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-muted-foreground">{user.email}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isAdmin
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {user.role}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Cargo Shipments</CardTitle>
              <CardDescription>
                {isAdmin ? (
                  <>
                    Viewing all cargo weights in <strong>Kilograms (KG)</strong>
                  </>
                ) : (
                  <>
                    Viewing all cargo weights in <strong>Pounds (LBS)</strong>
                  </>
                )}
                {" - Sorted by weight (heaviest first), Earth destinations pinned to bottom"}
              </CardDescription>
            </div>

            {/* DOM-level RBAC: Only render upload button for Admin */}
            {isAdmin && <FileUploadButton onUploadSuccess={handleUploadSuccess} />}
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="flex items-center justify-center h-64 text-destructive">
                Error loading cargo data. Please try again.
              </div>
            ) : (
              <CargoTable
                data={cargoResponse?.data || []}
                isLoading={dataLoading}
              />
            )}
          </CardContent>
        </Card>

        {/* Info Panel */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Shipments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {cargoResponse?.meta.total ?? "-"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Your Access Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{user.role}</p>
              <p className="text-sm text-muted-foreground">
                {isAdmin
                  ? "Full access: View & Upload"
                  : "Read-only: View only"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Weight Display
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{isAdmin ? "KG" : "LBS"}</p>
              <p className="text-sm text-muted-foreground">
                {isAdmin
                  ? "Native Kilograms"
                  : "Converted from KG (x2.20462)"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
