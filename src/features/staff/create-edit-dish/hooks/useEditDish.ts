import { useState } from "react";
import { DishFormValues } from "../types/schema";
import { DishImagesState } from "./useDishImages";
import { editDish } from "../services/dish.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


export function useEditDish() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onEdit = async (
    dishId: number,
    data: DishFormValues,
    images: DishImagesState,
    removedMediaIds: number[]
  ) => {
    try {
      setLoading(true);
      await editDish(dishId, data, images, removedMediaIds);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return { onEdit, loading };
}
