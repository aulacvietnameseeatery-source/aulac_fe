// "use client";
//
// import { cn } from "@/lib/utils";
// import { useTranslations } from "next-intl";
// import { motion, useAnimation, AnimatePresence } from "framer-motion";
// import { useEffect, useState } from "react";
// import { X, Minus, Plus, Trash2, Edit3 } from "lucide-react";
// import {CartItem} from "@/features/customer/menu-listing";
//
// interface CartSummaryProps {
//     cartItems: CartItem[];
//     tableNumber: string;
//     onUpdateTable: (val: string) => void;
//     onUpdateQuantity: (id: string, delta: number) => void;
//     onRemoveItem: (id: string) => void;
//     onConfirm: () => void;
//     className?: string;
// }
//
// export function CartSummary({
//                                 cartItems = [],
//                                 tableNumber,
//                                 onUpdateTable,
//                                 onUpdateQuantity,
//                                 onRemoveItem,
//                                 onConfirm,
//                                 className
//                             }: CartSummaryProps) {
//     const t = useTranslations("MenuListing.CartSummary");
//     const controls = useAnimation();
//
//     // State: false = Lá, true = Hình chữ nhật
//     const [isExpanded, setIsExpanded] = useState(false);
//
//     const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
//     const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
//
//     // --- 1. LOGIC ANIMATION QUÉT MÀU VÀNG ---
//     useEffect(() => {
//         if (totalItems > 0 && !isExpanded) {
//             controls.start({
//                 clipPath: [
//                     "inset(100% 0 0 0)",
//                     "inset(0% 0 0 0)",
//                     "inset(0 0 100% 0)"
//                 ],
//                 transition: {
//                     duration: 0.8,
//                     ease: [0.16, 1, 0.3, 1],
//                     times: [0, 0.8, 1]
//                 }
//             }).then(() => {
//                 controls.set({ clipPath: "inset(100% 0 0 0)" });
//             });
//         }
//     }, [totalItems, controls, isExpanded]);
//
//     // --- 2. COMPONENT CON: NỘI DUNG (DẠNG LÁ) ---
//     const CartContentOld = ({ isOverlay = false }: { isOverlay?: boolean }) => (
//         <div className="flex flex-col items-center justify-center w-full h-full rotate-[15deg] px-8 antialiased -translate-y-4">
//
//             <div className="flex flex-col items-center gap-3 mb-6">
//                 <span
//                     className={cn(
//                         "text-[13px] font-display font-bold uppercase tracking-[4px] drop-shadow-sm",
//                         isOverlay ? "text-[#1A3A52]" : "text-[#C5A059]"
//                     )}
//                 >
//                     {tableNumber ? `Table ${tableNumber}` : "Your Table"}
//                 </span>
//                 <div
//                     className={cn(
//                         "w-8 h-[1px]",
//                         isOverlay ? "bg-[#1A3A52]" : "bg-[#C5A059]"
//                     )}
//                 />
//             </div>
//
//
//             <div className="flex flex-col items-center gap-1 mb-8">
//                 <span className={cn(
//                     "text-[42px] font-display font-light leading-none tracking-tight",
//                     isOverlay ? "text-[#1A3A52]" : "text-white"
//                 )}>
//                     ${totalPrice.toFixed(2)}
//                 </span>
//                 <span className={cn(
//                     "text-[10px] font-display font-medium uppercase tracking-[1.5px] mt-2",
//                     isOverlay ? "text-[#1A3A52]/80" : "text-white/70"
//                 )}>
//                     {t("items_count", { count: totalItems })}
//                 </span>
//             </div>
//
//             <button
//                 onClick={(e) => { e.stopPropagation(); onConfirm(); }}
//                 className={cn(
//                     "group relative w-full max-w-[170px] py-3 rounded-full flex items-center justify-center mr-2 shadow-lg transition-all duration-300",
//                     isOverlay
//                         ? "bg-[#1A3A52] text-white"
//                         : "bg-[#C5A059] text-[#192339] hover:bg-[#D4AF6A] hover:-translate-y-0.5"
//                 )}
//             >
//                 <span className="text-[11px] font-display font-bold uppercase tracking-[1.5px] whitespace-nowrap">
//                    {t("confirm_btn")}
//                 </span>
//             </button>
//         </div>
//     );
//
//     // --- 3. COMPONENT CON: NỘI DUNG MỚI (DẠNG LIST) ---
//     const ExpandedContent = () => (
//         <motion.div
//             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//             className="w-full h-full flex flex-col p-6 text-white"
//         >
//             {/* Header & Close Button */}
//             <div className="flex justify-between items-start mb-6 border-b border-[#C5A059]/20 pb-4">
//                 <div className="flex flex-col gap-1">
//                     <label className="text-[10px] uppercase tracking-widest text-[#C5A059] flex items-center gap-2">
//                         Table <Edit3 size={10}/>
//                     </label>
//                     <input
//                         value={tableNumber} onChange={(e) => onUpdateTable(e.target.value)}
//                         className="bg-transparent border-none outline-none text-2xl font-display font-bold text-white w-24 placeholder:text-white/20 focus:text-[#C5A059]"
//                         placeholder="A-01" autoFocus
//                     />
//                 </div>
//                 <button onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} className="p-2 -mr-2 -mt-2 text-white/50 hover:text-white rounded-full">
//                     <X size={24} />
//                 </button>
//             </div>
//
//             {/* List Items */}
//             <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
//                 {cartItems.map((item) => (
//                     <div key={item.id} className="flex justify-between items-center bg-[#152e42]/60 p-3 rounded-xl border border-[#C5A059]/10">
//                         <div className="flex flex-col">
//                             <span className="font-medium text-sm text-white/90 line-clamp-1">{item.name}</span>
//                             <span className="text-xs text-[#C5A059] font-display mt-0.5">${(item.price * item.quantity).toFixed(2)}</span>
//                         </div>
//                         <div className="flex items-center gap-3 ml-2">
//                             <div className="flex items-center bg-[#204560] rounded-lg border border-[#C5A059]/20 h-8">
//                                 <button onClick={() => onUpdateQuantity(item.id, -1)} className="px-2 h-full hover:bg-[#C5A059] hover:text-[#204560] rounded-l-lg text-white"><Minus size={12} /></button>
//                                 <span className="min-w-[24px] text-center text-xs font-bold text-white">{item.quantity}</span>
//                                 <button onClick={() => onUpdateQuantity(item.id, 1)} className="px-2 h-full hover:bg-[#C5A059] hover:text-[#204560] rounded-r-lg text-white"><Plus size={12} /></button>
//                             </div>
//                             <button onClick={() => onRemoveItem(item.id)} className="text-white/30 hover:text-red-400 p-1"><Trash2 size={16} /></button>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//
//             {/* Footer */}
//             <div className="mt-4 pt-4 border-t border-[#C5A059]/20">
//                 <div className="flex justify-between items-center mb-4">
//                     <span className="text-sm uppercase tracking-wider text-white/60">Total</span>
//                     <span className="text-2xl font-display font-bold text-[#C5A059]">${totalPrice.toFixed(2)}</span>
//                 </div>
//                 <button onClick={(e) => { e.stopPropagation(); onConfirm(); }} className="w-full py-3.5 bg-[#C5A059] text-[#192339] rounded-xl font-bold text-sm uppercase tracking-[2px] hover:bg-[#D4AF6A]">
//                     {t("confirm_btn")}
//                 </button>
//             </div>
//         </motion.div>
//     );
//
//     return (
//         <motion.div
//             id="cart-destination"
//             layout // <--- Giúp biến hình mượt mà
//
//             initial={{ x: "120%", opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             exit={{ x: "120%", opacity: 0 }}
//             transition={{
//                 x: { type: "spring", stiffness: 60, damping: 15 },
//                 opacity: { duration: 0.2 },
//                 layout: { type: "spring", stiffness: 80, damping: 20 }
//             }}
//
//             onClick={() => !isExpanded && setIsExpanded(true)}
//             className={cn(
//                 "relative bg-[#204560] shadow-[0px_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden transition-shadow duration-500",
//                 isExpanded
//                     //sửa hình dáng khi mở rộng
//                     ? "w-[280px] h-[550px] rounded-[24px] rotate-0 border border-[#C5A059]/30 cursor-default" // Hình chữ nhật
//                     : "w-[286px] h-[357px] rounded-tl-[256px] rounded-br-[256px] rotate-[-15deg] border border-[#C5A059]/50 cursor-pointer", // Hình lá cũ
//                 className
//             )}
//         >
//             <AnimatePresence mode="wait">
//                 {!isExpanded ? (
//                     /* === NỘI DUNG LÁ CŨ === */
//                     <motion.div
//                         key="leaf-content"
//                         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }}
//                         className="w-full h-full relative"
//                     >
//                         <div className="absolute inset-6 border border-[#C5A059]/30 rounded-[100px] pointer-events-none" />
//                         <div className="absolute inset-14 border border-[#C5A059]/10 rounded-[80px] pointer-events-none" />
//
//                         <CartContentOld isOverlay={false} />
//
//                         {/* Overlay Quét Màu Vàng */}
//                         <motion.div
//                             animate={controls}
//                             initial={{ clipPath: "inset(100% 0 0 0)" }}
//                             className="absolute inset-0 bg-[#C5A059] z-20 flex flex-col justify-center items-center"
//                         >
//                             <div className="absolute inset-6 border border-[#1A3A52]/20 rounded-[100px] pointer-events-none" />
//                             <div className="absolute inset-14 border border-[#1A3A52]/10 rounded-[80px] pointer-events-none" />
//                             <CartContentOld isOverlay={true} />
//                         </motion.div>
//                     </motion.div>
//                 ) : (
//                     /* === NỘI DUNG MỞ RỘNG MỚI === */
//                     <ExpandedContent key="expanded-content" />
//                 )}
//             </AnimatePresence>
//
//             {/* Glow Effect */}
//             <div className="absolute inset-4 bg-[#C5A059]/10 blur-[40px] rounded-full -z-10 pointer-events-none" />
//         </motion.div>
//     );
// }