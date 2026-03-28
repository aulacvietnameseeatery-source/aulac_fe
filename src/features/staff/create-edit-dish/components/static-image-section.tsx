import React from "react";
import { useTranslations } from "next-intl";
import { ALFileUploader, ALExistingFile } from "@/components/ui/al-file-uploader";

type ExistingImage = {
  mediaId: number;
  url: string;
  isPrimary?: boolean; // Thêm isPrimary nếu backend có trả về
};

export const StaticImageSection: React.FC<{
  images: File[];
  existingImages?: ExistingImage[];
  onChange: (files: File[]) => void;
  onRemoveExisting: (mediaId: number) => void;
}> = ({ images, existingImages, onChange, onRemoveExisting }) => {
  const t = useTranslations("Dish.Form.media");

  // Map cấu trúc dữ liệu của existingImages sang chuẩn của ALFileUploader
  const mappedExistingFiles: ALExistingFile[] = (existingImages || []).map(
    (img) => ({
      id: img.mediaId,
      url: img.url,
      isPrimary: img.isPrimary,
    })
  );

  return (
    <div className="relative h-max overflow-hidden w-full pb-2">
      <ALFileUploader
        variant="gallery" 

        className="
          [&>div:first-of-type]:!grid 
          [&>div:first-of-type]:!grid-cols-2 
          sm:[&>div:first-of-type]:!grid-cols-3 
          md:[&>div:first-of-type]:!grid-cols-4 
          lg:[&>div:first-of-type]:!grid-cols-5 
          [&>div:first-of-type]:!gap-3
          [&>div:first-of-type>div]:!aspect-square 
          [&>div:first-of-type>div]:!h-auto
          [&>div:first-of-type>button]:!aspect-square 
          [&>div:first-of-type>button]:!h-auto
        "
        existingFiles={mappedExistingFiles}
        onDeleteExisting={(id) => onRemoveExisting(Number(id))}

        pendingFiles={images}
        onPendingChange={onChange}

        multiple={true}
        maxFiles={5}
        maxSizeBytes={5 * 1024 * 1024} // 5MB
        accept=".jpg,.jpeg,.png,.gif,.webp,.heic,.heif,image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif"
        acceptHint={["JPG", "PNG", "GIF", "WEBP", "HEIC"]}
        
      />
      <div className="flex flex-col items-center gap-1 mt-4">
         <p className="text-xs text-gray-400 text-center">
           {t("recommended")}
         </p>
         <p className="text-[11px] text-gray-400 font-medium text-center">
            ({t("recommended2")})
         </p>
      </div>
    </div>
  );
};