"use client";

import * as React from "react";
import { IconClock } from "@tabler/icons-react";

// Component for time display that prevents hydration mismatches
export function TimeDisplay({ 
  dateString, 
  showIcon = true,
  className = "" 
}: { 
  dateString: string;
  showIcon?: boolean;
  className?: string;
}) {
  const [timeAgo, setTimeAgo] = React.useState<string>("");
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    
    const formatTimeAgo = (dateString: string) => {
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
    };

    setTimeAgo(formatTimeAgo(dateString));
  }, [dateString]);

  // Show a static fallback during SSR and initial hydration
  if (!isClient) {
    return (
      <div className={`flex items-center gap-1 text-sm ${className}`}>
        {showIcon && <IconClock className="h-3 w-3 text-muted-foreground" />}
        {new Date(dateString).toLocaleDateString()}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 text-sm ${className}`}>
      {showIcon && <IconClock className="h-3 w-3 text-muted-foreground" />}
      {timeAgo}
    </div>
  );
}
