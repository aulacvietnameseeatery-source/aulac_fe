// components/Atmosphere.tsx
import Image from 'next/image';

// components/Atmosphere.tsx
export const Atmosphere = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden">
            <Image
                src="/images/menu-listing/layer1.png"
                alt="Ambiance"
                fill
                className="object-cover blur-[4px] brightness-[1.0] scale-105" // Tăng từ 0.4 lên 0.7 để sáng hơn
                priority
            />
            {/* Giảm độ mờ của lớp phủ gradient để nhìn rõ không gian nhà hàng hơn */}
            <div className="absolute inset-0 bg-black/20"></div>
        </div>
    );
};