"use client";

import { DishForm } from "@/features/staff/create-edit-dish";
import { useParams, useRouter } from "next/navigation";


export default function EditDishPage() {
  const router = useRouter();
  const params = useParams();

  const dishId = Number(params.id);

  if (!dishId) return null;

  return (
    <div className="">
      <DishForm
        mode="edit"
        dishId={dishId}
        onSuccess={() => {
          router.push(`/dashboard/dish`);
        }}
      />
    </div>
  );
}
