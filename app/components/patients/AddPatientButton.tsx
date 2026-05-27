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
        headers: {
          "Content-Type": "application/json",
        },
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
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not create patient.",
      );
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
        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Patient
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-xl border border-neutral-border bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-neutral-dark">
                  Add Patient
                </h2>
                <p className="text-xs text-neutral-gray mt-1">
                  Create one patient for testing.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-neutral-gray hover:text-neutral-dark"
              >
                <span className="sr-only">Close</span>
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
              <p className="mt-3 text-sm px-3 py-2 rounded-lg bg-bg-danger text-danger border border-red-200">
                {error}
              </p>
            )}

            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="patient_name"
                  className="block text-sm font-medium text-neutral-dark mb-1.5"
                >
                  Name *
                </label>
                <input
                  id="patient_name"
                  required
                  value={formData.patient_name}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      patient_name: event.target.value,
                    }))
                  }
                  className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                />
              </div>

              <div>
                <label
                  htmlFor="dob"
                  className="block text-sm font-medium text-neutral-dark mb-1.5"
                >
                  Date of Birth *
                </label>
                <input
                  id="dob"
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      dob: event.target.value,
                    }))
                  }
                  className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-dark mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="patient@email.com"
                  className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-neutral-dark mb-1.5"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  value={formData.phone}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="+1 555 0100"
                  className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-neutral-gray hover:text-neutral-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-60"
                >
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
