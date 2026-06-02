"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import { useAppointments, type Appointment, type AppointmentStatus } from "@/context/AppointmentsContext";
import { NewAppointmentModal } from "./NewAppointmentModal";
import { EditAppointmentModal } from "./EditAppointmentModal";

const STATUS_COLORS: Record<AppointmentStatus, { bg: string; border: string }> = {
  scheduled:  { bg: "#0066CC", border: "#0052A3" },
  confirmed:  { bg: "#10B981", border: "#059669" },
  cancelled:  { bg: "#EF4444", border: "#DC2626" },
  completed:  { bg: "#6B7280", border: "#4B5563" },
};

function appointmentToEvent(a: Appointment): EventInput {
  const colors = STATUS_COLORS[a.status];
  return {
    id: a.id,
    title: `${a.patient_name} — ${a.title}`,
    start: a.start,
    end: a.end,
    backgroundColor: colors.bg,
    borderColor: colors.border,
    textColor: "#ffffff",
    extendedProps: { appointment: a },
  };
}

export function AppointmentCalendar() {
  const { appointments, updateAppointment, removeAppointment } = useAppointments();
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const events = appointments.map(appointmentToEvent);

  function handleDateClick(arg: DateClickArg) {
    setShowNewModal(true);
    void arg;
  }

  function handleEventClick(arg: EventClickArg) {
    const appointment = arg.event.extendedProps.appointment as Appointment;
    setSelectedAppointment(appointment);
    setConfirmDelete(false);
  }

  function handleDelete() {
    if (!selectedAppointment) return;
    removeAppointment(selectedAppointment.id);
    setSelectedAppointment(null);
    setConfirmDelete(false);
  }

  function handleEdit() {
    setEditingAppointment(selectedAppointment);
    setSelectedAppointment(null);
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 text-xs text-neutral-gray">
          {(Object.entries(STATUS_COLORS) as [AppointmentStatus, { bg: string }][]).map(
            ([status, colors]) => (
              <span key={status} className="flex items-center gap-1.5 capitalize">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.bg }} />
                {status}
              </span>
            ),
          )}
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Appointment
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-neutral-border shadow-sm p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          editable={false}
          selectable={true}
          dayMaxEvents={true}
          weekends={true}
          slotMinTime="07:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          height="auto"
          buttonText={{ today: "Today", month: "Month", week: "Week", day: "Day" }}
        />
      </div>

      {/* Detail panel */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-sm rounded-xl border border-neutral-border bg-white p-5 shadow-lg">

            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold text-neutral-dark">{selectedAppointment.title}</h2>
                <p className="text-sm text-neutral-gray mt-0.5">{selectedAppointment.patient_name}</p>
              </div>
              <button onClick={() => { setSelectedAppointment(null); setConfirmDelete(false); }}
                className="text-neutral-gray hover:text-neutral-dark">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Info */}
            <div className="flex items-center gap-2 text-sm text-neutral-gray mb-5">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(selectedAppointment.start).toLocaleString("en-US", {
                weekday: "short", month: "short", day: "numeric",
                hour: "numeric", minute: "2-digit",
              })}
              <span className="text-neutral-border">·</span>
              <span
                className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium text-white capitalize"
                style={{ backgroundColor: STATUS_COLORS[selectedAppointment.status].bg }}
              >
                {selectedAppointment.status}
              </span>
            </div>

            {/* Quick status */}
            <div className="mb-5">
              <p className="text-xs font-medium text-neutral-gray mb-2">Update status</p>
              <div className="grid grid-cols-2 gap-2">
                {(["scheduled", "confirmed", "cancelled", "completed"] as AppointmentStatus[]).map((s) => (
                  <button key={s}
                    onClick={() => {
                      updateAppointment(selectedAppointment.id, { status: s });
                      setSelectedAppointment({ ...selectedAppointment, status: s });
                    }}
                    className={`py-1.5 text-xs font-medium rounded-lg border capitalize transition-colors
                      ${selectedAppointment.status === s
                        ? "text-white border-transparent"
                        : "border-neutral-border text-neutral-gray hover:border-neutral-dark"}`}
                    style={selectedAppointment.status === s ? { backgroundColor: STATUS_COLORS[s].bg } : {}}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Edit / Delete */}
            <div className="flex gap-2 pt-4 border-t border-neutral-border">
              <button
                onClick={handleEdit}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium
                           border border-neutral-border rounded-lg text-neutral-dark hover:bg-neutral-light transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>

              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium
                             border border-neutral-border rounded-lg text-danger hover:bg-bg-danger hover:border-danger transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              ) : (
                <div className="flex-1 flex gap-1.5">
                  <button onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2 text-xs font-medium border border-neutral-border rounded-lg text-neutral-gray hover:bg-neutral-light transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleDelete}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg bg-danger text-white hover:bg-red-600 transition-colors">
                    Confirm
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {showNewModal && <NewAppointmentModal onClose={() => setShowNewModal(false)} />}
      {editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
        />
      )}
    </>
  );
}
