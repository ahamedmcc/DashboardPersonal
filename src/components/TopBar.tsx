import { CalendarDays } from "lucide-react";

function formatToday(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/80 px-4 py-3 backdrop-blur lg:px-8">
      <div className="flex items-center justify-between gap-4 pl-12 lg:pl-0">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-semibold text-white">Personal Command Dashboard</span>
          <span className="hidden text-xs text-slate-500 sm:inline">
            Telegram + Hermes powered
          </span>
        </div>
        <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{formatToday()}</span>
        </div>
      </div>
    </header>
  );
}
