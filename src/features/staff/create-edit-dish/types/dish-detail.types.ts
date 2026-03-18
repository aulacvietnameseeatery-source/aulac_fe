import { Language } from "./schema";

export type DishDetailResponse = {
  dishId: number;
  categoryId: number;
  price: number;
  dishStatusLvId: number;
  tagIds: number[];
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
    mediaType: "IMAGE" | "IMAGE_360" | "VIDEO";
    isPrimary: boolean;
  }[];
};

export type CategoryDto = {
  categoryId: number;
  nameVi: string;
  nameEn: string;
  nameFr: string;
};

export type LookupValueDto = {
  valueId: number;
  valueCode: string;
  sortOrder: number;
  i18n: {
    vi: string;
    en: string;
    fr: string;
  };
};

export type DishTagDto = LookupValueDto;
export type DishStatusDto = LookupValueDto;
export type DishDietDto = LookupValueDto;

export type DishI18nDto = {
  dishName: string;
  description?: string | null;
  slogan?: string | null;
  note?: string | null;
  shortDescription?: string | null;
};


export type TranslateDishRequest = {
  sourceLang: Language; 
  data: DishI18nDto;    
};

export type TranslateDishResponse = {
  translations: Record<string, DishI18nDto>;
};