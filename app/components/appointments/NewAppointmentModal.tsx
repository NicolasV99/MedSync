"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAppointments, type AppointmentStatus } from "@/context/AppointmentsContext";

type PatientOption = { patient_id: number; patient_name: string };

const DURATIONS = [
  { label: "30 minutes", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "1.5 hours", minutes: 90 },
  { label: "2 hours", minutes: 120 },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-border bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-semibold text-neutral-dark">New Appointment</h2>
            <p className="text-xs text-neutral-gray mt-0.5">Schedule a patient appointment.</p>
          </div>
          <button onClick={onClose} className="text-neutral-gray hover:text-neutral-dark">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <p className="mb-4 text-sm px-3 py-2 rounded-lg bg-bg-danger text-danger border border-red-200">
            {error}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Patient */}
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1.5">
              Patient *
            </label>
            <select
              required
              value={formData.patient_id}
              onChange={(e) => update("patient_id", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none
                         focus:border-primary focus:ring-2 focus:ring-primary-light bg-white"
            >
              <option value="">Select a patient...</option>
              {patients.map((p) => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.patient_name}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1.5">
              Appointment Type *
            </label>
            <select
              value={formData.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none
                         focus:border-primary focus:ring-2 focus:ring-primary-light bg-white"
            >
              {APPOINTMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1.5">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.start}
              onChange={(e) => update("start", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none
                         focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1.5">
              Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.minutes}
                  type="button"
                  onClick={() => update("duration", String(d.minutes))}
                  className={`py-2 text-xs font-medium rounded-lg border transition-colors
                    ${formData.duration === String(d.minutes)
                      ? "bg-primary text-white border-primary"
                      : "border-neutral-border text-neutral-gray hover:border-primary hover:text-primary"
                    }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-gray hover:text-neutral-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-60"
            >
              {isSubmitting ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
