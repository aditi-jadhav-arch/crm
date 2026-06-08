"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Timestamp } from "firebase/firestore";
import { activitySchema } from "../../lib/validations";
import { activitiesService } from "../../lib/services/activitiesService";
import { useContacts } from "../../lib/hooks/useContacts";
import { useDeals } from "../../lib/hooks/useDeals";
import { useAuth } from "../../lib/hooks/useAuth";
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { Activity } from "../../lib/types";

type ActivityFormValues = z.infer<typeof activitySchema>;

interface AddActivitySheetProps {
  isOpen: boolean;
  onClose: () => void;
  activityToEdit?: Activity | null; // EDIT mode if passed
  defaultContactId?: string;
  defaultDealId?: string;
  defaultCompanyId?: string;
  defaultType?: "call" | "email" | "meeting" | "note" | "task";
}

export function AddActivitySheet({
  isOpen,
  onClose,
  activityToEdit,
  defaultContactId = "",
  defaultDealId = "",
  defaultCompanyId = "",
  defaultType = "call",
}: AddActivitySheetProps) {
  const { user } = useAuth();
  const { contacts } = useContacts();
  const { deals } = useDeals();

  const isEdit = !!activityToEdit;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema) as any,
    defaultValues: {
      type: defaultType,
      title: "",
      description: "",
      contactId: defaultContactId,
      dealId: defaultDealId,
      companyId: defaultCompanyId,
      dueDate: "",
      isCompleted: false,
    },
  });

  const selectedType = watch("type");

  const formatDateForInput = (dateVal: any) => {
    if (!dateVal) return "";
    let d: Date;
    if (dateVal.seconds) {
      d = new Date(dateVal.seconds * 1000);
    } else if (dateVal.toDate && typeof dateVal.toDate === "function") {
      d = dateVal.toDate();
    } else {
      d = new Date(dateVal);
    }
    try {
      return d.toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (activityToEdit) {
        reset({
          type: activityToEdit.type,
          title: activityToEdit.title,
          description: activityToEdit.description || "",
          contactId: activityToEdit.contactId || "",
          dealId: activityToEdit.dealId || "",
          companyId: activityToEdit.companyId || "",
          dueDate: formatDateForInput(activityToEdit.dueDate),
          isCompleted: activityToEdit.isCompleted || false,
        });
      } else {
        reset({
          type: defaultType,
          title: "",
          description: "",
          contactId: defaultContactId,
          dealId: defaultDealId,
          companyId: defaultCompanyId,
          dueDate: "",
          isCompleted: false,
        });
      }
    }
  }, [isOpen, activityToEdit, reset, defaultContactId, defaultDealId, defaultCompanyId, defaultType]);

  // Set default title depending on type selected
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const typeVal = e.target.value as any;
    setValue("type", typeVal);
    
    // Set a template title
    const templates: Record<string, string> = {
      call: "Log Call",
      email: "Sent Follow-up Email",
      meeting: "Initial Client Demo",
      note: "Meeting Summary Notes",
      task: "Follow up via phone",
    };
    setValue("title", templates[typeVal] || "");
  };

  const onSubmit = async (data: ActivityFormValues) => {
    if (!user) return;

    // Build payload
    const payload: any = {
      type: data.type,
      title: data.title,
      description: data.description,
      isCompleted: data.isCompleted,
    };

    if (data.contactId) {
      payload.contactId = data.contactId;
      // Auto-assign companyId if contact is found in our list
      const contact = contacts.find(c => c.id === data.contactId);
      if (contact && contact.companyId) {
        payload.companyId = contact.companyId;
      }
    }

    if (data.dealId) {
      payload.dealId = data.dealId;
      // Auto-assign companyId/contactId if not already set
      const deal = deals.find(d => d.id === data.dealId);
      if (deal) {
        if (!payload.companyId && deal.companyId) {
          payload.companyId = deal.companyId;
        }
        if (!payload.contactId && deal.contactId) {
          payload.contactId = deal.contactId;
          const contact = contacts.find(c => c.id === deal.contactId);
          if (contact) {
            payload.contactName = `${contact.firstName} ${contact.lastName}`;
          }
        }
      }
    }

    if (data.type === "task") {
      if (data.dueDate) {
        payload.dueDate = Timestamp.fromDate(new Date(data.dueDate));
      } else {
        // Default task due date is tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        payload.dueDate = Timestamp.fromDate(tomorrow);
      }
    }

    try {
      if (isEdit && activityToEdit) {
        await activitiesService.updateActivity(activityToEdit.id, payload);
        toast.success(`Activity log updated.`);
      } else {
        await activitiesService.createActivity(payload, user.uid);
        toast.success(`Activity logged successfully.`);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred. Please try again.");
    }
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Activity Log" : "Log Activity / Task"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update details of this logged activity."
              : "Record calls, emails, notes or schedule future tasks."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="space-y-4">
          {/* Activity Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Activity Type <span className="text-destructive">*</span>
              </label>
              <select
                value={selectedType}
                onChange={handleTypeChange}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="note">Internal Note</option>
                <option value="task">To-Do Task</option>
              </select>
            </div>
            
            {/* Conditional Due Date for Tasks */}
            {selectedType === "task" ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  {...register("dueDate")}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ) : (
              <div />
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Activity Summary / Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              {...register("title")}
              placeholder="e.g. Discovery Call with CEO"
              className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.title && (
              <p className="text-xs text-destructive font-semibold mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Associated Contact & Deal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Link to Contact
              </label>
              <select
                {...register("contactId")}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="">No Contact</option>
                {contacts.map((cont) => (
                  <option key={cont.id} value={cont.id}>
                    {cont.firstName} {cont.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Link to Deal
              </label>
              <select
                {...register("dealId")}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="">No Deal</option>
                {deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    {deal.title} ({deal.companyName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Task completion toggle */}
          {selectedType === "task" && (
            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="isCompleted"
                {...register("isCompleted")}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="isCompleted" className="text-sm font-semibold text-foreground cursor-pointer">
                Mark task as completed immediately
              </label>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Description / Notes
            </label>
            <textarea
              {...register("description")}
              rows={5}
              placeholder="Provide a detailed summary of the meeting, notes from the phone call, or outline of what needs to be done..."
              className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </ScrollArea>

        <SheetFooter>
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 border border-border rounded-md text-sm font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
            ) : null}
            <span>{isEdit ? "Save Changes" : "Log Activity"}</span>
          </button>
        </SheetFooter>
      </form>
    </Sheet>
  );
}
export default AddActivitySheet;
