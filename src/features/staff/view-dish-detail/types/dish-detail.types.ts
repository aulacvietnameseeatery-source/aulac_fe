export const LANGUAGES = ["en", "vi", "fr"] as const;
export type Language = (typeof LANGUAGES)[number];

export type DishDetailResponse = {
  dishId: number;
  categoryName: Record<Language, string>;
  price: number;
  dishStatus: Record<Language, string>;
  tags: {
    tagId: number;
    names: Record<Language, string>;
  }[];
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
