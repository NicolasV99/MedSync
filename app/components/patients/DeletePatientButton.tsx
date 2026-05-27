"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Patient } from "./PatientTable";

export function DeletePatientButton({
  patient,
  onClose,
}: {
  patient: Patient;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/patients/${patient.patient_id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to delete patient.");
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete patient.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-sm rounded-xl border border-neutral-border bg-white p-5 shadow-lg">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 bg-bg-danger rounded-full mx-auto mb-4">
          <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <h2 className="text-base font-semibold text-neutral-dark text-center">Delete Patient</h2>
        <p className="text-sm text-neutral-gray text-center mt-1">
          Are you sure you want to delete <span className="font-medium text-neutral-dark">{patient.patient_name}</span>? This action cannot be undone.
        </p>

        {error && (
          <p className="mt-3 text-sm px-3 py-2 rounded-lg bg-bg-danger text-danger border border-red-200 text-center">
            {error}
          </p>
        )}

        <div className="flex gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 text-sm font-medium border border-neutral-border rounded-lg text-neutral-gray hover:bg-neutral-light transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-danger hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
