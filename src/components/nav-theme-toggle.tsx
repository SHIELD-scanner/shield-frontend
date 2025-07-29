"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="w-full justify-start"
        >
          {theme === "light" ? (
            <IconMoon className="h-4 w-4" />
          ) : (
            <IconSun className="h-4 w-4" />
          )}
          <span>Toggle dark mode</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
