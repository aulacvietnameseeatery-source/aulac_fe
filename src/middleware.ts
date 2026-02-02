import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    // todo muốn không hiện en hay fr thì để never
    localePrefix: 'always'
});

export const config = {
    // Không chạy middleware trên các file hệ thống/ảnh
    matcher: ['/', '/(en|fr)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};