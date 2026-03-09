import { useState, useEffect } from "react";
import { supplierDetailService } from "../services/supplierDetailService";
import { SupplierDetail } from "../types";

export const useSupplierDetail = (id: number) => {
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupplierDetail = async () => {
      try {
        setIsLoading(true);
        const data = await supplierDetailService.getSupplierDetail(id);
        setSupplier(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load supplier details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupplierDetail();
  }, [id]);

  return { supplier, isLoading, error };
};
