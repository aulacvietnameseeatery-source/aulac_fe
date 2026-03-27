"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Edit3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { getDishDetailById } from "@/features/staff/view-dish-detail/services/dish.service";
import { DishViewDetail } from "@/features/staff/view-dish-detail";
import { Button } from "@/components/ui/button";

export default function DishDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dishId = Number(params.id);
  const t = useTranslations("Dish.Detail");

  const { data: dish, isLoading } = useQuery({
    queryKey: ["dish", dishId],
    queryFn: () => getDishDetailById(dishId!),
    enabled: !!dishId,
  });

  const handleEdit = () => {
          router.push(`/dashboard/dish/${dishId}/edit`);
      };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm font-medium">{t("header.loading")}</p>
        </div>
      </div>
    );
  }

  if (!dish) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <header className="flex-1 w-full mx-auto space-y-6 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {dish.i18n.en?.dishName || t("header.titleFallback")}
            </h1>
            <p className="text-gray-500 mt-1">{t("header.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="gap-2"
            >
               {t("header.back")}
            </Button>
            <Button 
              variant="default"
              onClick={handleEdit}
              className="gap-2"
            >
              {t("header.edit")}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto mt-6">
        <DishViewDetail dish={dish} />
      </main>
    </div>
  );
}