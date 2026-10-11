"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Patient } from "./PatientTable";

async function getErrorMessage(response: Response, fallback: string) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? fallback;
  }
  const text = await response.text();
  return text ? `${fallback} (${response.status})` : fallback;
}

export function DeletePatientButton({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/patients/${patient.patient_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to delete patient."));
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete patient.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
        <div className="flex items-center justify-center w-14 h-14 bg-bg-danger/60 rounded-full mx-auto mb-4">
          <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <h2 className="text-headline text-neutral-dark">Delete Patient</h2>
        <p className="text-[14px] text-neutral-gray mt-1.5">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-neutral-dark">{patient.patient_name}</span>?
          This cannot be undone.
        </p>

        {error && (
          <p className="mt-4 text-[13px] px-3.5 py-2.5 rounded-xl bg-bg-danger/60 text-danger border border-danger/10">
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} disabled={isDeleting}
            className="pressable flex-1 px-4 py-2.5 text-[14px] font-medium border border-neutral-border/50 rounded-xl text-neutral-gray disabled:opacity-60">
            Cancel
          </button>
          <button type="button" onClick={handleDelete} disabled={isDeleting}
            className="pressable flex-1 px-4 py-2.5 text-[14px] font-semibold text-white rounded-xl bg-danger disabled:opacity-60">
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
