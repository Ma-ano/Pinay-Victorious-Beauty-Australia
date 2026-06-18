"use client";

import AdminSidebar from "@/components/AdminSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-[80vh]">
        <AdminSidebar />
        <div className="flex-1 p-6 md:p-10">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
