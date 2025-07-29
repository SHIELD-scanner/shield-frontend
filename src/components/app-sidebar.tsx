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
  IconPhoto,
  IconBug,
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
const data = {
  user: {
    name: "SHIELD User",
    email: "user@shield.dev",
    avatar: "/avatars/shield-user.jpg",
  },
  navMain: [
    {
      title: "nav.dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "nav.vulnerable-images",
      url: "/vulnerable-images",
      icon: IconListDetails,
    },
    {
      title: "nav.exposed-secrets",
      url: "/exposed-secrets",
      icon: IconKey,
    },
    {
      title: "nav.cluster-audits",
      url: "/cluster-audits",
      icon: IconServer,
    },
    {
      title: "nav.rbac-audits",
      url: "/rbac-audits",
      icon: IconUsers,
    },
    {
      title: "nav.users",
      url: "/users",
      icon: IconUsers,
    },
    {
      title: "nav.images",
      url: "/images",
      icon: IconPhoto,
    },
    {
      title: "nav.vulnerabilities",
      url: "/vulnerabilities",
      icon: IconBug,
    },
    {
      title: "nav.settings",
      url: "/settings",
      icon: IconSettings,
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
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
