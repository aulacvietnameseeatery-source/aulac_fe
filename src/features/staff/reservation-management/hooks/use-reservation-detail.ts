// features/staff/reservation-management/hooks/use-reservation-detail.ts

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { reservationService } from "../services/reservation-service";
import { ReservationDetailDto } from "../types/reservation-types";

export const useReservationDetail = (reservationId: number) => {
    const [reservation, setReservation] = useState<ReservationDetailDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReservation = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await reservationService.getReservationDetail(reservationId);
                setReservation(data);
            } catch (err: any) {
                const errorMsg = err.response?.data?.userMessage || err.message || "Failed to load reservation details";
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                setIsLoading(false);
            }
        };

        if (reservationId) {
            fetchReservation();
        }
    }, [reservationId]);

    const refetch = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await reservationService.getReservationDetail(reservationId);
            setReservation(data);
        } catch (err: any) {
            const errorMsg = err.response?.data?.userMessage || err.message || "Failed to load reservation details";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        reservation,
        isLoading,
        error,
        refetch
    };
};
