import { z } from "zod";
import { DishDetailResponse } from "./dish-detail.types";

export const LANGUAGES = ["en", "vi", "fr"] as const;
export type Language = (typeof LANGUAGES)[number];


const nullableNumber = z.preprocess(
  (v) => (v === "" || v === undefined ? null : Number(v)),
  z.number().nullable()
);
// --- Sub-Schemas ---

const i18nContentSchema = z.object({
  dishName: z.string().trim().min(1, "Dish name is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  slogan: z.string().optional(),
  note: z.string().optional(),
});

// --- Base Schema (Structure) ---

export const dishFormSchema = z.object({
  // Section 1: Multilingual
  i18n: z.object({
    en: i18nContentSchema,
    vi: i18nContentSchema,
    fr: i18nContentSchema,
  }),

  // Section 2: Core Info
  categoryId: z.number().min(1, "Category is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  dishStatusLvId: z.coerce.number().min(1, "Status is required"),
  tagId: z.coerce.number().min(1, "Status is required"),
  isOnline: z.boolean(),
  chefRecommended: z.boolean(),

  // Section 3: Media (UI only for Create flow, usually handled separately)
  // We keep a placeholder here to match form state if needed, 
  // but usually media is uploaded after ID generation.
  
  // Section 4: Advanced
  displayOrder: nullableNumber,
  calories: nullableNumber,
  prepTimeMinutes: nullableNumber,
  cookTimeMinutes: nullableNumber,
});

export type DishFormValues = z.input<typeof dishFormSchema>;

export function mapDishToFormValues(
  dish: DishDetailResponse
): DishFormValues {
  return {
    i18n: {
      en: {
        dishName: dish.i18n.en.dishName,
        description: dish.i18n.en.description ?? "",
        shortDescription: dish.i18n.en.shortDescription ?? "",
        slogan: dish.i18n.en.slogan ?? "",
        note: dish.i18n.en.note ?? "",
      },
      vi: {
        dishName: dish.i18n.vi.dishName,
        description: dish.i18n.vi.description ?? "",
        shortDescription: dish.i18n.vi.shortDescription ?? "",
        slogan: dish.i18n.vi.slogan ?? "",
        note: dish.i18n.vi.note ?? "",
      },
      fr: {
        dishName: dish.i18n.fr.dishName,
        description: dish.i18n.fr.description ?? "",
        shortDescription: dish.i18n.fr.shortDescription ?? "",
        slogan: dish.i18n.fr.slogan ?? "",
        note: dish.i18n.fr.note ?? "",
      },
    },

    categoryId: 1,
    price: dish.price,
    dishStatusLvId: dish.dishStatusLvId,
    tagId: dish.tagId,
    isOnline: dish.isOnline,
    chefRecommended: dish.chefRecommended,

    displayOrder: dish.displayOrder,
    calories: dish.calories,
    prepTimeMinutes: dish.prepTimeMinutes,
    cookTimeMinutes: dish.cookTimeMinutes,
  };
}