// "use client";
//
// import { useTranslations } from "next-intl";
// import { Dish } from "../types";
// import { useState, useEffect, useRef } from "react";
// import Script from "next/script";
//
// // Khai báo types cho window.cloudinary để TypeScript không báo lỗi
// declare global {
//   interface Window {
//     cloudinary: any;
//   }
// }
//
// type DishHeroProps = {
//   dish: Dish;
//   onOrderNow: () => void;
// };
//
// export function DishHero({ dish, onOrderNow }: DishHeroProps) {
//   const t = useTranslations("DishDetails.Hero");
//   const heroImage = "/images/dish-detail/dish-hero/dish-hero.png";
//
//   // State quản lý chế độ xem: 'photo' | '360' | 'video'
//   const [viewMode, setViewMode] = useState<'photo' | '360' | 'video'>('photo');
//
//   // Ref để kiểm tra xem widget đã được render chưa
//   const galleryRef = useRef<any>(null);
//
//   // --- CẤU HÌNH CLOUDINARY ---
//   // Lưu ý: Thay đúng Cloud Name và Tag của bạn
//   const CLOUD_NAME = "dkstc8tkg";
//   const SPIN_TAG = "tiramisu-360"; // Đảm bảo ảnh trên Cloudinary đã gắn tag này
//
//   // Effect khởi tạo 360 Viewer
//   useEffect(() => {
//     // Chỉ chạy khi ở chế độ 360 và script đã load xong
//     if (viewMode === '360' && typeof window !== 'undefined' && window.cloudinary) {
//
//       // Hủy instance cũ nếu có để tránh lỗi render chồng (memory leak)
//       if (galleryRef.current) {
//         galleryRef.current.destroy();
//       }
//
//       // Khởi tạo Widget
//       galleryRef.current = window.cloudinary.galleryWidget({
//         container: "#cloudinary-360-target",
//         cloudName: CLOUD_NAME,
//         mediaAssets: [
//           { tag: SPIN_TAG, mediaType: "spin" }
//         ],
//         carouselStyle: "none", // Quan trọng: Ẩn thanh thumbnail bên dưới
//         navigation: "always",  // Luôn hiện nút xoay trái/phải
//         zoom: true,            // Cho phép user zoom in/out
//         spinProps: {
//           direction: "clockwise",
//           speed: 5
//         }
//         // Lưu ý: Không set aspectRatio để widget tự fill theo container cha
//       });
//
//       galleryRef.current.render();
//     }
//   }, [viewMode]);
//
//   return (
//       <section className="mx-auto w-full max-w-[1200px] overflow-hidden px-4 pt-6 md:pt-10">
//
//         {/* Load Script Cloudinary (Lazy load để tối ưu performance) */}
//         <Script
//             src="https://product-gallery.cloudinary.com/all.js"
//             strategy="lazyOnload"
//             onLoad={() => console.log("Cloudinary Script Loaded")}
//         />
//
//         {/* CONTAINER CHÍNH */}
//         {/* overflow-hidden: Cắt bỏ phần thừa khi ta đẩy ảnh 360 lên trên */}
//         <div className="relative h-[580px] overflow-hidden rounded-2xl shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10)] shadow-xl md:h-[561px] bg-neutral-100">
//
//           {/* --- 1. VIEW MODE: PHOTO (Mặc định) --- */}
//           {viewMode === 'photo' && (
//               <>
//                 <img
//                     src={heroImage}
//                     alt={dish.dishName}
//                     className="absolute left-0 top-0 h-full w-full object-contain md:top-[-460px] md:h-[1045px] md:object-cover animate-in fade-in duration-500"
//                 />
//                 {/* Gradient overlay giúp text dễ đọc hơn trên nền ảnh */}
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent md:bg-gradient-to-l md:from-black/80 md:via-black/20 md:to-black/0 pointer-events-none" />
//               </>
//           )}
//
//           {/* --- 2. VIEW MODE: 360 SPIN --- */}
//           {/* KỸ THUẬT CĂN CHỈNH:
//               - absolute left-0 w-full: Căn full chiều ngang
//               - -top-12 (tương đương -48px): Kéo khung lên trên để giấu bớt phần trời/khoảng trắng thừa
//               - h-[120%]: Tăng chiều cao lên 120% để bù lại phần bị kéo lên, đảm bảo đáy không bị hở trắng
//               - bg-white: Nền trắng cho sạch sẽ
//           */}
//           <div
//               id="cloudinary-360-target"
//               className={`absolute left-0 w-full -top-80 h-[120%] z-10 bg-white ${viewMode === '360' ? 'block' : 'hidden'}`}
//           >
//             {/* Cloudinary Widget sẽ được render vào đây */}
//           </div>
//
//           {/* --- 3. VIEW MODE: VIDEO (Placeholder) --- */}
//           {viewMode === 'video' && (
//               <div className="absolute inset-0 z-10 flex items-center justify-center bg-black animate-in fade-in">
//                 <p className="text-white font-medium">Video Player Coming Soon</p>
//               </div>
//           )}
//
//           {/* --- NÚT ORDER NOW --- */}
//           {viewMode !== '360' && (
//               <button
//                   type="button"
//                   className="absolute bottom-6 left-4 right-4 z-20 h-12 w-auto whitespace-nowrap rounded-lg bg-amber-400 px-6 shadow-lg md:left-auto md:right-[150px] md:top-[492px] md:bottom-auto md:h-11 md:w-auto md:min-w-[112px] hover:bg-amber-500 transition-colors"
//                   onClick={onOrderNow}
//               >
//                 <span className="text-base font-bold text-blue-950 md:text-sm md:font-medium">{t("order_now")}</span>
//               </button>
//           )}
//
//           {/* --- THANH ĐIỀU HƯỚNG (SWITCH MODES) --- */}
//           <div className="absolute left-1/2 top-4 z-30 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/30 p-1 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-md md:gap-2 md:p-1.5">
//             {/* PHOTO BTN */}
//             <button
//                 type="button"
//                 onClick={() => setViewMode('photo')}
//                 className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 md:px-6 md:py-2.5 md:text-xs ${
//                     viewMode === 'photo'
//                         ? "bg-white/20 text-white outline outline-1 outline-offset-[-1px] outline-white/20 shadow-lg"
//                         : "text-white/70 hover:bg-white/10"
//                 }`}
//             >
//               {t("photo")}
//             </button>
//
//             {/* 360 BTN */}
//             <button
//                 type="button"
//                 onClick={() => setViewMode('360')}
//                 className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 md:px-6 md:py-2.5 md:text-xs ${
//                     viewMode === '360'
//                         ? "bg-white/20 text-white outline outline-1 outline-offset-[-1px] outline-white/20 shadow-lg"
//                         : "text-white/70 hover:bg-white/10"
//                 }`}
//             >
//               {t("view_360")}
//             </button>
//
//             {/* VIDEO BTN */}
//             <button
//                 type="button"
//                 onClick={() => setViewMode('video')}
//                 className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 md:px-6 md:py-2.5 md:text-xs ${
//                     viewMode === 'video'
//                         ? "bg-white/20 text-white outline outline-1 outline-offset-[-1px] outline-white/20 shadow-lg"
//                         : "text-white/70 hover:bg-white/10"
//                 }`}
//             >
//               {t("video")}
//             </button>
//           </div>
//
//         </div>
//       </section>
//   );
// }

