"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </main>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Cargo Portal</h1>
          <p className="text-muted-foreground mt-2">
            Manage your cargo shipments efficiently
          </p>
        </div>
        <AuthForm
          mode={mode}
          onToggleMode={() => setMode(mode === "login" ? "signup" : "login")}
        />
      </div>
    </main>
  );
}
