"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { companySchema } from "../../lib/validations";
import { companiesService } from "../../lib/services/companiesService";
import { useAuth } from "../../lib/hooks/useAuth";
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { Company } from "../../lib/types";

type CompanyFormValues = z.infer<typeof companySchema>;

interface AddCompanySheetProps {
  isOpen: boolean;
  onClose: () => void;
  companyToEdit?: Company | null; // EDIT mode if passed
}

export function AddCompanySheet({ isOpen, onClose, companyToEdit }: AddCompanySheetProps) {
  const { user } = useAuth();
  const isEdit = !!companyToEdit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema) as any,
    defaultValues: {
      name: "",
      industry: "Software & Technology",
      website: "",
      phone: "",
      email: "",
      size: "startup",
      revenue: 0,
      address: {
        street: "",
        city: "",
        state: "",
        country: "USA",
        zip: "",
      },
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (companyToEdit) {
        reset({
          name: companyToEdit.name,
          industry: companyToEdit.industry,
          website: companyToEdit.website || "",
          phone: companyToEdit.phone || "",
          email: companyToEdit.email || "",
          size: companyToEdit.size,
          revenue: companyToEdit.revenue || 0,
          address: {
            street: companyToEdit.address?.street || "",
            city: companyToEdit.address?.city || "",
            state: companyToEdit.address?.state || "",
            country: companyToEdit.address?.country || "USA",
            zip: companyToEdit.address?.zip || "",
          },
          notes: companyToEdit.notes || "",
        });
      } else {
        reset({
          name: "",
          industry: "Software & Technology",
          website: "",
          phone: "",
          email: "",
          size: "startup",
          revenue: 0,
          address: {
            street: "",
            city: "",
            state: "",
            country: "USA",
            zip: "",
          },
          notes: "",
        });
      }
    }
  }, [isOpen, companyToEdit, reset]);

  const onSubmit = async (data: CompanyFormValues) => {
    if (!user) return;

    // Filter NaN or empty revenue values
    const cleanedData = {
      ...data,
      revenue: isNaN(Number(data.revenue)) ? 0 : Number(data.revenue),
    };

    try {
      if (isEdit && companyToEdit) {
        await companiesService.updateCompany(companyToEdit.id, cleanedData);
        toast.success(`Company "${data.name}" updated successfully.`);
      } else {
        await companiesService.createCompany(cleanedData, user.uid);
        toast.success(`Company "${data.name}" created successfully.`);
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
          <SheetTitle>{isEdit ? "Edit Company" : "Add New Company"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update company organization details and profile."
              : "Enter details below to register a new client company profile."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="space-y-4">
          {/* Company Name & Industry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Company Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                {...register("name")}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.name && (
                <p className="text-xs text-destructive font-semibold mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Industry <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                {...register("industry")}
                placeholder="Software"
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.industry && (
                <p className="text-xs text-destructive font-semibold mt-1">{errors.industry.message}</p>
              )}
            </div>
          </div>

          {/* Website & Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Website URL
              </label>
              <input
                type="text"
                {...register("website")}
                placeholder="https://domain.com"
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.website && (
                <p className="text-xs text-destructive font-semibold mt-1">{errors.website.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Company Size <span className="text-destructive">*</span>
              </label>
              <select
                {...register("size")}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="startup">Startup (&lt; 10)</option>
                <option value="small">Small (10 - 50)</option>
                <option value="medium">Medium (50 - 250)</option>
                <option value="enterprise">Enterprise (250+)</option>
              </select>
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Email Address
              </label>
              <input
                type="text"
                {...register("email")}
                placeholder="contact@company.com"
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.email && (
                <p className="text-xs text-destructive font-semibold mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Annual Revenue */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Annual Revenue (USD)
            </label>
            <input
              type="number"
              {...register("revenue", { valueAsNumber: true })}
              placeholder="500000"
              className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Address Section */}
          <div className="border-t border-border pt-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
              Office Address
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  {...register("address.street")}
                  placeholder="123 Corporate Blvd"
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    {...register("address.city")}
                    placeholder="San Francisco"
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    State / Region
                  </label>
                  <input
                    type="text"
                    {...register("address.state")}
                    placeholder="CA"
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    {...register("address.country")}
                    placeholder="USA"
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    Zip / Postal Code
                  </label>
                  <input
                    type="text"
                    {...register("address.zip")}
                    placeholder="94105"
                    className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t border-border pt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Private Notes
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="Record business context, sizing details, etc..."
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
            <span>{isEdit ? "Save Changes" : "Add Company"}</span>
          </button>
        </SheetFooter>
      </form>
    </Sheet>
  );
}
export default AddCompanySheet;
