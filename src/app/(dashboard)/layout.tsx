import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Add authentication check here using middleware or server component
  // For now, we'll handle it on the client side
  
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
