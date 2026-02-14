import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { reservationService } from '../services/reservation.service';
import { CustomerDto, TableAvailabilityDto, BookingSource, BookingStatus, CustomerType } from '../types/types';

export const useReservationForm = (t: (key: string, values?: any) => string) => {
  const router = useRouter();
  const [validationError, setValidationError] = useState<string | null>(null);
  // -- Customer State --
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('new');
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

  // -- Booking Details State --
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState<number | ''>('');

  // -- Table State --
  const [tables, setTables] = useState<TableAvailabilityDto[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
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
    setCustomerType('new');
    setLoyaltyPoints(0);
    try {
      const data = await reservationService.searchCustomer(phone);
      if (data) {
        setFullName(data.fullName || '');
        setEmail(data.email || '');
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

    const now = new Date();
    const selected = new Date(`${selectedDate}T${selectedTime}`);

    // So sánh timestamp
    if (selected.getTime() < now.getTime()) {
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
        setTables([]);
        return;
      }
      const isValid = validateDateTime(date, time);
      if (!isValid) {
        setTables([]);
        return; 
      }
        setIsLoadingTables(true);
        setIsTableChecked(true);
        setSelectedTableId(null);
        try {
          const data = await reservationService.getAvailableTables(date, time, Number(partySize));
          setTables(data);
        } catch (error) {

        } finally {
          setIsLoadingTables(false);
        }
    };
    const timer = setTimeout(fetchTables, 500);
    return () => clearTimeout(timer);
  }, [date, time, partySize]);

  const handleSubmit = async () => {
    if (!phone || !date || !time || !partySize || !selectedTableId || !fullName) {
      toast.error(t("errors.missingTitle"), {
        description: t("errors.missingDescription"),
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
    const reservedTime = new Date(`${date}T${time}`).toISOString();
    try {
      const payload = {
        lockToken: null,
        tableId: selectedTableId,
        customerName: fullName,
        phone: phone,
        email: email || null,
        partySize: Number(partySize),
        reservedTime: reservedTime,
        status: status,
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

      setTimeout(() => {
          router.push('/dashboard/reservation'); 
        }, 1500);
    } catch (error: any) {
      toast.error(t("errors.failTitle"), {
        description: error.message || t("errors.systemError"),
      });
    }
  };

  return {
    formState: { phone, fullName, email, customerType, loyaltyPoints, date, time, partySize, source, status, validationError },
    tableState: { tables, selectedTableId, isLoadingTables, isTableChecked },
    loadingState: { isSearchingCustomer },
    setters: { setPhone, setFullName, setEmail, setDate, setTime, setPartySize, setSelectedTableId, setStatus },
    handlers: { handleCustomerSearch, handleSourceChange, handleSubmit }
  };
};