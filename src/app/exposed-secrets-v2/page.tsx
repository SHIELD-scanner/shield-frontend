import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { ExposedSecretsTable } from "@/components/exposed-secrets-table";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import exposedSecretsData from "./data.json";

export default function ExposedSecretsPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-2">
                  <h1 className="text-2xl font-bold">Exposed Secrets</h1>
                  <p className="text-muted-foreground">
                    Secrets, API keys, and sensitive information detected in
                    your container images and repositories
                  </p>
                </div>
              </div>
              <ExposedSecretsTable data={exposedSecretsData} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
