export const SUPPORTED_PHONE_REGEX = /^(?:0[0-9]{9,10}|\+84[0-9]{9,10}|(?:\+41|0)[1-9][0-9]{8})$/;

export function isSupportedPhoneNumber(phone?: string | null): boolean {
    return SUPPORTED_PHONE_REGEX.test(phone?.trim() ?? "");
}