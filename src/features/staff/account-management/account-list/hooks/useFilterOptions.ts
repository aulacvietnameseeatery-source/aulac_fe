'use client';

import { useState, useEffect } from 'react';
import { Role, AccountStatus } from '../types/staff-account.types';
import { staffAccountService } from '../services/staff-account.service';

interface UseFilterOptionsReturn {
  roles: Role[];
  statuses: AccountStatus[];
  isLoadingFilters: boolean;
}

export function useFilterOptions(): UseFilterOptionsReturn {
  const [roles, setRoles] = useState<Role[]>([]);
  const [statuses, setStatuses] = useState<AccountStatus[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      setIsLoadingFilters(true);
      try {
        const [rolesData, statusesData] = await Promise.all([
          staffAccountService.getActiveRoles(),
          staffAccountService.getAccountStatuses(),
        ]);
        setRoles(rolesData);
        setStatuses(statusesData);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchFilterOptions();
  }, []);

  return {
    roles,
    statuses,
    isLoadingFilters,
  };
}
