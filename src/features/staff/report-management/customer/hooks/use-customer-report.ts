import { useState, useEffect, useCallback } from "react";
import { CustomerReportRecordDto, CustomerFilterParams } from "../types/customer-report-types";

export const useCustomerReport = () => {
    const [data, setData] = useState<CustomerReportRecordDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<CustomerFilterParams>({});

    const fetchReportData = useCallback(async () => {
        setIsLoading(true);
        setTimeout(() => {
            setData([
                { customerId: "#CUS0016", customerName: "Walk-in Customer", totalOrders: 32, grandTotal: 1000 },
                { customerId: "#CUS0015", customerName: "Sue Allen", totalOrders: 45, grandTotal: 1500 },
                { customerId: "#CUS0014", customerName: "Frank Barrett", totalOrders: 70, grandTotal: 1200 },
                { customerId: "#CUS0013", customerName: "Kelley Davis", totalOrders: 53, grandTotal: 800 },
                { customerId: "#CUS0012", customerName: "Jim Vickers", totalOrders: 34, grandTotal: 750 },
            ]);
            setIsLoading(false);
        }, 500);
    }, [filters]);

    useEffect(() => { fetchReportData(); }, [fetchReportData]);

    return { data, isLoading, filters, refresh: fetchReportData };
};