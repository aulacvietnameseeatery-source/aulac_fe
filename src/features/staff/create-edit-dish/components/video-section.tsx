"use client";

import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { ExistingMedia } from "../hooks/useDishEditMedia";
import { Button } from "@/components/ui/button";
import { X, UploadCloud } from "lucide-react";
import { useTranslations } from "next-intl";

type VideoSectionProps = {
  videoFile: File | null;
  existingVideo: ExistingMedia | null;
  onChange: (file: File | null) => void;
  onRemoveExisting: (mediaId: number) => void;
};

export function VideoSection({ videoFile, existingVideo, onChange, onRemoveExisting }: VideoSectionProps) {
  const t = useTranslations("Dish.Form.media.video");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Tạo URL preview khi có file mới
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [videoFile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validate Định dạng
    if (file.type !== "video/mp4") {
      toast.error(t("validation.invalidFormat"));
      return;
    }

    // 2. Validate Dung lượng (20MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(t("validation.maxSize"));
      return;
    }

    // 3. Validate Thời lượng (15 giây)
    const isValidDuration = await checkVideoDuration(file, 15);
    if (!isValidDuration) {
      toast.error(t("validation.maxDuration"));
      return;
    }

    onChange(file);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
  };

  const checkVideoDuration = (file: File, maxSeconds: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";

      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        resolve(videoElement.duration <= maxSeconds);
      };

      videoElement.onerror = () => {
        resolve(false); // Lỗi không đọc được video
      };

      videoElement.src = URL.createObjectURL(file);
    });
  };

  const handleRemove = () => {
    onChange(null);
    if (existingVideo) {
      onRemoveExisting(existingVideo.mediaId);
    }
  };

  const hasVideo = !!videoFile || !!existingVideo;
  const videoSrc = videoFile ? previewUrl : (existingVideo ? `${existingVideo.url}` : undefined);

  return (
    <div className="w-full">
      {!hasVideo ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors min-h-[230px]"
        >
          <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-900">{t("uploadPrompt")}</p>
          <p className="text-xs text-gray-500 mt-1">{t("uploadHint")}</p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black flex justify-center h-[240px]">
          <video 
            src={videoSrc!} 
            controls 
            className="h-full max-w-full object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-red-500 hover:text-white rounded-full transition-colors backdrop-blur-sm shadow-sm"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/mp4"
        className="hidden"
      />
    </div>
  );
}