"use client";

import { ThemeToggle } from "@/components/custom/ThemeToggle";

import React, { useEffect, useState } from "react";
import { useLanguage, availableLanguages } from "@/lib/i18n";
import { fetchNamespaces } from "@/services/namespaceService";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconSettings,
  IconPalette,
  IconGlobe,
  IconServer,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";

interface NamespaceSelectorProps {
  value: string;
  onChange: (v: string) => void;
  namespaceOptions: { cluster: string; name: string }[];
}

function NamespaceSelector(props: Readonly<NamespaceSelectorProps>) {
  const { value, onChange, namespaceOptions } = props;
  const { t } = useLanguage();

  const options = namespaceOptions.map((ns) => `${ns.cluster}/${ns.name}`);

  return (
    <div className="space-y-2">
      <Label htmlFor="namespace-select">{t("sidebar.namespace")}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={t("sidebar.namespacePlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("sidebar.all")}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ThemeToggleCard() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  function getCookie(name: string) {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
    return null;
  }

  function setCookie(name: string, value: string, days = 365) {
    if (typeof document === "undefined") return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    const saved = getCookie("theme");
    let dark = false;
    if (
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
      dark = true;
    } else {
      root.classList.remove("dark");
    }
    setIsDark(dark);
  }, [mounted]);

  if (!mounted) return null;

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      setCookie("theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      setCookie("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label>Theme</Label>
        <p className="text-sm text-muted-foreground">
          Choose between light and dark themes
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {isDark ? (
          <IconMoon className="h-4 w-4" />
        ) : (
          <IconSun className="h-4 w-4" />
        )}
        <Switch checked={isDark} onCheckedChange={toggleTheme} />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [namespaceList, setNamespaceList] = useState<
    { cluster: string; name: string }[]
  >([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string>("all");
  const { lang, setLang, t } = useLanguage();
  const [notifications, setNotifications] = useState({
    vulnerabilities: true,
    secrets: true,
    compliance: false,
    updates: true,
  });
  const [securitySettings, setSecuritySettings] = useState({
    autoScan: true,
    realTimeMonitoring: true,
    alertThreshold: "medium",
  });

  // Hydrate from sessionStorage after mount (client only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ns = sessionStorage.getItem("namespace");
      if (ns) setSelectedNamespace(ns);
    }
  }, []);

  useEffect(() => {
    fetchNamespaces()
      .then((data) => {
        if (Array.isArray(data) && data.length && typeof data[0] === "string") {
          setNamespaceList(
            data.map((name: string) => ({ cluster: "default", name }))
          );
        } else if (
          Array.isArray(data) &&
          data.length &&
          typeof data[0] === "object" &&
          data[0] !== null &&
          Object.hasOwn(data[0], "cluster") &&
          Object.hasOwn(data[0], "name") &&
          data.every(
            (item) =>
              typeof item === "object" &&
              item !== null &&
              "cluster" in item &&
              "name" in item
          )
        ) {
          setNamespaceList(data as { cluster: string; name: string }[]);
        } else {
          setNamespaceList([]);
        }
      })
      .catch(() => setNamespaceList([]));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("namespace", selectedNamespace);
      document.cookie = `namespace=${encodeURIComponent(
        selectedNamespace
      )}; path=/`;
    }
  }, [selectedNamespace]);

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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              {/* Header */}
              <div className="flex items-center gap-2">
                <IconSettings className="h-6 w-6" />
                <h1 className="text-2xl font-bold">Settings</h1>
              </div>

              <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger
                    value="general"
                    className="flex items-center gap-2"
                  >
                    <IconSettings className="h-4 w-4" />
                    General
                  </TabsTrigger>
                  <TabsTrigger
                    value="appearance"
                    className="flex items-center gap-2"
                  >
                    <IconPalette className="h-4 w-4" />
                    Appearance
                  </TabsTrigger>
                  {/* <TabsTrigger
                    value="notifications"
                    className="flex items-center gap-2"
                  >
                    <IconBell className="h-4 w-4" />
                    Notifications
                  </TabsTrigger> */}
                  {/* <TabsTrigger
                    value="security"
                    className="flex items-center gap-2"
                  >
                    <IconShield className="h-4 w-4" />
                    Security
                  </TabsTrigger> */}
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                  <div className="grid gap-6">
                    {/* General Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconGlobe className="h-5 w-5" />
                          Language & Region
                        </CardTitle>
                        <CardDescription>
                          Configure your language preferences and regional
                          settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="language-select">Language</Label>
                          <Select value={lang} onValueChange={setLang}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableLanguages().map((code) => (
                                <SelectItem key={code} value={code}>
                                  {t(code)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Timezone</Label>
                          <Select defaultValue="utc">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="utc">
                                UTC (Coordinated Universal Time)
                              </SelectItem>
                              <SelectItem value="est">
                                EST (Eastern Standard Time)
                              </SelectItem>
                              <SelectItem value="pst">
                                PST (Pacific Standard Time)
                              </SelectItem>
                              <SelectItem value="cet">
                                CET (Central European Time)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Namespace Configuration */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconServer className="h-5 w-5" />
                          Namespace Configuration
                        </CardTitle>
                        <CardDescription>
                          Manage your default namespace and cluster settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <NamespaceSelector
                          value={selectedNamespace}
                          onChange={setSelectedNamespace}
                          namespaceOptions={namespaceList}
                        />
                        {/* <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-refresh namespace data</Label>
                            <p className="text-sm text-muted-foreground">
                              Automatically refresh namespace information every
                              30 seconds
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div> */}
                      </CardContent>
                      {/* <CardFooter>
                        <Button variant="outline" className="w-full">
                          <IconRefresh className="h-4 w-4 mr-2" />
                          Refresh Namespaces
                        </Button>
                      </CardFooter> */}
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-6">
                  <div className="grid gap-6">
                    {/* Theme Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconPalette className="h-5 w-5" />
                          Theme & Display
                        </CardTitle>
                        <CardDescription>
                          Customize the appearance of your dashboard
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <ThemeToggleCard />
                        <ThemeToggle />

                        {/* <Separator /> */}
                        {/* <div className="space-y-4"> */}
                        {/* <div className="flex items-center justify-between">
                            <div>
                              <Label>Compact mode</Label>
                              <p className="text-sm text-muted-foreground">
                                Show more data in less space
                              </p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Show tooltips</Label>
                              <p className="text-sm text-muted-foreground">
                                Display helpful tooltips on hover
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div> */}
                        {/* <div className="space-y-2">
                            <Label>Dashboard refresh rate</Label>
                            <Select defaultValue="30">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 seconds</SelectItem>
                                <SelectItem value="30">30 seconds</SelectItem>
                                <SelectItem value="60">1 minute</SelectItem>
                                <SelectItem value="300">5 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div> */}
                        {/* </div> */}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* <TabsContent value="notifications" className="space-y-6">
                  <div className="grid gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconBell className="h-5 w-5" />
                          Notification Preferences
                        </CardTitle>
                        <CardDescription>
                          Configure when and how you want to be notified
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Vulnerability alerts</Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified when new vulnerabilities are found
                              </p>
                            </div>
                            <Switch
                              checked={notifications.vulnerabilities}
                              onCheckedChange={(checked) =>
                                setNotifications((prev) => ({
                                  ...prev,
                                  vulnerabilities: checked,
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Exposed secrets</Label>
                              <p className="text-sm text-muted-foreground">
                                Alert when secrets are detected in code or
                                images
                              </p>
                            </div>
                            <Switch
                              checked={notifications.secrets}
                              onCheckedChange={(checked) =>
                                setNotifications((prev) => ({
                                  ...prev,
                                  secrets: checked,
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Compliance violations</Label>
                              <p className="text-sm text-muted-foreground">
                                Notify about compliance check failures
                              </p>
                            </div>
                            <Switch
                              checked={notifications.compliance}
                              onCheckedChange={(checked) =>
                                setNotifications((prev) => ({
                                  ...prev,
                                  compliance: checked,
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>System updates</Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified about system updates and
                                maintenance
                              </p>
                            </div>
                            <Switch
                              checked={notifications.updates}
                              onCheckedChange={(checked) =>
                                setNotifications((prev) => ({
                                  ...prev,
                                  updates: checked,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                          <Label>Email notification frequency</Label>
                          <Select defaultValue="immediate">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">
                                Immediate
                              </SelectItem>
                              <SelectItem value="hourly">
                                Hourly digest
                              </SelectItem>
                              <SelectItem value="daily">
                                Daily digest
                              </SelectItem>
                              <SelectItem value="weekly">
                                Weekly digest
                              </SelectItem>
                              <SelectItem value="never">Never</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent> */}

                {/* <TabsContent value="security" className="space-y-6"> */}
                {/* <div className="grid gap-6"> */}
                {/* Security Settings */}
                {/* <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconShield className="h-5 w-5" />
                          Security & Monitoring
                        </CardTitle>
                        <CardDescription>
                          Configure security scanning and monitoring settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Auto-scan new images</Label>
                              <p className="text-sm text-muted-foreground">
                                Automatically scan new container images for vulnerabilities
                              </p>
                            </div>
                            <Switch 
                              checked={securitySettings.autoScan}
                              onCheckedChange={(checked) => 
                                setSecuritySettings(prev => ({...prev, autoScan: checked}))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Real-time monitoring</Label>
                              <p className="text-sm text-muted-foreground">
                                Monitor cluster activities in real-time
                              </p>
                            </div>
                            <Switch 
                              checked={securitySettings.realTimeMonitoring}
                              onCheckedChange={(checked) => 
                                setSecuritySettings(prev => ({...prev, realTimeMonitoring: checked}))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Alert threshold</Label>
                            <Select 
                              value={securitySettings.alertThreshold}
                              onValueChange={(value) => 
                                setSecuritySettings(prev => ({...prev, alertThreshold: value}))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low (All vulnerabilities)</SelectItem>
                                <SelectItem value="medium">Medium (Medium and above)</SelectItem>
                                <SelectItem value="high">High (High and critical only)</SelectItem>
                                <SelectItem value="critical">Critical (Critical only)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                          <Label>Data retention period</Label>
                          <Select defaultValue="90">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="180">6 months</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card> */}

                {/* API Keys */}
                {/* <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconKey className="h-5 w-5" />
                          API Keys & Access
                        </CardTitle>
                        <CardDescription>
                          Manage API keys and external integrations
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Current API Key</Label>
                          <div className="flex space-x-2">
                            <Input type="password" value="sk-****************************" readOnly />
                            <Button variant="outline" size="sm">
                              <IconRefresh className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" className="flex-1">
                            Generate New Key
                          </Button>
                          <Button variant="destructive" className="flex-1">
                            Revoke Access
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>*/}
              </Tabs>

              {/* Save Button */}
              {/* <Card> */}
              {/* <CardFooter className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    Settings are automatically saved
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline">Reset to Defaults</Button>
                    <Button>
                      <IconCheck className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardFooter>
              </Card> */}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
