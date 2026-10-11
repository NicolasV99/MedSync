"use client";

import { useState, useMemo } from "react";
import { EditPatientModal } from "./EditPatientModal";
import { DeletePatientButton } from "./DeletePatientButton";

export type Patient = {
  patient_id: number;
  patient_name: string;
  email: string | null;
  phone: string | null;
  dob: string;
  last_visit: string | null;
};

type SortKey = "patient_name" | "email" | "last_visit";
type SortDir = "asc" | "desc";

function formatDate(dateValue: string | null) {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg className={`w-3.5 h-3.5 ml-1 transition-all ${active ? "text-primary" : "text-neutral-gray/30"}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d={active && dir === "desc" ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
    </svg>
  );
}

export function PatientTable({ patients }: { patients: Patient[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("patient_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return patients.filter(
      (p) =>
        p.patient_name.toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q),
    );
  }, [patients, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = (a[sortKey] ?? "").toString().toLowerCase();
      const bVal = (b[sortKey] ?? "").toString().toLowerCase();
      const cmp = aVal.localeCompare(bVal);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const columns: { key: SortKey; label: string }[] = [
    { key: "patient_name", label: "Name" },
    { key: "email", label: "Email" },
  ];

  return (
    <>
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray/60"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-10 py-3 text-[15px] bg-white border border-neutral-border/50 rounded-xl outline-none
                     focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-neutral-gray/50"
        />
        {search && (
          <button onClick={() => setSearch("")}
            className="pressable absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-neutral-light text-neutral-gray">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {search && (
        <p className="text-caption text-neutral-gray -mt-3">
          {sorted.length} result{sorted.length !== 1 ? "s" : ""} for &quot;{search}&quot;
        </p>
      )}

      {/* Mobile card list */}
      <div className="lg:hidden space-y-3">
        {sorted.map((patient) => (
          <div key={patient.patient_id} className="bg-white rounded-2xl border border-neutral-border/50 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shrink-0">
                  <span className="text-[13px] font-bold text-white">
                    {patient.patient_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-neutral-dark truncate">{patient.patient_name}</p>
                  <p className="text-caption text-neutral-gray truncate">{patient.email ?? "No email"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setEditingPatient(patient)}
                  className="pressable p-2 text-neutral-gray rounded-lg" title="Edit">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button onClick={() => setDeletingPatient(patient)}
                  className="pressable p-2 text-neutral-gray rounded-lg" title="Delete">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-border/30">
              {patient.phone && (
                <span className="text-caption text-neutral-gray flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {patient.phone}
                </span>
              )}
              <span className="text-caption text-neutral-gray tabular-nums">
                Last visit: {formatDate(patient.last_visit)}
              </span>
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-14 h-14 bg-neutral-light rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-neutral-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-neutral-dark">
              {search ? "No patients match your search" : "No patients yet"}
            </p>
            <p className="text-caption text-neutral-gray mt-1">
              {search ? "Try a different name or email." : "Add your first patient to get started."}
            </p>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white rounded-2xl border border-neutral-border/50 shadow-sm overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="border-b border-neutral-border/50">
              {columns.map((col) => (
                <th key={col.key} className="text-left px-5 py-3.5">
                  <button onClick={() => handleSort(col.key)}
                    className="pressable flex items-center text-[12px] font-semibold text-neutral-gray uppercase tracking-wide">
                    {col.label}
                    <SortIcon active={sortKey === col.key} dir={sortDir} />
                  </button>
                </th>
              ))}
              <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-neutral-gray uppercase tracking-wide">Phone</th>
              <th className="text-left px-5 py-3.5">
                <button onClick={() => handleSort("last_visit")}
                  className="pressable flex items-center text-[12px] font-semibold text-neutral-gray uppercase tracking-wide">
                  Last Visit
                  <SortIcon active={sortKey === "last_visit"} dir={sortDir} />
                </button>
              </th>
              <th className="px-5 py-3.5 w-24" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((patient) => (
              <tr key={patient.patient_id}
                className="border-b border-neutral-border/30 last:border-none transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-white">{patient.patient_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="font-semibold text-neutral-dark">{patient.patient_name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-neutral-gray">{patient.email ?? "—"}</td>
                <td className="px-5 py-4 text-neutral-gray tabular-nums">{patient.phone ?? "—"}</td>
                <td className="px-5 py-4 text-neutral-gray tabular-nums">{formatDate(patient.last_visit)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => setEditingPatient(patient)}
                      className="pressable p-2 text-neutral-gray rounded-lg transition-colors" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => setDeletingPatient(patient)}
                      className="pressable p-2 text-neutral-gray rounded-lg transition-colors" title="Delete">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-neutral-light rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-neutral-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-[15px] font-semibold text-neutral-dark">
                      {search ? "No patients match your search" : "No patients yet"}
                    </p>
                    <p className="text-caption text-neutral-gray">
                      {search ? "Try a different name or email." : "Add your first patient to get started."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingPatient && (
        <EditPatientModal patient={editingPatient} onClose={() => setEditingPatient(null)} />
      )}
      {deletingPatient && (
        <DeletePatientButton patient={deletingPatient} onClose={() => setDeletingPatient(null)} />
      )}
    </>
  );
}
