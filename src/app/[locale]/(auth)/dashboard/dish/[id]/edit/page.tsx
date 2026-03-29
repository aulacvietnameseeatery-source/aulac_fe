"use client";

import { DishForm } from "@/features/staff/create-edit-dish";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";


export default function EditDishPage() {
  const router = useRouter();
  const params = useParams();

  const dishId = Number(params.id);

  if (!dishId) return null;

  return (
    <ProtectedRoute permission={Permissions.EditDish}>
      <div className="">
        <DishForm
          mode="edit"
          dishId={dishId}
          onSuccess={() => {
            router.push(`/dashboard/dish`);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
