import React from "react";
import { cn } from "../../lib/utils";

interface StatusBadgeProps {
  status: "lead" | "prospect" | "customer" | "churned";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    lead: "bg-sky-50 text-sky-700 border-sky-200",
    prospect: "bg-amber-100 text-amber-800 border-amber-200",
    customer: "bg-emerald-100 text-emerald-800 border-emerald-200",
    churned: "bg-rose-100 text-rose-800 border-rose-200",
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
    lead: "bg-sky-50 text-sky-700 border-sky-200",
    qualified: "bg-purple-100 text-purple-800 border-purple-200",
    proposal: "bg-blue-100 text-blue-800 border-blue-200",
    negotiation: "bg-orange-100 text-orange-800 border-orange-200",
    closed_won: "bg-emerald-100 text-emerald-800 border-emerald-200",
    closed_lost: "bg-rose-100 text-rose-800 border-rose-200",
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
