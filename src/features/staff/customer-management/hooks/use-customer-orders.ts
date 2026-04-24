import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { CustomerOrderDto } from "../types/customer-detail-types";
import { customerDetailService } from "../services/customer-detail-service";
import { toast } from "sonner";
import type { TableDataChangeParams } from "@/types/table-data-change.types";

export const useCustomerOrders = (customerId: number) => {
    const t = useTranslations("Customer.List.notifications");
    const [orders, setOrders] = useState<CustomerOrderDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [paginationInfo, setPaginationInfo] = useState({ page: 1, pageSize: 12 });

    const fetchIdRef = useRef(0);

    const onDataChange = useCallback(async (params: TableDataChangeParams) => {
        const currentFetchId = ++fetchIdRef.current;
        const page = params.page || 1;
        const pageSize = params.pageSize || 12;

        setPaginationInfo({ page, pageSize });
        setIsLoading(true);

        try {
            // Lấy từ filter của BaseTable nếu có (Giả sử field name là fromDate, toDate, type)
            const fromDate = params.filters?.["fromDate"]?.value;
            const toDate = params.filters?.["toDate"]?.value;
            const type = params.filters?.["orderType"]?.value;

            const data = await customerDetailService.getOrders({
                customerId,
                pageIndex: page,
                pageSize,
                fromDate,
                toDate,
                orderType: type ? type : undefined
            });

            if (currentFetchId === fetchIdRef.current) {
                setOrders(data.pageData);
                setTotalCount(data.totalCount);
            }
        } catch (error: any) {
            if (currentFetchId === fetchIdRef.current) toast.error(t("loadOrdersError"));
        } finally {
            if (currentFetchId === fetchIdRef.current) setIsLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        if (customerId) {
            onDataChange({ page: 1, pageSize: 12 });
        }
    }, [customerId, onDataChange]);

    return { orders, isLoading, totalCount, paginationInfo, onDataChange };
};