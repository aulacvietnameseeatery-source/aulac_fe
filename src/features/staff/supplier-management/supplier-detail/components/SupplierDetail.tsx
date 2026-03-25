"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSupplierDetail } from "../hooks/useSupplierDetail";
import FormHeader from './FormHeader';
import FormCard from './FormCard';
import SupplierNameDisplay from './SupplierNameDisplay';
import PhoneDisplay from './PhoneDisplay';
import EmailDisplay from './EmailDisplay';
import AddressDisplay from './AddressDisplay';
import TaxCodeDisplay from './TaxCodeDisplay';
import IngredientsDisplay from './IngredientsDisplay';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

export function SupplierDetail() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("Supplier.Detail");
  const supplierId = Number(params.id);

  const { supplier, isLoading, error } = useSupplierDetail(supplierId);

  const handleBack = () => {
    router.push("/dashboard/suppliers");
  };

  const handleEdit = () => {
    router.push(`/dashboard/suppliers/edit/${supplierId}`);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !supplier) {
    return (
      <ErrorState
        error={error || t("notFound")}
        onBackToList={handleBack}
      />
    );
  }

  return (
    <div className="bg-white">
      <div className="px-8">
        <FormHeader
          title={t("title")}
          subtitle={t("subtitle")}
          onBack={handleBack}
          onEdit={handleEdit}
        />

        <FormCard>
          <SupplierNameDisplay value={supplier.supplierName} />
          
          <PhoneDisplay value={supplier.phone || ''} />

          <EmailDisplay value={supplier.email || ''} />

          <AddressDisplay value={supplier.address || ''} />

          <TaxCodeDisplay value={supplier.taxCode || ''} />

          <IngredientsDisplay ingredients={supplier.ingredients} />
        </FormCard>
      </div>
    </div>
  );
}
