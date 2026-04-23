export function formatPhoneToDomesticDisplay(phone?: string | null): string {
    const normalized = phone?.trim();
    const digitsOnly = normalized ? normalized.replace(/\D/g, "") : "";

    if (!normalized) {
        return "";
    }

    if (digitsOnly.startsWith("84") && digitsOnly.length >= 11 && digitsOnly.length <= 12) {
        return `0${digitsOnly.slice(2)}`;
    }

    if (digitsOnly.startsWith("41") && digitsOnly.length === 11) {
        return `0${digitsOnly.slice(2)}`;
    }

    if (digitsOnly.startsWith("0")) {
        return digitsOnly;
    }

    return normalized;
}