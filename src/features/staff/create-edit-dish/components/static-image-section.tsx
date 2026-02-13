import React, { useState, useEffect } from "react";
import { ImagePlus, X } from "lucide-react";
import { BASE_URL } from "@/lib/http";

type ExistingImage = {
  mediaId: number;
  url: string;
};

export const StaticImageSection: React.FC<{
  images: File[];
  existingImages?: ExistingImage[];
  onChange: (files: File[]) => void;
  onRemoveExisting: (mediaId: number) => void;
}> = ({ images, existingImages, onChange, onRemoveExisting }) => {
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

    const files = Array.from(e.target.files);
    const previews = files.map((f) => URL.createObjectURL(f));

    setNewImagePreviews((prev) => [...prev, ...previews]);
    onChange([...images, ...files]);
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

  return (
    <div className="p-0">
      {/* Grid 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        
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
              Existing
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
        <label className="cursor-pointer group relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-2">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <div className="p-3 rounded-full bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
            <ImagePlus size={20} className="text-gray-400 group-hover:text-blue-600" />
          </div>
          <span className="text-xs font-semibold text-gray-500 group-hover:text-blue-700">Add Image</span>
        </label>

      </div>
      
      {/* Helper text footer */}
      <p className="text-xs text-gray-400 mt-3 text-center">
        Recommended: 800x800px (JPG, PNG)
      </p>
    </div>
  );
};