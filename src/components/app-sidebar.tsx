"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bug,
  CalendarDays,
  FileText,
  HardHat,
  Inbox,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Settings,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { logout } from "@/lib/actions/auth";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/quotes", label: "Quotes", icon: FileText },
  { href: "/jobs", label: "Jobs", icon: HardHat },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/invoices", label: "Invoices", icon: ReceiptText },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/bugs", label: "Bug log", icon: Bug },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <Link
          href="/"
          className="block rounded-lg bg-white px-3 py-2.5 transition-opacity hover:opacity-90"
        >
          <Image
            src="/clockwork-screed-logo.webp"
            alt="Clockwork Screed"
            width={1000}
            height={289}
            priority
            className="h-auto w-full"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV.map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className="h-10 data-[active=true]:font-semibold data-[active=true]:text-amber-400!"
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <form action={logout}>
          <SidebarMenuButton
            type="submit"
            className="h-10 text-sidebar-foreground/80 hover:text-sidebar-foreground"
          >
            <LogOut />
            <span>Sign out</span>
          </SidebarMenuButton>
        </form>
        <p className="px-2 pt-2 text-[11px] leading-tight text-sidebar-foreground/45">
          Clockwork Screed Ltd · operations
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
