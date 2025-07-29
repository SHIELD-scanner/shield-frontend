"use client";
import {
  IconDashboard,
  IconHelp,
  IconListDetails,
  IconSettings,
  IconUsers,
  IconKey,
  IconServer,
  IconShield,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { NavThemeToggle } from "@/components/nav-theme-toggle";
import { ThemeToggle } from "@/components/custom/ThemeToggle";

const data = {
  user: {
    name: "SHIELD User",
    email: "user@shield.dev",
    avatar: "/avatars/shield-user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Vulnerable Images",
      url: "/vulnerable-images",
      icon: IconListDetails,
    },
    {
      title: "Exposed Secrets",
      url: "/exposed-secrets",
      icon: IconKey,
    },
    {
      title: "Cluster Audits",
      url: "/cluster-audits",
      icon: IconServer,
    },
    {
      title: "RBAC Audits",
      url: "/rbac-audits",
      icon: IconUsers,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Help & Support",
      url: "#",
      icon: IconHelp,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconShield className="h-6 w-6" />
                <span className="text-base font-semibold">SHIELD</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
        <NavThemeToggle />
        <ThemeToggle />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
