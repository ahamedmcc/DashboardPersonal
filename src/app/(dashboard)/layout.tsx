import type { ReactNode } from "react";
import { SideNav } from "@/components/SideNav";
import { TopBar } from "@/components/TopBar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <SideNav />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <TopBar />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
