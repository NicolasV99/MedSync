"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  end: string; // ISO datetime
  status: AppointmentStatus;
  google_event_id?: string;
};

type AppointmentsContextType = {
  appointments: Appointment[];
  isLoading: boolean;
  addAppointment: (data: Omit<Appointment, "id">) => Promise<void>;
  updateAppointment: (
    id: string,
    updates: Partial<Appointment>,
  ) => Promise<void>;
  removeAppointment: (id: string) => Promise<void>;
};

const AppointmentsContext = createContext<AppointmentsContextType | null>(null);

type AppointmentsApiResponse = {
  appointments?: Appointment[];
  appointment?: Appointment;
  error?: string;
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

export function AppointmentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAppointments = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const data = await requestJson<AppointmentsApiResponse>(
        "/api/appointments",
        {
          method: "GET",
        },
      );
      setAppointments(data.appointments ?? []);
    } catch {
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAppointments(false);
  }, [loadAppointments]);

  const addAppointment = useCallback(async (data: Omit<Appointment, "id">) => {
    const response = await requestJson<AppointmentsApiResponse>(
      "/api/appointments",
      {
        method: "POST",
        body: JSON.stringify({
          patient_id: data.patient_id ?? null,
          title: data.title,
          start: data.start,
          end: data.end,
          status: data.status,
          syncGoogle: true,
        }),
      },
    );

    if (!response.appointment) {
      throw new Error("Appointment was not created.");
    }

    setAppointments((prev) => [response.appointment as Appointment, ...prev]);
  }, []);

  const updateAppointment = useCallback(
    async (id: string, updates: Partial<Appointment>) => {
      const previous = appointments;
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      );

      try {
        const response = await requestJson<AppointmentsApiResponse>(
          `/api/appointments/${id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              patient_id: updates.patient_id,
              title: updates.title,
              start: updates.start,
              end: updates.end,
              status: updates.status,
              syncGoogle: true,
            }),
          },
        );

        if (response.appointment) {
          setAppointments((prev) =>
            prev.map((a) =>
              a.id === id
                ? {
                    ...a,
                    ...(response.appointment as Appointment),
                  }
                : a,
            ),
          );
        }
      } catch (error) {
        setAppointments(previous);
        throw error;
      }
    },
    [appointments],
  );

  const removeAppointment = useCallback(
    async (id: string) => {
      const previous = appointments;
      setAppointments((prev) => prev.filter((a) => a.id !== id));

      try {
        await requestJson<{ message: string }>(`/api/appointments/${id}`, {
          method: "DELETE",
        });
      } catch (error) {
        setAppointments(previous);
        throw error;
      }
    },
    [appointments],
  );

  const value = useMemo(
    () => ({
      appointments,
      isLoading,
      addAppointment,
      updateAppointment,
      removeAppointment,
    }),
    [
      appointments,
      isLoading,
      addAppointment,
      updateAppointment,
      removeAppointment,
    ],
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
