"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Command, Menu, X } from "lucide-react";
import { NAV_SECTIONS } from "./nav-config";

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SideNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-40 inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-700/60 bg-slate-900/80 text-slate-200 backdrop-blur transition hover:bg-slate-800 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-slate-800/60 bg-slate-950/95 backdrop-blur transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-300 ring-1 ring-inset ring-indigo-400/40">
              <Command className="h-3.5 w-3.5" />
            </span>
            <span>Personal Dashboard</span>
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.section}>
              <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {section.section}
              </p>
              <ul className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname ?? "", item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={[
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                          active
                            ? "bg-indigo-500/15 text-indigo-200 ring-1 ring-inset ring-indigo-400/30"
                            : "text-slate-300 hover:bg-slate-800/70 hover:text-white",
                        ].join(" ")}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-800/60 px-5 py-4 text-[11px] text-slate-500">
          MVP build · Phase 2
        </div>
      </aside>
    </>
  );
}
