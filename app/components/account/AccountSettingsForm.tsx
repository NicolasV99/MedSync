"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AccountSettingsFormProps = {
  fullName: string;
  role: string;
};

export function AccountSettingsForm({
  fullName,
  role,
}: AccountSettingsFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName,
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  function update(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (formData.newPassword || formData.confirmNewPassword) {
        if (!formData.currentPassword) {
          throw new Error(
            "Current password is required to change your password.",
          );
        }
      }

      if (
        formData.newPassword ||
        formData.confirmNewPassword ||
        formData.currentPassword
      ) {
        if (formData.newPassword !== formData.confirmNewPassword) {
          throw new Error("New passwords do not match.");
        }
      }

      const response = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // UI sends only editable fields (name/password) to match the account policy.
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to update account.");
      }

      const payload = (await response.json()) as {
        user?: { first_name?: string; last_name?: string };
      };

      setSuccess("Your account was updated.");
      setFormData((prev) => ({
        ...prev,
        fullName:
          payload.user?.first_name && payload.user?.last_name
            ? `${payload.user.first_name} ${payload.user.last_name}`
            : prev.fullName,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not update account.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-bg-danger px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="fullName"
            className="mb-1.5 block text-sm font-medium text-neutral-dark"
          >
            Full name
          </label>
          <input
            id="fullName"
            required
            value={formData.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            className="w-full rounded-lg border border-neutral-border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-light"
          />
        </div>
      </div>

      {/* Email is displayed in the parent page as read-only and is not editable here. */}

      <div className="rounded-xl border border-neutral-border bg-neutral-light/40 p-4">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-dark">
              Security confirmation
            </h3>
            <p className="mt-1 text-xs text-neutral-gray">
              Use your current password when changing your password.
            </p>
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-neutral-gray">
            {role}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-1.5 block text-sm font-medium text-neutral-dark"
            >
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(event) =>
                update("currentPassword", event.target.value)
              }
              className="w-full rounded-lg border border-neutral-border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="mb-1.5 block text-sm font-medium text-neutral-dark"
            >
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(event) => update("newPassword", event.target.value)}
              className="w-full rounded-lg border border-neutral-border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
          </div>

          <div>
            <label
              htmlFor="confirmNewPassword"
              className="mb-1.5 block text-sm font-medium text-neutral-dark"
            >
              Confirm new password
            </label>
            <input
              id="confirmNewPassword"
              type="password"
              value={formData.confirmNewPassword}
              onChange={(event) =>
                update("confirmNewPassword", event.target.value)
              }
              className="w-full rounded-lg border border-neutral-border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.refresh()}
          className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-gray transition hover:text-neutral-dark"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
