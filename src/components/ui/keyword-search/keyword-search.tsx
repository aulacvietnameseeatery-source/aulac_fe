// src/components/shared/keyword-search.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // Giả sử bạn có utility cn, nếu không thì dùng template string thường

export interface KeywordSearchProps {
  value: string;
  placeholder?: string;
  loading?: boolean;
  debounceMs?: number;
  className?: string; // Để custom style container nếu cần
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
}

export function KeywordSearch({
  value,
  placeholder = "Search...",
  loading = false,
  debounceMs = 500,
  className,
  onChange,
  onSearch,
  onClear,
}: KeywordSearchProps) {
  // 1. State nội bộ để hiển thị text ngay khi user gõ
  const [localValue, setLocalValue] = useState(value);
  const isFirstMount = useRef(true);

  // 2. Đồng bộ: Nếu value từ Cha (URL) thay đổi -> Cập nhật local
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // 3. Xử lý Debounce: Chỉ gọi onChange khi ngừng gõ sau debounceMs
  useEffect(() => {
    // Bỏ qua lần render đầu tiên để tránh gọi onChange khi vừa mount
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const handler = setTimeout(() => {
      // Chỉ gọi ra ngoài nếu giá trị thực sự khác với giá trị hiện tại ở Cha
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localValue, debounceMs]); // Không thêm 'value' hay 'onChange' để tránh loop

  // 4. Handle Actions
  const handleClear = () => {
    setLocalValue("");
    onChange("");
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch?.(localValue);
      // Nếu muốn Enter trigger search ngay lập tức bỏ qua debounce:
      onChange(localValue); 
    }
  };

  return (
    <div className={cn("relative w-full md:w-80", className)}>
      {/* Icon Search (Left) */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className="text-gray-400" />
      </div>

      <input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                   shadow-sm transition-all placeholder:text-gray-400"
      />

      {/* Loading & Clear Icons (Right) */}
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
        {loading ? (
          <Loader2 size={16} className="animate-spin text-blue-500" />
        ) : localValue ? (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
}