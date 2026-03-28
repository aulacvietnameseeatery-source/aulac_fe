import { useState } from "react";
import { DishFormValues } from "../types/schema";
import { DishImagesState } from "./useDishImages";
import { editDish } from "../services/dish.service";
import { toast } from "sonner";
import { useRouter } from "@/routing"


export function useEditDish() {

  const onEdit = async (
    dishId: number,
    data: DishFormValues,
    images: DishImagesState,
    removedMediaIds: number[]
  ) => {
    return await editDish(dishId, data, images, removedMediaIds);
  };

  return { onEdit };
}
