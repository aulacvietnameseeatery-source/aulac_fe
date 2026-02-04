"use client";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/auth-storage";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    if (!tokenStorage.isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 ml-60 p-8">
        {children}
      </main>
    </div>
  );
}
