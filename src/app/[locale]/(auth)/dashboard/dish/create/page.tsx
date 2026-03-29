"use client";

import { DishForm } from "@/features/staff/create-edit-dish";
import { useRouter } from "@/routing"
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";

export default function CreateDishPage() {
  const router = useRouter();
  return (
    <ProtectedRoute permission={Permissions.CreateDish}>
      <div className="">
        <DishForm
          mode="create"
          onSuccess={() => {
            router.push(`/dashboard/dish`);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
