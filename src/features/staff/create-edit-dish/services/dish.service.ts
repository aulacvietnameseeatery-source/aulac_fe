import { ApiResponse } from "@/types/api-response.types";
import { DishFormValues } from "../types/schema";
import { api } from "@/lib/http";
import { DishDetailResponse, CategoryDto, DishStatusDto, DishTagDto, DishDietDto, TranslateDishRequest, TranslateDishResponse } from "../types/dish-detail.types";

export async function createDish(
  data: DishFormValues,
  images: {
    staticImages: File[];
    images360: File[];
  }
) {
  const formData = new FormData();

  formData.append(
    "dish",
    JSON.stringify({
    ...data,
    price: Number(data.price),
    dietId:
      data.dietId === "" || data.dietId == null
        ? null
        : Number(data.dietId),
    calories:
      data.calories === "" || data.calories == null
        ? null
        : Number(data.calories),
    
    cookTimeMinutes:
      data.cookTimeMinutes === "" || data.cookTimeMinutes == null
        ? null
        : Number(data.cookTimeMinutes),
   
    prepTimeMinutes:
      data.prepTimeMinutes === "" || data.prepTimeMinutes == null
        ? null
        : Number(data.prepTimeMinutes),
    
    displayOrder:
      data.displayOrder === "" || data.displayOrder == null
        ? null
        : Number(data.displayOrder),
    }),
    
  );

  images.staticImages.forEach(f =>
    formData.append("staticImages", f)
  );

  images.images360.forEach(f =>
    formData.append("images360", f)
  );

  const res =  api.post<ApiResponse<void>>("/api/dishes", formData);

  if (!(await res).success) throw new Error("Create dish failed");
}

export async function getDishById(dishId : number) {
  const res =  api.get<ApiResponse<DishDetailResponse>>(`/api/dishes/detail/${dishId}`);
  return (await res).data;
}

export async function getAllActiveStatus() {
  const res =  api.get<ApiResponse<DishStatusDto[]>>(`/api/dishes/status/active`);
  return (await res).data;
}

export async function getAllCategories() {
  const res =  api.get<ApiResponse<CategoryDto[]>>(`/api/dishes/all-categories`);
  return (await res).data;
}

export async function getAllTag() {
  const res =  api.get<ApiResponse<DishTagDto[]>>(`/api/dishes/tags`);
  return (await res).data;
}

export async function getAllDiets() {
  const res = api.get<ApiResponse<DishDietDto[]>>(`/api/dishes/diets`);
  return (await res).data;
}

export async function editDish(
  dishId : number, 
  data: DishFormValues, 
  images: {
    staticImages: File[];
    images360: File[];
  },
  removedMediaIds: number[]
) {
  const formData = new FormData();

  formData.append(
    "dish",
    JSON.stringify({
    ...data,
    dishId: dishId,
    price: Number(data.price),
    dietId:
      data.dietId === "" || data.dietId == null
        ? null
        : Number(data.dietId),
    calories:
      data.calories === "" || data.calories == null
        ? null
        : Number(data.calories),
    
    cookTimeMinutes:
      data.cookTimeMinutes === "" || data.cookTimeMinutes == null
        ? null
        : Number(data.cookTimeMinutes),
   
    prepTimeMinutes:
      data.prepTimeMinutes === "" || data.prepTimeMinutes == null
        ? null
        : Number(data.prepTimeMinutes),
    
    displayOrder:
      data.displayOrder === "" || data.displayOrder == null
        ? null
        : Number(data.displayOrder),
    }),
    
  );

  images.staticImages.forEach(f =>
    formData.append("staticImages", f)
  );

  images.images360.forEach(f =>
    formData.append("images360", f)
  );

  formData.append("removedMediaIds", JSON.stringify(removedMediaIds));

  const res =  api.put<ApiResponse<void>>(`/api/dishes/${dishId}/edit`, formData);

  if (!(await res).success) throw new Error("Edit dish failed");
}

export async function translateDishContent(payload: TranslateDishRequest) {
  const res = await api.post<TranslateDishResponse>("/api/translate/dish", payload);
  return res;
}