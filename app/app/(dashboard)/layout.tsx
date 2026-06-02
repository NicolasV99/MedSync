import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { AppointmentsProvider } from "@/context/AppointmentsContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppointmentsProvider>
      <div className="flex h-full bg-neutral-light">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Navbar />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </AppointmentsProvider>
  );
}
