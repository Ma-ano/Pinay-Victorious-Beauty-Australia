"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/");
    }
  }, [isAdmin, loading, router]);

  if (loading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex min-h-[80vh]">
        <AdminSidebar />
        <div className="flex-1 p-6 md:p-10 md:pt-10 pt-16">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
