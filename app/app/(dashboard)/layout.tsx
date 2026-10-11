import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { AppointmentsProvider } from "@/context/AppointmentsContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <AppointmentsProvider>
      <div className="flex h-dvh bg-neutral-light">
        <Sidebar userName={session.user.name} userEmail={session.user.email} />
        <div className="flex flex-col flex-1 min-w-0">
          <Navbar />
          <main className="flex-1 px-4 py-6 lg:px-8 overflow-auto overscroll-contain">{children}</main>
        </div>
      </div>
    </AppointmentsProvider>
  );
}
