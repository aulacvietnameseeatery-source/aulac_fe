"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BookingDetailsSection,
  CustomerSection,
  TableSelectionGrid,
  useReservationForm,
} from "@/features/staff/reservation-create";
import { useTranslations } from "next-intl";

interface CreateReservationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateReservationModal = ({
  onClose,
  onSuccess,
}: CreateReservationModalProps) => {
  const t = useTranslations("reservations.staff");
  const { formState, tableState, loadingState, setters, handlers } =
    useReservationForm(t, {
      onSuccess,
    });

  return (
    <Dialog
      open={true}
      onClose={onClose}
      title={t("title")}
      width="min(960px, 96vw)"
      bodyOverflowY="auto"
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 w-full">
          <Button variant="outline" type="button" onClick={onClose} className="sm:w-32">
            {t("cancel")}
          </Button>
          <Button type="button" onClick={handlers.handleSubmit} className="sm:w-32">
            {t("save")}
          </Button>
        </div>
      }
    >
      <div className="p-4 sm:p-6 space-y-6 pb-2">
        <CustomerSection
          phone={formState.phone}
          fullName={formState.fullName}
          email={formState.email}
          customerType={formState.customerType}
          loyaltyPoints={formState.loyaltyPoints}
          isSearching={loadingState.isSearchingCustomer}
          onPhoneChange={setters.setPhone}
          onNameChange={setters.setFullName}
          onEmailChange={setters.setEmail}
          onSearch={handlers.handleCustomerSearch}
        />

        <BookingDetailsSection
          date={formState.date}
          time={formState.time}
          partySize={formState.partySize}
          validationError={formState.validationError}
          onDateChange={setters.setDate}
          onTimeChange={setters.setTime}
          onSizeChange={setters.setPartySize}
        />

        <TableSelectionGrid
          options={tableState.tableOptions}
          selectedOptionId={tableState.selectedOptionId}
          isLoading={tableState.isLoadingTables}
          isChecked={tableState.isTableChecked}
          onSelectOption={setters.setSelectedOptionId}
          compact
        />
      </div>
    </Dialog>
  );
};
