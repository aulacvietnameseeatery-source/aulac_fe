import { useState } from "react";

export type ExistingMedia = {
  mediaId: number;
  url: string;
  isPrimary: boolean;
};


export function useDishEditMedia() {
  const [existingImages, setExistingImages] = useState<ExistingMedia[]>([]);
  const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([]);

  const removeExistingImage = (mediaId: number) => {
    setExistingImages(prev => prev.filter(i => i.mediaId !== mediaId));
    setRemovedMediaIds(prev => [...prev, mediaId]);
  };

  return {
    existingImages,
    setExistingImages,
    removedMediaIds,
    removeExistingImage,
  };
}
