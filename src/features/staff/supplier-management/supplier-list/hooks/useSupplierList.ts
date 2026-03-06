"use client";

import { useState, useCallback } from "react";
import { Supplier, SupplierFilters } from "../types";
import { listSupplierService } from "../services/listSupplierService";
import type { FilterState } from '@/hooks/table/useTableFiltering';
import type { SortStateItem } from '@/hooks/table/useTableSorting';

export const useSupplierList = () => {
  // Data State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    pageSize: 10,
  });

  // Fetch suppliers from API - compatible with BaseTable onDataChange
  const onDataChange = useCallback((params: {
    search?: string;
    filters?: Record<string, FilterState>;
    sort?: SortStateItem[];
    page?: number;
    pageSize?: number;
  }) => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const apiFilters: SupplierFilters = {
          search: params.search || undefined,
          pageIndex: params.page || 1,
          pageSize: params.pageSize || 10,
        };

        const result = await listSupplierService.getSuppliers(apiFilters);
        
        setSuppliers(result.pageData);
        setTotalCount(result.totalCount);
        setPaginationInfo({
          page: params.page || 1,
          pageSize: params.pageSize || 10,
        });
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        setSuppliers([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refresh function
  const refresh = useCallback(() => {
    // Trigger a re-fetch by calling onDataChange with current pagination
    onDataChange({
      page: paginationInfo.page,
      pageSize: paginationInfo.pageSize,
    });
  }, [paginationInfo, onDataChange]);

  return {
    suppliers,
    isLoading,
    totalCount,
    paginationInfo,
    onDataChange,
    refresh,
  };
};
