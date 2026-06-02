"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "cancelled"
  | "completed";

export type Appointment = {
  id: string;
  title: string;
  patient_id?: number;
  patient_name: string;
  start: string; // ISO datetime
  end: string;   // ISO datetime
  status: AppointmentStatus;
  google_event_id?: string;
};

type AppointmentsContextType = {
  appointments: Appointment[];
  isLoading: boolean;
  addAppointment: (data: Omit<Appointment, "id">) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  removeAppointment: (id: string) => void;
};

const AppointmentsContext = createContext<AppointmentsContextType | null>(null);

// Mock appointments for development — replace with API call when Nefi's endpoint is ready
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    title: "General Consultation",
    patient_name: "Maria Gutierrez",
    patient_id: 1,
    start: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    end: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
    status: "confirmed",
  },
  {
    id: "2",
    title: "Follow-up",
    patient_name: "Doug McManamon",
    patient_id: 2,
    start: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
    end: new Date(Date.now() + 1000 * 60 * 60 * 27).toISOString(),
    status: "scheduled",
  },
  {
    id: "3",
    title: "Check-up",
    patient_name: "Norman Allen",
    patient_id: 3,
    start: new Date(Date.now() + 1000 * 60 * 60 * 50).toISOString(),
    end: new Date(Date.now() + 1000 * 60 * 60 * 51).toISOString(),
    status: "scheduled",
  },
];

export function AppointmentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appointments, setAppointments] =
    useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [isLoading] = useState(false);

  const addAppointment = useCallback(
    async (data: Omit<Appointment, "id">) => {
      // TODO: replace with POST /api/appointments when Nefi's endpoint is ready
      const newAppointment: Appointment = {
        ...data,
        id: crypto.randomUUID(),
      };
      setAppointments((prev) => [...prev, newAppointment]);
    },
    [],
  );

  const updateAppointment = useCallback(
    (id: string, updates: Partial<Appointment>) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      );
    },
    [],
  );

  const removeAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      appointments,
      isLoading,
      addAppointment,
      updateAppointment,
      removeAppointment,
    }),
    [appointments, isLoading, addAppointment, updateAppointment, removeAppointment],
  );

  return (
    <AppointmentsContext.Provider value={value}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const ctx = useContext(AppointmentsContext);
  if (!ctx) {
    throw new Error("useAppointments must be used inside AppointmentsProvider");
  }
  return ctx;
}
