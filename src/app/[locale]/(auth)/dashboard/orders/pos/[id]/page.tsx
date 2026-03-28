import { PosWorkspace } from "@/features/staff/order-create/components/pos-workspace";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  return <PosWorkspace key={`edit-workspace-${resolvedParams.id}`} initialOrderId={Number(resolvedParams.id)} />;
}