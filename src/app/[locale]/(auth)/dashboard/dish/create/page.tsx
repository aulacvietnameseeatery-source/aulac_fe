"use client";

import { DishForm } from "@/features/staff/create-edit-dish";
import { useRouter } from "@/routing"

export default function CreateDishPage() {
  const router = useRouter();
  return (
    <div className="">
      <DishForm
        mode="create"
        onSuccess={() => {
          router.push(`/dashboard/dish`);
        }}
      />
    </div>
  );
}
