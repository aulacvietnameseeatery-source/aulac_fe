import { useState } from "react";

export type DishImagesState = {
  staticImages: File[];
  images360: File[];
};

export function useDishImages() {
  const [staticImages, setStaticImages] = useState<File[]>([]);
  const [images360, setImages360] = useState<File[]>([]);
  const [images, setImages] = useState<DishImagesState>({staticImages, images360});

  return {
    staticImages,
    images360,
    images,
    setImages,
    setStaticImages,
    setImages360,
    resetImages: () => {
      setStaticImages([]);
      setImages360([]);
    }
  };
}
