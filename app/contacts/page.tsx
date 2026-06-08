"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Phone, 
  Mail, 
  Calendar,
  Building,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { useContacts } from "../../lib/hooks/useContacts";
import { contactsService } from "../../lib/services/contactsService";
import { DataTable, ColumnConfig } from "@/components/ui/data-table";
import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { StatusBadge } from "@/components/ui/status-badges";
import { Avatar } from "@/components/ui/custom-avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddContactSheet } from "../../components/contacts/add-contact-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "../../lib/utils";
import { Contact } from "../../lib/types";

export default function ContactsPage() {
  const router = useRouter();

  // 1. Listeners and states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sortField, setSortField] = useState("");

  const { contacts, loading } = useContacts();

  // Dialog & Form states
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null);
  const [bulkDeleteItems, setBulkDeleteItems] = useState<Contact[]>([]);

  // 2. Computed filtering & sorting logic
  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    // Client-side search (first name, last name, email, company, job title)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.companyName?.toLowerCase().includes(q) ||
          c.jobTitle?.toLowerCase().includes(q)
      );
    }

    // Apply Filter Bar variables
    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (sourceFilter) {
      result = result.filter((c) => c.source === sourceFilter);
    }
    if (tagFilter) {
      result = result.filter((c) => c.tags?.includes(tagFilter));
    }

    // Apply Sorting
    if (sortField) {
      result.sort((a, b) => {
        if (sortField === "name") {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        }
        if (sortField === "created") {
          const secA = a.createdAt?.seconds || 0;
          const secB = b.createdAt?.seconds || 0;
          return secB - secA; // Descending
        }
        if (sortField === "lastContacted") {
          const secA = a.lastContactedAt?.seconds || 0;
          const secB = b.lastContactedAt?.seconds || 0;
          return secB - secA; // Descending
        }
        return 0;
      });
    }

    return result;
  }, [contacts, searchQuery, statusFilter, sourceFilter, tagFilter, sortField]);

  // List of all unique tags from contacts for tags filter
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    contacts.forEach((c) => {
      c.tags?.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet).map((t) => ({ label: t, value: t }));
  }, [contacts]);

  // Handlers
  const handleSingleDelete = async () => {
    if (!deleteContact) return;
    try {
      await contactsService.deleteContact(deleteContact.id);
      toast.success(`Contact "${deleteContact.firstName} ${deleteContact.lastName}" deleted.`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete contact.");
    } finally {
      setDeleteContact(null);
    }
  };

  const handleBulkDelete = async () => {
    if (bulkDeleteItems.length === 0) return;
    try {
      const deletePromises = bulkDeleteItems.map((c) =>
        contactsService.deleteContact(c.id)
      );
      await Promise.all(deletePromises);
      toast.success(`Successfully deleted ${bulkDeleteItems.length} contacts.`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete contacts.");
    } finally {
      setBulkDeleteItems([]);
    }
  };

  const handleEditClick = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditContact(contact);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteContact(contact);
  };

  // DataTable columns config
  const columns: ColumnConfig<Contact>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={`${item.firstName} ${item.lastName}`}
            avatarUrl={item.avatarUrl}
            size="sm"
          />
          <div>
            <span className="font-semibold text-foreground hover:text-primary transition-colors">
              {item.firstName} {item.lastName}
            </span>
            <div className="text-xs text-muted-foreground">{item.jobTitle}</div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (item) => (
        <div className="flex items-center gap-1.5 text-secondary-foreground">
          <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">{item.email || "-"}</span>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (item) => (
        <div className="flex items-center gap-1.5 text-secondary-foreground shrink-0">
          <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span>{item.phone || "-"}</span>
        </div>
      ),
    },
    {
      key: "companyName",
      header: "Company",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5 text-secondary-foreground">
          <Building className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          {item.companyId ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/companies/${item.companyId}`);
              }}
              className="hover:underline hover:text-primary transition-colors cursor-pointer"
            >
              {item.companyName}
            </span>
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "lastContactedAt",
      header: "Last Contacted",
      render: (item) => (
        <span className="text-muted-foreground">
          {item.lastContactedAt ? formatDate(item.lastContactedAt) : "Never"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => router.push(`/contacts/${item.id}`)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => handleEditClick(item, e)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            title="Edit contact"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => handleDeleteClick(item, e)}
            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-600 cursor-pointer"
            title="Delete contact"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // FilterBar configurations
  const filters: FilterConfig[] = [
    {
      key: "status",
      label: "All Statuses",
      value: statusFilter,
      options: [
        { label: "Lead", value: "lead" },
        { label: "Prospect", value: "prospect" },
        { label: "Customer", value: "customer" },
        { label: "Churned", value: "churned" },
      ],
    },
    {
      key: "source",
      label: "All Sources",
      value: sourceFilter,
      options: [
        { label: "Website", value: "Website" },
        { label: "Referral", value: "Referral" },
        { label: "LinkedIn", value: "LinkedIn" },
        { label: "Partner", value: "Partner" },
        { label: "Cold Outreach", value: "Cold Outreach" },
        { label: "Event", value: "Event" },
      ],
    },
    {
      key: "tag",
      label: "All Tags",
      value: tagFilter,
      options: allTags,
    },
  ];

  const sortOptions = [
    { label: "Full Name", value: "name" },
    { label: "Created Date", value: "created" },
    { label: "Last Contacted", value: "lastContacted" },
  ];

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setSourceFilter("");
    setTagFilter("");
    setSortField("");
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "status") setStatusFilter(value);
    if (key === "source") setSourceFilter(value);
    if (key === "tag") setTagFilter(value);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-14 bg-card border rounded-md" />
        <div className="h-96 bg-card border rounded-md" />
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Contacts</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your leads, prospects, and customer relationships.
            </p>
          </div>
        </div>

        <EmptyState
          icon={UserPlus}
          title="No Contacts Yet"
          description="Create your first contact manually or go to CRM settings to seed realistic mock data."
          action={{
            label: "Add Contact",
            onClick: () => {
              setEditContact(null);
              setIsEditOpen(true);
            },
          }}
        />

        <AddContactSheet
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditContact(null);
          }}
          contactToEdit={editContact}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Add Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Contacts</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your leads, prospects, and customer relationships.
          </p>
        </div>
        <button
          onClick={() => {
            setEditContact(null);
            setIsEditOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-opacity cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Filter and Search Panel */}
      <FilterBar
        searchPlaceholder="Search by name, email, company, job title..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={handleFilterChange}
        sortOptions={sortOptions}
        sortValue={sortField}
        onSortChange={setSortField}
        onClear={handleClearFilters}
      />

      {/* Contacts DataTable */}
      <DataTable
        columns={columns}
        data={filteredContacts}
        onRowClick={(item) => router.push(`/contacts/${item.id}`)}
        pageSize={25}
        exportFileName="crm_contacts.csv"
        bulkActions={[
          {
            label: "Bulk Delete",
            onClick: (items) => setBulkDeleteItems(items),
            icon: <Trash2 className="h-3.5 w-3.5" />,
            className: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/50",
          },
        ]}
      />

      {/* Contact Form Sheet (Add / Edit) */}
      <AddContactSheet
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditContact(null);
        }}
        contactToEdit={editContact}
      />

      {/* Single Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteContact}
        onClose={() => setDeleteContact(null)}
        onConfirm={handleSingleDelete}
        title="Delete Contact"
        description={`Are you sure you want to delete ${deleteContact?.firstName} ${deleteContact?.lastName}? This action cannot be undone and will remove the contact from the system.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Bulk Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteItems.length > 0}
        onClose={() => setBulkDeleteItems([])}
        onConfirm={handleBulkDelete}
        title="Delete Multiple Contacts"
        description={`Are you sure you want to delete the ${bulkDeleteItems.length} selected contacts? This action is permanent and cannot be undone.`}
        confirmText={`Delete ${bulkDeleteItems.length} Contacts`}
        cancelText="Cancel"
      />
    </div>
  );
}
