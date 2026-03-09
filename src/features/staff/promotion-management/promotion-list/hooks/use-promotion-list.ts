import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { PromotionListDTO } from "../types/promotion-types";
import { staffPromotionService } from "../services/promotion-service";
import type { TableDataChangeParams } from "@/types/table-data-change.types";

export const usePromotionList = () => {
    const [promotions, setPromotions] = useState<PromotionListDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [paginationInfo, setPaginationInfo] = useState({ page: 1, pageSize: 10 });

    const latestParamsRef = useRef<TableDataChangeParams>({});
    const lastFetchHashRef = useRef("");
    const fetchIdRef = useRef(0);

    const handleDataChange = useCallback(async (params: TableDataChangeParams) => {
        const hash = JSON.stringify(params);
        if (hash === lastFetchHashRef.current) return;
        lastFetchHashRef.current = hash;
        latestParamsRef.current = params;

        const currentFetchId = ++fetchIdRef.current;
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;

        setPaginationInfo({ page, pageSize });
        setIsLoading(true);

        try {
            const promotionStatus = params.filters?.["promotionStatus"]?.value || "All";
            const type = params.filters?.["type"]?.value || "All";

            const fromDate = params.filters?.["fromDate"]?.value;
            const toDate = params.filters?.["toDate"]?.value;

            const data = await staffPromotionService.getPromotions({
                pageIndex: page,
                pageSize,
                search: params.search || "",
                fromDate,
                toDate
            });

            if (currentFetchId === fetchIdRef.current) {
                setPromotions(data.pageData);
                setTotalCount(data.totalCount);
            }
        } catch (error: any) {
            if (currentFetchId === fetchIdRef.current) {
                console.error("Failed to fetch promotions:", error);
                toast.error(error.message || "Error loading promotions");
            }
        } finally {
            if (currentFetchId === fetchIdRef.current) {
                setIsLoading(false);
            }
        }
    }, []);

    const refresh = useCallback(() => {
        lastFetchHashRef.current = "";
        handleDataChange(latestParamsRef.current);
    }, [handleDataChange]);

    return {
        promotions,
        isLoading,
        totalCount,
        paginationInfo,
        onDataChange: handleDataChange,
        refresh,
        updatePromotionLocally: (updatedPromo: PromotionListDTO) => {
            setPromotions(prev => prev.map(p => p.promotionId === updatedPromo.promotionId ? updatedPromo : p));
        },
    };
};