"use client";

import { useState, useCallback, useRef } from "react";
import { CouponDTO, CouponFilters } from "../types/coupon.types";
import { couponListService } from "../services/coupon-list-service";
import type { TableDataChangeParams } from '@/types/table-data-change.types';

export const useCouponList = () => {
  // Data State
  const [coupons, setCoupons] = useState<CouponDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    pageSize: 10,
  });

  // Dedup + latest-request tracking
  const latestParamsRef = useRef<TableDataChangeParams>({});
  const lastFetchHashRef = useRef("");
  const fetchIdRef = useRef(0);

  // Fetch coupons from API - compatible with BaseTable onDataChange
  const onDataChange = useCallback(async (params: TableDataChangeParams) => {
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
      const apiFilters: CouponFilters = {
        search: params.search || undefined,
        pageIndex: page,
        pageSize,
      };

      const result = await couponListService.getCoupons(apiFilters);

      if (currentFetchId === fetchIdRef.current) {
        setCoupons(result.pageData);
        setTotalCount(result.totalCount);
      }
    } catch (error) {
      if (currentFetchId === fetchIdRef.current) {
        console.error("Error fetching coupons:", error);
        setCoupons([]);
        setTotalCount(0);
      }
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Refresh function
  const refresh = useCallback(() => {
    lastFetchHashRef.current = "";
    onDataChange(latestParamsRef.current);
  }, [onDataChange]);

  return {
    coupons,
    isLoading,
    totalCount,
    paginationInfo,
    onDataChange,
    refresh,
  };
};
