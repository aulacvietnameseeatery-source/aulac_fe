'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
    const router = useRouter();
    const t = useTranslations('NotFound');
    const tAuth = useTranslations('Unauthorized');

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale-[0.5]"
                style={{ backgroundImage: "url('/images/error-bg.png')" }}
            />
            <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-[4px]" />

            {/* Content */}
            <div className="relative z-20 text-center px-4 w-full max-w-4xl py-12">
                <div className="mb-6 flex justify-center animate-in fade-in zoom-in duration-1000">
                    <div className="p-4 rounded-full bg-[#d4a373]/10 border border-[#d4a373]/20">
                        <FileQuestion className="w-12 h-12 text-[#d4a373]" />
                    </div>
                </div>

                <h1
                    className="text-[100px] md:text-[150px] font-playfair leading-none tracking-tighter text-[#d4a373] opacity-90 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-10 duration-1000"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                    404
                </h1>

                <h2
                    className="text-3xl md:text-5xl font-playfair text-white mb-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                    {t('title')}
                </h2>

                <p className="text-gray-400 text-sm md:text-base mb-10 max-w-md mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                    {t('description')}
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">
                    <button
                        onClick={() => router.back()}
                        className="px-8 py-3 bg-transparent text-white border border-white/20 font-bold text-[10px] tracking-[0.2em] rounded-full uppercase transition-all duration-300 hover:bg-white/5 flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        {tAuth('goBack')}
                    </button>

                    <Link
                        href="/"
                        className="px-8 py-3 bg-[#d4a373] text-[#1a1a1a] font-bold text-[10px] tracking-[0.2em] rounded-full uppercase transition-all duration-300 hover:bg-[#e9c46a] shadow-xl flex items-center justify-center gap-2"
                    >
                        <Home className="w-3 h-3" />
                        {t('backToHome')}
                    </Link>
                </div>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 163, 115, 0.2);
          border-radius: 10px;
        }
      `}</style>
        </div>
    );
}
