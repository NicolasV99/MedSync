"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type NewPatientForm = {
  patient_name: string;
  dob: string;
  email: string;
  phone: string;
};

const initialFormState: NewPatientForm = {
  patient_name: "",
  dob: "",
  email: "",
  phone: "",
};

export function AddPatientButton() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewPatientForm>(initialFormState);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Failed to create patient.");
      }
      setFormData(initialFormState);
      setIsModalOpen(false);
      router.refresh();
    } catch (submitError) {
      console.error(submitError);
      setError(submitError instanceof Error ? submitError.message : "Could not create patient.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="pressable flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-[14px] font-semibold rounded-xl shadow-sm shadow-primary/20 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Add Patient
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="text-headline text-neutral-dark">New Patient</h2>
                <p className="text-caption text-neutral-gray mt-0.5">Add a patient to your clinic.</p>
              </div>
              <button type="button" onClick={closeModal}
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
                <label htmlFor="patient_name" className="block text-[13px] font-semibold text-neutral-dark mb-1.5">Name *</label>
                <input id="patient_name" required value={formData.patient_name}
                  onChange={(e) => setFormData((c) => ({ ...c, patient_name: e.target.value }))}
                  className="w-full px-3.5 py-3 text-[15px] bg-neutral-light/60 border border-neutral-border/50 rounded-xl outline-none
                             focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all" />
              </div>
              <div>
                <label htmlFor="dob" className="block text-[13px] font-semibold text-neutral-dark mb-1.5">Date of Birth *</label>
                <input id="dob" type="date" required value={formData.dob}
                  onChange={(e) => setFormData((c) => ({ ...c, dob: e.target.value }))}
                  className="w-full px-3.5 py-3 text-[15px] bg-neutral-light/60 border border-neutral-border/50 rounded-xl outline-none
                             focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all" />
              </div>
              <div>
                <label htmlFor="email" className="block text-[13px] font-semibold text-neutral-dark mb-1.5">Email</label>
                <input id="email" type="email" value={formData.email}
                  onChange={(e) => setFormData((c) => ({ ...c, email: e.target.value }))}
                  placeholder="patient@email.com" autoComplete="email"
                  className="w-full px-3.5 py-3 text-[15px] bg-neutral-light/60 border border-neutral-border/50 rounded-xl outline-none
                             focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-neutral-gray/50" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-[13px] font-semibold text-neutral-dark mb-1.5">Phone</label>
                <input id="phone" value={formData.phone}
                  onChange={(e) => setFormData((c) => ({ ...c, phone: e.target.value }))}
                  placeholder="+1 555 0100" inputMode="tel"
                  className="w-full px-3.5 py-3 text-[15px] bg-neutral-light/60 border border-neutral-border/50 rounded-xl outline-none
                             focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-neutral-gray/50" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="pressable px-5 py-2.5 text-[14px] font-medium text-neutral-gray rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="pressable px-5 py-2.5 text-[14px] font-semibold text-white rounded-xl bg-primary disabled:opacity-60">
                  {isSubmitting ? "Saving..." : "Save Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
