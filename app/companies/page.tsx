"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Globe, 
  Phone, 
  Mail, 
  Building2, 
  Users 
} from "lucide-react";
import { toast } from "sonner";
import { useCompanies } from "../../lib/hooks/useCompanies";
import { useContacts } from "../../lib/hooks/useContacts";
import { companiesService } from "../../lib/services/companiesService";
import { DataTable, ColumnConfig } from "@/components/ui/data-table";
import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { Avatar } from "@/components/ui/custom-avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddCompanySheet } from "../../components/companies/add-company-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Company } from "../../lib/types";

export default function CompaniesPage() {
  const router = useRouter();

  // 1. Data hooks & states
  const [searchQuery, setSearchQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [sortField, setSortField] = useState("");

  const { companies, loading: companiesLoading } = useCompanies();
  const { contacts, loading: contactsLoading } = useContacts();

  const loading = companiesLoading || contactsLoading;

  // Dialog & Form states
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteCompany, setDeleteCompany] = useState<Company | null>(null);
  const [bulkDeleteItems, setBulkDeleteItems] = useState<Company[]>([]);

  // Calculate contact count per company
  const companyContactCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    contacts.forEach((contact) => {
      if (contact.companyId) {
        counts[contact.companyId] = (counts[contact.companyId] || 0) + 1;
      }
    });
    return counts;
  }, [contacts]);

  // Compiled industries list for filter options
  const allIndustries = useMemo(() => {
    const industriesSet = new Set<string>();
    companies.forEach((c) => {
      if (c.industry) industriesSet.add(c.industry);
    });
    return Array.from(industriesSet).map((ind) => ({ label: ind, value: ind }));
  }, [companies]);

  // 2. Client-side filtering & sorting
  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.website?.toLowerCase().includes(q)
      );
    }

    // Filters
    if (sizeFilter) {
      result = result.filter((c) => c.size === sizeFilter);
    }
    if (industryFilter) {
      result = result.filter((c) => c.industry === industryFilter);
    }

    // Sorter logic
    if (sortField) {
      result.sort((a, b) => {
        if (sortField === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sortField === "industry") {
          return a.industry.localeCompare(b.industry);
        }
        if (sortField === "contactsCount") {
          const countA = companyContactCounts[a.id] || 0;
          const countB = companyContactCounts[b.id] || 0;
          return countB - countA; // Descending
        }
        return 0;
      });
    }

    return result;
  }, [companies, searchQuery, sizeFilter, industryFilter, sortField, companyContactCounts]);

  const handleSingleDelete = async () => {
    if (!deleteCompany) return;
    try {
      await companiesService.deleteCompany(deleteCompany.id);
      toast.success(`Company "${deleteCompany.name}" deleted.`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete company.");
    } finally {
      setDeleteCompany(null);
    }
  };

  const handleBulkDelete = async () => {
    if (bulkDeleteItems.length === 0) return;
    try {
      const deletePromises = bulkDeleteItems.map((c) =>
        companiesService.deleteCompany(c.id)
      );
      await Promise.all(deletePromises);
      toast.success(`Successfully deleted ${bulkDeleteItems.length} companies.`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete companies.");
    } finally {
      setBulkDeleteItems([]);
    }
  };

  const handleEditClick = (company: Company, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditCompany(company);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (company: Company, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteCompany(company);
  };

  // DataTable columns config
  const columns: ColumnConfig<Company>[] = [
    {
      key: "name",
      header: "Company Name",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={item.name}
            avatarUrl={item.logoUrl}
            size="sm"
          />
          <div>
            <span className="font-semibold text-foreground hover:text-primary transition-colors">
              {item.name}
            </span>
            <div className="text-xs text-muted-foreground">
              {item.address?.city && item.address?.state 
                ? `${item.address.city}, ${item.address.state}` 
                : "No location"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "industry",
      header: "Industry",
      sortable: true,
      render: (item) => (
        <span className="text-primary text-xs font-bold px-2 py-1 rounded bg-primary/10 border border-primary/20">
          {item.industry}
        </span>
      ),
    },
    {
      key: "size",
      header: "Size",
      render: (item) => {
        const labels = {
          startup: "Startup (<10)",
          small: "Small (10-50)",
          medium: "Medium (50-250)",
          enterprise: "Enterprise (250+)",
        };
        return <span className="capitalize text-secondary-foreground">{labels[item.size] || item.size}</span>;
      },
    },
    {
      key: "website",
      header: "Website",
      render: (item) => (
        <div className="flex items-center gap-1.5 text-secondary-foreground">
          <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          {item.website ? (
            <a
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:underline hover:text-primary transition-colors truncate max-w-[150px]"
            >
              {item.website.replace(/^https?:\/\//i, "")}
            </a>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      key: "contactsCount",
      header: "Contacts Count",
      render: (item) => (
        <div className="flex items-center gap-1.5 text-secondary-foreground font-semibold">
          <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span>{companyContactCounts[item.id] || 0}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => router.push(`/companies/${item.id}`)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            title="View profile"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => handleEditClick(item, e)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            title="Edit company"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => handleDeleteClick(item, e)}
            className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 cursor-pointer"
            title="Delete company"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // Filter options
  const filters: FilterConfig[] = [
    {
      key: "size",
      label: "All Sizes",
      value: sizeFilter,
      options: [
        { label: "Startup (<10)", value: "startup" },
        { label: "Small (10-50)", value: "small" },
        { label: "Medium (50-250)", value: "medium" },
        { label: "Enterprise (250+)", value: "enterprise" },
      ],
    },
    {
      key: "industry",
      label: "All Industries",
      value: industryFilter,
      options: allIndustries,
    },
  ];

  const sortOptions = [
    { label: "Company Name", value: "name" },
    { label: "Industry Type", value: "industry" },
    { label: "Contacts Count", value: "contactsCount" },
  ];

  const handleClearFilters = () => {
    setSearchQuery("");
    setSizeFilter("");
    setIndustryFilter("");
    setSortField("");
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "size") setSizeFilter(value);
    if (key === "industry") setIndustryFilter(value);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-14 bg-card border rounded-md" />
        <div className="h-96 bg-card border rounded-md" />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Companies</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your client organizations and accounts.
            </p>
          </div>
        </div>

        <EmptyState
          icon={Building2}
          title="No Companies Yet"
          description="Create your first client company manually or go to Elara Settings to seed realistic mock data."
          action={{
            label: "Add Company",
            onClick: () => {
              setEditCompany(null);
              setIsEditOpen(true);
            },
          }}
        />

        <AddCompanySheet
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditCompany(null);
          }}
          companyToEdit={editCompany}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Companies</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your client organizations and accounts.
          </p>
        </div>
        <button
          onClick={() => {
            setEditCompany(null);
            setIsEditOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-opacity cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Company</span>
        </button>
      </div>

      {/* Filter panel */}
      <FilterBar
        searchPlaceholder="Search by name, industry, website..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={handleFilterChange}
        sortOptions={sortOptions}
        sortValue={sortField}
        onSortChange={setSortField}
        onClear={handleClearFilters}
      />

      {/* Companies DataTable */}
      <DataTable
        columns={columns}
        data={filteredCompanies}
        onRowClick={(item) => router.push(`/companies/${item.id}`)}
        pageSize={25}
        exportFileName="crm_companies.csv"
        bulkActions={[
          {
            label: "Bulk Delete",
            onClick: (items) => setBulkDeleteItems(items),
            icon: <Trash2 className="h-3.5 w-3.5" />,
            className: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
          },
        ]}
      />

      {/* Company Sheet (Add / Edit) */}
      <AddCompanySheet
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditCompany(null);
        }}
        companyToEdit={editCompany}
      />

      {/* Single delete dialog */}
      <ConfirmDialog
        isOpen={!!deleteCompany}
        onClose={() => setDeleteCompany(null)}
        onConfirm={handleSingleDelete}
        title="Delete Company Account"
        description={`Are you sure you want to delete "${deleteCompany?.name}"? All associated contacts and deals will lose their company association, and this cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Bulk delete dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteItems.length > 0}
        onClose={() => setBulkDeleteItems([])}
        onConfirm={handleBulkDelete}
        title="Delete Multiple Companies"
        description={`Are you sure you want to delete the ${bulkDeleteItems.length} selected company accounts? This action is permanent and cannot be undone.`}
        confirmText={`Delete ${bulkDeleteItems.length} Companies`}
        cancelText="Cancel"
      />
    </div>
  );
}