//
//
// "use client";
//
// import { useTranslations } from "next-intl";
// import { Dish } from "../types";
// import { useState } from "react";
// import Script from "next/script";
//
// // Khai báo custom element cho TypeScript khỏi báo lỗi
// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       'model-viewer': any;
//     }
//   }
// }
//
// export function DishHero({ dish, onOrderNow }: { dish: Dish; onOrderNow: () => void }) {
//   const t = useTranslations("DishDetails.Hero");
//   const [viewMode, setViewMode] = useState<'photo' | '360' | 'video'>('photo');
//
//   // Đường dẫn đến file 3D của bạn
//   const MODEL_URL = "/images/dish-detail/dish-hero/tiramisu.glb";
//
//   return (
//       <section className="mx-auto w-full max-w-[1200px] overflow-hidden px-4 pt-6 md:pt-10">
//         {/* Load Script Model Viewer của Google */}
//         <Script
//             type="module"
//             src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
//         />
//
//         <div className="relative h-[580px] overflow-hidden rounded-2xl shadow-xl md:h-[561px] bg-neutral-100">
//
//           {/* --- 1. PHOTO MODE --- */}
//           {viewMode === 'photo' && (
//               <img
//                   src="/images/dish-detail/dish-hero/dish-hero.png"
//                   className="absolute inset-0 h-full w-full object-cover animate-in fade-in duration-500"
//                   alt={dish.dishName}
//               />
//           )}
//
//           {/* --- 2. 3D MODEL MODE (CÁCH 2) --- */}
//           {viewMode === '360' && (
//               <div className="absolute inset-0 z-10 h-full w-full bg-stone-50">
//                 <model-viewer
//                     src={MODEL_URL}
//                     poster="/images/loading-3d.png" // Ảnh hiện lúc đang load model
//                     alt="A 3D model of Tiramisu"
//                     shadow-intensity="1"
//                     camera-controls
//                     auto-rotate
//                     ar // Bật tính năng thực tế ảo cho mobile
//                     touch-action="pan-y"
//                     style={{ width: '100%', height: '100%', backgroundColor: '#f5f5f4' }}
//                 >
//                   {/* Nút hỗ trợ AR trên điện thoại */}
//                   <button slot="ar-button" className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-md text-xs font-bold">
//                     👋 XEM TRONG KHÔNG GIAN THẬT
//                   </button>
//                 </model-viewer>
//               </div>
//           )}
//
//           {/* --- 3. VIDEO MODE --- */}
//           {viewMode === 'video' && (
//               <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
//                 <p className="text-white">Video Coming Soon</p>
//               </div>
//           )}
//
//           {/* CONTROLS & PILL (Giữ nguyên logic cũ của bạn) */}
//           <div className="absolute left-1/2 top-4 z-30 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/30 p-1 backdrop-blur-md">
//             {['photo', '360', 'video'].map((mode) => (
//                 <button
//                     key={mode}
//                     onClick={() => setViewMode(mode as any)}
//                     className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase ${
//                         viewMode === mode ? "bg-white/20 text-white" : "text-white/70"
//                     }`}
//                 >
//                   {mode === '360' ? '3D View' : mode}
//                 </button>
//             ))}
//           </div>
//         </div>
//       </section>
//   );
// }