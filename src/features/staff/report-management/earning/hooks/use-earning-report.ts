import { useState, useEffect, useCallback } from "react";
import { EarningRecordDto, EarningFilterParams } from "../types/report-types";

export const useEarningReport = () => {
    const [data, setData] = useState<EarningRecordDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<EarningFilterParams>({});

    const fetchReportData = useCallback(async () => {
        setIsLoading(true);
        try {
            // TODO: await reportService.getEarningReport(filters)
            setTimeout(() => {
                setData([
                    { earningId: "#ERN0016", date: "2025-11-01", orderId: "#23588", customerName: "Walk-in Customer", orderType: "Dine In", paymentMethod: "Credit Card", grandTotal: 34.50, status: "Completed" },
                    { earningId: "#ERN0015", date: "2025-11-01", orderId: "#23587", customerName: "Sue Allen", orderType: "Take Away", paymentMethod: "Cash", grandTotal: 78.20, status: "Completed" },
                    { earningId: "#ERN0014", date: "2025-11-01", orderId: "#23586", customerName: "Frank Barrett", orderType: "Dine In", paymentMethod: "PayPal", grandTotal: 45.10, status: "Completed" },
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

    const updateFilter = (newFilters: Partial<EarningFilterParams>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    return { data, isLoading, filters, updateFilter, refresh: fetchReportData };
};