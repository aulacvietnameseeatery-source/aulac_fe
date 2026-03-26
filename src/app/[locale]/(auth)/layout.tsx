"use client";

import { AdminSidebar } from "@/components/layout/admin-sidebar/admin-sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "@/routing"
import { useAuth } from "@/components/providers/auth-provider";
import "../../../styles/adminLayout.css"
import { Tooltip } from "react-tooltip";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { DashboardTopNav } from "@/components/ui/dashboard-top-nav";
// _OLD: NotificationProvider + NotificationToastRenderer were mounted locally in this layout.
// _OLD: They are now mounted in src/app/[locale]/layout.tsx so hub subscription starts immediately after login.
// import { NotificationProvider } from "@/features/staff/notifications/providers/notification-provider";
// import { NotificationToastRenderer } from "@/features/staff/notifications/components/notification-toast-renderer";
import { NotificationBell } from "@/features/staff/notifications/components/notification-bell";
import { NotificationCenter } from "@/features/staff/notifications/components/notification-center";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    // Only check authentication after auth state is initialized
    // This prevents false redirects when auth is still loading from localStorage
    if (isInitialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isInitialized, router]);

  // Show loading state while auth is initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1A3A51] border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* _OLD: Local provider/toast renderer wrapper retained for reference. */}
      {/* _OLD: <NotificationProvider> */}
      {/* _OLD: <NotificationToastRenderer /> */}
      <div className="main-container relative min-h-screen bg-[#F8F9FA]">
      {/* Mobile Header for Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-[#1A3A51] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <span className="font-display font-bold text-[#1A3A51] text-base">An Lac Admin</span>
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

        {/* --- MAIN CONTENT AREA --- */}
        <div className="main-right flex-1 flex flex-col h-full overflow-hidden">
          
          {/* --- UPDATED DESKTOP TOP BAR --- */}
          <header className="hidden md:flex items-center justify-between px-6 py-2 bg-white border-b border-gray-100 shadow-sm">
            {/* Quick Navigation Buttons */}
            <DashboardTopNav />

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <NotificationBell onClick={() => setIsNotificationOpen((v) => !v)} />
                <NotificationCenter
                  open={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                />
              </div>
              <LanguageSwitcher variant="admin" />
            </div>
          </header>

          <div className="main-view flex-1 overflow-auto p-4 md:p-5 bg-[#FDFBF9]">
            {/* View for page content */}
            {children}
          </div>
        </div>
      </div>
        <Tooltip id="my-tooltip" style={{ zIndex: 10000 }} />
      </div>
      {/* _OLD: </NotificationProvider> */}
    </>
  );
}
