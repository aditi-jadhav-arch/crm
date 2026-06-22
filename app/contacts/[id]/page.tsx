"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { 
  Building, 
  Phone, 
  Mail, 
  Tag, 
  Globe, 
  Calendar, 
  User, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  FileCheck2,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { useDeals } from "../../../lib/hooks/useDeals";
import { useActivities } from "../../../lib/hooks/useActivities";
import { contactsService } from "../../../lib/services/contactsService";
import { Avatar } from "@/components/ui/custom-avatar";
import { StatusBadge, StageBadge } from "@/components/ui/status-badges";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddContactSheet } from "../../../components/contacts/add-contact-sheet";
import { AddActivitySheet } from "../../../components/activities/add-activity-sheet";
import { ActivityTimeline } from "@/components/ui/activity-timeline";
import { formatDate, formatCurrency } from "../../../lib/utils";
import { Contact } from "../../../lib/types";

export default function ContactDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // 1. Real-time Contact Loading State
  const [contact, setContact] = useState<Contact | null>(null);
  const [loadingContact, setLoadingContact] = useState(true);

  // Layout Sheets
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);

  // Tab Selection State
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "deals" | "files">("overview");

  useEffect(() => {
    if (!id) return;
    
    // Subscribe to contact doc changes in Firestore
    const unsubscribe = onSnapshot(doc(db, "contacts", id), (docSnap) => {
      if (docSnap.exists()) {
        setContact(docSnap.data() as Contact);
      } else {
        setContact(null);
      }
      setLoadingContact(false);
    });

    return () => unsubscribe();
  }, [id]);

  // 2. Fetch associated entities (real-time listeners)
  const { deals, loading: dealsLoading } = useDeals({ contactId: id });
  const { activities, loading: activitiesLoading } = useActivities({ contactId: id });

  // 3. Computed calculations
  const totalDealValue = React.useMemo(() => {
    return deals.reduce((sum, d) => sum + (d.value || 0), 0);
  }, [deals]);

  const openDealsCount = React.useMemo(() => {
    return deals.filter(d => !["closed_won", "closed_lost"].includes(d.stage)).length;
  }, [deals]);

  // Mock Files (UI only as requested)
  const mockFiles = [
    { name: "Executive_Summary_Acme.pdf", size: "1.4 MB", uploadedAt: "Jun 02, 2026" },
    { name: "Pricing_Proposal_Tier2.docx", size: "450 KB", uploadedAt: "May 25, 2026" },
  ];

  const handleDelete = async () => {
    if (!contact) return;
    try {
      await contactsService.deleteContact(contact.id);
      toast.success("Contact deleted successfully.");
      router.push("/contacts");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete contact.");
    }
  };

  if (loadingContact) {
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

  if (!contact) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-foreground">Contact not found</h3>
        <p className="text-sm text-muted-foreground mt-2">The contact record may have been deleted.</p>
        <Link href="/contacts" className="text-primary hover:underline font-bold text-sm mt-4 inline-block">
          Back to Contacts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back navigation breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/contacts" className="hover:text-foreground transition-colors">
          Contacts
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-foreground">
          {contact.firstName} {contact.lastName}
        </span>
      </div>

      {/* 4. Contact Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border border-border bg-card rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar
            name={`${contact.firstName} ${contact.lastName}`}
            avatarUrl={contact.avatarUrl}
            size="lg"
            className="ring-2 ring-primary/20"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">
                {contact.firstName} {contact.lastName}
              </h2>
              <StatusBadge status={contact.status} />
            </div>
            <p className="text-sm text-secondary-foreground mt-0.5">
              {contact.jobTitle || "No Title"} &bull;{" "}
              {contact.companyId ? (
                <Link
                  href={`/companies/${contact.companyId}`}
                  className="font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  <Building className="h-3 w-3 shrink-0" />
                  {contact.companyName}
                </Link>
              ) : (
                <span className="text-muted-foreground">Unassigned</span>
              )}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold bg-secondary text-secondary-foreground hover:bg-muted border border-border shadow-xs transition-colors cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5 text-primary" />
            <span>Edit Profile</span>
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

      {/* Main split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Tabs & Contents */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-border text-sm font-semibold select-none">
            {(["overview", "activity", "deals", "files"] as const).map((tab) => (
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

          {/* Tab Content Display */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm min-h-[300px]">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Profile Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="block text-xs font-bold text-muted-foreground mb-1">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-primary hover:underline font-semibold flex items-center gap-1.5"
                    >
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      {contact.email || "No email provided"}
                    </a>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-muted-foreground mb-1">
                      Phone Number
                    </span>
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-foreground font-semibold flex items-center gap-1.5"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      {contact.phone || "No phone provided"}
                    </a>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-muted-foreground mb-1">
                      Lead Source
                    </span>
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                      {contact.source}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-muted-foreground mb-1">
                      Created On
                    </span>
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      {formatDate(contact.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Tags mapping */}
                <div className="border-t border-border pt-4">
                  <span className="block text-xs font-bold text-muted-foreground mb-2">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {contact.tags && contact.tags.length > 0 ? (
                      contact.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-primary/20 bg-primary/10 text-xs font-bold text-primary"
                        >
                          <Tag className="h-3 w-3 text-primary/80 shrink-0" />
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground font-medium">No tags assigned</span>
                    )}
                  </div>
                </div>

                {/* Description notes */}
                <div className="border-t border-border pt-4">
                  <span className="block text-xs font-bold text-muted-foreground mb-2">
                    Private Notes
                  </span>
                  <p className="text-sm text-secondary-foreground bg-muted/20 border border-border/40 p-4 rounded-md whitespace-pre-wrap leading-relaxed">
                    {contact.notes || "No notes logged for this contact profile."}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border/50 pb-3 shrink-0">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Activity Feed
                  </h3>
                  <button
                    onClick={() => setIsLogOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Log Activity</span>
                  </button>
                </div>

                {/* Activities Timeline */}
                <ActivityTimeline activities={activities} />
              </div>
            )}

            {activeTab === "deals" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Linked Deals ({deals.length})
                </h3>
                {deals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground font-medium">
                    No deals linked to this contact.
                  </div>
                ) : (
                  <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                    {deals.map((deal) => (
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

            {activeTab === "files" && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Document Attachments
                </h3>
                {/* Drag-n-drop mock area */}
                <div className="border border-dashed border-border rounded-lg p-6 text-center bg-muted/20">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">Upload attachments</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Drag and drop files here, or click to browse
                  </p>
                  <button
                    onClick={() => toast.info("File upload is UI-only in this demonstration.")}
                    className="px-3.5 py-1.5 bg-secondary text-secondary-foreground text-xs font-bold border border-border rounded-md hover:bg-muted cursor-pointer transition-colors"
                  >
                    Select File
                  </button>
                </div>

                {/* Mock files list */}
                <div className="divide-y divide-border border border-border rounded-lg bg-card">
                  {mockFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileCheck2 className="h-5 w-5 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate text-xs">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {file.size} &bull; Uploaded {file.uploadedAt}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toast.info(`Downloading file "${file.name}" (mock download)`)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Stats Column */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Deal Performance
            </h3>
            
            <div className="space-y-4">
              {/* Stat: Total Deal Value */}
              <div>
                <span className="block text-xs text-muted-foreground">
                  Total Pipeline Value
                </span>
                <span className="text-2xl font-black text-foreground tracking-tight mt-0.5 block">
                  {formatCurrency(totalDealValue)}
                </span>
              </div>

              {/* Stat: Open Deals */}
              <div>
                <span className="block text-xs text-muted-foreground">
                  Active Open Deals
                </span>
                <span className="text-lg font-bold text-foreground mt-0.5 block">
                  {openDealsCount} {openDealsCount === 1 ? "deal" : "deals"}
                </span>
              </div>

              {/* Stat: Last Contacted */}
              <div className="border-t border-border/80 pt-4 mt-2">
                <span className="block text-xs text-muted-foreground">
                  Last Contact Date
                </span>
                <span className="text-sm font-bold text-foreground mt-1 block">
                  {contact.lastContactedAt ? formatDate(contact.lastContactedAt) : "Never"}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Slide-over Profile Edit Drawer */}
      <AddContactSheet
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        contactToEdit={contact}
      />

      {/* Activity logging drawer */}
      <AddActivitySheet
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        defaultContactId={contact.id}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Contact Profile"
        description={`Are you sure you want to delete the profile of ${contact.firstName} ${contact.lastName}? This action cannot be undone and will permanently remove their records.`}
        confirmText="Delete Profile"
        cancelText="Cancel"
      />
    </div>
  );
}
