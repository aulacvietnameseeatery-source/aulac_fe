"use client";

import {DishDetailPage} from "@/features/auth/view-dish-detail";
import { useParams, useRouter } from "next/navigation";


export default function DetailDishPage() {
  const router = useRouter();
  const params = useParams();

  const dishId = Number(params.id);

  if (!dishId) return null;

  return (
    <div className="">
      <DishDetailPage
        dishId={dishId}
      />
    </div>
  );
}
