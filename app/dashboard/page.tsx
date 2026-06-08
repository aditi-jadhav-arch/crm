"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  CheckSquare, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  TrendingUp,
  UserPlus,
  CalendarPlus
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";
import { useDashboardStats } from "../../lib/hooks/useDashboardStats";
import { useContacts } from "../../lib/hooks/useContacts";
import { useDeals } from "../../lib/hooks/useDeals";
import { useActivities } from "../../lib/hooks/useActivities";
import { formatCurrency, formatDate, cn } from "../../lib/utils";
import { StageBadge } from "@/components/ui/status-badges";
import { ActivityTimeline } from "@/components/ui/activity-timeline";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { stats, loading: statsLoading } = useDashboardStats();
  const { contacts, loading: contactsLoading } = useContacts();
  const { deals, loading: dealsLoading } = useDeals();
  const { activities, loading: activitiesLoading } = useActivities();

  useEffect(() => {
    setMounted(true);
  }, []);

  const loading = statsLoading || contactsLoading || dealsLoading || activitiesLoading;

  // 1. Calculate Revenue Over Time (Last 6 Months)
  const revenueChartData = React.useMemo(() => {
    if (loading) return [];
    
    // Get last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString("default", { month: "short" }),
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
      });
    }

    const wonDeals = deals.filter(d => d.stage === "closed_won");

    return months.map(m => {
      const matchingDeals = wonDeals.filter(d => {
        let closeDate: Date;
        if (d.actualCloseDate?.seconds) {
          closeDate = new Date(d.actualCloseDate.seconds * 1000);
        } else if (d.actualCloseDate?.toDate) {
          closeDate = d.actualCloseDate.toDate();
        } else if (d.actualCloseDate instanceof Date) {
          closeDate = d.actualCloseDate;
        } else {
          closeDate = d.updatedAt?.seconds 
            ? new Date(d.updatedAt.seconds * 1000) 
            : new Date();
        }
        return closeDate.getMonth() === m.monthIndex && closeDate.getFullYear() === m.year;
      });

      const totalRevenue = matchingDeals.reduce((sum, d) => sum + (d.value || 0), 0);
      return {
        name: m.label,
        Revenue: totalRevenue,
      };
    });
  }, [deals, loading]);

  // 2. Calculate Deals By Stage
  const dealStageChartData = React.useMemo(() => {
    if (loading) return [];

    const stages = {
      lead: { name: "Lead", count: 0 },
      qualified: { name: "Qualified", count: 0 },
      proposal: { name: "Proposal", count: 0 },
      negotiation: { name: "Negotiation", count: 0 },
      closed_won: { name: "Closed Won", count: 0 },
      closed_lost: { name: "Closed Lost", count: 0 },
    };

    deals.forEach((deal) => {
      if (stages[deal.stage]) {
        stages[deal.stage].count += 1;
      }
    });

    return Object.values(stages).filter(s => s.count > 0);
  }, [deals, loading]);

  // 3. Top Open Deals (Limit to 5, sorted by value)
  const topOpenDeals = React.useMemo(() => {
    return deals
      .filter((d) => !["closed_won", "closed_lost"].includes(d.stage))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [deals]);

  // 4. Recent Activities (Limit to 8)
  const recentActivities = React.useMemo(() => {
    return activities.slice(0, 8);
  }, [activities]);

  const triggerQuickAdd = (eventName: string) => {
    window.dispatchEvent(new CustomEvent(eventName));
  };

  // Pie chart theme colors mapped from CSS variables
  // --chart-1, --chart-2, --chart-3, --chart-4, --chart-5, and --primary
  const PIE_COLORS = [
    "var(--primary)",
    "var(--chart-2)",
    "var(--chart-1)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--destructive)"
  ];

  if (loading || !mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-card border border-border rounded-lg" />
          ))}
        </div>
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-card border border-border rounded-lg lg:col-span-2" />
          <div className="h-96 bg-card border border-border rounded-lg" />
        </div>
        {/* Bottom Rows Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-card border border-border rounded-lg lg:col-span-2" />
          <div className="h-96 bg-card border border-border rounded-lg" />
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      title: "Total Contacts",
      value: stats.totalContacts,
      trend: stats.totalContactsTrend,
      icon: Users,
      color: "text-orange-600 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400",
    },
    {
      title: "Open Deals",
      value: stats.openDeals,
      trend: stats.openDealsTrend,
      icon: Briefcase,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      trend: stats.totalRevenueTrend,
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400",
    },
    {
      title: "Tasks Due Today",
      value: stats.tasksDueToday,
      trend: stats.tasksDueTodayTrend,
      icon: CheckSquare,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400",
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Welcome to CRM Core</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here is your sales performance overview and action center.
          </p>
        </div>
        
        {/* Quick actions row */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => triggerQuickAdd("crm-open-add-contact")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-opacity cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Contact</span>
          </button>
          
          <button
            onClick={() => triggerQuickAdd("crm-open-add-deal")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold bg-secondary text-secondary-foreground hover:bg-muted border border-border shadow-xs transition-colors cursor-pointer"
          >
            <Briefcase className="h-3.5 w-3.5 text-primary" />
            <span>Create Deal</span>
          </button>
          
          <button
            onClick={() => triggerQuickAdd("crm-open-add-activity")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold bg-secondary text-secondary-foreground hover:bg-muted border border-border shadow-xs transition-colors cursor-pointer"
          >
            <CalendarPlus className="h-3.5 w-3.5 text-primary" />
            <span>Log Activity</span>
          </button>
        </div>
      </div>

      {/* 2. Metrics Summary Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const CardIcon = card.icon;
          const isPositive = card.trend >= 0;

          return (
            <div
              key={card.title}
              className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between shadow-xs hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground">
                  {card.title}
                </span>
                <span className={cn("p-2 rounded-lg", card.color)}>
                  <CardIcon className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <span className="text-2xl font-black text-foreground tracking-tight">
                    {card.value}
                  </span>
                </div>
                {/* Trend Badge */}
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full border shrink-0",
                    isPositive
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400"
                      : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
                  )}
                >
                  {isPositive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  <span>{Math.abs(card.trend)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Recharts Performance Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Line Chart */}
        <div className="bg-card border border-border rounded-lg p-6 lg:col-span-2 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-md font-bold text-foreground">Revenue Growth</h3>
              <p className="text-xs text-muted-foreground">Won deals aggregate over the last 6 months</p>
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              Real-time Firestore
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="currentColor" 
                  className="text-muted-foreground text-xs" 
                  dy={10}
                  tickLine={false} 
                />
                <YAxis 
                  stroke="currentColor" 
                  className="text-muted-foreground text-xs" 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }}
                  labelStyle={{ color: "var(--foreground)", fontWeight: "bold" }}
                  formatter={(value: any) => [formatCurrency(value), "Won Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="Revenue"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={{ r: 4, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deals Stage Donut Chart */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-foreground">Deals by Stage</h3>
            <p className="text-xs text-muted-foreground mb-4">Volume split of current active pipeline</p>
          </div>

          <div className="h-64 relative flex items-center justify-center">
            {dealStageChartData.length === 0 ? (
              <div className="text-xs font-semibold text-muted-foreground">No active deals found</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dealStageChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {dealStageChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }}
                    labelStyle={{ color: "var(--foreground)" }}
                    formatter={(value: any) => [value, "Deals"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend Mapping */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
            {dealStageChartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs font-medium">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                <span className="text-secondary-foreground">{entry.name} ({entry.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Top Open Deals Table & Recent Activities timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Open Deals list */}
        <div className="bg-card border border-border rounded-lg p-6 lg:col-span-2 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-md font-bold text-foreground">Top Open Deals</h3>
                <p className="text-xs text-muted-foreground">Highest value active sales pipeline deals</p>
              </div>
              <Link
                href="/deals"
                className="text-xs font-bold text-primary hover:underline"
              >
                View Pipeline
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="py-2.5">Deal Name</th>
                    <th className="py-2.5">Associated Contact</th>
                    <th className="py-2.5 text-right">Value</th>
                    <th className="py-2.5">Stage</th>
                    <th className="py-2.5 text-right">Close Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {topOpenDeals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground font-medium">
                        No active open deals. Use Quick Add to create one!
                      </td>
                    </tr>
                  ) : (
                    topOpenDeals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-muted/10">
                        <td className="py-3 font-semibold text-foreground">
                          <Link href={`/deals/${deal.id}`} className="hover:text-primary hover:underline">
                            {deal.title}
                          </Link>
                        </td>
                        <td className="py-3 text-secondary-foreground">
                          {deal.contactId ? (
                            <Link href={`/contacts/${deal.contactId}`} className="hover:text-primary hover:underline">
                              {deal.contactName}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">Unlinked</span>
                          )}
                        </td>
                        <td className="py-3 text-right font-bold text-foreground">
                          {formatCurrency(deal.value, deal.currency)}
                        </td>
                        <td className="py-3">
                          <StageBadge stage={deal.stage} className="scale-90" />
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          {formatDate(deal.expectedCloseDate)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activities timeline */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h3 className="text-md font-bold text-foreground">Recent Activity</h3>
              <p className="text-xs text-muted-foreground">Latest actions and communications</p>
            </div>
            <Link
              href="/activities"
              className="text-xs font-bold text-primary hover:underline"
            >
              View Feed
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[340px] pr-1 scrollbar-thin">
            <ActivityTimeline activities={recentActivities} />
          </div>
        </div>

      </div>

    </div>
  );
}
