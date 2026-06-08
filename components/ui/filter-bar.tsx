import React from "react";
import { Search, RotateCcw } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  value: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: FilterConfig[];
  onFilterChange: (key: string, value: string) => void;
  sortOptions?: FilterOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  onClear?: () => void;
}

export function FilterBar({
  searchPlaceholder = "Search...",
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  sortOptions,
  sortValue,
  onSortChange,
  onClear,
}: FilterBarProps) {
  const hasActiveFilters = 
    searchQuery !== "" || 
    filters.some(f => f.value !== "") || 
    (sortValue && sortValue !== "");

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 border border-border bg-card rounded-lg shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] md:max-w-md">
        <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-background border border-border text-foreground pl-9 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
      </div>

      {/* Dynamic Dropdown Filters & Sorters */}
      <div className="flex flex-wrap items-center gap-3">
        {filters.map((filter) => (
          <div key={filter.key} className="flex flex-col">
            <select
              value={filter.value}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Sorting option */}
        {sortOptions && onSortChange && (
          <select
            value={sortValue || ""}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <option value="">Sort By</option>
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Clear Filters CTA */}
        {hasActiveFilters && onClear && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
export default FilterBar;
