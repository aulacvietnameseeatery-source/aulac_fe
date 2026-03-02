import { MetadataRoute } from 'next'

export default function manifest(): {
    name: string;
    short_name: string;
    description: string;
    start_url: string;
    display: string;
    background_color: string;
    theme_color: string;
    icons: { src: string; sizes: string; type: string; purpose: string }[]
} {
    return {
        name: 'An Lac - Vietnamese Eatery',
        short_name: 'An Lac',
        description: 'A Symphony of Vietnamese Artistry',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        icons: [
            {
                src: '/images/logo.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
            },
        ],
    }
}