'use client'

import { useTranslations } from "next-intl";  
import React from 'react';
import { BookingDetailsSection, CustomerSection, StatusSection, TableSelectionGrid, useReservationForm } from '@/features/staff/reservation-create';

const CreateReservationPage = () => {
  const t = useTranslations("StaffReservation");
  const { formState, tableState, loadingState, setters, handlers } = useReservationForm(t);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-6 flex justify-center">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t("title")}</h1>
            <p className="text-slate-500 mt-1">{t("subtitle")}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
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
          <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end gap-4">
            <button className="px-6 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 transition">
              {t("cancel")}
            </button>
            <button 
              onClick={handlers.handleSubmit}
              className="px-8 py-2.5 rounded-lg bg-[#1A3A52] text-white font-semibold hover:bg-[#152E41] transition shadow-md flex items-center gap-2"
            >
              {t("save")}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateReservationPage;