import { useState, useCallback, useRef } from "react";
import { PaymentListDto } from "../types/payment-types";
import { staffPaymentService } from "../services/payment-service";
import { toast } from "sonner";
import type { TableDataChangeParams } from "@/types/table-data-change.types";

export const usePaymentList = () => {
    const [payments, setPayments] = useState<PaymentListDto[]>([]);
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
            // Lấy value từ cột filter method
            const methodFilter = params.filters?.["method"]?.value as string | undefined;
            const method = methodFilter || "All";

            const data = await staffPaymentService.getPayments({
                pageIndex: page,
                pageSize,
                search: params.search || "",
                method: method
            });

            if (currentFetchId === fetchIdRef.current) {
                setPayments(data.pageData);
                setTotalCount(data.totalCount);
            }
        } catch (error: any) {
            if (currentFetchId === fetchIdRef.current) {
                console.error("Failed to fetch payments:", error);
                toast.error(error.message || "Error loading payments");
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
        payments,
        isLoading,
        totalCount,
        paginationInfo,
        onDataChange: handleDataChange,
        refresh
    };
};