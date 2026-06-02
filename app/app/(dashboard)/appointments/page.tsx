import { AppointmentCalendar } from "@/components/appointments/AppointmentCalendar";

export default function AppointmentsPage() {
  return (
    <div className="space-y-2">
      <div>
        <h1 className="text-2xl font-bold text-neutral-dark">Appointments</h1>
        <p className="text-sm text-neutral-gray mt-1">
          Schedule and manage patient appointments.
        </p>
      </div>
      <AppointmentCalendar />
    </div>
  );
}
