import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ALInput } from "@/components/ui/al-input";
import {
  BookingDetailsSection,
  CustomerSection,
  TableSelectionGrid,
} from "@/features/staff/reservation-create";
import {
  ReservationCustomerLookupDto,
  ReservationDetailDto,
  ReservationTableOptionDto,
} from "../types/reservation-types";
import { reservationService } from "../services/reservation-service";
import { dateUtils } from "@/lib/date-utils";

interface EditReservationModalProps {
  reservationId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const buildOptionKey = (tableIds: number[]) => [...tableIds].sort((a, b) => a - b).join("-");

const toCurrentOption = (
  detail: ReservationDetailDto,
  reservedTime: string
): ReservationTableOptionDto | null => {
  if (!detail.tables || detail.tables.length === 0) {
    return null;
  }

  const sortedTables = [...detail.tables].sort((a, b) => a.tableCode.localeCompare(b.tableCode));
  const tableIds = sortedTables.map((t) => t.tableId);
  const totalCapacity = sortedTables.reduce((sum, t) => sum + t.capacity, 0);

  return {
    optionId: `current-${buildOptionKey(tableIds)}-${reservedTime}`,
    tableIds,
    tableCodes: sortedTables.map((t) => t.tableCode).join(" + "),
    zone: sortedTables[0]?.zone ?? "",
    totalCapacity,
    excessCapacity: Math.max(0, totalCapacity - detail.partySize),
    tableCount: sortedTables.length,
    isBestFit: false,
  };
};

export const EditReservationModal = ({
  reservationId,
  onClose,
  onSuccess,
}: EditReservationModalProps) => {
  const tStaff = useTranslations("reservations.staff");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [customerType, setCustomerType] = useState<"new" | "member">("new");
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  const [initialDate, setInitialDate] = useState("");
  const [initialTime, setInitialTime] = useState("");
  const [initialPartySize, setInitialPartySize] = useState<number>(0);
  const [initialCurrentOption, setInitialCurrentOption] = useState<ReservationTableOptionDto | null>(null);

  const [tableOptions, setTableOptions] = useState<ReservationTableOptionDto[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isTableChecked, setIsTableChecked] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isCoreBookingChanged =
    date !== initialDate || time !== initialTime || Number(partySize || 0) !== initialPartySize;

  const selectedOption = useMemo(
    () => tableOptions.find((option) => option.optionId === selectedOptionId) ?? null,
    [tableOptions, selectedOptionId]
  );

  const validateDateTime = (selectedDate: string, selectedTime: string): boolean => {
    if (!selectedDate || !selectedTime) {
      setValidationError(null);
      return true;
    }

    // Allow initial date/time even if in the past (e.g. when opening an existing record)
    if (selectedDate === initialDate && selectedTime === initialTime) {
      setValidationError(null);
      return true;
    }

    if (dateUtils.isPast(selectedDate, selectedTime)) {
      setValidationError(tStaff("errors.timePast"));
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleCustomerSearch = async () => {
    if (!phone) {
      return;
    }

    setIsSearchingCustomer(true);
    try {
      const customer: ReservationCustomerLookupDto | null = await reservationService.searchCustomerByPhone(phone);
      if (!customer) {
        return;
      }
      setFullName(customer.fullName ?? "");
      setEmail(customer.email ?? "");
      setCustomerType(customer.isMember ? "member" : "new");
      setLoyaltyPoints(customer.loyaltyPoints ?? 0);
    } catch {
      toast.error(tStaff("errors.systemError"));
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const detail = await reservationService.getReservationDetail(reservationId);
        const initialDateValue = dateUtils.formatLocal(detail.reservedTime, "yyyy-MM-dd");
        const initialTimeValue = dateUtils.formatLocal(detail.reservedTime, "HH:mm");

        setPhone(detail.phone ?? "");
        setFullName(detail.customerName ?? "");
        setEmail(detail.email ?? "");
        setDate(initialDateValue);
        setTime(initialTimeValue);
        setPartySize(detail.partySize);
        setNotes(detail.notes ?? "");

        setInitialDate(initialDateValue);
        setInitialTime(initialTimeValue);
        setInitialPartySize(detail.partySize);

        const currentOption = toCurrentOption(detail, detail.reservedTime);
        setInitialCurrentOption(currentOption);
        setSelectedOptionId(currentOption?.optionId ?? null);
      } catch {
        toast.error(tStaff("errors.systemError"));
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [reservationId, onClose]);

  useEffect(() => {
    const fetchTableOptions = async () => {
      if (!date || !time || !partySize) {
        setTableOptions([]);
        setSelectedOptionId(null);
        return;
      }

      if (!validateDateTime(date, time)) {
        setTableOptions([]);
        setSelectedOptionId(null);
        return;
      }

      setIsLoadingTables(true);
      setIsTableChecked(true);

      try {
        const fetched = await reservationService.getManualTableOptions(date, time, Number(partySize));
        let merged = [...fetched];

        if (!isCoreBookingChanged && initialCurrentOption) {
          const existingKeys = new Set(merged.map((option) => buildOptionKey(option.tableIds)));
          const currentKey = buildOptionKey(initialCurrentOption.tableIds);
          if (!existingKeys.has(currentKey)) {
            merged = [initialCurrentOption, ...merged];
          }
        }

        setTableOptions(merged);

        setSelectedOptionId((prev) => {
          if (prev && merged.some((option) => option.optionId === prev)) {
            return prev;
          }

          if (!isCoreBookingChanged && initialCurrentOption) {
            const currentStillExists = merged.find(
              (option) => buildOptionKey(option.tableIds) === buildOptionKey(initialCurrentOption.tableIds)
            );
            if (currentStillExists) {
              return currentStillExists.optionId;
            }
          }

          return merged[0]?.optionId ?? null;
        });
      } catch {
        setTableOptions([]);
        setSelectedOptionId(null);
      } finally {
        setIsLoadingTables(false);
      }
    };

    const timer = setTimeout(fetchTableOptions, 350);
    return () => clearTimeout(timer);
  }, [date, time, partySize, initialCurrentOption, isCoreBookingChanged]);

  const handleSubmit = async () => {
    if (!phone || !fullName || !date || !time || !partySize || !selectedOption) {
      toast.error(tStaff("errors.missingTitle"), {
        description: tStaff("errors.missingDescription"),
      });
      return;
    }

    if (!validateDateTime(date, time)) {
      toast.error(tStaff("errors.timeErrorTitle"), { description: validationError ?? tStaff("errors.timePast") });
      return;
    }

    setIsSubmitting(true);
    try {
      await reservationService.updateReservation(reservationId, {
        customerName: fullName,
        phone,
        email: email || null,
        partySize: Number(partySize),
        reservedTime: dateUtils.toUtcIso(date, time),
        notes,
        tableIds: selectedOption.tableIds,
      });

      toast.success(tStaff("success.title"));
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || tStaff("errors.systemError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      title={tStaff("editTitle")}
      width="min(960px, 96vw)"
      bodyOverflowY="hidden"
    >
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="animate-spin text-gray-400 w-8 h-8" />
        </div>
      ) : (
        <div className="flex h-[min(82dvh,760px)] flex-col">
          <div className="flex-1 min-h-0 p-3 sm:p-5 space-y-4 sm:space-y-5 overflow-hidden">
            <CustomerSection
              phone={phone}
              fullName={fullName}
              email={email}
              customerType={customerType}
              loyaltyPoints={loyaltyPoints}
              isSearching={isSearchingCustomer}
              onPhoneChange={setPhone}
              onNameChange={setFullName}
              onEmailChange={setEmail}
              onSearch={handleCustomerSearch}
            />

            <BookingDetailsSection
              date={date}
              time={time}
              partySize={partySize}
              validationError={validationError}
              onDateChange={setDate}
              onTimeChange={setTime}
              onSizeChange={setPartySize}
            />

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText size={14} className="text-blue-600" /> {tStaff("notes")}
              </label>
              <ALInput
                value={notes}
                onChange={(e: any) => setNotes(e.target.value)}
                placeholder={tStaff("notesPlaceholder")}
              />
            </div>

            <TableSelectionGrid
              options={tableOptions}
              selectedOptionId={selectedOptionId}
              isLoading={isLoadingTables}
              isChecked={isTableChecked}
              onSelectOption={setSelectedOptionId}
              compact
            />
          </div>

          <div className="shrink-0 bg-slate-50 border-t border-slate-200 px-3 sm:px-5 py-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {tStaff("cancel")}
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {tStaff("saveChanges")}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};
