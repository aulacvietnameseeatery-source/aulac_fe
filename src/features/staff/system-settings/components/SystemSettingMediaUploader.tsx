"use client";

import React, { useRef, useState, useCallback } from "react";
import { Upload, Maximize2, Loader2, X, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { processImageFile } from "@/lib/image-processing";

interface SystemSettingMediaUploaderProps {
    value?: string;
    onUpload: (file: File) => Promise<{ relativePath: string; publicUrl?: string }>;
    onChange: (value: string, publicUrl?: string) => void;
    onPreview?: (url: string) => void;
    accept?: string;
    type?: "image" | "video";
    maxSizeMB?: number;
    maxVideoDuration?: number; // In seconds
    aspectRatioClassName?: string;
    className?: string;
    disabled?: boolean;
    label?: string;
}

export const SystemSettingMediaUploader: React.FC<SystemSettingMediaUploaderProps> = ({
    value,
    onUpload,
    onChange,
    onPreview,
    accept,
    type = "image",
    maxSizeMB = 5,
    maxVideoDuration = 30,
    aspectRatioClassName = "aspect-square",
    className,
    disabled = false,
    label,
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const checkVideoDuration = (file: File, maxSeconds: number): Promise<boolean> => {
        return new Promise((resolve) => {
            const videoElement = document.createElement("video");
            videoElement.preload = "metadata";

            videoElement.onloadedmetadata = () => {
                window.URL.revokeObjectURL(videoElement.src);
                resolve(videoElement.duration <= maxSeconds);
            };

            videoElement.onerror = () => {
                resolve(false);
            };

            videoElement.src = URL.createObjectURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic type check
        if (type === "video" && !file.type.startsWith("video/")) {
            toast.error("Invalid video format");
            if (e.target) e.target.value = "";
            return;
        }

        if (type === "image" && !file.type.startsWith("image/") && !file.name.toLowerCase().endsWith(".heic") && !file.name.toLowerCase().endsWith(".heif")) {
            toast.error("Invalid image format");
            if (e.target) e.target.value = "";
            return;
        }

        // Size check
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`File size exceeds ${maxSizeMB}MB limit`);
            if (e.target) e.target.value = "";
            return;
        }

        // Video duration check
        if (type === "video" && maxVideoDuration) {
            setIsUploading(true);
            const isValidDuration = await checkVideoDuration(file, maxVideoDuration);
            if (!isValidDuration) {
                toast.error(`Video duration must be under ${maxVideoDuration} seconds`);
                setIsUploading(false);
                if (e.target) e.target.value = "";
                return;
            }
        }

        setIsUploading(true);

        try {
            let fileToUpload = file;
            if (type === "image") {
                fileToUpload = await processImageFile(file, { maxSizeMB });
            }

            // Create local preview
            const previewUrl = URL.createObjectURL(fileToUpload);
            setLocalPreview(previewUrl);

            const result = await onUpload(fileToUpload);
            onChange(result.relativePath, result.publicUrl);
            toast.success("Upload successful");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload file");
            setLocalPreview(null);
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = "";
        }
    };

    const currentUrl = localPreview || value;


    const handlePreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onPreview && currentUrl) {
            onPreview(currentUrl);
        }
    };

    return (
        <div className={cn("relative group w-full", aspectRatioClassName, className)}>
            <div
                className={cn(
                    "w-full h-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-500 cursor-pointer",
                    currentUrl
                        ? "border-solid border-white bg-white shadow-xl"
                        : "border-slate-300 bg-white/50 hover:border-primary/40 hover:bg-white/80 hover:shadow-2xl hover:shadow-primary/5",
                    disabled && "opacity-50 cursor-not-allowed pointer-events-none",
                    isUploading && "pointer-events-none"
                )}
                onClick={() => inputRef.current?.click()}
            >
                {currentUrl ? (
                    <div className="relative w-full h-full">
                        {type === "video" ? (
                            <video src={currentUrl} className="w-full h-full object-cover" />
                        ) : (
                            <img
                                src={currentUrl}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt={label || "Uploaded media"}
                            />
                        )}

                        {/* Hover/Always Overlay */}
                        <div className="absolute inset-0 bg-black/20 lg:opacity-0 lg:group-hover:opacity-100 opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <div className="flex gap-3 bg-white/90 p-2 rounded-2xl shadow-lg lg:transform lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-300">
                                <div className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                                    <Upload className="w-5 h-5 text-slate-700" />
                                </div>
                                {onPreview && (
                                    <button
                                        type="button"
                                        className="p-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                        onClick={handlePreview}
                                    >
                                        <Maximize2 className="w-5 h-5" />
                                    </button>
                                )}

                            </div>
                        </div>

                        {type === "video" && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80 group-hover:opacity-0 transition-opacity">
                                <PlayCircle className="w-12 h-12 text-white shadow-lg" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                        <div className="p-5 bg-slate-50 rounded-full border border-slate-100 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8" />
                        </div>
                        <div className="text-center px-4">
                            <span className="text-sm font-semibold block">{label || `Click to upload ${type}`}</span>
                            <span className="text-[10px] uppercase tracking-widest opacity-60">
                                Max {maxSizeMB}MB {type === 'video' && `· Under ${maxVideoDuration}s`}
                            </span>
                        </div>
                    </div>
                )}

                {isUploading && (
                    <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-3 backdrop-blur-sm z-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="text-xs font-bold text-primary animate-pulse">Processing...</span>
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept={accept || (type === "video" ? "video/mp4" : "image/*")}
                onChange={handleFileChange}
                disabled={disabled}
            />
        </div>
    );
};
