"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const clusters = [
  { id: "All", name: "All Clusters" },
  { id: "cluster-1", name: "Cluster 1" },
  { id: "cluster-2", name: "Cluster 2" },
  { id: "cluster-3", name: "Cluster 3" },
];

function ClusterSelector() {
  const [selected, setSelected] = useState(clusters[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[120px]">
          {selected.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background border">
        {clusters.map((cluster) => (
          <DropdownMenuItem
            key={cluster.id}
            onSelect={() => setSelected(cluster)}
            className={selected.id === cluster.id ? "font-semibold" : ""}
          >
            {cluster.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  return (
    <header className="flex h-[--header-height] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[--header-height]">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <ClusterSelector />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <h1 className="text-base font-medium">Dashboard</h1>
        <div className="ml-auto flex items-center gap-2"></div>
      </div>
    </header>
  );
}
