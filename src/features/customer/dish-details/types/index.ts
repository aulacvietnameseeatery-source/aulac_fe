export interface RecipeItem {
  ingredientId: number;
  ingredientName: string;
  quantity: number;
  unit: string;
  note?: string;
}

export interface Dish {
  dishId: number;
  dishName: string;
  price: number;
  categoryName: string;
  description?: string;
  shortDescription?: string;
  slogan?: string;
  calories?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  imageUrls: string[];
  composition: RecipeItem[];
}

export interface DishDetailResponse {
  success: boolean;
  code: number;
  userMessage: string;
  data: Dish;
  serverTime: string;
}
