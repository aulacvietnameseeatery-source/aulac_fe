// src/features/view-dish-detail/components/DishTagList.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { 
  Flame,    // Hỏa
  Droplets, // Thủy
  Leaf,     // Mộc
  Mountain, // Thổ
  Gem,      // Kim (hoặc dùng Shield/Hexagon)
  Tag       // Mặc định
} from "lucide-react";

// Định nghĩa cấu hình cho từng nguyên tố
const ELEMENT_CONFIG: Record<string, { style: string, icon: React.ElementType, label: string }> = {
  FIRE: {
    style: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
    icon: Flame,
    label: "Hỏa (Fire)"
  },
  WATER: {
    style: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    icon: Droplets,
    label: "Thủy (Water)"
  },
  WOOD: {
    style: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    icon: Leaf,
    label: "Mộc (Wood)"
  },
  EARTH: {
    style: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    icon: Mountain,
    label: "Thổ (Earth)"
  },
  METAL: {
    style: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200",
    icon: Gem,
    label: "Kim (Metal)"
  },
};

const DEFAULT_CONFIG = {
  style: "bg-gray-50 text-gray-600 border-gray-200",
  icon: Tag,
  label: "Unknown"
};

type Props = {
  tag?: string; 
};

export const DishTag = ({ tag }: Props) => {
  if (!tag) return null;

  const key = tag.toUpperCase();
  const config = ELEMENT_CONFIG[key] || { ...DEFAULT_CONFIG, label: tag };
  const Icon = config.icon;

  return (
    <div className="">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border transition-colors cursor-default select-none uppercase tracking-wider",
          config.style
        )}
      >
        <Icon size={14} strokeWidth={2.5} />
        {key} {/* Hoặc dùng {config.label} nếu muốn hiển thị tên đẹp hơn */}
      </span>
    </div>
  );
};