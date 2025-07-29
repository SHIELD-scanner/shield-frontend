"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconShield,
  IconCalendar,
  IconAlertTriangle,
  IconKey,
  IconCode,
  IconFileText,
  IconCopy,
  IconExternalLink,
  IconMapPin,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

import exposedSecretsData from "../data.json";

interface PageProps {
  params: {
    id: string;
  };
}

function getSeverityBadgeVariant(severity: string) {
  switch (severity.toLowerCase()) {
    case "critical":
      return "destructive";
    case "high":
      return "secondary";
    case "medium":
      return "outline";
    case "low":
      return "default";
    default:
      return "outline";
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "destructive";
    case "suppressed":
      return "outline";
    case "resolved":
      return "default";
    default:
      return "outline";
  }
}

function getConfidenceBadgeVariant(confidence: string) {
  switch (confidence.toLowerCase()) {
    case "high":
      return "default";
    case "medium":
      return "secondary";
    case "low":
      return "outline";
    default:
      return "outline";
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case "aws":
    case "azure":
    case "google":
      return IconShield;
    case "github":
    case "gitlab":
      return IconCode;
    case "database":
      return IconFileText;
    case "cryptography":
    case "ssh":
      return IconKey;
    default:
      return IconKey;
  }
}
interface Secret {
  id: string;
  secretType: string;
  ruleId: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  match: string;
  file: string;
  line: number;
  column: number;
  code: string;
  imageId: number;
  imageName: string;
  tag: string;
  namespace: string;
  workload: string;
  detectedDate: string;
  status: string;
  falsePositive: boolean;
  suppressed: boolean;
  confidence: string;
  entropy: number;
}

export default function SecretDetailPage({ params }: PageProps) {
  const secretId = params.id;
  const [showSecret, setShowSecret] = useState(false);

  const secret = exposedSecretsData.find((s: Secret) => s.id === secretId);

  if (!secret) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Secret not found</h1>
          <Link href="/exposed-secrets">
            <Button variant="outline" className="mt-4">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Secrets
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(secret.category);

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
                {/* Navigation */}
                <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
                  <Link href="/exposed-secrets" className="hover:underline">
                    Exposed Secrets
                  </Link>
                  <span>/</span>
                  <span className="text-foreground font-medium">
                    {secret.secretType}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <Link href="/exposed-secrets">
                    <Button variant="outline" size="sm">
                      <IconArrowLeft className="mr-2 h-4 w-4" />
                      Back to Secrets
                    </Button>
                  </Link>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <CategoryIcon className="h-6 w-6 text-muted-foreground" />
                      <h1 className="text-2xl font-bold">
                        {secret.secretType}
                      </h1>
                      <Badge
                        variant={getSeverityBadgeVariant(secret.severity)}
                        className="capitalize"
                      >
                        {secret.severity}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {secret.category}
                      </Badge>
                    </div>
                    <h2 className="text-lg text-muted-foreground">
                      {secret.title}
                    </h2>
                  </div>
                </div>

                {/* Alert Banner */}
                {secret.status === "active" && !secret.suppressed && (
                  <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-6">
                    <IconAlertTriangle className="h-5 w-5 text-destructive" />
                    <div>
                      <div className="font-semibold text-destructive">
                        Active Security Risk
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This secret is currently active and poses a security
                        risk. Take immediate action to rotate or remove it.
                      </p>
                    </div>
                  </div>
                )}

                {/* Overview Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Status
                      </CardTitle>
                      <IconShield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getStatusBadgeVariant(secret.status)}
                          className="capitalize"
                        >
                          {secret.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {secret.falsePositive && (
                          <Badge variant="outline" className="text-xs">
                            False Positive
                          </Badge>
                        )}
                        {secret.suppressed && (
                          <Badge variant="outline" className="text-xs">
                            Suppressed
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Confidence
                      </CardTitle>
                      <IconKey className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getConfidenceBadgeVariant(secret.confidence)}
                          className="capitalize"
                        >
                          {secret.confidence}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Entropy: {secret.entropy.toFixed(1)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Detected
                      </CardTitle>
                      <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-medium">
                        {formatDate(secret.detectedDate)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Rule
                      </CardTitle>
                      <IconCode className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-mono">{secret.ruleId}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconFileText className="h-5 w-5" />
                        Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">
                        {secret.description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Location Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconMapPin className="h-5 w-5" />
                        Location Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">File Path</Label>
                        <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                          {secret.file}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Line</Label>
                          <p className="text-sm">{secret.line}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Column</Label>
                          <p className="text-sm">{secret.column}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Image</Label>
                        <Link
                          href={`/vulnerable-images/${secret.imageId}`}
                          className="block text-sm hover:underline text-blue-600 dark:text-blue-400 mt-1"
                        >
                          {secret.imageName}:{secret.tag}
                        </Link>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Workload</Label>
                        <p className="text-sm">{secret.workload}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Namespace</Label>
                        <Badge variant="outline" className="mt-1">
                          {secret.namespace}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Code Context */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconCode className="h-5 w-5" />
                      Code Context
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSecret(!showSecret)}
                        className="ml-auto"
                      >
                        {showSecret ? (
                          <>
                            <IconEyeOff className="mr-2 h-4 w-4" />
                            Hide Secret
                          </>
                        ) : (
                          <>
                            <IconEye className="mr-2 h-4 w-4" />
                            Show Secret
                          </>
                        )}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="font-mono text-sm bg-muted p-4 rounded overflow-x-auto">
                        <code>{showSecret ? secret.code : secret.match}</code>
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            showSecret ? secret.code : secret.match
                          )
                        }
                      >
                        <IconCopy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>
                        Line {secret.line}, Column {secret.column} in{" "}
                        {secret.file}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Remediation */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconShield className="h-5 w-5" />
                      Remediation Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <div>
                          <div className="font-medium">
                            Remove the secret from the code
                          </div>
                          <p className="text-muted-foreground">
                            Delete the hardcoded secret from the source file.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          2
                        </div>
                        <div>
                          <div className="font-medium">Rotate the secret</div>
                          <p className="text-muted-foreground">
                            Generate a new secret and update all systems that
                            use it.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          3
                        </div>
                        <div>
                          <div className="font-medium">
                            Use environment variables or secret management
                          </div>
                          <p className="text-muted-foreground">
                            Store secrets in environment variables or a
                            dedicated secret management system.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          4
                        </div>
                        <div>
                          <div className="font-medium">Review git history</div>
                          <p className="text-muted-foreground">
                            Check if the secret was committed to version control
                            and consider cleaning the history.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-2 mt-6">
                  <Button>
                    <IconShield className="mr-2 h-4 w-4" />
                    Mark as Resolved
                  </Button>
                  <Button variant="outline">Mark as False Positive</Button>
                  <Button variant="outline">Suppress Alerts</Button>
                  <Button variant="outline">
                    <IconExternalLink className="mr-2 h-4 w-4" />
                    View in Repository
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={className}>{children}</label>;
}
