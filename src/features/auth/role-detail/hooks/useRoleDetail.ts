
import { useState, useEffect } from "react";
import { getRoleDetail } from "../services/role-detail.service";
import { RoleDetailDto } from "../types/role-detail.types";

export const useRoleDetail = (roleId: number) => {
  const [roleDetail, setRoleDetail] = useState<RoleDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoleDetail = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getRoleDetail(roleId);
        if (data) {
          setRoleDetail(data);
        }
      } catch (err: any) {
        setError(err.message || err.response?.data?.userMessage || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (roleId) {
      fetchRoleDetail();
    }
  }, [roleId]);

  return { roleDetail, isLoading, error };
};
