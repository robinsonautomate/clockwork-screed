import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { BugReportWidget } from "@/components/bug-report-widget";
import { CommandPalette } from "@/components/command-palette";
import { Topbar } from "@/components/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <Topbar />
        <main className="flex-1 px-4 py-5 md:px-6 md:py-7">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </SidebarInset>
      <CommandPalette />
      <BugReportWidget />
    </SidebarProvider>
  );
}
