"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/patients",
    label: "Patients",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/appointments",
    label: "Appointments",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/reminders",
    label: "Reminders",
    icon: (
      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const displayName = userName?.trim() || "User";
  const displayEmail = userEmail?.trim() || "No email";
  const initials = useMemo(() => {
    const source = (userName || userEmail || "U").trim();
    if (!source) return "U";
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
      await signOut({ callbackUrl: "/login?accountDeleted=1" });
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Failed to delete account.");
      setIsDeleting(false);
    }
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-[10px] flex items-center justify-center shadow-sm">
            <svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <span className="text-[17px] font-bold text-neutral-dark tracking-tight">MedSync</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-2 space-y-0.5 overflow-y-auto overscroll-contain">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.comingSoon ? "#" : item.href}
              className={`pressable flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors duration-150
                ${isActive
                  ? "bg-primary/10 text-primary"
                  : "text-neutral-gray"
                }
                ${item.comingSoon ? "opacity-40 pointer-events-none" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.comingSoon && (
                <span className="ml-auto text-[11px] bg-neutral-light text-neutral-gray px-1.5 py-0.5 rounded-md font-medium">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 relative">
        {menuOpen && (
          <div className="absolute left-3 right-3 bottom-full mb-1.5 bg-white rounded-xl shadow-lg border border-neutral-border/60 p-1.5 z-20">
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="pressable block w-full px-3 py-2 text-[14px] text-neutral-dark rounded-lg transition-colors"
            >
              Settings
            </Link>
            <button
              type="button"
              onClick={() => { setDeleteModalOpen(true); setMenuOpen(false); setDeleteError(null); }}
              className="pressable w-full text-left px-3 py-2 text-[14px] text-danger rounded-lg transition-colors"
            >
              Delete account
            </button>
            <div className="my-1 h-px bg-neutral-border/60" />
            <button
              type="button"
              onClick={handleLogout}
              className="pressable w-full text-left px-3 py-2 text-[14px] text-danger rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="pressable flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0 text-left">
            <p className="text-[14px] font-semibold text-neutral-dark truncate">{displayName}</p>
            <p className="text-[12px] text-neutral-gray truncate">{displayEmail}</p>
          </div>
          <svg className="w-4 h-4 text-neutral-gray/60 shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="pressable fixed top-3.5 left-4 z-40 w-10 h-10 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-lg shadow-sm border border-neutral-border/40 lg:hidden"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5 text-neutral-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] shrink-0 h-full material-thick border-r border-neutral-border/50 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile overlay + drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="absolute left-0 top-0 bottom-0 w-[280px] bg-white/95 backdrop-blur-2xl flex flex-col shadow-2xl"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div className="flex items-center justify-end px-4 pt-3">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="pressable w-8 h-8 flex items-center justify-center rounded-full bg-neutral-light/80"
                aria-label="Close menu"
              >
                <svg className="w-4 h-4 text-neutral-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Delete account modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5">
              <h2 className="text-headline text-neutral-dark">Delete account permanently</h2>
              <p className="mt-1 text-caption text-neutral-gray">This action cannot be undone.</p>
            </div>

            <div className="rounded-xl bg-bg-danger/60 p-4 text-[14px] text-danger border border-danger/10">
              <p className="font-semibold">Before continuing:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-[13px]">
                <li>Your account access will be removed permanently.</li>
                <li>Appointments and calendar sync tokens will be deleted.</li>
                <li>Patient data linked to this account may be lost.</li>
              </ul>
            </div>

            {deleteError && (
              <p className="mt-3 rounded-xl bg-bg-danger px-4 py-2.5 text-[13px] text-danger">{deleteError}</p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => { setDeleteModalOpen(false); setDeleteError(null); }}
                className="pressable rounded-xl px-5 py-2.5 text-[14px] font-medium text-neutral-gray"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="pressable rounded-xl bg-danger px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
