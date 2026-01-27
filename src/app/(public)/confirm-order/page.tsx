"use client";

import { OrderSummary, DiningOption } from "@/features/confirm-order";

export default function ConfirmOrderPage() {
    return (
        <main className="min-h-screen w-full bg-[#FAF9F6] pb-32 pt-28 px-4 md:px-0">
            <div className="mx-auto flex max-w-[768px] flex-col gap-16">

                {/* Section 1: Review Order */}
                <OrderSummary />

                {/* Section 2: Dining Option */}
                <DiningOption />

            </div>
        </main>
    );
}