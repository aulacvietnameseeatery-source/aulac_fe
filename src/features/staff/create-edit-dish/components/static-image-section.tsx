import React, { useState, useEffect } from "react";
import { ImagePlus, X } from "lucide-react";
import { BASE_URL } from "@/lib/http";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

type ExistingImage = {
  mediaId: number;
  url: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILE_COUNT = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export const StaticImageSection: React.FC<{
  images: File[];
  existingImages?: ExistingImage[];
  onChange: (files: File[]) => void;
  onRemoveExisting: (mediaId: number) => void;
}> = ({ images, existingImages, onChange, onRemoveExisting }) => {
  const t = useTranslations("Dish.Form.media");
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  /* ---------- Cleanup object URLs ---------- */
  useEffect(() => {
    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImagePreviews]);

  /* ---------- Upload new images ---------- */
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    
    // 1. Validate tổng số lượng ảnh (Ảnh đã có + Ảnh mới chọn)
    const currentTotal = (existingImages?.length || 0) + images.length;
    if (currentTotal + selectedFiles.length > MAX_FILE_COUNT) {
      // Báo lỗi bằng toast
      toast.error(t("validation.maxImages") || `Bạn chỉ được tải lên tối đa ${MAX_FILE_COUNT} ảnh`);
      e.target.value = ""; // Reset input
      return;
    }

    const validFiles: File[] = [];

    // Lọc qua từng file để check size và type
    for (const file of selectedFiles) {
      // 2. Validate định dạng
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${t("validation.invalidFormat") || "Định dạng không hợp lệ"}: ${file.name}`);
        continue;
      }
      
      // 3. Validate dung lượng
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${t("validation.maxSize") || "Dung lượng vượt quá 5MB"}: ${file.name}`);
        continue;
      }
      
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      e.target.value = ""; // Reset input
      return;
    }

    const previews = validFiles.map((f) => URL.createObjectURL(f));

    setNewImagePreviews((prev) => [...prev, ...previews]);
    onChange([...images, ...validFiles]);
    
    e.target.value = "";
  };

  /* ---------- Remove NEW image ---------- */
  const removeNewImage = (index: number) => {
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
    onChange(images.filter((_, i) => i !== index));
  };

  /* ---------- Remove EXISTING image ---------- */
  const removeExistingImage = (mediaId: number) => {
    onRemoveExisting(mediaId);
  };

  const currentTotal = (existingImages?.length || 0) + images.length;
  const canUploadMore = currentTotal < MAX_FILE_COUNT;

  return (
    <div className="p-0">
      {/* Grid 2 columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        
        {/* ===== EXISTING IMAGES ===== */}
        {existingImages?.map((img) => (
          <div
            key={`existing-${img.mediaId}`}
            className="group relative aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100"
          >
            <img
              src={`${BASE_URL}${img.url}`}
              alt="existing"
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-start justify-end p-2">
              <button
                type="button"
                onClick={() => removeExistingImage(img.mediaId)}
                className="bg-white/90 hover:bg-red-500 hover:text-white text-gray-600 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>

            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
              {t("existing")}
            </div>
          </div>
        ))}

        {/* Render Uploaded Images */}
        {newImagePreviews.map((src, idx) => (
          <div key={idx} className="group relative aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
            <img src={src} alt="uploaded" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            
            {/* Overlay & Remove Button */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-start justify-end p-2">
              <button
                type="button"
                onClick={() => removeNewImage(idx)}
                className="bg-white/90 hover:bg-red-500 hover:text-white text-gray-600 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100"
              >
                <X size={14} />
              </button>
            </div>
            
            {/* Badge index */}
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
              #{idx + 1}
            </div>
          </div>
        ))}

        {/* The Upload Button (Always at the end) */}
        {canUploadMore && (
          <label className="cursor-pointer group relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-2">
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleUpload}
            />
            <div className="p-3 rounded-full bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              <ImagePlus size={20} className="text-gray-400 group-hover:text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-gray-500 group-hover:text-blue-700 text-center px-2">
              {t("addImage") || "Thêm ảnh"}
            </span>
          </label>
        )}

      </div>
      
      {/* Helper text footer */}
      <div className="flex flex-col items-center gap-1 mt-3">
         <p className="text-xs text-gray-400 text-center">
           {t("recommended")}
         </p>
         <p className="text-[11px] text-gray-400 font-medium">
            ({t("recommended2")})
         </p>
      </div>
    </div>
  );
};