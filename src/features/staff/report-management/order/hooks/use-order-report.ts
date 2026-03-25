import { useState, useEffect, useCallback } from "react";
import { OrderReportRecordDto, OrderFilterParams } from "../types/order-report-types";

export const useOrderReport = () => {
    const [data, setData] = useState<OrderReportRecordDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<OrderFilterParams>({});

    const fetchReportData = useCallback(async () => {
        setIsLoading(true);
        try {
            // TODO:  await reportService.getOrderReport(filters)
            setTimeout(() => {
                setData([
                    { orderId: "#23588", date: "01 Nov 2025", customerName: "Walk-in Customer", tokenNo: "16", orderType: "Dine In", menusCount: 3, grandTotal: 34.50, status: "Paid" },
                    { orderId: "#23587", date: "01 Nov 2025", customerName: "Sue Allen", tokenNo: "15", orderType: "Take Away", menusCount: 7, grandTotal: 78.20, status: "Paid" },
                    { orderId: "#23586", date: "01 Nov 2025", customerName: "Frank Barrett", tokenNo: "14", orderType: "Dine In", menusCount: 4, grandTotal: 45.10, status: "Paid" },
                    { orderId: "#23585", date: "01 Nov 2025", customerName: "Kelley Davis", tokenNo: "13", orderType: "Take Away", menusCount: 9, grandTotal: 92.80, status: "Paid" },
                    { orderId: "#23584", date: "01 Nov 2025", customerName: "Jim Vickers", tokenNo: "12", orderType: "Dine In", menusCount: 6, grandTotal: 61.40, status: "Paid" },
                ]);
                setIsLoading(false);
            }, 500);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    const updateFilter = (newFilters: Partial<OrderFilterParams>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    return { data, isLoading, filters, updateFilter, refresh: fetchReportData };
};