import { EditOrderPage } from "@/features/staff/order-create/components/edit-order-page";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  return <EditOrderPage orderId={Number(resolvedParams.id)} />;
}