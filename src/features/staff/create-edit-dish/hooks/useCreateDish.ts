import { useState } from "react";
import { DishFormValues } from "../types/schema";
import { DishImagesState } from "./useDishImages";
import { createDish } from "../services/dish.service";
import { toast } from "sonner";


export function useCreateDish() {
  const [loading, setLoading] = useState(false);

  const onCreate = async (
    data: DishFormValues,
    images: DishImagesState
  ) => {
    try {
      setLoading(true);
      await createDish(data, images);

    } catch {

    } finally {
      setLoading(false);
    }
  };

  return { onCreate, loading };
}
