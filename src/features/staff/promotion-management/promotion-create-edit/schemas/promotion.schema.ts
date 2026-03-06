import { z } from "zod";
import { PromotionStatusCode } from "@/types/status-codes";

export const createPromotionSchema = (t: (key: string) => string) => {
  const basePromotionSchema = z.object({
    promoCode: z.string().min(3, t("promoCodeMin")).toUpperCase(),
    promoName: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    startTime: z.string().min(1, t("startTimeRequired")),
    endTime: z.string().min(1, t("endTimeRequired")),
    maxUsage: z.coerce.number().min(0).optional().nullable(),
    
    ruleMinOrderValue: z.coerce.number().min(0).optional().nullable(),
    ruleMinQuantity: z.coerce.number().min(0).optional().nullable(),
    ruleRequiredDishIds: z.array(z.number()).default([]),
    ruleRequiredCategoryIds: z.array(z.number()).default([]),

    targetDishIds: z.array(z.number()).default([]),
    targetCategoryIds: z.array(z.number()).default([]),
    
    initialStatus: z.nativeEnum(PromotionStatusCode).optional(),
  });

  return z.discriminatedUnion("type", [
    basePromotionSchema.extend({
      type: z.literal("PERCENT"),
      discountValue: z.coerce.number().min(1, t("discountMinPercent")).max(100, t("discountMaxPercent")),
    }),
    basePromotionSchema.extend({
      type: z.literal("FIXED_AMOUNT"),
      discountValue: z.coerce.number().positive(t("discountPositive")),
    })
  ]).superRefine((data, ctx) => {
    if (data.startTime && data.endTime && new Date(data.startTime) >= new Date(data.endTime)) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: t("endTimeAfterStartTime"), 
        path: ["endTime"] 
      });
    }
  });
};

export type PromotionFormValues = z.infer<ReturnType<typeof createPromotionSchema>>;