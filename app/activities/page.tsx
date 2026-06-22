"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Filter, 
  CheckSquare, 
  Phone, 
  Mail, 
  FileText, 
  Users,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useActivities } from "../../lib/hooks/useActivities";
import { activitiesService } from "../../lib/services/activitiesService";
import { ActivityIcon } from "@/components/ui/activity-icon";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddActivitySheet } from "../../components/activities/add-activity-sheet";
import { formatDate, formatDateTime } from "../../lib/utils";
import { Activity } from "../../lib/types";
import { cn } from "../../lib/utils";

export default function ActivitiesPage() {
  // 1. Data hooks & states
  const { activities, loading } = useActivities();
  
  const [taskDueDateFilter, setTaskDueDateFilter] = useState<"all" | "today" | "week" | "overdue">("all");
  const [taskStatusFilter, setTaskStatusFilter] = useState<"pending" | "completed" | "all">("pending");
  
  // Sheet & Dialog states
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [logDefaultType, setLogDefaultType] = useState<"call" | "email" | "meeting" | "note" | "task">("task");
  const [deleteActivity, setDeleteActivity] = useState<Activity | null>(null);

  // Time calculations
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = startOfToday + 24 * 60 * 60 * 1000;
  const endOfWeek = startOfToday + 7 * 24 * 60 * 60 * 1000;

  const getSeconds = (dateVal: any) => {
    if (!dateVal) return 0;
    if (dateVal.seconds !== undefined) return dateVal.seconds;
    if (dateVal.toDate && typeof dateVal.toDate === "function") return Math.floor(dateVal.toDate().getTime() / 1000);
    return Math.floor(new Date(dateVal).getTime() / 1000);
  };

  // 2. Filter tasks (activities where type === 'task')
  const filteredTasks = useMemo(() => {
    let result = activities.filter((a) => a.type === "task");

    // Status Filter
    if (taskStatusFilter === "pending") {
      result = result.filter((t) => !t.isCompleted);
    } else if (taskStatusFilter === "completed") {
      result = result.filter((t) => t.isCompleted);
    }

    // Due Date Filter
    if (taskDueDateFilter !== "all") {
      result = result.filter((t) => {
        if (!t.dueDate) return false;
        const dueTime = getSeconds(t.dueDate) * 1000;

        if (taskDueDateFilter === "today") {
          return dueTime >= startOfToday && dueTime < endOfToday;
        }
        if (taskDueDateFilter === "week") {
          return dueTime >= startOfToday && dueTime < endOfWeek;
        }
        if (taskDueDateFilter === "overdue") {
          return dueTime < startOfToday && !t.isCompleted;
        }
        return true;
      });
    }

    // Sort: pending tasks with nearest due date first, then completed tasks
    result.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      const dueA = getSeconds(a.dueDate);
      const dueB = getSeconds(b.dueDate);
      return dueA - dueB;
    });

    return result;
  }, [activities, taskDueDateFilter, taskStatusFilter, startOfToday, endOfToday, endOfWeek]);

  // 3. Filter Activity Feed (non-tasks + completed tasks)
  const activityFeedList = useMemo(() => {
    const feed = activities.filter((a) => a.type !== "task" || a.isCompleted);
    
    // Sort: newest first
    feed.sort((a, b) => getSeconds(b.createdAt) - getSeconds(a.createdAt));
    return feed;
  }, [activities]);

  // Group Feed by date strings
  const groupedFeed = useMemo(() => {
    const groups: Record<string, Activity[]> = {};
    const todayStr = new Date().toDateString();
    const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    activityFeedList.forEach((act) => {
      let d: Date;
      if (act.createdAt?.seconds) {
        d = new Date(act.createdAt.seconds * 1000);
      } else if (act.createdAt?.toDate) {
        d = act.createdAt.toDate();
      } else {
        d = new Date(act.createdAt || Date.now());
      }
      const dateStr = d.toDateString();
      let groupKey = formatDate(d);

      if (dateStr === todayStr) groupKey = "Today";
      else if (dateStr === yesterdayStr) groupKey = "Yesterday";

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(act);
    });

    return groups;
  }, [activityFeedList]);

  // Handlers
  const handleToggleComplete = async (task: Activity) => {
    const nextState = !task.isCompleted;
    try {
      await activitiesService.toggleActivityCompleted(task.id, nextState);
      toast.success(
        nextState 
          ? `Task "${task.title}" completed!` 
          : `Task "${task.title}" marked pending.`
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update task.");
    }
  };

  const handleDelete = async () => {
    if (!deleteActivity) return;
    try {
      await activitiesService.deleteActivity(deleteActivity.id);
      toast.success("Activity log removed.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to remove activity.");
    } finally {
      setDeleteActivity(null);
    }
  };

  const openLogSheet = (type: "call" | "email" | "meeting" | "note" | "task") => {
    setLogDefaultType(type);
    setIsLogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
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
      {/* Title Header with logging quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Activities &amp; Tasks</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Log correspondence details and organize your checklists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openLogSheet("task")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-sm cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Task</span>
          </button>
          <button
            onClick={() => openLogSheet("call")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold bg-secondary text-secondary-foreground hover:bg-muted border border-border shadow-xs cursor-pointer"
          >
            <span>Log Call/Meeting</span>
          </button>
        </div>
      </div>

      {/* Main split display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Tasks Checklist (Span 7) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-3">
            <h3 className="text-md font-bold text-foreground flex items-center gap-1.5">
              <CheckSquare className="h-5 w-5 text-primary" />
              <span>Tasks &amp; To-Do</span>
            </h3>

            {/* Task Filters */}
            <div className="flex items-center gap-2 text-xs">
              {/* Due Date filter selector */}
              <select
                value={taskDueDateFilter}
                onChange={(e) => setTaskDueDateFilter(e.target.value as any)}
                className="bg-background border border-border text-foreground px-2 py-1.5 rounded cursor-pointer focus:outline-none"
              >
                <option value="all">All Dates</option>
                <option value="today">Due Today</option>
                <option value="week">Due This Week</option>
                <option value="overdue">Overdue Only</option>
              </select>

              {/* Status filter selector */}
              <select
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value as any)}
                className="bg-background border border-border text-foreground px-2 py-1.5 rounded cursor-pointer focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="all">All Tasks</option>
              </select>
            </div>
          </div>

          {/* Tasks List */}
          <div className="divide-y divide-border/60">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-medium">
                No tasks match your filters.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isOverdue = 
                  task.dueDate && 
                  getSeconds(task.dueDate) * 1000 < startOfToday && 
                  !task.isCompleted;

                return (
                  <div
                    key={task.id}
                    className={cn(
                      "py-4 flex gap-3 hover:bg-muted/10 transition-colors px-1",
                      task.isCompleted ? "opacity-60" : ""
                    )}
                  >
                    {/* Completion Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="shrink-0 text-muted-foreground hover:text-primary mt-0.5 cursor-pointer focus:outline-none"
                      title={task.isCompleted ? "Mark pending" : "Mark completed"}
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-100" />
                      ) : (
                        <Circle className="h-5 w-5 hover:scale-105 transition-transform" />
                      )}
                    </button>

                    {/* Task details */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-semibold text-foreground truncate",
                        task.isCompleted ? "line-through text-muted-foreground" : ""
                      )}>
                        {task.title}
                      </p>
                      
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Metadata row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-[10px] text-muted-foreground font-medium">
                        {/* Due Date Indicator */}
                        {task.dueDate && (
                          <span className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded border shrink-0",
                            isOverdue 
                              ? "bg-red-50 text-red-600 border-red-200" 
                              : "bg-muted border-border"
                          )}>
                            {isOverdue && <AlertCircle className="h-3 w-3 animate-pulse" />}
                            <span>Due: {formatDate(task.dueDate)}</span>
                          </span>
                        )}

                        {/* Linked Entities */}
                        {task.contactId && (
                          <span className="shrink-0">
                            Contact:{" "}
                            <Link href={`/contacts/${task.contactId}`} className="text-primary hover:underline font-bold">
                              {task.contactName}
                            </Link>
                          </span>
                        )}

                        {task.dealId && (
                          <span className="shrink-0">
                            Deal:{" "}
                            <Link href={`/deals/${task.dealId}`} className="text-primary hover:underline font-bold">
                              {task.dealTitle}
                            </Link>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Row Delete Button */}
                    <button
                      onClick={() => setDeleteActivity(task)}
                      className="p-1 rounded text-muted-foreground hover:text-red-600 hover:bg-red-50 self-start shrink-0 cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Activity Feed (Span 5) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-lg p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-4 flex items-center gap-1.5 shrink-0">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="text-md font-bold text-foreground">Activity Timeline</h3>
          </div>

          {/* Grouped Feeds */}
          <div className="overflow-y-auto max-h-[70vh] pr-1 space-y-6 scrollbar-thin">
            {activityFeedList.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-medium">
                No logged correspondence.
              </div>
            ) : (
              Object.keys(groupedFeed).map((dateKey) => (
                <div key={dateKey} className="space-y-4">
                  {/* Date Heading */}
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest sticky top-0 bg-card py-1 z-10">
                    {dateKey}
                  </h4>
                  
                  {/* Feed Items under this Date */}
                  <div className="border-l border-border pl-4 space-y-4 ml-2">
                    {groupedFeed[dateKey].map((act) => {
                      const typeColors = {
                        call: "bg-blue-50 text-blue-600 border-blue-200",
                        email: "bg-amber-50 text-amber-600 border-amber-200",
                        meeting: "bg-purple-50 text-purple-600 border-purple-200",
                        note: "bg-sky-50 text-sky-600 border-sky-200",
                        task: "bg-emerald-50 text-emerald-600 border-emerald-200",
                      };
                      const tagClass = typeColors[act.type] || typeColors.note;

                      return (
                        <div key={act.id} className="relative group text-xs text-secondary-foreground">
                          {/* Dot Badge */}
                          <span className={cn(
                            "absolute -left-[25px] top-0.5 flex items-center justify-center h-5 w-5 rounded-full border bg-card shadow-xs",
                            tagClass
                          )}>
                            <ActivityIcon type={act.type} className="h-2.5 w-2.5" />
                          </span>

                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <p className="font-bold text-foreground text-xs leading-normal">
                                {act.title}
                              </p>
                              {act.description && (
                                <p className="text-muted-foreground mt-0.5 whitespace-pre-wrap leading-relaxed">
                                  {act.description}
                                </p>
                              )}
                              
                              {/* Metadata link row */}
                              <div className="flex flex-wrap gap-x-2 mt-1.5 text-[9px] text-muted-foreground">
                                {act.contactId && (
                                  <span>
                                    Contact:{" "}
                                    <Link href={`/contacts/${act.contactId}`} className="text-primary hover:underline font-semibold">
                                      {act.contactName}
                                    </Link>
                                  </span>
                                )}
                                {act.dealId && (
                                  <span>
                                    Deal:{" "}
                                    <Link href={`/deals/${act.dealId}`} className="text-primary hover:underline font-semibold">
                                      {act.dealTitle}
                                    </Link>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Delete specific feed row */}
                            <button
                              onClick={() => setDeleteActivity(act)}
                              className="p-1 rounded text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                              title="Delete log"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Dynamic Creation Sheet */}
      <AddActivitySheet
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        defaultType={logDefaultType}
      />

      {/* Delete dialog */}
      <ConfirmDialog
        isOpen={!!deleteActivity}
        onClose={() => setDeleteActivity(null)}
        onConfirm={handleDelete}
        title="Delete Activity / Task Record"
        description="Are you sure you want to remove this logged activity? It will be permanently deleted from Elara."
        confirmText="Delete Record"
        cancelText="Cancel"
      />
    </div>
  );
}
