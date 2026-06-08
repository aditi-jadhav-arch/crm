import React, { useState } from "react";
import { cn } from "../../lib/utils";

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ name, avatarUrl, size = "md", className }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const initials = React.useMemo(() => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs font-semibold",
    md: "h-10 w-10 text-sm font-semibold",
    lg: "h-16 w-16 text-xl font-bold",
  };

  // Generate a soft background color based on name string hash
  const bgColorClass = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-900/50",
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50",
      "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200 dark:border-blue-900/50",
      "bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300 border-purple-200 dark:border-purple-900/50",
      "bg-pink-100 text-pink-800 dark:bg-pink-950/30 dark:text-pink-300 border-pink-200 dark:border-pink-900/50",
      "bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-300 border-teal-200 dark:border-teal-900/50",
    ];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }, [name]);

  return (
    <div
      className={cn(
        "relative shrink-0 flex items-center justify-center rounded-full overflow-hidden border select-none",
        sizeClasses[size],
        bgColorClass,
        className
      )}
    >
      {avatarUrl && !imageError ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
export default Avatar;
