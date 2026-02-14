"use client";

import { DishForm } from "@/features/staff/create-edit-dish";
import { useRouter } from "next/navigation";


export default function CreateDishPage() {
  const router = useRouter();

  return (
    <div className="">
      <DishForm
        mode="create"
        onSuccess={() => {
          
        }}
      />
    </div>
  );
}
