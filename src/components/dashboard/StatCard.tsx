import { useLanguage } from "@/lib/i18n";

// Icon components matching the reference design
const VulnerabilityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" fill="#ef4444"/>
    <path d="M12 1v6m0 4v6m11-7h-6m-4 0H1" stroke="#ef4444" strokeWidth="1.5"/>
  </svg>
);

const CriticalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L22 20H2L12 2Z" fill="#f59e0b"/>
    <path d="M12 9V13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="0.8" fill="white"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#10b981"/>
    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="3" fill="#ef4444"/>
    <path d="M11 11l9 9" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M17 17l2 2" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="8" cy="8" r="1" fill="white"/>
  </svg>
);

const getIcon = (iconType: string) => {
  switch (iconType) {
    case 'vulnerability':
      return <VulnerabilityIcon />;
    case 'critical':
      return <CriticalIcon />;
    case 'shield':
      return <ShieldIcon />;
    case 'key':
      return <KeyIcon />;
    default:
      return null;
  }
};

export function StatCard({
  title,
  value,
  subtext,
  valueClass = "",
  subtextClass = "",
  icon,
}: Readonly<{
  title: string;
  value: string | number;
  subtext?: string;
  valueClass?: string;
  subtextClass?: string;
  icon?: string;
}>) {
  const { t } = useLanguage();
  return (
    <div className="bg-[#0f1419] rounded-lg p-5 border border-gray-800/50 hover:border-gray-700/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">{t(title)}</h3>
        {icon && (
          <div className="opacity-80">
            {getIcon(icon)}
          </div>
        )}
      </div>
      <div className={`text-3xl font-bold text-white mb-2 ${valueClass}`}>
        {value}
      </div>
      {subtext && (
        <div className={`text-xs flex items-center ${subtextClass}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="mr-1">
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t(subtext)}
        </div>
      )}
    </div>
  );
}
