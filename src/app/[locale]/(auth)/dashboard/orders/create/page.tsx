import { CreateOrderPage } from "@/features/staff/order-create/components/create-order-page";

export const metadata = {
  title: "Create Order | POS System",
  description: "Create a new order for dine-in or takeaway.",
};

export default function Page() {
  return <CreateOrderPage />;
}