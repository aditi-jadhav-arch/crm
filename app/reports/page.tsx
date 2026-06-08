"use client";

import React, { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Trophy,
  PieChart as PieIcon,
  BarChart3,
  GitBranch
} from "lucide-react";
import { useContacts } from "../../lib/hooks/useContacts";
import { useDeals } from "../../lib/hooks/useDeals";
import { useActivities } from "../../lib/hooks/useActivities";
import { formatCurrency, formatDate } from "../../lib/utils";
import { Avatar } from "@/components/ui/custom-avatar";

type DateRange = "month" | "quarter" | "year" | "all";

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>("year");
  const [users, setUsers] = useState<any[]>([]);

  const { contacts, loading: contactsLoading } = useContacts();
  const { deals, loading: dealsLoading } = useDeals();
  const { activities, loading: activitiesLoading } = useActivities();

  useEffect(() => {
    setMounted(true);

    // Fetch team users for leaderboard
    const unsubscribe = onSnapshot(collection(db, "users"), (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => {
        list.push(doc.data());
      });
      setUsers(list);
    });

    return () => unsubscribe();
  }, []);

  const loading = contactsLoading || dealsLoading || activitiesLoading;

  const getSeconds = (dateVal: any) => {
    if (!dateVal) return 0;
    if (dateVal.seconds !== undefined) return dateVal.seconds;
    if (dateVal.toDate && typeof dateVal.toDate === "function") return Math.floor(dateVal.toDate().getTime() / 1000);
    return Math.floor(new Date(dateVal).getTime() / 1000);
  };

  // 1. Filtered data based on selected Date Range
  const filteredData = useMemo(() => {
    if (loading) return { contacts: [], deals: [], activities: [] };

    const now = new Date();
    let startDate: Date | null = null;

    if (dateRange === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dateRange === "quarter") {
      // Current quarter start
      const qStartMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), qStartMonth, 1);
    } else if (dateRange === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    if (!startDate) {
      return { contacts, deals, activities };
    }

    const startSec = Math.floor(startDate.getTime() / 1000);

    return {
      contacts: contacts.filter((c) => getSeconds(c.createdAt) >= startSec),
      deals: deals.filter((d) => getSeconds(d.createdAt) >= startSec),
      activities: activities.filter((a) => getSeconds(a.createdAt) >= startSec),
    };
  }, [dateRange, contacts, deals, activities, loading]);

  // 2. Revenue Report: Closed Won deals by month (Current Year)
  const revenueReportData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const currentYear = now.getFullYear();

    const initial = months.map(m => ({ name: m, Revenue: 0 }));

    // Use full list of deals, but filtered by current year
    const wonDealsCurrentYear = deals.filter((d) => {
      if (d.stage !== "closed_won") return false;
      const closeSec = getSeconds(d.actualCloseDate || d.updatedAt);
      const closeDate = new Date(closeSec * 1000);
      return closeDate.getFullYear() === currentYear;
    });

    wonDealsCurrentYear.forEach((d) => {
      const closeSec = getSeconds(d.actualCloseDate || d.updatedAt);
      const closeDate = new Date(closeSec * 1000);
      const monthIdx = closeDate.getMonth();
      if (monthIdx >= 0 && monthIdx < 12) {
        initial[monthIdx].Revenue += d.value || 0;
      }
    });

    return initial;
  }, [deals]);

  // 3. Pipeline Report: Stage progression funnel
  const pipelineReportData = useMemo(() => {
    const pipelineStages = [
      { key: "lead", label: "Lead" },
      { key: "qualified", label: "Qualified" },
      { key: "proposal", label: "Proposal" },
      { key: "negotiation", label: "Negotiation" },
      { key: "closed_won", label: "Closed Won" },
    ];

    return pipelineStages.map((stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage.key);
      const count = stageDeals.length;
      const value = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

      return {
        name: stage.label,
        Deals: count,
        Value: value,
      };
    });
  }, [deals]);

  // 4. Contact Growth: Line chart of contacts added by month (Current Year)
  const contactGrowthData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const currentYear = now.getFullYear();

    const initial = months.map(m => ({ name: m, Contacts: 0 }));

    contacts.forEach((c) => {
      const cDate = new Date(getSeconds(c.createdAt) * 1000);
      if (cDate.getFullYear() === currentYear) {
        const monthIdx = cDate.getMonth();
        if (monthIdx >= 0 && monthIdx < 12) {
          initial[monthIdx].Contacts += 1;
        }
      }
    });

    return initial;
  }, [contacts]);

  // 5. Activity Distribution Donut Chart
  const activityDistributionData = useMemo(() => {
    const counts = {
      call: { name: "Calls", count: 0 },
      email: { name: "Emails", count: 0 },
      meeting: { name: "Meetings", count: 0 },
      note: { name: "Notes", count: 0 },
      task: { name: "Tasks", count: 0 },
    };

    filteredData.activities.forEach((act) => {
      if (counts[act.type]) {
        counts[act.type].count += 1;
      }
    });

    return Object.values(counts).filter((c) => c.count > 0);
  }, [filteredData]);

  // 6. Leaderboard ranking
  const leaderboardData = useMemo(() => {
    if (users.length === 0) return [];

    const leaderboard = users.map((u) => {
      // Sum closed won deals value for this user
      const userWonDeals = deals.filter(
        (d) => d.owner === u.uid && d.stage === "closed_won"
      );
      const salesVolume = userWonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
      const dealsCount = userWonDeals.length;

      return {
        name: u.displayName || u.email.split("@")[0],
        email: u.email,
        photoURL: u.photoURL,
        volume: salesVolume,
        dealsCount: dealsCount,
      };
    });

    // Sort by sales volume descending
    return leaderboard.sort((a, b) => b.volume - a.volume);
  }, [users, deals]);

  const PIE_COLORS = [
    "var(--primary)",
    "var(--chart-2)",
    "var(--chart-1)",
    "var(--chart-4)",
    "var(--chart-5)"
  ];

  if (loading || !mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-14 bg-card border rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-96 bg-card border rounded-md" />
          <div className="h-96 bg-card border rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Header Filter Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-card border border-border rounded-lg shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-foreground">Analytics Reports</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Key performance indicators, pipeline reports, and sales leaderboard.
          </p>
        </div>

        {/* Date filter selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="inline-flex rounded-md border border-border bg-background p-1 text-xs select-none">
            {(["month", "quarter", "year", "all"] as const).map((r) => {
              const labels = { month: "This Month", quarter: "This Quarter", year: "This Year", all: "All Time" };
              return (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                    dateRange === r
                      ? "bg-muted text-primary shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {labels[r]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Performance bar chart */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-primary" />
              <span>Revenue (Current Year)</span>
            </h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueReportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-[10px]" tickLine={false} />
                <YAxis 
                  stroke="currentColor" 
                  className="text-muted-foreground text-[10px]" 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }}
                  labelStyle={{ color: "var(--foreground)", fontWeight: "bold" }}
                  formatter={(value: any) => [formatCurrency(value), "Won Revenue"]}
                />
                <Bar dataKey="Revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline horizontal Funnel representation */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
              <GitBranch className="h-4 w-4 text-primary" />
              <span>Pipeline Stage Progression</span>
            </h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical"
                data={pipelineReportData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <XAxis type="number" stroke="currentColor" className="text-muted-foreground text-[10px]" tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="currentColor" className="text-muted-foreground text-[10px]" tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }}
                  labelStyle={{ color: "var(--foreground)", fontWeight: "bold" }}
                  formatter={(value: any, name: any) => [
                    name === "Value" ? formatCurrency(value) : value, 
                    name
                  ]}
                />
                <Bar dataKey="Deals" fill="var(--chart-2)" name="Deals Count" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Contact Growth line chart */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              <span>Contact Growth (Current Year)</span>
            </h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={contactGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-[10px]" tickLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground text-[10px]" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }}
                  labelStyle={{ color: "var(--foreground)", fontWeight: "bold" }}
                  formatter={(value: any) => [value, "New Contacts"]}
                />
                <Line type="monotone" dataKey="Contacts" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Distribution donut */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <PieIcon className="h-4 w-4 text-primary" />
              <span>Activity Distribution</span>
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Breakdown of communication and notes</p>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            {activityDistributionData.length === 0 ? (
              <div className="text-xs font-semibold text-muted-foreground">No activities logged in range</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {activityDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px" }}
                    labelStyle={{ color: "var(--foreground)" }}
                    formatter={(value: any) => [value, "Logs"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Donut Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
            {activityDistributionData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs font-semibold">
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

      {/* 3. Team Sales Leaderboard */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span>Team Sales Leaderboard</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold">
                <th className="py-2.5 w-12 text-center">Rank</th>
                <th className="py-2.5">Team Member</th>
                <th className="py-2.5 text-right">Closed Won Deals</th>
                <th className="py-2.5 text-right font-bold text-foreground">Total Sales Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {leaderboardData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground font-medium">
                    No sales recorded in database.
                  </td>
                </tr>
              ) : (
                leaderboardData.map((row, idx) => {
                  const isTopRank = idx < 3;
                  const ranks = ["🥇", "🥈", "🥉"];

                  return (
                    <tr key={row.email} className="hover:bg-muted/10 font-medium">
                      <td className="py-3 text-center text-sm font-bold">
                        {isTopRank ? ranks[idx] : idx + 1}
                      </td>
                      <td className="py-3 flex items-center gap-3">
                        <Avatar
                          name={row.name}
                          avatarUrl={row.photoURL}
                          size="sm"
                        />
                        <div>
                          <span className="font-bold text-foreground block">{row.name}</span>
                          <span className="text-[10px] text-muted-foreground">{row.email}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-secondary-foreground text-sm font-semibold">
                        {row.dealsCount} {row.dealsCount === 1 ? "deal" : "deals"}
                      </td>
                      <td className="py-3 text-right text-sm font-black text-primary">
                        {formatCurrency(row.volume)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
