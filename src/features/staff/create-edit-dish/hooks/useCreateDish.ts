import { useState } from "react";
import { DishFormValues } from "../types/schema";
import { DishImagesState } from "./useDishImages";
import { createDish } from "../services/dish.service";
import { toast } from "sonner";


export function useCreateDish() {
  const onCreate = async (
    data: DishFormValues,
    images: DishImagesState
  ) => {
    return await createDish(data, images);
  };

  return { onCreate };
}
