import { format, addMinutes } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

const RESTAURANT_TZ = "Europe/Zurich";

export const dateUtils = {
    /**
     * Lấy chuỗi UTC từ Backend và format thành giờ THỤY SĨ để hiển thị.
     */
    formatLocal: (utcString: string | Date, formatStr: string): string => {
        if (!utcString) return "";
        const dateObj = typeof utcString === "string" ? new Date(utcString) : utcString;

        // format theo giờ Thụy Sĩ
        return formatInTimeZone(dateObj, RESTAURANT_TZ, formatStr);
    },

    /**
     * Nhận Ngày/Giờ ( Giờ Thụy Sĩ) từ Form, ép sang chuẩn UTC gửi cho BE.
     */
    toUtcIso: (localDate: string, localTime: string): string => {
        if (!localDate || !localTime) return "";

        const zonedDate = fromZonedTime(`${localDate}T${localTime}`, RESTAURANT_TZ);

        // Đổi nó ra UTC để gửi xuống BE
        return zonedDate.toISOString();
    },

    /**
     * Kiểm tra xem Ngày + Giờ (Thụy Sĩ) có nằm trong quá khứ không.
     */
    isPast: (localDate: string, localTime: string): boolean => {
        if (!localDate || !localTime) return false;

        const inputTime = fromZonedTime(`${localDate}T${localTime}`, RESTAURANT_TZ).getTime();
        return inputTime < Date.now();
    },

    /**
     * Lấy Ngày và Giờ mặc định cho Form (Thời gian hiện tại ở Thụy Sĩ + 30 phút).
     */
    getDefaultLocalInput: (addMins: number = 30): { date: string; time: string } => {
        // Lấy giờ hiện tại, chuyển sang múi giờ Thụy Sĩ, rồi cộng thêm 30 phút
        const nowInSwiss = toZonedTime(new Date(), RESTAURANT_TZ);
        const futureDate = addMinutes(nowInSwiss, addMins);

        return {
            date: format(futureDate, "yyyy-MM-dd"),
            time: format(futureDate, "HH:mm")
        };
    },

    /**
     * Lấy mốc bắt đầu/kết thúc của 1 ngày (Tính theo ngày của Thụy Sĩ), đổi ra UTC.
     */
    getUtcDayRange: (localDate: string | Date): { fromTime: string; toTime: string } => {
        const dateStr = typeof localDate === "string" ? localDate : format(localDate, "yyyy-MM-dd");

        // Bắt đầu ngày (00:00:00) tại Thụy Sĩ
        const startSwiss = fromZonedTime(`${dateStr}T00:00:00`, RESTAURANT_TZ);
        // Kết thúc ngày (23:59:59) tại Thụy Sĩ
        const endSwiss = fromZonedTime(`${dateStr}T23:59:59`, RESTAURANT_TZ);

        return {
            fromTime: startSwiss.toISOString(),
            toTime: endSwiss.toISOString()
        };
    }
};