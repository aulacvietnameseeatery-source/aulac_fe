import { useState } from "react";

export type DishImagesState = {
  staticImages: File[];
  images360: File[];
  video: File | null;
};

export function useDishImages() {
  const [staticImages, setStaticImages] = useState<File[]>([]);
  const [images360, setImages360] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);

  const images: DishImagesState = { staticImages, images360, video };

  return {
    staticImages,
    images360,
    video,
    images,
    setStaticImages,
    setImages360,
    setVideo,
    resetImages: () => {
      setStaticImages([]);
      setImages360([]);
      setVideo(null);
    }
  };
}
