import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTableColumnSizingParams {
    getInitialWidth: (field: string) => number;
}

export const useTableColumnSizing = ({ getInitialWidth }: UseTableColumnSizingParams) => {
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const resizingStateRef = useRef<{ field: string; startX: number; startWidth: number } | null>(null);

    /**
     * Khởi tạo chiều rộng mặc định cho các cột từ getInitialWidth. Trả về Record<field, width>
     * Create by: DatND (15/1/2026)
     */
    const initWidths = useCallback((fields: string[]) => {
        const next: Record<string, number> = {};
        fields.forEach(field => {
            next[field] = getInitialWidth(field);
        });
        setColumnWidths(next);
    }, [getInitialWidth]);

    const getColumnWidth = useCallback((field: string) => {
        const fromState = columnWidths[field];
        if (fromState) return fromState;
        return getInitialWidth(field);
    }, [columnWidths, getInitialWidth]);

    /**
     * Tính toán chiều rộng mới khi kéo resize. Width tối thiểu là 10px
     * Create by: DatND (15/1/2026)
     */
    const handleMouseMove = useCallback((event: MouseEvent) => {
        const resizingState = resizingStateRef.current;
        if (!resizingState) return;
        const delta = event.clientX - resizingState.startX;
        const nextWidth = Math.max(10, resizingState.startWidth + delta);
        setColumnWidths(prev => ({ ...prev, [resizingState.field]: nextWidth }));
    }, []);

    const stopResize = useCallback(() => {
        resizingStateRef.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', stopResize);
    }, [handleMouseMove]);

    /**
     * Xử lý bắt đầu resize cột, lưu state và đăng ký mousemove, mouseup events
     * Create by: DatND (15/1/2026)
     */
    const startResize = useCallback((field: string, clientX: number) => {
        const width = getColumnWidth(field);
        resizingStateRef.current = { field, startX: clientX, startWidth: width };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', stopResize);
    }, [getColumnWidth, handleMouseMove, stopResize]);

    useEffect(() => {
        return () => stopResize();
    }, [stopResize]);

    return {
        columnWidths,
        resizingState: resizingStateRef.current,
        initWidths,
        getColumnWidth,
        startResize,
        stopResize
    };
};
