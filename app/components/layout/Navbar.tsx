export default function Navbar() {
  return (
    <header className="h-14 bg-white border-b border-neutral-border px-6 flex items-center justify-between shrink-0">
      <div className="text-sm text-neutral-gray">
        Spring 2025 — CSE 499
      </div>
      <div className="flex items-center gap-3">
        {/* Google Calendar status placeholder */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-gray border border-neutral-border rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-gray"></span>
          Google Calendar not connected
        </div>
      </div>
    </header>
  );
}
