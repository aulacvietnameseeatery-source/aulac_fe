import { useState, useCallback, useRef } from "react";
import { CustomerListDto } from "../types/customer-types";
import { staffCustomerService } from "../services/customer-service";
import { toast } from "sonner";
import type { TableDataChangeParams } from "@/types/table-data-change.types";

export const useCustomerList = () => {
    const [customers, setCustomers] = useState<CustomerListDto[]>([]);
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
            // Lấy value từ cột filter
            const isMemberFilter = params.filters?.["isMember"]?.value;
            let isMember: boolean | "All" = "All";
            if (isMemberFilter === "true") isMember = true;
            if (isMemberFilter === "false") isMember = false;

            const data = await staffCustomerService.getCustomers({
                pageIndex: page,
                pageSize,
                search: params.search || "",
                isMember: isMember
            });

            if (currentFetchId === fetchIdRef.current) {
                setCustomers(data.pageData);
                setTotalCount(data.totalCount);
            }
        } catch (error: any) {
            if (currentFetchId === fetchIdRef.current) {
                console.error("Failed to fetch customers:", error);
                toast.error(error.message || "Error loading customers");
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
        customers,
        isLoading,
        totalCount,
        paginationInfo,
        onDataChange: handleDataChange,
        refresh
    };
};