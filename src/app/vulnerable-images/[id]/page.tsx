import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { ImageVulnerabilitiesTable } from "@/components/image-vulnerabilities-table";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconArrowLeft,
  IconShield,
  IconClock,
  IconAlertTriangle,
} from "@tabler/icons-react";
import Link from "next/link";

import vulnerableImagesData from "../data.json";
import vulnerabilitiesData from "./vulnerabilities-data.json";
// Function to get vulnerabilities for a specific image
function getVulnerabilitiesForImage(imageId: number) {
  return vulnerabilitiesData.filter(
    (vuln: { imageId: number }) => vuln.imageId === imageId
  );
}

interface PageProps {
  params: {
    id: string;
  };
}

function getRiskScoreBadgeVariant(score: number) {
  if (score >= 9) return "destructive";
  if (score >= 7) return "secondary";
  if (score >= 5) return "outline";
  return "default";
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}w ago`;
}

export default function ImageDetailPage({ params }: PageProps) {
  const imageId = parseInt(params.id);
  const image = vulnerableImagesData.find((img) => img.id === imageId);
  const imageVulnerabilities = getVulnerabilitiesForImage(imageId);

  if (!image) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Image not found</h1>
          <Link href="/vulnerable-images">
            <Button variant="outline" className="mt-4">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Images
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
                <div className="flex items-center gap-4 mb-6">
                  <Link href="/vulnerable-images">
                    <Button variant="outline" size="sm">
                      <IconArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  </Link>
                  <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">
                      {image.imageName}:{image.tag}
                    </h1>
                    <p className="text-muted-foreground">{image.fullName}</p>
                  </div>
                </div>

                {/* Image Overview Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Risk Score
                      </CardTitle>
                      <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getRiskScoreBadgeVariant(image.riskScore)}
                          className="text-lg font-bold px-3 py-1"
                        >
                          {image.riskScore.toFixed(1)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Vulnerabilities
                      </CardTitle>
                      <IconShield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {image.vulnerabilityCount.total}
                      </div>
                      <div className="flex gap-1 mt-2">
                        {image.vulnerabilityCount.critical > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {image.vulnerabilityCount.critical} Critical
                          </Badge>
                        )}
                        {image.vulnerabilityCount.high > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {image.vulnerabilityCount.high} High
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Last Scanned
                      </CardTitle>
                      <IconClock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatTimeAgo(image.lastScanned)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(image.lastScanned).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Image Size
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{image.size}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {image.namespace}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {image.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Workloads */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Deployed Workloads
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {image.workloads.map((workload) => (
                        <Badge
                          key={workload}
                          variant="outline"
                          className="px-3 py-1"
                        >
                          {workload}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Vulnerabilities Table */}
              <div className="px-4 lg:px-6">
                <h2 className="text-xl font-semibold mb-4">
                  Vulnerabilities ({imageVulnerabilities.length})
                </h2>
                <ImageVulnerabilitiesTable
                  data={imageVulnerabilities}
                  imageId={imageId}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
