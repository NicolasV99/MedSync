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

const STATUS_STYLES: Record<AppointmentStatus, { bg: string; border: string; dot: string }> = {
  scheduled:  { bg: "#007AFF", border: "#0062CC", dot: "bg-primary" },
  confirmed:  { bg: "#34C759", border: "#2DA44E", dot: "bg-success" },
  cancelled:  { bg: "#FF3B30", border: "#E0332B", dot: "bg-danger" },
  completed:  { bg: "#8E8E93", border: "#6E6E73", dot: "bg-neutral-gray" },
};

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  scheduled: "bg-primary/10 text-primary",
  confirmed: "bg-success/10 text-success",
  cancelled: "bg-danger/10 text-danger",
  completed: "bg-neutral-light text-neutral-gray",
};

function appointmentToEvent(a: Appointment): EventInput {
  const colors = STATUS_STYLES[a.status];
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {(Object.entries(STATUS_STYLES) as [AppointmentStatus, { dot: string }][]).map(
            ([status, style]) => (
              <span key={status} className="flex items-center gap-1.5 text-caption text-neutral-gray capitalize">
                <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                {status}
              </span>
            ),
          )}
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="pressable flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-[14px] font-semibold rounded-xl shadow-sm shadow-primary/20 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Appointment
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-neutral-border/50 shadow-sm p-3 lg:p-5 fc-apple">
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
          eventDisplay="block"
          slotLabelFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
          dayHeaderFormat={{ weekday: "short", day: "numeric" }}
        />
      </div>

      {/* Detail panel */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="text-headline text-neutral-dark">{selectedAppointment.title}</h2>
                <p className="text-[14px] text-neutral-gray mt-0.5">{selectedAppointment.patient_name}</p>
              </div>
              <button onClick={() => { setSelectedAppointment(null); setConfirmDelete(false); }}
                className="pressable w-8 h-8 flex items-center justify-center rounded-full bg-neutral-light/80 text-neutral-gray">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2.5 text-[14px] text-neutral-gray mb-5">
              <svg className="w-4 h-4 shrink-0 text-neutral-gray/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="tabular-nums">
                {new Date(selectedAppointment.start).toLocaleString("en-US", {
                  weekday: "short", month: "short", day: "numeric",
                  hour: "numeric", minute: "2-digit",
                })}
              </span>
              <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize ${STATUS_BADGE[selectedAppointment.status]}`}>
                {selectedAppointment.status}
              </span>
            </div>

            {/* Quick status */}
            <div className="mb-6">
              <p className="text-[12px] font-semibold text-neutral-gray uppercase tracking-wide mb-2.5">Update status</p>
              <div className="grid grid-cols-2 gap-2">
                {(["scheduled", "confirmed", "cancelled", "completed"] as AppointmentStatus[]).map((s) => (
                  <button key={s}
                    onClick={() => {
                      updateAppointment(selectedAppointment.id, { status: s });
                      setSelectedAppointment({ ...selectedAppointment, status: s });
                    }}
                    className={`pressable py-2 text-[13px] font-medium rounded-xl border capitalize transition-all
                      ${selectedAppointment.status === s
                        ? "text-white border-transparent shadow-sm"
                        : "border-neutral-border/50 text-neutral-gray"}`}
                    style={selectedAppointment.status === s ? { backgroundColor: STATUS_STYLES[s].bg } : {}}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Edit / Delete */}
            <div className="flex gap-2.5 pt-4 border-t border-neutral-border/40">
              <button onClick={handleEdit}
                className="pressable flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[14px] font-medium
                           border border-neutral-border/50 rounded-xl text-neutral-dark transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>

              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)}
                  className="pressable flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[14px] font-medium
                             border border-neutral-border/50 rounded-xl text-danger transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              ) : (
                <div className="flex-1 flex gap-2">
                  <button onClick={() => setConfirmDelete(false)}
                    className="pressable flex-1 py-2.5 text-[13px] font-medium border border-neutral-border/50 rounded-xl text-neutral-gray">
                    Cancel
                  </button>
                  <button onClick={handleDelete}
                    className="pressable flex-1 py-2.5 text-[13px] font-semibold rounded-xl bg-danger text-white">
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
        <EditAppointmentModal appointment={editingAppointment} onClose={() => setEditingAppointment(null)} />
      )}
    </>
  );
}
