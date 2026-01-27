import { OrderReceipt } from "../types/receipt.types";

export default function ReceiptInfoStrip({ order }: { order: OrderReceipt }) {
  return (
    <div className="border-y border-[#475569]/30 px-12 py-6 grid grid-cols-2 gap-y-6">
      <Info label="Order Date" value={order.date} />
      <Info label="Order ID" value={order.id} align="right" />
      <Info label="Time" value={order.time} />
      <Info label="Status" value={order.status} align="right" highlight />
    </div>
  );
}

function Info({
  label,
  value,
  align,
  highlight,
}: {
  label: string;
  value: string;
  align?: "right";
  highlight?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1 ${align === "right" && "items-end text-right"}`}>
      <b className="text-[9px] uppercase tracking-[0.9px] text-[#64748B]">{label}</b>
      <div className={`text-[14px] font-medium ${highlight ? "text-[#DEA048]" : "text-[#1A3951]"}`}>
        {value}
      </div>
    </div>
  );
}
