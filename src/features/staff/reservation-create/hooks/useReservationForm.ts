import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { reservationService } from '../services/reservation.service';
import { TableOptionDto, BookingSource, BookingStatus, CustomerType } from '../types/types';
import { dateUtils } from '@/lib/date-utils';

interface UseReservationFormOptions {
  onSuccess?: () => void;
}

export const useReservationForm = (
  t: (key: string, values?: any) => string,
  options?: UseReservationFormOptions
) => {
  const router = useRouter();
  const [validationError, setValidationError] = useState<string | null>(null);
  // -- Customer State --
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('new');
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

  // -- Booking Details State --
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState<number | ''>('');

  // -- Table State --
  const [tableOptions, setTableOptions] = useState<TableOptionDto[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isTableChecked, setIsTableChecked] = useState(false);

  // -- Final Status & Source --
  const [source, setSource] = useState<BookingSource>('phone');
  const [status, setStatus] = useState<BookingStatus>('confirmed');

  // --- HANDLERS ---
  const handleSourceChange = (newSource: BookingSource) => {
    setSource(newSource);
    if (newSource === 'phone') {
      setStatus('confirmed');
    }
  };

  const handleCustomerSearch = async () => {
    if (!phone) return;
    setIsSearchingCustomer(true);
    setFullName('');
    setEmail('');
    setCustomerId(undefined);
    setCustomerType('new');
    setLoyaltyPoints(0);
    try {
      const data = await reservationService.searchCustomer(phone);
      if (data) {
        setFullName(data.fullName || '');
        setEmail(data.email || '');
        setCustomerId(data.customerId);
        setCustomerType(data.isMember ? 'member' : 'new');
        setLoyaltyPoints(data.loyaltyPoints || 0);
      }
    } catch (error) {
      //console.error("Error searching customer", error);
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  // --- HELPER: Validate Date & Time ---
  const validateDateTime = (selectedDate: string, selectedTime: string): boolean => {
    if (!selectedDate || !selectedTime) return true; // Chưa nhập đủ thì chưa báo lỗi logic (để required check lo)

    // So sánh timestamp
    if (dateUtils.isPast(selectedDate, selectedTime)) {
      setValidationError(t("errors.timePast"));
      return false;
    }

    setValidationError(null);
    return true;
  };

  // Auto-fetch tables logic
  useEffect(() => {
    const fetchTables = async () => {
      if (!date || !time || !partySize) {
        setTableOptions([]);
        return;
      }
      const isValid = validateDateTime(date, time);
      if (!isValid) {
        setTableOptions([]);
        return;
      }
      setIsLoadingTables(true);
      setIsTableChecked(true);
      setSelectedOptionId(null);
      try {
        const data = await reservationService.getAvailableTables(date, time, Number(partySize));
        setTableOptions(data);

        if (data.length > 0) {
          setSelectedOptionId(data[0].optionId);
        }
      } catch (error) {

      } finally {
        setIsLoadingTables(false);
      }
    };
    const timer = setTimeout(fetchTables, 500);
    return () => clearTimeout(timer);
  }, [date, time, partySize]);

  const handleSubmit = async () => {
    if (!phone || !date || !time || !partySize || !selectedOptionId || !fullName) {
      toast.error(t("errors.missingTitle"), {
        description: t("errors.missingDescription"),
      });
      return;
    }

    const selectedOption = tableOptions.find((x) => x.optionId === selectedOptionId);
    if (!selectedOption || selectedOption.tableIds.length === 0) {
      toast.error(t("errors.failTitle"), {
        description: t("errors.systemError"),
      });
      return;
    }

    if (!validateDateTime(date, time)) {
      toast.error(t("errors.timeErrorTitle"), {
        description: validationError,
      });
      return;
    }

    // Combine Date + Time -> ISO String for Backend
    const reservedTime = dateUtils.toUtcIso(date, time);
    try {
      const payload = {
        customerId: customerId,
        tableId: selectedOption.tableIds[0],
        tableIds: selectedOption.tableIds,
        customerName: fullName,
        phone: phone,
        email: email || null,
        partySize: Number(partySize),
        reservedTime: reservedTime,
        status: 'confirmed',
        source: source
      };

      const result = await reservationService.createReservation(payload);
      // 5. SUCCESS: Thông báo & Chuyển trang
      toast.success(t("success.title"), {
        description: t("success.description", {
          name: result.customerName,
          id: result.reservationId
        }),
      });

      if (options?.onSuccess) {
        options.onSuccess();
      } else {
        setTimeout(() => {
          router.push('/dashboard/reservations');
        }, 1500);
      }
    } catch (error: any) {
      toast.error(t("errors.failTitle"), {
        description: error.message || t("errors.systemError"),
      });
    }
  };

  return {
    formState: { phone, fullName, email, customerType, loyaltyPoints, date, time, partySize, source, status, validationError },
    tableState: { tableOptions, selectedOptionId, isLoadingTables, isTableChecked },
    loadingState: { isSearchingCustomer },
    setters: { setPhone, setFullName, setEmail, setDate, setTime, setPartySize, setSelectedOptionId, setStatus },
    handlers: { handleCustomerSearch, handleSourceChange, handleSubmit }
  };
};