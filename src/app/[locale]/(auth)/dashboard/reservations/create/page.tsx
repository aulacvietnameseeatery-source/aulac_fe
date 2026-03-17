'use client'

import { useTranslations } from "next-intl";  
import React from 'react';
import { BookingDetailsSection, CustomerSection, StatusSection, TableSelectionGrid, useReservationForm } from '@/features/staff/reservation-create';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const CreateReservationPage = () => {
  const t = useTranslations("StaffReservation");
  const router = useRouter();
  const { formState, tableState, loadingState, setters, handlers } = useReservationForm(t);

  return (
    <div className="min-h-screen font-sans text-slate-800 flex justify-center">
      <div className="w-full flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t("title")}</h1>
            <p className="text-slate-500 mt-1">{t("subtitle")}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border border-[#D5BA98]/60 overflow-hidden">
          
          {/* Customer Section */}
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

          {/* Booking & Table Section */}
          <div className="p-8 space-y-8">
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
              tables={tableState.tables}
              selectedTableId={tableState.selectedTableId}
              isLoading={tableState.isLoadingTables}
              isChecked={tableState.isTableChecked}
              onSelectTable={setters.setSelectedTableId}
            />

            <StatusSection 
              source={formState.source}
              status={formState.status}
              onSourceChange={handlers.handleSourceChange}
              onStatusChange={setters.setStatus}
            />
          </div>

          {/* Footer */}
          <div className="bg-slate-50 p-6 border-t border border-[#D5BA98]/60 flex justify-end gap-4">
            <Button 
              type="button"
              variant="outline"
              onClick={() => router.back()} 
              className="px-6 py-2.5 font-semibold"
            >
              {t("cancel")}
            </Button>
            <Button 
              type="button"
              variant="default"
              onClick={handlers.handleSubmit}
              className="px-8 py-2.5 font-semibold shadow-md gap-2"
            >
              {t("save")}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateReservationPage;