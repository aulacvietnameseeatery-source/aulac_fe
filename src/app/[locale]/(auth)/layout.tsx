"use client";

import { AdminSidebar } from "@/components/layout/admin-sidebar/admin-sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import "../../../styles/adminLayout.css"
import { Tooltip } from "react-tooltip";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check authentication and redirect if not logged in
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="main-container relative min-h-screen bg-[#F8F9FA]">
      {/* Mobile Header for Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-[#1A3A51] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <span className="font-display font-bold text-[#1A3A51] text-lg">An Lac Admin</span>
        </div>
        <LanguageSwitcher variant="admin" isMobile={true} />
      </div>

      <div className="main flex h-screen overflow-hidden pt-15 md:pt-0">
        {/* Desktop Sidebar */}
        <div className="main-left hidden md:block h-full">
          <div className="left-container h-full">
            <AdminSidebar />
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Sidebar Drawer */}
            <div className="absolute left-0 top-0 bottom-0 w-[310px] animate-in slide-in-from-left duration-300 shadow-2xl">
              <AdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        <div className="main-right flex-1 flex flex-col h-full overflow-hidden">
          {/* Desktop Top Bar */}
          <div className="hidden md:flex items-center justify-end px-8 py-4 bg-white border-b border-gray-100">
            <LanguageSwitcher variant="admin" />
          </div>

          <div className="main-view flex-1 overflow-auto p-4 md:p-8">
            {/* View for page content */}
            {children}
          </div>
        </div>
      </div>
      <Tooltip id="my-tooltip" style={{ zIndex: 10000 }} />
    </div>


  );
}
