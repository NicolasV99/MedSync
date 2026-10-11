"use client";

import { FormEvent, useState } from "react";
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

function normalizeDobForInput(dob: string | Date | null | undefined) {
  if (!dob) return "";
  if (typeof dob === "string") {
    if (!dob.trim()) return "";
    return dob.includes("T") ? dob.split("T")[0] : dob;
  }
  if (dob instanceof Date && !Number.isNaN(dob.getTime())) {
    const year = dob.getUTCFullYear();
    const month = String(dob.getUTCMonth() + 1).padStart(2, "0");
    const day = String(dob.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return "";
}

export function EditPatientModal({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    patient_name: patient.patient_name,
    dob: normalizeDobForInput(patient.dob),
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
      if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to update patient."));
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update patient.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-headline text-neutral-dark">Edit Patient</h2>
            <p className="text-caption text-neutral-gray mt-0.5">Update {patient.patient_name}&apos;s information.</p>
          </div>
          <button onClick={onClose}
            className="pressable w-8 h-8 flex items-center justify-center rounded-full bg-neutral-light/80 text-neutral-gray">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-[13px] px-3.5 py-2.5 rounded-xl bg-bg-danger/60 text-danger border border-danger/10">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="edit_name" className="block text-[13px] font-semibold text-neutral-dark mb-1.5">Name *</label>
            <input id="edit_name" required value={formData.patient_name} onChange={(e) => update("patient_name", e.target.value)}
              className="w-full px-3.5 py-3 text-[15px] bg-neutral-light/60 border border-neutral-border/50 rounded-xl outline-none
                         focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all" />
          </div>
          <div>
            <label htmlFor="edit_dob" className="block text-[13px] font-semibold text-neutral-dark mb-1.5">Date of Birth *</label>
            <input id="edit_dob" type="date" required value={formData.dob} onChange={(e) => update("dob", e.target.value)}
              className="w-full px-3.5 py-3 text-[15px] bg-neutral-light/60 border border-neutral-border/50 rounded-xl outline-none
                         focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all" />
          </div>
          <div>
            <label htmlFor="edit_email" className="block text-[13px] font-semibold text-neutral-dark mb-1.5">Email</label>
            <input id="edit_email" type="email" value={formData.email} onChange={(e) => update("email", e.target.value)}
              placeholder="patient@email.com"
              className="w-full px-3.5 py-3 text-[15px] bg-neutral-light/60 border border-neutral-border/50 rounded-xl outline-none
                         focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-neutral-gray/50" />
          </div>
          <div>
            <label htmlFor="edit_phone" className="block text-[13px] font-semibold text-neutral-dark mb-1.5">Phone</label>
            <input id="edit_phone" value={formData.phone} onChange={(e) => update("phone", e.target.value)}
              placeholder="+1 555 0100" inputMode="tel"
              className="w-full px-3.5 py-3 text-[15px] bg-neutral-light/60 border border-neutral-border/50 rounded-xl outline-none
                         focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-neutral-gray/50" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="pressable px-5 py-2.5 text-[14px] font-medium text-neutral-gray rounded-xl">Cancel</button>
            <button type="submit" disabled={isSubmitting}
              className="pressable px-5 py-2.5 text-[14px] font-semibold text-white rounded-xl bg-primary disabled:opacity-60">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
