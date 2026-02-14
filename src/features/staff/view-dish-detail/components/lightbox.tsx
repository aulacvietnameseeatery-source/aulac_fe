import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { BASE_URL } from "@/lib/http";

type Props = {
  images: string[];
  initialIndex: number;
  onClose: () => void;
};

export const Lightbox = ({ images, initialIndex, onClose }: Props) => {
  const [index, setIndex] = useState(initialIndex);

  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIndex((prev) => (prev + 1) % images.length); };
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIndex((prev) => (prev - 1 + images.length) % images.length); };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((prev) => (prev + 1) % images.length);
      if (e.key === "ArrowLeft") setIndex((prev) => (prev - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-in fade-in duration-200" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white p-2"><X size={32} /></button>
      <button onClick={prev} className="absolute left-4 text-white/50 hover:text-white p-2"><ChevronLeft size={48} /></button>
      
      {/* BASE_URL xử lý ở đây hoặc truyền full url từ ngoài */}
      <img src={`${BASE_URL}${images[index]}`} alt="Fullscreen" className="max-h-[90vh] max-w-[90vw] object-contain select-none" onClick={(e) => e.stopPropagation()} />
      
      <button onClick={next} className="absolute right-4 text-white/50 hover:text-white p-2"><ChevronRight size={48} /></button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">{index + 1} / {images.length}</div>
    </div>
  );
};