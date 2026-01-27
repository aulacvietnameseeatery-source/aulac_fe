import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales = ['en', 'fr'];

export default getRequestConfig(async ({requestLocale}) => {
    // 1. Lấy locale từ requestLocale (Đây là một Promise trong bản mới)
    const locale = await requestLocale;

    if (!locale || !locales.includes(locale as string)) {
        notFound();
    }

    return {
        messages: (await import(`./messages/${locale}.json`)).default,
        locale: locale
    };
});