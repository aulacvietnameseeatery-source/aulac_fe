import { useState, useEffect, useCallback } from "react";
import { SalesReportRecordDto, SalesFilterParams } from "../types/sales-report-types";

export const useSalesReport = () => {
    const [data, setData] = useState<SalesReportRecordDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<SalesFilterParams>({});

    const fetchReportData = useCallback(async () => {
        setIsLoading(true);
        try {
            // TODO: await reportService.getSalesReport(filters)
            setTimeout(() => {
                setData([
                    { salesId: "#SA0016", date: "01 Nov 2025", category: "Sea Food", itemsSold: 28, totalOrders: 32, grandTotal: 1000, status: "Completed" },
                    { salesId: "#SA0015", date: "01 Nov 2025", category: "Pizza", itemsSold: 42, totalOrders: 45, grandTotal: 1500, status: "Completed" },
                    { salesId: "#SA0014", date: "01 Nov 2025", category: "Salads", itemsSold: 66, totalOrders: 70, grandTotal: 1200, status: "Completed" },
                    { salesId: "#SA0013", date: "01 Nov 2025", category: "Tacos", itemsSold: 48, totalOrders: 53, grandTotal: 800, status: "Completed" },
                    { salesId: "#SA0012", date: "01 Nov 2025", category: "Burgers", itemsSold: 24, totalOrders: 34, grandTotal: 750, status: "Completed" },
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

    const updateFilter = (newFilters: Partial<SalesFilterParams>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    return { data, isLoading, filters, updateFilter, refresh: fetchReportData };
};