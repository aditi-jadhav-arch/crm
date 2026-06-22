import React, { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  Download 
} from "lucide-react";
import { cn } from "../../lib/utils";

export interface ColumnConfig<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: ColumnConfig<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  pageSize?: number;
  exportFileName?: string;
  bulkActions?: {
    label: string;
    onClick: (selectedItems: T[]) => void | Promise<void>;
    icon?: React.ReactNode;
    className?: string;
  }[];
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  pageSize = 25,
  exportFileName = "export.csv",
  bulkActions,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Reset page and selection when data changes
  React.useEffect(() => {
    setSelectedIds(new Set());
  }, [data]);

  // Handle Header Sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort Data
  const sortedData = useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle simple nested fields if needed or undefined values
      if (valA === undefined || valA === null) valA = "";
      if (valB === undefined || valB === null) valB = "";

      // Handle strings
      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      // Handle numbers / dates
      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [data, sortField, sortDirection]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.max(Math.ceil(sortedData.length / pageSize), 1);

  // Handle Row Selection Checkbox
  const handleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click navigation
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Handle Header "Select All" Checkbox
  const handleSelectAll = () => {
    const newSelected = new Set<string>();
    // If all current page items are selected, unselect them
    const allPageSelected = paginatedData.every(item => selectedIds.has(item.id));
    
    if (allPageSelected) {
      const updated = new Set(selectedIds);
      paginatedData.forEach(item => updated.delete(item.id));
      setSelectedIds(updated);
    } else {
      const updated = new Set(selectedIds);
      paginatedData.forEach(item => updated.add(item.id));
      setSelectedIds(updated);
    }
  };

  const isAllSelected = paginatedData.length > 0 && paginatedData.every(item => selectedIds.has(item.id));
  const isSomeSelected = paginatedData.some(item => selectedIds.has(item.id)) && !isAllSelected;

  const selectedItems = useMemo(() => {
    return data.filter(item => selectedIds.has(item.id));
  }, [data, selectedIds]);

  // CSV Export Utility
  const handleExportCSV = () => {
    if (!data.length) return;

    // Headers
    const headers = columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(",");

    // Rows
    const rows = data.map(item => {
      return columns.map(col => {
        let val = (item as any)[col.key];
        
        // Handle object fields (like address or array of tags)
        if (typeof val === "object" && val !== null) {
          val = JSON.stringify(val);
        }
        
        const stringVal = val !== undefined && val !== null ? String(val) : "";
        return `"${stringVal.replace(/"/g, '""')}"`;
      }).join(",");
    });

    const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Actions: Bulk actions & CSV Export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && bulkActions && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-150">
              <span className="text-sm text-muted-foreground mr-1">
                {selectedIds.size} selected
              </span>
              {bulkActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => action.onClick(selectedItems)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer",
                    action.className || "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {data.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border shadow-sm cursor-pointer transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export to CSV
          </button>
        )}
      </div>

      {/* Table Box */}
      <div className="w-full overflow-x-auto border border-border rounded-lg bg-card shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 font-medium text-muted-foreground">
              {/* Select All Checkbox Header */}
              {bulkActions && (
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={cn(
                    "p-3 select-none text-xs font-bold uppercase tracking-wider",
                    col.sortable ? "cursor-pointer hover:text-foreground transition-colors" : ""
                  )}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortField === col.key && (
                      sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (bulkActions ? 1 : 0)}
                  className="p-8 text-center text-muted-foreground font-medium"
                >
                  No items match search criteria
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={cn(
                    "hover:bg-muted/30 transition-colors",
                    onRowClick ? "cursor-pointer" : "",
                    selectedIds.has(item.id) ? "bg-accent/40" : ""
                  )}
                >
                  {/* Row Checkbox */}
                  {bulkActions && (
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={(e) => handleSelectRow(item.id, e as any)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="p-3 align-middle">
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
            {sortedData.length} records
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default DataTable;
