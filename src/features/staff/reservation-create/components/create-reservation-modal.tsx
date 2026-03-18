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
  const t = useTranslations("StaffReservation");
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
      bodyOverflowY="hidden"
    >
      <div className="flex h-[min(76dvh,700px)] flex-col">
        <div className="flex-1 min-h-0 p-3 sm:p-5 space-y-4 sm:space-y-5 overflow-hidden">
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

        <div className="shrink-0 bg-slate-50 border-t border-slate-200 px-3 sm:px-5 py-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button type="button" onClick={handlers.handleSubmit}>
            {t("save")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
