"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Patient } from "./PatientTable";

function toInputDate(value: unknown): string {
  if (!value) return "";

  if (typeof value === "string") {
    // Handles ISO strings and plain YYYY-MM-DD values.
    return value.includes("T") ? value.split("T")[0] : value;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().split("T")[0];
  }

  return "";
}

// Edits an existing patient in a modal and updates it via the PUT endpoint.
export function EditPatientModal({
  patient,
  onClose,
}: {
  patient: Patient;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    patient_name: patient.patient_name,
    dob: toInputDate(patient.dob),
    email: patient.email ?? "",
    phone: patient.phone ?? "",
  });

  function update(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/patients/${patient.patient_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to update patient.");
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update patient.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-border bg-white p-5 shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-dark">
              Edit Patient
            </h2>
            <p className="text-xs text-neutral-gray mt-0.5">
              Update {patient.patient_name}&apos;s information.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-gray hover:text-neutral-dark"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <p className="mb-3 text-sm px-3 py-2 rounded-lg bg-bg-danger text-danger border border-red-200">
            {error}
          </p>
        )}

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="edit_name"
              className="block text-sm font-medium text-neutral-dark mb-1.5"
            >
              Name *
            </label>
            <input
              id="edit_name"
              required
              value={formData.patient_name}
              onChange={(e) => update("patient_name", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
          </div>
          <div>
            <label
              htmlFor="edit_dob"
              className="block text-sm font-medium text-neutral-dark mb-1.5"
            >
              Date of Birth *
            </label>
            <input
              id="edit_dob"
              type="date"
              required
              value={formData.dob}
              onChange={(e) => update("dob", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
          </div>
          <div>
            <label
              htmlFor="edit_email"
              className="block text-sm font-medium text-neutral-dark mb-1.5"
            >
              Email
            </label>
            <input
              id="edit_email"
              type="email"
              value={formData.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="patient@email.com"
              className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
          </div>
          <div>
            <label
              htmlFor="edit_phone"
              className="block text-sm font-medium text-neutral-dark mb-1.5"
            >
              Phone
            </label>
            <input
              id="edit_phone"
              value={formData.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+1 555 0100"
              className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
