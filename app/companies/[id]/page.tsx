"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  MapPin,
  Calendar, 
  DollarSign, 
  Users, 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronRight,
  Timeline
} from "lucide-react";
import { toast } from "sonner";
import { useContacts } from "../../../lib/hooks/useContacts";
import { useDeals } from "../../../lib/hooks/useDeals";
import { useActivities } from "../../../lib/hooks/useActivities";
import { companiesService } from "../../../lib/services/companiesService";
import { Avatar } from "@/components/ui/custom-avatar";
import { StageBadge } from "@/components/ui/status-badges";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddCompanySheet } from "../../../components/companies/add-company-sheet";
import { AddActivitySheet } from "../../../components/activities/add-activity-sheet";
import { ActivityTimeline } from "@/components/ui/activity-timeline";
import { formatDate, formatCurrency } from "../../../lib/utils";
import { Company } from "../../../lib/types";

export default function CompanyDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // 1. Company loading & state
  const [company, setCompany] = useState<Company | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  // Sheet states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "contacts" | "deals" | "activity">("overview");

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, "companies", id), (docSnap) => {
      if (docSnap.exists()) {
        setCompany(docSnap.data() as Company);
      } else {
        setCompany(null);
      }
      setLoadingCompany(false);
    });

    return () => unsubscribe();
  }, [id]);

  // 2. Fetch all linked entities (real-time filtering from main lists)
  const { contacts } = useContacts();
  const { deals } = useDeals();
  const { activities } = useActivities();

  const linkedContacts = useMemo(() => {
    return contacts.filter((c) => c.companyId === id);
  }, [contacts, id]);

  const linkedDeals = useMemo(() => {
    return deals.filter((d) => d.companyId === id);
  }, [deals, id]);

  const linkedActivities = useMemo(() => {
    // Filter activities where companyId matches, or matching any contact belonging to this company
    const contactIds = new Set(linkedContacts.map(c => c.id));
    return activities.filter((a) => a.companyId === id || (a.contactId && contactIds.has(a.contactId)));
  }, [activities, id, linkedContacts]);

  // 3. Stats Aggregations
  const totalPipelineValue = useMemo(() => {
    return linkedDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  }, [linkedDeals]);

  const openDealsCount = useMemo(() => {
    return linkedDeals.filter(d => !["closed_won", "closed_lost"].includes(d.stage)).length;
  }, [linkedDeals]);

  const handleDelete = async () => {
    if (!company) return;
    try {
      await companiesService.deleteCompany(company.id);
      toast.success(`Company "${company.name}" deleted successfully.`);
      router.push("/companies");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete company.");
    }
  };

  if (loadingCompany) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-card border rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-card border rounded-lg lg:col-span-2" />
          <div className="h-96 bg-card border rounded-lg" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-foreground">Company not found</h3>
        <p className="text-sm text-muted-foreground mt-2">The company record may have been deleted.</p>
        <Link href="/companies" className="text-primary hover:underline font-bold text-sm mt-4 inline-block">
          Back to Companies
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/companies" className="hover:text-foreground transition-colors">
          Companies
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-foreground">{company.name}</span>
      </div>

      {/* 4. Company Header Box */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border border-border bg-card rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar
            name={company.name}
            avatarUrl={company.logoUrl}
            size="lg"
            className="ring-2 ring-primary/20"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{company.name}</h2>
            </div>
            <p className="text-sm text-secondary-foreground mt-0.5 flex items-center gap-2">
              <span className="font-semibold text-foreground">{company.industry}</span>
              {company.website && (
                <>
                  <span>&bull;</span>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-bold inline-flex items-center gap-0.5"
                  >
                    <Globe className="h-3 w-3" />
                    {company.website.replace(/^https?:\/\//i, "")}
                  </a>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold bg-secondary text-secondary-foreground hover:bg-muted border border-border shadow-xs transition-colors cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5 text-primary" />
            <span>Edit Company</span>
          </button>
          
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-xs transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Tab Contents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs header */}
          <div className="flex border-b border-border text-sm font-semibold select-none">
            {(["overview", "contacts", "deals", "activity"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 border-b-2 capitalize transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Card */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm min-h-[300px]">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                    Company Demographics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <span className="block text-xs font-bold text-muted-foreground mb-1">
                        Company Size
                      </span>
                      <span className="font-semibold text-foreground capitalize">
                        {company.size === "startup" ? "Startup (< 10 employees)" : ""}
                        {company.size === "small" ? "Small (10 - 50 employees)" : ""}
                        {company.size === "medium" ? "Medium (50 - 250 employees)" : ""}
                        {company.size === "enterprise" ? "Enterprise (250+ employees)" : ""}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-muted-foreground mb-1">
                        Annual Revenue
                      </span>
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        {company.revenue ? formatCurrency(company.revenue) : "Undisclosed"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-muted-foreground mb-1">
                        Corporate Phone
                      </span>
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {company.phone || "No corporate phone"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-muted-foreground mb-1">
                        General Contact Email
                      </span>
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {company.email || "No contact email"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Corporate Address */}
                <div className="border-t border-border pt-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                    Office Location
                  </h3>
                  <div className="text-sm text-secondary-foreground flex items-start gap-2.5 bg-muted/20 border p-4 rounded-md">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">
                        {company.address?.street || "No street address"}
                      </p>
                      <p className="mt-0.5">
                        {company.address?.city || "No City"}{company.address?.state ? `, ${company.address.state}` : ""}{" "}
                        {company.address?.zip}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {company.address?.country || "USA"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="border-t border-border pt-6">
                  <span className="block text-xs font-bold text-muted-foreground mb-2">
                    Private Notes
                  </span>
                  <p className="text-sm text-secondary-foreground bg-muted/20 border border-border/40 p-4 rounded-md whitespace-pre-wrap leading-relaxed">
                    {company.notes || "No notes logged for this corporate account."}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "contacts" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Linked Contacts ({linkedContacts.length})
                </h3>
                {linkedContacts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground font-medium">
                    No contacts mapped to this company.
                  </div>
                ) : (
                  <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                    {linkedContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-4 flex items-center justify-between gap-4 bg-card hover:bg-muted/10 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar
                            name={`${contact.firstName} ${contact.lastName}`}
                            avatarUrl={contact.avatarUrl}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/contacts/${contact.id}`}
                              className="font-bold text-foreground text-sm hover:underline hover:text-primary transition-colors block"
                            >
                              {contact.firstName} {contact.lastName}
                            </Link>
                            <span className="text-xs text-muted-foreground block truncate">
                              {contact.jobTitle || "No title"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-secondary-foreground hidden sm:block">
                            {contact.email}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
                            {contact.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "deals" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Linked Deals ({linkedDeals.length})
                </h3>
                {linkedDeals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground font-medium">
                    No sales deals tracked for this company.
                  </div>
                ) : (
                  <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                    {linkedDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-card hover:bg-muted/10 transition-colors"
                      >
                        <div>
                          <Link
                            href={`/deals/${deal.id}`}
                            className="font-bold text-foreground text-sm hover:underline hover:text-primary transition-colors"
                          >
                            {deal.title}
                          </Link>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Close Date: {formatDate(deal.expectedCloseDate)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-extrabold text-foreground text-sm">
                            {formatCurrency(deal.value, deal.currency)}
                          </span>
                          <StageBadge stage={deal.stage} className="scale-95" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border/50 pb-3 shrink-0">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Corporate Timeline
                  </h3>
                  <button
                    onClick={() => setIsLogOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Log Activity</span>
                  </button>
                </div>

                <ActivityTimeline activities={linkedActivities} />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Account Summary Column */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Account Stats
            </h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-xs text-muted-foreground">
                  Total Corporate Pipeline
                </span>
                <span className="text-2xl font-black text-foreground tracking-tight mt-0.5 block">
                  {formatCurrency(totalPipelineValue)}
                </span>
              </div>

              <div>
                <span className="block text-xs text-muted-foreground">
                  Open Deals
                </span>
                <span className="text-lg font-bold text-foreground mt-0.5 block">
                  {openDealsCount} {openDealsCount === 1 ? "deal" : "deals"}
                </span>
              </div>

              <div className="border-t border-border/80 pt-4 mt-2">
                <span className="block text-xs text-muted-foreground">
                  Associated Contacts
                </span>
                <span className="text-lg font-bold text-foreground mt-0.5 block">
                  {linkedContacts.length} {linkedContacts.length === 1 ? "contact" : "contacts"}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Organization Sheet */}
      <AddCompanySheet
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        companyToEdit={company}
      />

      {/* Activity Drawer */}
      <AddActivitySheet
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        defaultCompanyId={company.id}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Corporate Account"
        description={`Are you sure you want to delete ${company.name}? This will permanently delete their company profile from Elara.`}
        confirmText="Delete Account"
        cancelText="Cancel"
      />
    </div>
  );
}
