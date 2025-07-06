// All fields that are user-facing and should be translated are now keys, not raw strings.
export const dashboardNav = [
  {
    label: "nav.dashboard",
    href: "/",
    badge: undefined,
    badgeColor: undefined,
  },
  {
    label: "nav.vulnerabilities",
    href: "/vulnerabilities",
    badge: "127",
    badgeColor: "bg-[#e11d48]",
  },
  {
    label: "nav.compliance",
    href: "/compliance",
    badge: "23",
    badgeColor: "bg-[#2563eb]",
  },
  { label: "nav.configAudit", href: "/config-audit" },
  {
    label: "nav.exposedSecrets",
    href: "/exposed-secrets",
    badge: "5",
    badgeColor: "bg-[#e11d48]",
  },
  { label: "nav.rbacAssessment", href: "/rbac-assessment" },
  { label: "nav.sbomReports", href: "/sbom-reports" },
];
