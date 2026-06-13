"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: "/patients",
    label: "Patients",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    href: "/appointments",
    label: "Appointments",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    href: "/reminders",
    label: "Reminders",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
    comingSoon: true,
  },
];

type SidebarProps = {
  userName?: string | null;
  userEmail?: string | null;
};

export default function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayName = userName?.trim() || "User";
  const displayEmail = userEmail?.trim() || "No email";
  const initials = useMemo(() => {
    const source = (userName || userEmail || "U").trim();
    if (!source) {
      return "U";
    }

    const words = source.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return `${words[0][0] || ""}${words[1][0] || ""}`.toUpperCase();
    }

    return (words[0] || source).slice(0, 2).toUpperCase();
  }, [userEmail, userName]);

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" });
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to delete account.");
      }

      // End the local session immediately after successful account deletion.
      await signOut({ callbackUrl: "/login?accountDeleted=1" });
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete account.",
      );
      setIsDeleting(false);
    }
  }

  return (
    <aside className="w-60 shrink-0 h-full bg-white border-r border-neutral-border flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-neutral-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <span className="text-base font-bold text-neutral-dark">MedSync</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.comingSoon ? "#" : item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-neutral-gray hover:bg-neutral-light hover:text-neutral-dark"
                }
                ${item.comingSoon ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.comingSoon && (
                <span className="ml-auto text-xs bg-neutral-light text-neutral-gray px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-neutral-border relative">
        {menuOpen ? (
          <div className="absolute left-3 right-3 bottom-full mb-2 bg-white border border-neutral-border rounded-lg shadow-md p-1 z-20">
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="block w-full px-3 py-2 text-sm text-neutral-gray rounded-md hover:bg-neutral-light transition-colors"
            >
              Configuration
            </Link>
            <button
              type="button"
              onClick={() => {
                setDeleteModalOpen(true);
                setMenuOpen(false);
                setDeleteError(null);
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              Delete account
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              Log out
            </button>
          </div>
        ) : null}

        <div
          role="button"
          tabIndex={0}
          onClick={() => setMenuOpen((prev) => !prev)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setMenuOpen((prev) => !prev);
            }
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-light transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-dark truncate">
              {displayName}
            </p>
            <p className="text-xs text-neutral-gray truncate">{displayEmail}</p>
          </div>
        </div>
      </div>

      {deleteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-neutral-border bg-white p-5 shadow-lg">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-neutral-dark">
                Delete account permanently
              </h2>
              <p className="mt-1 text-sm text-neutral-gray">
                This action cannot be undone.
              </p>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p className="font-medium">Before continuing, please note:</p>
              {/* Human-readable risk checklist shown before any destructive action. */}
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Your account access will be removed permanently.</li>
                <li>
                  Your appointments and calendar sync tokens will be deleted.
                </li>
                <li>
                  Patient and clinical data linked to this account may be lost.
                </li>
              </ul>
            </div>

            {deleteError ? (
              <p className="mt-3 rounded-lg border border-red-200 bg-bg-danger px-3 py-2 text-sm text-danger">
                {deleteError}
              </p>
            ) : null}

            <p className="mt-5 text-sm font-medium text-neutral-dark">
              Do you still want to proceed?
            </p>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteError(null);
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-gray hover:text-neutral-dark"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
