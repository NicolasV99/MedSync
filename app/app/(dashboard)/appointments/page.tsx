import { AppointmentCalendar } from "@/components/appointments/AppointmentCalendar";

export default function AppointmentsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-title text-neutral-dark">Appointments</h1>
        <p className="text-caption text-neutral-gray mt-1">
          Schedule and manage patient appointments.
        </p>
      </div>
      <AppointmentCalendar />
    </div>
  );
}
