import React from "react";
import { cn } from "../../lib/utils";

interface StatusBadgeProps {
  status: "lead" | "prospect" | "customer" | "churned";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    lead: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300 border-sky-200 dark:border-sky-900/50",
    prospect: "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-900/50",
    customer: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50",
    churned: "bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200 dark:border-rose-900/50",
  };

  const labels = {
    lead: "Lead",
    prospect: "Prospect",
    customer: "Customer",
    churned: "Churned",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border",
        styles[status] || styles.lead,
        className
      )}
    >
      {labels[status] || status}
    </span>
  );
}

interface StageBadgeProps {
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  className?: string;
}

export function StageBadge({ stage, className }: StageBadgeProps) {
  const styles = {
    lead: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300 border-sky-200 dark:border-sky-900/50",
    qualified: "bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300 border-purple-200 dark:border-purple-900/50",
    proposal: "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200 dark:border-blue-900/50",
    negotiation: "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300 border-orange-200 dark:border-orange-900/50",
    closed_won: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50",
    closed_lost: "bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200 dark:border-rose-900/50",
  };

  const labels = {
    lead: "Lead",
    qualified: "Qualified",
    proposal: "Proposal",
    negotiation: "Negotiation",
    closed_won: "Closed Won",
    closed_lost: "Closed Lost",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        styles[stage] || styles.lead,
        className
      )}
    >
      {labels[stage] || stage}
    </span>
  );
}
