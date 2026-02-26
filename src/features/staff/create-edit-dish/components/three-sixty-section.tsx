import React, { useState, useRef, useEffect } from "react";
import { RefreshCw, MoveHorizontal, Image as ImageIcon, RotateCw, Trash2, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export const ThreeSixtySection: React.FC<{
  frames: File[];
  onChange: (files: File[]) => void;
}> = ({ frames, onChange }) => {
  const t = useTranslations("Dish.Form.media");
  const [frameView, setFrameView] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  
  // Clean up
  useEffect(() => {
    return () => frameView.forEach(url => URL.revokeObjectURL(url));
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).sort((a, b) => a.name.localeCompare(b.name));
      setFrameView(files.map(f => URL.createObjectURL(f)));
      setCurrentFrame(0);

      onChange(files);
    }
  };

  // Logic xoay (Drag)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || frameView.length === 0) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 10) {
      const direction = delta > 0 ? 1 : -1;
      setCurrentFrame(prev => {
        let next = prev - direction;
        if (next < 0) next = frameView.length - 1;
        if (next >= frameView.length) next = 0;
        return next;
      });
      startX.current = e.clientX;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* === TRẠNG THÁI 1: PREVIEW PLAYER (Chỉ hiện khi đã có ảnh) === */}
      {frameView.length > 0 ? (
        <div className="space-y-4">
            {/* Player Container */}
            <div 
                className="relative bg-gray-100 rounded-xl border border-gray-200 aspect-video flex items-center justify-center overflow-hidden cursor-ew-resize select-none group"
                onMouseDown={(e) => { setIsDragging(true); startX.current = e.clientX; }}
                onMouseMove={handleMouseMove}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
            >
                <img src={frameView[currentFrame]} alt="360 view" className="h-full object-contain" />
                
                {/* 360 Badge */}
                <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                    <RotateCw size={12} className="text-purple-600" /> {t("badge")}
                </div>

                {/* Instruction Overlay (Fade out on hover) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 pointer-events-none transition-opacity group-hover:opacity-50">
                    <MoveHorizontal size={14} /> {t("drag")}
                </div>
            </div>

            {/* === TRẠNG THÁI 2: CONTROL & UPLOAD BAR (Tách biệt) === */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                        {frameView.length}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700">{t("sequenceLoaded")}</span>
                        <span className="text-[10px] text-gray-500">{t("frame")} {currentFrame + 1}/{frameView.length}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Nút xóa */}
                    <button 
                        onClick={() => setFrameView([])}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title={t("delete")}
                    >
                        <Trash2 size={16} />
                    </button>
                    
                    {/* Nút re-upload */}
                    <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 shadow-sm transition-all">
                        <FolderOpen size={14} />
                        {t("changeFiles")}
                        <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
                    </label>
                </div>
            </div>
        </div>
      ) : (
        /* === TRẠNG THÁI 0: EMPTY STATE (Upload Zone) === */
        <label className="block w-full cursor-pointer group">
            <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 p-8 flex flex-col items-center justify-center text-center transition-all group-hover:bg-purple-50/50 group-hover:border-purple-300">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <RefreshCw className="w-6 h-6 text-purple-500" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">{t("uploadTitle")}</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-[200px]">{t("uploadDesc")}</p>
                <div className="mt-4 px-4 py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-600 shadow-sm group-hover:text-purple-700 group-hover:border-purple-200">
                    {t("chooseFiles")}
                </div>
            </div>
        </label>
      )}
    </div>
  );
};