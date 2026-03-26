import { format, addMinutes, parseISO } from "date-fns";

/**
 * Bộ công cụ xử lý Thời gian (UTC <-> Local) dùng chung cho toàn dự án.
 * Backend lưu và trả về UTC (ISO 8601).
 * Frontend hiển thị và xử lý bằng Local Time (Giờ địa phương của thiết bị).
 */
export const dateUtils = {
    /**
     * Lấy chuỗi UTC từ Backend và format thành giờ Local để hiển thị.
     * @param utcString Chuỗi thời gian từ BE (VD: "2026-03-22T14:00:00Z")
     * @param formatStr Định dạng muốn hiển thị (VD: "HH:mm", "yyyy-MM-dd", "dd MMM, HH:mm")
     * @returns Chuỗi đã được format theo giờ địa phương
     */
    formatLocal: (utcString: string | Date, formatStr: string): string => {
        if (!utcString) return "";
        let date: Date;
        if (typeof utcString === "string") {
            // Nếu chuỗi không có Z và không có offset (+/-), tự động thêm Z để trình duyệt coi là UTC
            const normalized = (utcString.toUpperCase().includes("Z") || utcString.includes("+"))
                ? utcString
                : `${utcString}Z`;
            date = new Date(normalized);
            // Fallback nếu việc thêm Z làm chuỗi không hợp lệ
            if (isNaN(date.getTime())) {
                date = new Date(utcString);
            }
        } else {
            date = utcString;
        }
        return format(date, formatStr);
    },

    /**
     * Ghép Ngày (Local) và Giờ (Local) từ Form, sau đó ép sang chuẩn UTC để gửi xuống Backend.
     * @param localDate Chuỗi ngày (VD: "2026-03-23")
     * @param localTime Chuỗi giờ (VD: "18:00")
     * @returns Chuỗi chuẩn ISO UTC (VD: "2026-03-23T11:00:00.000Z")
     */
    toUtcIso: (localDate: string, localTime: string): string => {
        if (!localDate || !localTime) return "";
        return new Date(`${localDate}T${localTime}`).toISOString();
    },

    /**
     * Kiểm tra xem Ngày + Giờ được chọn có nằm trong quá khứ so với "Ngay lúc này" không.
     * @param localDate Chuỗi ngày (VD: "2026-03-23")
     * @param localTime Chuỗi giờ (VD: "18:00")
     * @returns true nếu là quá khứ, false nếu là tương lai/hiện tại
     */
    isPast: (localDate: string, localTime: string): boolean => {
        if (!localDate || !localTime) return false;
        const selectedTime = new Date(`${localDate}T${localTime}`).getTime();
        return selectedTime < Date.now();
    },

    /**
     * Lấy Ngày và Giờ mặc định cho Form tạo mới (VD: Hiện tại + 30 phút).
     * @param addMins Số phút muốn cộng thêm (Mặc định: 30)
     * @returns Object chứa date và time dạng chuỗi
     */
    getDefaultLocalInput: (addMins: number = 30): { date: string; time: string } => {
        const futureDate = addMinutes(new Date(), addMins);
        return {
            date: format(futureDate, "yyyy-MM-dd"),
            time: format(futureDate, "HH:mm")
        };
    },

    /**
     * Lấy 2 mốc bắt đầu (00:00:00) và kết thúc (23:59:59) của một ngày Local,
     * ép sang UTC để gửi cho Backend làm bộ lọc tìm kiếm (Date Filter).
     * @param localDate Chuỗi ngày hoặc Object Date
     * @returns Object chứa fromTime và toTime chuẩn UTC
     */
    getUtcDayRange: (localDate: string | Date): { fromTime: string; toTime: string } => {
        const start = new Date(localDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(localDate);
        end.setHours(23, 59, 59, 999);

        return {
            fromTime: start.toISOString(),
            toTime: end.toISOString()
        };
    },

    /**
     * Format a DateOnly string (e.g. "2026-03-25") without any timezone conversion.
     * Backend DateOnly fields have no time component — parsing as UTC would shift the date.
     * @param dateOnlyStr Chuỗi ngày thuần (VD: "2026-03-25")
     * @param formatStr Định dạng (VD: "dd/MM/yyyy", "MMM dd", "yyyy-MM-dd")
     * @returns Chuỗi đã format, giữ nguyên ngày gốc
     */
    formatDateOnly: (dateOnlyStr: string | null | undefined, formatStr: string): string => {
        if (!dateOnlyStr) return "";
        // parseISO treats date-only strings as local midnight (no TZ shift)
        const date = parseISO(dateOnlyStr);
        if (isNaN(date.getTime())) return dateOnlyStr;
        return format(date, formatStr);
    },

    /**
     * Convert a Date object or ISO string to a "yyyy-MM-dd" date-only string
     * using the local timezone (no UTC conversion).
     * @param date Date object or ISO string
     * @returns "yyyy-MM-dd" string in local time
     */
    toDateOnlyString: (date: Date | string): string => {
        const d = typeof date === "string" ? new Date(date) : date;
        return format(d, "yyyy-MM-dd");
    },
};