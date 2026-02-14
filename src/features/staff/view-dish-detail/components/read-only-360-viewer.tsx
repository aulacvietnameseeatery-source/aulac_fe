import React, { useState, useRef } from "react";
import { RotateCw, MoveHorizontal } from "lucide-react";

export const ReadOnly360Viewer = ({ images }: { images: string[] }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const startX = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  if (!images || images.length === 0) return null;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 10) {
      const direction = delta > 0 ? 1 : -1;
      setCurrentFrame(prev => {
        let next = prev - direction;
        if (next < 0) next = images.length - 1;
        if (next >= images.length) next = 0;
        return next;
      });
      startX.current = e.clientX;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
         <RotateCw size={16} className="text-purple-600" />
         <h4 className="text-sm font-bold text-gray-900">360° Interactive View</h4>
      </div>
      <div 
        className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-ew-resize border border-gray-200"
        onMouseDown={(e) => { setIsDragging(true); startX.current = e.clientX; }}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <img src={images[currentFrame]} alt="360 view" className="w-full h-full object-contain" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-[10px] font-medium flex items-center gap-1 pointer-events-none backdrop-blur-sm">
           <MoveHorizontal size={12} /> Drag to rotate
        </div>
      </div>
    </div>
  );
};