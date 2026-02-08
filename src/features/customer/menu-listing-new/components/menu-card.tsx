import Image from 'next/image';

interface MenuCardProps {
    name: string;
    desc?: string;
    price: string;
    image?: string;
}

export const MenuCard = ({ name, desc, price, image }: MenuCardProps) => {
    return (
        <div className="flex flex-col items-center text-center group h-full justify-between">
            {/* Khung ảnh: relative để chứa Image fill */}
            <div className="w-full aspect-[3/2] relative border border-[#C5A059] p-[2px] mb-1 bg-[#0f172a]/60 shadow-md group-hover:shadow-[#C5A059]/20 transition-all">
                <div className="absolute inset-[2px] border border-[#C5A059]/30 z-20 pointer-events-none"></div>
                <div className="relative w-full h-full overflow-hidden">
                    {image && image !== "" ? (
                        <Image
                            src={image}
                            alt={name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full bg-[#1e293b] flex items-center justify-center">
                            <span className="text-[#C5A059]/30 text-[8px]">NO IMAGE</span>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-[#C5A059] font-display text-xs lg:text-[13px] font-bold uppercase tracking-wide leading-tight line-clamp-1">
                {name}
            </h3>

            <div className="mt-1 flex items-center gap-3 border-t border-[#C5A059]/10 pt-1 w-full justify-center">
                <span className="text-white font-display font-bold text-xs">{price}</span>
                <button className="text-[8px] text-[#C5A059] border border-[#C5A059] px-2 py-[1px] hover:bg-[#C5A059] hover:text-[#0f172a] transition-colors uppercase tracking-wider">
                    Order
                </button>
            </div>
        </div>
    );
};