"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Timestamp } from "firebase/firestore";
import { dealSchema } from "../../lib/validations";
import { dealsService } from "../../lib/services/dealsService";
import { useContacts } from "../../lib/hooks/useContacts";
import { useCompanies } from "../../lib/hooks/useCompanies";
import { useAuth } from "../../lib/hooks/useAuth";
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { Deal } from "../../lib/types";

type DealFormValues = z.infer<typeof dealSchema>;

interface AddDealSheetProps {
  isOpen: boolean;
  onClose: () => void;
  dealToEdit?: Deal | null; // EDIT mode if passed
  defaultStage?: "lead" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost"; // Preset when opening from Kanban
}

export function AddDealSheet({ isOpen, onClose, dealToEdit, defaultStage }: AddDealSheetProps) {
  const { user } = useAuth();
  const { contacts } = useContacts();
  const { companies } = useCompanies();

  const isEdit = !!dealToEdit;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema) as any,
    defaultValues: {
      title: "",
      value: 0,
      currency: "USD",
      stage: defaultStage || "lead",
      probability: 10,
      contactId: "",
      companyId: "",
      expectedCloseDate: "",
      notes: "",
      tags: [],
    },
  });

  const selectedStage = watch("stage");

  // Auto-set probability based on standard sales stage defaults
  useEffect(() => {
    if (!isEdit && selectedStage) {
      const defaultProbability: Record<string, number> = {
        lead: 10,
        qualified: 30,
        proposal: 60,
        negotiation: 80,
        closed_won: 100,
        closed_lost: 0,
      };
      setValue("probability", defaultProbability[selectedStage] ?? 10);
    }
  }, [selectedStage, isEdit, setValue]);

  // Form input helper
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
      if (dealToEdit) {
        reset({
          title: dealToEdit.title,
          value: dealToEdit.value || 0,
          currency: dealToEdit.currency || "USD",
          stage: dealToEdit.stage,
          probability: dealToEdit.probability || 0,
          contactId: dealToEdit.contactId || "",
          companyId: dealToEdit.companyId || "",
          expectedCloseDate: formatDateForInput(dealToEdit.expectedCloseDate),
          notes: dealToEdit.notes || "",
          tags: dealToEdit.tags || [],
        });
      } else {
        reset({
          title: "",
          value: 0,
          currency: "USD",
          stage: defaultStage || "lead",
          probability: 10,
          contactId: "",
          companyId: "",
          expectedCloseDate: "",
          notes: "",
          tags: [],
        });
      }
    }
  }, [isOpen, dealToEdit, reset, defaultStage]);

  const onSubmit = async (data: DealFormValues) => {
    if (!user) return;

    if (!data.expectedCloseDate) {
      toast.error("Please specify the expected close date.");
      return;
    }

    const payload = {
      ...data,
      expectedCloseDate: Timestamp.fromDate(new Date(data.expectedCloseDate)),
    };

    try {
      if (isEdit && dealToEdit) {
        await dealsService.updateDeal(dealToEdit.id, payload);
        toast.success(`Deal "${data.title}" updated successfully.`);
      } else {
        await dealsService.createDeal(payload, user.uid);
        toast.success(`Deal "${data.title}" created successfully.`);
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
          <SheetTitle>{isEdit ? "Edit Deal" : "Create Deal"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modify this deal's properties and stage progress."
              : "Register a new sales deal and track pipeline progress."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="space-y-4">
          {/* Deal Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Deal Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              {...register("title")}
              placeholder="e.g. Acme Licensing Deal"
              className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.title && (
              <p className="text-xs text-destructive font-semibold mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Value & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Value (Amt) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                {...register("value", { valueAsNumber: true })}
                placeholder="50000"
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.value && (
                <p className="text-xs text-destructive font-semibold mt-1">{errors.value.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Currency <span className="text-destructive">*</span>
              </label>
              <select
                {...register("currency")}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          {/* Deal Stage & Probability */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Pipeline Stage <span className="text-destructive">*</span>
              </label>
              <select
                {...register("stage")}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="lead">Lead</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Win Probability (%) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                {...register("probability", { valueAsNumber: true })}
                min={0}
                max={100}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.probability && (
                <p className="text-xs text-destructive font-semibold mt-1">{errors.probability.message}</p>
              )}
            </div>
          </div>

          {/* Associated Company & Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Associated Company
              </label>
              <select
                {...register("companyId")}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="">No Company</option>
                {companies.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Primary Contact
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
          </div>

          {/* Expected Close Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Expected Close Date <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              {...register("expectedCloseDate")}
              className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="Enterprise, Expansion"
              onChange={(e) => {
                const tagsArr = e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter((t) => t !== "");
                setValue("tags", tagsArr);
              }}
              defaultValue={dealToEdit?.tags?.join(", ") || ""}
              className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Deal Scope / Notes
            </label>
            <textarea
              {...register("notes")}
              rows={4}
              placeholder="Outline deal milestones, competition, next steps..."
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
            <span>{isEdit ? "Save Changes" : "Create Deal"}</span>
          </button>
        </SheetFooter>
      </form>
    </Sheet>
  );
}
export default AddDealSheet;
