import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    locales: ['en', 'fr', 'vi'],
    defaultLocale: 'en',
    // todo muốn không hiện en hay fr hay vi thì để never
    localePrefix: 'always'
});

export const config = {
    // Không chạy middleware trên các file hệ thống/ảnh
    matcher: ['/', '/(en|fr|vi)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};