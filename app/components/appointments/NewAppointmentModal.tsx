"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAppointments, type AppointmentStatus } from "@/context/AppointmentsContext";

type PatientOption = { patient_id: number; patient_name: string };

const DURATIONS = [
  { label: "30 min", minutes: 30 },
  { label: "1 hr", minutes: 60 },
  { label: "1.5 hr", minutes: 90 },
  { label: "2 hr", minutes: 120 },
];

const APPOINTMENT_TYPES = [
  "General Consultation",
  "Follow-up",
  "Check-up",
  "Procedure",
  "Emergency",
  "Other",
];

function toLocalDatetimeValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function NewAppointmentModal({ onClose }: { onClose: () => void }) {
  const { addAppointment } = useAppointments();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patient_id: "",
    patient_name: "",
    title: "General Consultation",
    start: toLocalDatetimeValue(new Date()),
    duration: "60",
    status: "scheduled" as AppointmentStatus,
  });

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((data: { patients?: PatientOption[] }) => {
        setPatients(data.patients ?? []);
      })
      .catch(() => setPatients([]));
  }, []);

  function update(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!formData.patient_id) {
      setError("Please select a patient.");
      return;
    }

    setIsSubmitting(true);
    try {
      const start = new Date(formData.start);
      const end = new Date(start.getTime() + Number(formData.duration) * 60 * 1000);

      const selectedPatient = patients.find(
        (p) => p.patient_id === Number(formData.patient_id),
      );

      await addAppointment({
        title: formData.title,
        patient_id: Number(formData.patient_id),
        patient_name: selectedPatient?.patient_name ?? formData.patient_name,
        start: start.toISOString(),
        end: end.toISOString(),
        status: formData.status,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create appointment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-headline text-neutral-dark">New Appointment</h2>
            <p className="text-caption text-neutral-gray mt-0.5">Schedule a patient appointment.</p>
          </div>
          <button onClick={onClose}
            className="pressable w-8 h-8 flex items-center justify-center rounded-full bg-neutral-light/80 text-neutral-gray">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-[13px] px-3.5 py-2.5 rounded-xl bg-danger/10 text-danger border border-danger/10">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="new_patient" className="block text-[13px] font-semibold text-neutral-dark mb-1.5">Patient *</label>
            <select id="new_patient" required value={formData.patient_id}
              onChange={(e) => update("patient_id", e.target.value)}
              className="w-full px-3.5 py-3 text-[15px] bg-neutral-light/60 border border-neutral-border/50 rounded-xl outline-none
                         focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all">
              <option value="">Select a patient...</option>
              {patients.map((p) => (
                <option key={p.patient_id} value={p.patient_id}>{p.patient_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="new_type" className="block text-[13px] font-semibold text-neutral-dark mb-1.5">Appointment Type *</label>
            <select id="new_type" value={formData.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full px-3.5 py-3 text-[15px] bg-neutral-light/60 border border-neutral-border/50 rounded-xl outline-none
                         focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all">
              {APPOINTMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="new_datetime" className="block text-[13px] font-semibold text-neutral-dark mb-1.5">Date & Time *</label>
            <input id="new_datetime" type="datetime-local" required value={formData.start}
              onChange={(e) => update("start", e.target.value)}
              className="w-full px-3.5 py-3 text-[15px] bg-neutral-light/60 border border-neutral-border/50 rounded-xl outline-none
                         focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all" />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-neutral-dark mb-1.5">Duration</label>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map((d) => (
                <button key={d.minutes} type="button"
                  onClick={() => update("duration", String(d.minutes))}
                  className={`pressable py-2.5 text-[13px] font-medium rounded-xl border transition-all
                    ${formData.duration === String(d.minutes)
                      ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                      : "border-neutral-border/50 text-neutral-gray"}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="pressable px-5 py-2.5 text-[14px] font-medium text-neutral-gray rounded-xl">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="pressable px-5 py-2.5 text-[14px] font-semibold text-white rounded-xl bg-primary shadow-sm shadow-primary/20 disabled:opacity-60">
              {isSubmitting ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
