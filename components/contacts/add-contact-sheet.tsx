"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { contactSchema } from "../../lib/validations";
import { contactsService } from "../../lib/services/contactsService";
import { useCompanies } from "../../lib/hooks/useCompanies";
import { useAuth } from "../../lib/hooks/useAuth";
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { Contact } from "../../lib/types";

type ContactFormValues = z.infer<typeof contactSchema>;

interface AddContactSheetProps {
  isOpen: boolean;
  onClose: () => void;
  contactToEdit?: Contact | null; // If provided, we are in EDIT mode
}

export function AddContactSheet({ isOpen, onClose, contactToEdit }: AddContactSheetProps) {
  const { user } = useAuth();
  const { companies } = useCompanies();

  const isEdit = !!contactToEdit;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      companyId: "",
      status: "lead",
      source: "Website",
      tags: [],
      notes: "",
    },
  });

  // Reset form when opening or changing edit target
  useEffect(() => {
    if (isOpen) {
      if (contactToEdit) {
        reset({
          firstName: contactToEdit.firstName,
          lastName: contactToEdit.lastName,
          email: contactToEdit.email,
          phone: contactToEdit.phone,
          jobTitle: contactToEdit.jobTitle,
          companyId: contactToEdit.companyId || "",
          status: contactToEdit.status,
          source: contactToEdit.source,
          tags: contactToEdit.tags || [],
          notes: contactToEdit.notes || "",
        });
      } else {
        reset({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          jobTitle: "",
          companyId: "",
          status: "lead",
          source: "Website",
          tags: [],
          notes: "",
        });
      }
    }
  }, [isOpen, contactToEdit, reset]);

  const onSubmit = async (data: ContactFormValues) => {
    if (!user) return;

    try {
      if (isEdit && contactToEdit) {
        await contactsService.updateContact(contactToEdit.id, data);
        toast.success(`Contact "${data.firstName} ${data.lastName}" updated successfully.`);
      } else {
        await contactsService.createContact(data, user.uid);
        toast.success(`Contact "${data.firstName} ${data.lastName}" created successfully.`);
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
          <SheetTitle>{isEdit ? "Edit Contact" : "Add New Contact"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the contact profile information."
              : "Enter the details below to create a new CRM contact profile."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="space-y-4">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                First Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                {...register("firstName")}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.firstName && (
                <p className="text-xs text-destructive font-semibold mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Last Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                {...register("lastName")}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.lastName && (
                <p className="text-xs text-destructive font-semibold mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Email Address
              </label>
              <input
                type="text"
                {...register("email")}
                placeholder="email@domain.com"
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.email && (
                <p className="text-xs text-destructive font-semibold mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                {...register("phone")}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Job Title & Company */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Job Title
              </label>
              <input
                type="text"
                {...register("jobTitle")}
                placeholder="Product Director"
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Company Name
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
          </div>

          {/* Status & Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Contact Status <span className="text-destructive">*</span>
              </label>
              <select
                {...register("status")}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="customer">Customer</option>
                <option value="churned">Churned</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Lead Source <span className="text-destructive">*</span>
              </label>
              <select
                {...register("source")}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Partner">Partner</option>
                <option value="Cold Outreach">Cold Outreach</option>
                <option value="Event">Event</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="VIP, Tech, Design"
              onChange={(e) => {
                const tagsArr = e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter((t) => t !== "");
                setValue("tags", tagsArr);
              }}
              defaultValue={contactToEdit?.tags?.join(", ") || ""}
              className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Private Notes
            </label>
            <textarea
              {...register("notes")}
              rows={4}
              placeholder="Add contact details, meeting context, etc..."
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
            <span>{isEdit ? "Save Changes" : "Add Contact"}</span>
          </button>
        </SheetFooter>
      </form>
    </Sheet>
  );
}
export default AddContactSheet;
