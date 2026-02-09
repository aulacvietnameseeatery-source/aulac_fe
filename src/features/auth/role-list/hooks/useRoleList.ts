// src/features/auth/role-list/hooks/useRoleList.ts
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { RoleDto } from "../types/role.types";
import { getRoles } from "../services/role.service";

export const useRoleList = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Get the state from the URL (if not available, use the default value).
  const pageIndex = Number(searchParams.get("pageIndex")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 5;
  const searchParam = searchParams.get("search") || "";

  // State cục bộ cho dữ liệu API
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Default is false to avoid flash loading if using SSR, or true if using pure CSR.
  const [totalPage, setTotalPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 2. Utility function to generate a new URL
  const createQueryString = useCallback(
    (name: string, value: string | number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, String(value));
      return params.toString();
    },
    [searchParams]
  );

  // 3. Fetch data whenever the URL changes (pageIndex, pageSize, searchParam).
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await getRoles({
          pageIndex,
          pageSize,
          search: searchParam,
        });

        if (res) {
          setRoles(res.pageData);
          setTotalPage(res.totalPage);
          setTotalCount(res.totalCount);
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pageIndex, pageSize, searchParam]); 

  // 4. URL update actions
  
  // Search: Reset to page 1 when search results change.
  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("pageIndex", "1"); // Always reset to page 1 when filtering.
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    router.push(`${pathname}?${createQueryString("pageIndex", newPage)}`);
  };

  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", String(newSize));
    params.set("pageIndex", "1"); // Reset to page 1 when changing sizes for safety.
    router.push(`${pathname}?${params.toString()}`);
  };

  const refresh = () => {
    router.refresh(); // Reload the current route.
  };

  return {
    roles,
    isLoading,
    pagination: {
      pageIndex,
      pageSize,
      totalPage,
      totalCount,
    },
    searchTerm: searchParam, // Returns the current search value from the URL.
    actions: {
      onSearchChange: handleSearchChange,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
      refresh,
    },
  };
};