"use client";

import { DishForm } from "@/features/staff/create-edit-dish";

export default function CreateDishPage() {

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
