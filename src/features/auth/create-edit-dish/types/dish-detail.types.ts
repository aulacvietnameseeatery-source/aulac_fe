import { Language } from "./schema";

export type DishDetailResponse = {
  dishId: number;
  categoryId: number;
  price: number;
  dishStatusLvId: number;
  tagId: number;
  isOnline: boolean;
  chefRecommended: boolean;
  displayOrder: number | null;
  calories: number | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  i18n: Record<Language, {
    dishName: string;
    description?: string | null;
    shortDescription?: string | null;
    slogan?: string | null;
    note?: string | null;
  }>;
  media: {
    mediaId: number;
    url: string;
    mediaType: "IMAGE" | "IMAGE_360";
    isPrimary: boolean;
  }[];
};

export type CategoryDto = {
  categoryId: number;
  categoryName: string;
};

export type DishStatusDto = {
  dishStatusLvId: number;
  valueName: string;
  valueCode: string;
};

export type DishTagDto = {
  tagId: number;
  code: string;
  name: string;
}