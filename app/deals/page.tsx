"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Kanban as KanbanIcon, 
  List as ListIcon, 
  DollarSign, 
  Calendar,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { useDeals } from "../../lib/hooks/useDeals";
import { useContacts } from "../../lib/hooks/useContacts";
import { useCompanies } from "../../lib/hooks/useCompanies";
import { dealsService } from "../../lib/services/dealsService";
import { DataTable, ColumnConfig } from "@/components/ui/data-table";
import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { StageBadge } from "@/components/ui/status-badges";
import { Avatar } from "@/components/ui/custom-avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddDealSheet } from "../../components/deals/add-deal-sheet";
import { formatCurrency, formatDate } from "../../lib/utils";
import { Deal } from "../../lib/types";
import { cn } from "../../lib/utils";
import { Timestamp } from "firebase/firestore";

type DealStage = "lead" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost";

const STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: "lead", label: "Lead", color: "border-slate-200 bg-slate-50/20" },
  { id: "qualified", label: "Qualified", color: "border-purple-200 bg-purple-50/10" },
  { id: "proposal", label: "Proposal", color: "border-blue-200 bg-blue-50/10" },
  { id: "negotiation", label: "Negotiation", color: "border-orange-200 bg-orange-50/10" },
  { id: "closed_won", label: "Closed Won", color: "border-emerald-200 bg-emerald-50/15" },
  { id: "closed_lost", label: "Closed Lost", color: "border-rose-200 bg-rose-50/15" },
];

