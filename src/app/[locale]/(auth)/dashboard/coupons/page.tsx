"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { CouponList } from '@/features/staff/coupon-management/coupon-list';
import { ProtectedRoute } from '@/components/protected-route';
import { Permissions } from '@/types/const';

const CouponListContent = () => {
  return <CouponList />;
};

export default function CouponPage() {
  return (
    <ProtectedRoute permission={Permissions.ViewCoupon}>
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-gray-400" />
        </div>
      }>
        <CouponListContent />
      </Suspense>
    </ProtectedRoute>
  );
}
