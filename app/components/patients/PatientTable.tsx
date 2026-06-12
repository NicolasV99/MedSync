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
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span
      className={`ml-1 inline-block transition-opacity ${active ? "opacity-100" : "opacity-30"}`}
    >
      {active && dir === "desc" ? "↓" : "↑"}
    </span>
  );
}

// Displays searchable/sortable patients and opens edit/delete modals per row.
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
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patients by name or email..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-border rounded-lg outline-none
                     focus:border-primary focus:ring-2 focus:ring-primary-light bg-white transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray hover:text-neutral-dark"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Result count */}
      {search && (
        <p className="text-xs text-neutral-gray -mt-3">
          {sorted.length} result{sorted.length !== 1 ? "s" : ""} for &quot;
          {search}&quot;
        </p>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-border bg-neutral-light">
              {columns.map((col) => (
                <th key={col.key} className="text-left px-4 py-3">
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center font-semibold text-neutral-gray hover:text-neutral-dark transition-colors"
                  >
                    {col.label}
                    <SortIcon active={sortKey === col.key} dir={sortDir} />
                  </button>
                </th>
              ))}
              <th className="text-left px-4 py-3 font-semibold text-neutral-gray">
                Phone
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort("last_visit")}
                  className="flex items-center font-semibold text-neutral-gray hover:text-neutral-dark transition-colors"
                >
                  Last Visit
                  <SortIcon active={sortKey === "last_visit"} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((patient) => (
              <tr
                key={patient.patient_id}
                className="border-b border-neutral-border/60 last:border-none hover:bg-neutral-light/40 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-neutral-dark">
                  {patient.patient_name}
                </td>
                <td className="px-4 py-3 text-neutral-gray">
                  {patient.email ?? "-"}
                </td>
                <td className="px-4 py-3 text-neutral-gray">
                  {patient.phone ?? "-"}
                </td>
                <td className="px-4 py-3 text-neutral-gray">
                  {formatDate(patient.last_visit)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => setEditingPatient(patient)}
                      className="p-1.5 text-neutral-gray hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
                      title="Edit patient"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeletingPatient(patient)}
                      className="p-1.5 text-neutral-gray hover:text-danger hover:bg-bg-danger rounded-lg transition-colors"
                      title="Delete patient"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-neutral-light rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-neutral-gray"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-neutral-dark">
                      {search
                        ? "No patients match your search"
                        : "No patients found"}
                    </p>
                    <p className="text-xs text-neutral-gray">
                      {search
                        ? "Try a different name or email."
                        : "Use Add Patient to create your first record."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {editingPatient && (
        <EditPatientModal
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
        />
      )}
      {deletingPatient && (
        <DeletePatientButton
          patient={deletingPatient}
          onClose={() => setDeletingPatient(null)}
        />
      )}
    </>
  );
}
