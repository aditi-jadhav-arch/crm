import React from "react";
import { Activity } from "../../lib/types";
import { formatDateTime, formatDate } from "../../lib/utils";
import { ActivityIcon } from "./activity-icon";
import { cn } from "../../lib/utils";
import { Calendar } from "lucide-react";

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground font-medium">
        No activities logged yet.
      </div>
    );
  }

  return (
    <div className="relative border-l border-border ml-3 pl-6 space-y-8 py-2">
      {activities.map((act) => {
        // Different icon colors based on activity type
        const typeColors = {
          call: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
          email: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
          meeting: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800/50",
          note: "bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400 border-sky-200 dark:border-sky-900/50",
          task: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/50",
        };

        const iconBg = typeColors[act.type] || typeColors.note;

        return (
          <div key={act.id} className="relative group">
            {/* Timeline Dot Icon */}
            <span className={cn(
              "absolute -left-[37px] top-1.5 flex items-center justify-center h-7.5 w-7.5 rounded-full border bg-card shadow-sm z-10 transition-transform group-hover:scale-110",
              iconBg
            )}>
              <ActivityIcon type={act.type} className="h-3.5 w-3.5" />
            </span>

            {/* Content Card */}
            <div className="bg-card border border-border p-4 rounded-lg shadow-xs group-hover:shadow-sm transition-all duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <span className="font-semibold text-foreground text-sm">
                  {act.title}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDateTime(act.createdAt)}
                </span>
              </div>
              
              {act.description && (
                <p className="text-sm text-secondary-foreground whitespace-pre-wrap leading-relaxed">
                  {act.description}
                </p>
              )}

              {/* Task specific metadata */}
              {act.type === "task" && (
                <div className="mt-3 flex flex-wrap gap-2 items-center text-xs">
                  {act.dueDate && (
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded border",
                      act.isCompleted 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                        : new Date(act.dueDate.seconds * 1000).getTime() < Date.now()
                          ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50"
                          : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
                    )}>
                      <Calendar className="h-3 w-3" />
                      Due: {formatDate(act.dueDate)}
                    </span>
                  )}
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full font-semibold border",
                    act.isCompleted
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
                  )}>
                    {act.isCompleted ? "Completed" : "Pending"}
                  </span>
                  {act.completedAt && (
                    <span className="text-muted-foreground font-normal">
                      Done on {formatDate(act.completedAt)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default ActivityTimeline;
