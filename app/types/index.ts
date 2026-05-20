export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patient?: Patient;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "confirmed" | "cancelled" | "completed";
  googleEventId?: string;
  reminderSent: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  googleCalendarConnected: boolean;
}
