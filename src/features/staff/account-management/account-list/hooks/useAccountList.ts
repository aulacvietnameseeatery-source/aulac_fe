// src/features/staff/account-management/account-list/hooks/useAccountList.ts
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { StaffAccount } from "../types/staff-account.types";
import { staffAccountService } from "../services/staff-account.service";

export const useAccountList = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Pagination from URL
  const pageIndex = Number(searchParams.get("pageIndex")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;

  // 2. Filters as local state (không dùng URL để tránh reload)
  const [searchTerm, setSearchTerm] = useState("");
  const [roleId, setRoleId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<number | undefined>(undefined);

  // State for data from API
  const [accounts, setAccounts] = useState<StaffAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPage, setTotalPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // State for manual refresh
  const [refreshKey, setRefreshKey] = useState(0);

  // 2. Utility function to generate a new URL
  const createQueryString = useCallback(
    (name: string, value: string | number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, String(value));
      return params.toString();
    },
    [searchParams]
  );

  // 3. Fetch data whenever filters or pagination changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await staffAccountService.getStaffAccounts({
          pageIndex,
          pageSize,
          search: searchTerm,
          roleId: roleId,
          accountStatus: status,
        });

        if (res) {
          setAccounts(res.pageData);
          setTotalPage(res.totalPage);
          setTotalCount(res.totalCount);
        }
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pageIndex, pageSize, searchTerm, roleId, status, refreshKey]);

  // 4. Filter handlers (local state only, no URL changes)

  // Search
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Reset về trang 1 khi search
    if (pageIndex !== 1) {
      router.replace(`${pathname}?pageIndex=1&pageSize=${pageSize}`, { scroll: false });
    }
  };

  // Role filter
  const handleRoleChange = (newRoleId?: number) => {
    setRoleId(newRoleId);
    // Reset về trang 1 khi filter
    if (pageIndex !== 1) {
      router.replace(`${pathname}?pageIndex=1&pageSize=${pageSize}`, { scroll: false });
    }
  };

  // Status filter
  const handleStatusChange = (newStatus?: number) => {
    setStatus(newStatus);
    // Reset về trang 1 khi filter
    if (pageIndex !== 1) {
      router.replace(`${pathname}?pageIndex=1&pageSize=${pageSize}`, { scroll: false });
    }
  };

  const handlePageChange = (newPage: number) => {
    router.replace(`${pathname}?${createQueryString("pageIndex", newPage)}`, { scroll: false });
  };

  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", String(newSize));
    params.set("pageIndex", "1"); // Reset to page 1 when changing sizes for safety.
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const refresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return {
    accounts,
    isLoading,
    pagination: {
      pageIndex,
      pageSize,
      totalPage,
      totalCount,
    },
    filters: {
      searchTerm,
      roleId,
      status,
    },
    actions: {
      onSearchChange: handleSearchChange,
      onRoleChange: handleRoleChange,
      onStatusChange: handleStatusChange,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
      refresh,
    },
  };
};
