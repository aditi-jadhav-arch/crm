"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { 
  Building2, 
  User, 
  Tag, 
  Calendar, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronRight,
  FileText,
  FileCheck2,
  Download,
  Percent
} from "lucide-react";
import { toast } from "sonner";
import { useActivities } from "../../../lib/hooks/useActivities";
import { dealsService } from "../../../lib/services/dealsService";
import { Avatar } from "@/components/ui/custom-avatar";
import { StageBadge } from "@/components/ui/status-badges";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddDealSheet } from "../../../components/deals/add-deal-sheet";
import { AddActivitySheet } from "../../../components/activities/add-activity-sheet";
import { ActivityTimeline } from "@/components/ui/activity-timeline";
import { formatDate, formatCurrency } from "../../../lib/utils";
import { Deal } from "../../../lib/types";

export default function DealDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // 1. Real-time Deal document subscriber
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loadingDeal, setLoadingDeal] = useState(true);

  // Sheets & dialog states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "files">("overview");

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, "deals", id), (docSnap) => {
      if (docSnap.exists()) {
        setDeal(docSnap.data() as Deal);
      } else {
        setDeal(null);
      }
      setLoadingDeal(false);
    });

    return () => unsubscribe();
  }, [id]);

  // 2. Fetch associated activities
  const { activities } = useActivities({ dealId: id });

  const mockFiles = [
    { name: "SOW_Contract_Draft.pdf", size: "1.8 MB", uploadedAt: "Jun 03, 2026" },
    { name: "Apex_Technical_Spec.docx", size: "320 KB", uploadedAt: "May 29, 2026" },
  ];

  const handleDelete = async () => {
    if (!deal) return;
    try {
      await dealsService.deleteDeal(deal.id);
      toast.success(`Deal "${deal.title}" deleted successfully.`);
      router.push("/deals");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete deal.");
    }
  };

  if (loadingDeal) {
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

  if (!deal) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-foreground">Deal not found</h3>
        <p className="text-sm text-muted-foreground mt-2">The sales deal record may have been deleted.</p>
        <Link href="/deals" className="text-primary hover:underline font-bold text-sm mt-4 inline-block">
          Back to Deals
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/deals" className="hover:text-foreground transition-colors">
          Deals
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-foreground">{deal.title}</span>
      </div>

      {/* 4. Deal Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border border-border bg-card rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg shadow-sm shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{deal.title}</h2>
              <StageBadge stage={deal.stage} />
            </div>
            <p className="text-sm text-secondary-foreground mt-0.5">
              Associated Company:{" "}
              {deal.companyId ? (
                <Link
                  href={`/companies/${deal.companyId}`}
                  className="font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  {deal.companyName}
                </Link>
              ) : (
                <span className="text-muted-foreground">Unassigned</span>
              )}
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold bg-secondary text-secondary-foreground hover:bg-muted border border-border shadow-xs transition-colors cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5 text-primary" />
            <span>Edit Deal</span>
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

      {/* Main layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-border text-sm font-semibold select-none">
            {(["overview", "activity", "files"] as const).map((tab) => (
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

          <div className="bg-card border border-border rounded-lg p-6 shadow-sm min-h-[300px]">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                    Deal Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <span className="block text-xs font-bold text-muted-foreground mb-1">
                        Primary Contact
                      </span>
                      {deal.contactId ? (
                        <Link
                          href={`/contacts/${deal.contactId}`}
                          className="font-semibold text-primary hover:underline flex items-center gap-1.5"
                        >
                          <User className="h-4 w-4 text-muted-foreground shrink-0" />
                          {deal.contactName}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-muted-foreground mb-1">
                        Target Close Date
                      </span>
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        {formatDate(deal.expectedCloseDate)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-muted-foreground mb-1">
                        Deal Value
                      </span>
                      <span className="font-extrabold text-foreground text-sm flex items-center gap-0.5">
                        {formatCurrency(deal.value, deal.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-muted-foreground mb-1">
                        Win Probability
                      </span>
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <Percent className="h-4 w-4 text-muted-foreground shrink-0" />
                        {deal.probability}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deal tags */}
                <div className="border-t border-border pt-4">
                  <span className="block text-xs font-bold text-muted-foreground mb-2">
                    Opportunity Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {deal.tags && deal.tags.length > 0 ? (
                      deal.tags.map((tag) => (
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

                {/* Deal scope / Notes */}
                <div className="border-t border-border pt-4">
                  <span className="block text-xs font-bold text-muted-foreground mb-2">
                    Deal Notes / Scope
                  </span>
                  <p className="text-sm text-secondary-foreground bg-muted/20 border border-border/40 p-4 rounded-md whitespace-pre-wrap leading-relaxed">
                    {deal.notes || "No notes logged for this deal opportunity."}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border/50 pb-3 shrink-0">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Deal Log
                  </h3>
                  <button
                    onClick={() => setIsLogOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Log Activity</span>
                  </button>
                </div>

                <ActivityTimeline activities={activities} />
              </div>
            )}

            {activeTab === "files" && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Deal Attachments
                </h3>
                {/* Drag-n-drop mock area */}
                <div className="border border-dashed border-border rounded-lg p-6 text-center bg-muted/20">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">Upload deal files</p>
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

        {/* Right Side: Quick Stats column */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-5">
            <div>
              <span className="block text-xs text-muted-foreground font-bold uppercase tracking-wider">
                Deal Snapshot
              </span>
            </div>

            <div className="space-y-4 text-sm border-t border-border/50 pt-3">
              <div>
                <span className="block text-xs text-muted-foreground">
                  Est. Close Date
                </span>
                <span className="font-bold text-foreground mt-0.5 block">
                  {formatDate(deal.expectedCloseDate)}
                </span>
              </div>
              
              {deal.actualCloseDate && (
                <div>
                  <span className="block text-xs text-muted-foreground">
                    Actual Close Date
                  </span>
                  <span className="font-bold text-emerald-600 mt-0.5 block">
                    {formatDate(deal.actualCloseDate)}
                  </span>
                </div>
              )}

              <div>
                <span className="block text-xs text-muted-foreground">
                  Expected Value
                </span>
                <span className="text-xl font-black text-foreground tracking-tight mt-0.5 block">
                  {formatCurrency(deal.value, deal.currency)}
                </span>
              </div>

              <div>
                <span className="block text-xs text-muted-foreground">
                  Calculated Probability Value
                </span>
                <span className="text-sm font-semibold text-primary mt-0.5 block">
                  {formatCurrency((deal.value * (deal.probability || 0)) / 100, deal.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Deal Sheet */}
      <AddDealSheet
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        dealToEdit={deal}
      />

      {/* Log Activity Drawer */}
      <AddActivitySheet
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        defaultDealId={deal.id}
        defaultCompanyId={deal.companyId}
        defaultContactId={deal.contactId}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Deal Opportunity"
        description={`Are you sure you want to delete "${deal.title}"? This action will permanently remove it from the system and is irreversible.`}
        confirmText="Delete Deal"
        cancelText="Cancel"
      />
    </div>
  );
}
