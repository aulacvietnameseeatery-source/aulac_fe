"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { DishCategoryList } from '@/features/staff/dish-category-management/dish-category-list';
import { ProtectedRoute } from '@/components/protected-route';
import { Permissions } from '@/types/const';

const DishCategoryListContent = () => {
  return <DishCategoryList />;
};

export default function DishCategoryPage() {
  return (
    <ProtectedRoute permission={Permissions.ViewDishCategory}>
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-gray-400" />
        </div>
      }>
        <DishCategoryListContent />
      </Suspense>
    </ProtectedRoute>
  );
}
