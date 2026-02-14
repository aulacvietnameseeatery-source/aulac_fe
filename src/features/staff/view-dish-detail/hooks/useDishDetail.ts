// src/hooks/useDishDetail.ts
import { useState, useEffect, useMemo } from "react";
import { DishDetailResponse } from "../types/dish-detail.types";
import { toast } from "sonner"; // Hoặc thư viện toast bạn đang dùng
import { getDishDetailById } from "../services/dish.service";

export const useDishDetail = (id: number) => {
  const [data, setData] = useState<DishDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getDishDetailById(id);
        setData(result);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load dish details");
        toast.error("Could not load dish details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const { staticImages, rotationImages } = useMemo(() => {
    if (!data?.media) return { staticImages: [], rotationImages: [] };

    const staticImgs = data.media
      .filter((m) => m.mediaType === "IMAGE")
      .sort((a, b) => (a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1))
      .map((m) => m.url);

    const rotationImgs = data.media
      .filter((m) => m.mediaType === "IMAGE_360")
      .map((m) => m.url);

    return { staticImages: staticImgs, rotationImages: rotationImgs };
  }, [data]);

  return { dish: data, isLoading, error, staticImages, rotationImages };
};
