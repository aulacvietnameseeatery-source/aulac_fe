"use client";

import { useEffect, useState } from "react";
import {
  V2Hero360,
  V2Narrative,
  V2Cinematic,
  V2Video,
  V2Composition,
  V2CTA,
  OrderPopup,
} from "@/features/dish-details-v2";

export default function DishDetailV2Page() {
  const [openPopup, setOpenPopup] = useState(false);

  // optional: khóa scroll khi mở popup
  useEffect(() => {
    document.body.style.overflow = openPopup ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openPopup]);

  return (
    <main className="w-full bg-white">
      {/* Section A */}
      <V2Hero360 onOrderNow={() => setOpenPopup(true)} />

      {/* Section B */}
      <V2Narrative />

      {/* Section C */}
      <V2Cinematic />

      {/* Section D */}
      <V2Video />

      {/* Section E */}
      <V2Composition />

      {/* Section F */}
      <V2CTA onReserve={() => setOpenPopup(true)} />

      {/* Popup */}
      <OrderPopup open={openPopup} onClose={() => setOpenPopup(false)} />
    </main>
  );
}