export default function DealsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // 1. Data states
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [sortField, setSortField] = useState("");

  const { deals, loading } = useDeals();

  // Optimistic Deals state for Kanban
  const [localDeals, setLocalDeals] = useState<Deal[]>([]);

  // Sheets & delete modals
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteDeal, setDeleteDeal] = useState<Deal | null>(null);
  const [bulkDeleteItems, setBulkDeleteItems] = useState<Deal[]>([]);
  const [sheetDefaultStage, setSheetDefaultStage] = useState<DealStage | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronize localDeals with source deals when they update from firestore
  useEffect(() => {
    setLocalDeals(deals);
  }, [deals]);

  // 2. Computed filtering & sorting logic (used by list view)
  const filteredDeals = useMemo(() => {
    let result = [...deals];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.companyName?.toLowerCase().includes(q) ||
          d.contactName?.toLowerCase().includes(q)
      );
    }

    if (stageFilter) {
      result = result.filter((d) => d.stage === stageFilter);
    }

    if (sortField) {
      result.sort((a, b) => {
        if (sortField === "title") {
          return a.title.localeCompare(b.title);
        }
        if (sortField === "value") {
          return b.value - a.value; // Descending
        }
        if (sortField === "closeDate") {
          const secA = a.expectedCloseDate?.seconds || 0;
          const secB = b.expectedCloseDate?.seconds || 0;
          return secA - secB;
        }
        return 0;
      });
    }

    return result;
  }, [deals, searchQuery, stageFilter, sortField]);

  // Group deals by stage for Kanban columns
  const groupedDeals = useMemo(() => {
    const groups: Record<DealStage, Deal[]> = {
      lead: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      closed_won: [],
      closed_lost: [],
    };

    localDeals.forEach((deal) => {
      if (groups[deal.stage]) {
        // Apply search query filter if typing on kanban
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          if (
            !deal.title.toLowerCase().includes(q) &&
            !deal.companyName?.toLowerCase().includes(q) &&
            !deal.contactName?.toLowerCase().includes(q)
          ) {
            return;
          }
        }
        groups[deal.stage].push(deal);
      }
    });

    return groups;
  }, [localDeals, searchQuery]);

  // Compute column totals (sum of deal value per stage)
  const columnTotals = useMemo(() => {
    const totals: Record<DealStage, number> = {
      lead: 0,
      qualified: 0,
      proposal: 0,
      negotiation: 0,
      closed_won: 0,
      closed_lost: 0,
    };

    Object.keys(groupedDeals).forEach((key) => {
      const stageKey = key as DealStage;
      totals[stageKey] = groupedDeals[stageKey].reduce((sum, d) => sum + (d.value || 0), 0);
    });

    return totals;
  }, [groupedDeals]);

  // 3. Drag and Drop Handler
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Dropped in same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceStage = source.droppableId as DealStage;
    const destStage = destination.droppableId as DealStage;

    // Optimistic UI Update: change stage locally
    const updatedLocalDeals = localDeals.map((deal) => {
      if (deal.id === draggableId) {
        return {
          ...deal,
          stage: destStage,
          actualCloseDate: ["closed_won", "closed_lost"].includes(destStage) 
            ? Timestamp.now() 
            : undefined
        };
      }
      return deal;
    });
    setLocalDeals(updatedLocalDeals);

    try {
      // Async database write
      await dealsService.updateDeal(draggableId, { stage: destStage });
      toast.success(`Deal moved to ${destStage.replace("_", " ")}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update deal stage in database.");
      // Revert local sync state
      setLocalDeals(deals);
    }
  };

  const handleSingleDelete = async () => {
    if (!deleteDeal) return;
    try {
      await dealsService.deleteDeal(deleteDeal.id);
      toast.success(`Deal "${deleteDeal.title}" deleted.`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete deal.");
    } finally {
      setDeleteDeal(null);
    }
  };

  const handleBulkDelete = async () => {
    if (bulkDeleteItems.length === 0) return;
    try {
      const deletePromises = bulkDeleteItems.map((d) =>
        dealsService.deleteDeal(d.id)
      );
      await Promise.all(deletePromises);
      toast.success(`Successfully deleted ${bulkDeleteItems.length} deals.`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete deals.");
    } finally {
      setBulkDeleteItems([]);
    }
  };

  const handleEditClick = (deal: Deal, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDeal(deal);
    setSheetDefaultStage(deal.stage);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (deal: Deal, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDeal(deal);
  };

  // DataTable columns config
  const columns: ColumnConfig<Deal>[] = [
    {
      key: "title",
      header: "Deal Name",
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-foreground hover:text-primary transition-colors block">
          {item.title}
        </span>
      ),
    },
    {
      key: "companyName",
      header: "Company",
      render: (item) => (
        item.companyId ? (
          <Link
            href={`/companies/${item.companyId}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:underline hover:text-primary transition-colors text-secondary-foreground"
          >
            {item.companyName}
          </Link>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: "contactName",
      header: "Contact",
      render: (item) => (
        item.contactId ? (
          <Link
            href={`/contacts/${item.contactId}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:underline hover:text-primary transition-colors text-secondary-foreground"
          >
            {item.contactName}
          </Link>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: "value",
      header: "Value",
      sortable: true,
      render: (item) => (
        <span className="font-extrabold text-foreground">
          {formatCurrency(item.value, item.currency)}
        </span>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      render: (item) => <StageBadge stage={item.stage} />,
    },
    {
      key: "probability",
      header: "Probability",
      render: (item) => (
        <span className="font-bold text-xs py-0.5 px-2 bg-primary/10 border border-primary/20 rounded-full text-primary">
          {item.probability}%
        </span>
      ),
    },
    {
      key: "expectedCloseDate",
      header: "Close Date",
      sortable: true,
      render: (item) => (
        <span className="text-muted-foreground">
          {formatDate(item.expectedCloseDate)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => router.push(`/deals/${item.id}`)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => handleEditClick(item, e)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            title="Edit deal"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => handleDeleteClick(item, e)}
            className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 cursor-pointer"
            title="Delete deal"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // List view filters
  const filters: FilterConfig[] = [
    {
      key: "stage",
      label: "All Stages",
      value: stageFilter,
      options: STAGES.map((s) => ({ label: s.label, value: s.id })),
    },
  ];

  const sortOptions = [
    { label: "Deal Name", value: "title" },
    { label: "Deal Value", value: "value" },
    { label: "Close Date", value: "closeDate" },
  ];

  const handleClearFilters = () => {
    setSearchQuery("");
    setStageFilter("");
    setSortField("");
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "stage") setStageFilter(value);
  };

  if (loading || !mounted) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-14 bg-card border rounded-md" />
        <div className="h-96 bg-card border rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Deals</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor and advance your sales pipeline opportunities.
          </p>
        </div>
        
        {/* Toggle buttons for view modes */}
        <div className="flex items-center gap-4">
          <div className="inline-flex rounded-md border border-border bg-card p-1 shadow-xs select-none">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "p-1.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer transition-all",
                viewMode === "kanban" ? "bg-muted text-primary font-bold shadow-xs" : ""
              )}
              title="Kanban Board"
            >
              <KanbanIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer transition-all",
                viewMode === "list" ? "bg-muted text-primary font-bold shadow-xs" : ""
              )}
              title="List Directory"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setEditDeal(null);
              setSheetDefaultStage(undefined);
              setIsEditOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-opacity cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Deal</span>
          </button>
        </div>
      </div>

      {/* 4. Filter and Search bar */}
      <FilterBar
        searchPlaceholder="Search by deal title, company, contact..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={viewMode === "list" ? filters : []} // filters only relevant in List mode
        onFilterChange={handleFilterChange}
        sortOptions={viewMode === "list" ? sortOptions : undefined}
        sortValue={sortField}
        onSortChange={setSortField}
        onClear={handleClearFilters}
      />

      {/* Render selected view */}
      {viewMode === "list" ? (
        <DataTable
          columns={columns}
          data={filteredDeals}
          onRowClick={(item) => router.push(`/deals/${item.id}`)}
          pageSize={25}
          exportFileName="crm_deals.csv"
          bulkActions={[
            {
              label: "Bulk Delete",
              onClick: (items) => setBulkDeleteItems(items),
              icon: <Trash2 className="h-3.5 w-3.5" />,
              className: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
            },
          ]}
        />
      ) : (
        /* KANBAN BOARD VIEW */
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin select-none min-h-[500px] items-start">
            {STAGES.map((stage) => {
              const stageDeals = groupedDeals[stage.id] || [];
              const columnTotal = columnTotals[stage.id];

              return (
                <div
                  key={stage.id}
                  className={cn(
                    "flex flex-col w-72 border rounded-lg shrink-0 max-h-[80vh]",
                    stage.id === "closed_won"
                      ? "bg-emerald-50/15 border-emerald-200"
                      : stage.id === "closed_lost"
                      ? "bg-rose-50/15 border-rose-200"
                      : "bg-sidebar border-sidebar-border"
                  )}
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-sidebar-border flex items-center justify-between font-bold text-xs shrink-0 select-none">
                    <div className="flex items-center gap-1.5 text-sidebar-foreground">
                      <span>{stage.label}</span>
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] text-primary font-bold">
                        {stageDeals.length}
                      </span>
                    </div>
                    <span className="text-primary tracking-tight">
                      {formatCurrency(columnTotal)}
                    </span>
                  </div>

                  {/* Droppable Region */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "p-3.5 space-y-3 overflow-y-auto min-h-[300px] flex-1",
                          snapshot.isDraggingOver ? "bg-sidebar-accent/30" : ""
                        )}
                      >
                        {stageDeals.map((deal, index) => (
                          <Draggable
                            key={deal.id}
                            draggableId={deal.id}
                            index={index}
                          >
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                onClick={() => router.push(`/deals/${deal.id}`)}
                                className={cn(
                                  "bg-card border p-3 rounded-lg shadow-xs hover:shadow-sm cursor-pointer select-none transition-all flex flex-col gap-2.5",
                                  dragSnapshot.isDragging ? "shadow-md scale-102 border-primary" : "border-border",
                                  stage.id === "closed_won" ? "border-l-4 border-l-emerald-500" : "",
                                  stage.id === "closed_lost" ? "border-l-4 border-l-rose-500" : ""
                                )}
                              >
                                {/* Title and actions */}
                                <div className="flex items-start justify-between gap-1.5">
                                  <span className="text-xs font-bold text-foreground leading-snug line-clamp-2">
                                    {deal.title}
                                  </span>
                                  <div className="flex items-center gap-1 opacity-40 hover:opacity-100 shrink-0" onClick={e => e.stopPropagation()}>
                                    <button
                                      onClick={(e) => handleEditClick(deal, e)}
                                      className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                                      title="Edit deal"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Company Name */}
                                <div className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                  <Briefcase className="h-3 w-3 text-muted-foreground" />
                                  <span className="truncate">{deal.companyName || "Unlinked"}</span>
                                </div>

                                {/* Footer Row: Value & Date */}
                                <div className="flex items-center justify-between gap-2 border-t border-border/30 pt-2 text-[10px]">
                                  <span className="font-extrabold text-foreground">
                                    {formatCurrency(deal.value, deal.currency)}
                                  </span>
                                  
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="px-1.5 py-0.5 rounded-full font-extrabold bg-primary/10 border border-primary/20 text-primary">
                                      {deal.probability}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {/* Quick column creation card */}
                        {stageDeals.length === 0 && (
                          <button
                            onClick={() => {
                              setEditDeal(null);
                              setSheetDefaultStage(stage.id);
                              setIsEditOpen(true);
                            }}
                            className="w-full flex items-center justify-center py-4 text-xs font-medium border border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-card/40 rounded-lg cursor-pointer transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            <span>Add Deal</span>
                          </button>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Deal Sheet (Add / Edit) */}
      <AddDealSheet
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditDeal(null);
          setSheetDefaultStage(undefined);
        }}
        dealToEdit={editDeal}
        defaultStage={sheetDefaultStage}
      />

      {/* Single delete dialog */}
      <ConfirmDialog
        isOpen={!!deleteDeal}
        onClose={() => setDeleteDeal(null)}
        onConfirm={handleSingleDelete}
        title="Delete Deal Opportunity"
        description={`Are you sure you want to delete "${deleteDeal?.title}"? This sales opportunity will be permanently removed from Elara.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Bulk delete dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteItems.length > 0}
        onClose={() => setBulkDeleteItems([])}
        onConfirm={handleBulkDelete}
        title="Delete Multiple Deals"
        description={`Are you sure you want to delete the ${bulkDeleteItems.length} selected deals? This action is permanent and cannot be undone.`}
        confirmText={`Delete ${bulkDeleteItems.length} Deals`}
        cancelText="Cancel"
      />
    </div>
  );
}
