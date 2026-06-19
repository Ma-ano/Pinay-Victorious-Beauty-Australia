"use client";

import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function ProtectedRoute({ children, requireAdmin = false }: { children: ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, loading, needsVerification, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && needsVerification) {
      router.push("/verify-email");
    } else if (!loading && !isAuthenticated) {
      router.push("/login");
    } else if (!loading && requireAdmin && !isAdmin) {
      router.push("/");
    }
  }, [isAuthenticated, isAdmin, needsVerification, loading, requireAdmin, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || (requireAdmin && !isAdmin)) return null;

  return <>{children}</>;
}
