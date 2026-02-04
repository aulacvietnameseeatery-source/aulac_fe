"use client";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/auth-storage";
import "../../../styles/adminLayout.css"

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
    // <div className="main-container flex flex-col h-full">
    //   {/* <div className="header-container">
    //   <Header></Header>
    // </div> */}
    //   <div className="main flex grow">
    //     <div className="main-left">
    //       <div className="left-container h-full">
    //       </div>
    //     </div>
    //     <div className="main-right grow flex flex-col">
    //       <div className="main-view flex flex-col">
    //         {/* View for page content */}
    //         {children}
    //       </div>
    //     </div>
    //   </div>
    // </div>

    <div className="main-container">
      <div className="header-container">
        {/* <Header></Header> */}
      </div>
      <div className="main flex">
        <div className="main-left">
          <div className="left-container h-full">
            <AdminSidebar></AdminSidebar>
          </div>
        </div>
        <div className="main-right flex-1 flex flex-col">
          <div className="main-view">
            {/* View for page content */}
            {children}
          </div>
        </div>
      </div>
    </div>
    
  );
}
