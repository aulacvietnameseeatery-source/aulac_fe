'use client';

import { useState, useEffect } from 'react';
import { StaffAccount, StaffAccountFilters } from '../types/staff-account.types';
import { staffAccountService } from '../services/staff-account.service';

interface UseStaffAccountsReturn {
  staffList: StaffAccount[];
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: StaffAccountFilters;
  setFilters: React.Dispatch<React.SetStateAction<StaffAccountFilters>>;
  handleSearchChange: (search: string) => void;
  handleRoleChange: (roleId?: number) => void;
  handleStatusChange: (accountStatus?: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  handlePageChange: (pageIndex: number) => void;
}

export function useStaffAccounts(): UseStaffAccountsReturn {
  const [filters, setFilters] = useState<StaffAccountFilters>({
    pageIndex: 1,
    pageSize: 10,
  });

  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch staff accounts when filters change
  useEffect(() => {
    const fetchStaffAccounts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await staffAccountService.getStaffAccounts(filters);
        setStaffList(result.pageData || []);
        setTotalItems(result.totalCount || 0);
        setTotalPages(result.totalPage || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch staff accounts');
        console.error('Error fetching staff accounts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffAccounts();
  }, [filters]);

  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search, pageIndex: 1 });
  };

  const handleRoleChange = (roleId?: number) => {
    setFilters({ ...filters, roleId, pageIndex: 1 });
  };

  const handleStatusChange = (accountStatus?: number) => {
    setFilters({ ...filters, accountStatus, pageIndex: 1 });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters({ ...filters, pageSize, pageIndex: 1 });
  };

  const handlePageChange = (pageIndex: number) => {
    setFilters({ ...filters, pageIndex });
  };

  return {
    staffList,
    totalItems,
    totalPages,
    isLoading,
    error,
    filters,
    setFilters,
    handleSearchChange,
    handleRoleChange,
    handleStatusChange,
    handlePageSizeChange,
    handlePageChange,
  };
}
