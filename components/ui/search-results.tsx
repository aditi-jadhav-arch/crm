import React from "react";
import Link from "next/link";
import { User, Building2, Briefcase } from "lucide-react";
import { Contact, Company, Deal } from "../../lib/types";
import { formatCurrency } from "../../lib/utils";

interface SearchResultsProps {
  query: string;
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
  onResultClick: () => void;
}

export function SearchResults({
  query,
  contacts,
  companies,
  deals,
  onResultClick,
}: SearchResultsProps) {
  const trimmedQuery = query.trim().toLowerCase();

  const filteredContacts = React.useMemo(() => {
    if (!trimmedQuery) return [];
    return contacts.filter(
      (c) =>
        c.firstName.toLowerCase().includes(trimmedQuery) ||
        c.lastName.toLowerCase().includes(trimmedQuery) ||
        c.email?.toLowerCase().includes(trimmedQuery)
    ).slice(0, 4);
  }, [contacts, trimmedQuery]);

  const filteredCompanies = React.useMemo(() => {
    if (!trimmedQuery) return [];
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(trimmedQuery) ||
        c.industry.toLowerCase().includes(trimmedQuery)
    ).slice(0, 4);
  }, [companies, trimmedQuery]);

  const filteredDeals = React.useMemo(() => {
    if (!trimmedQuery) return [];
    return deals.filter(
      (d) =>
        d.title.toLowerCase().includes(trimmedQuery) ||
        d.companyName?.toLowerCase().includes(trimmedQuery)
    ).slice(0, 4);
  }, [deals, trimmedQuery]);

  const totalResults =
    filteredContacts.length + filteredCompanies.length + filteredDeals.length;

  if (!trimmedQuery) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-lg shadow-xl max-h-[400px] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-150">
      {totalResults === 0 ? (
        <div className="p-4 text-center text-sm text-muted-foreground font-medium">
          No matches found for &quot;{query}&quot;
        </div>
      ) : (
        <div className="divide-y divide-border">
          {/* Contacts Section */}
          {filteredContacts.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                Contacts
              </div>
              {filteredContacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/contacts/${contact.id}`}
                  onClick={onResultClick}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-muted/50 text-foreground transition-colors"
                >
                  <span className="p-1.5 rounded-full bg-orange-100 text-orange-600">
                    <User className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {contact.firstName} {contact.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {contact.jobTitle ? `${contact.jobTitle} at ` : ""}{contact.companyName}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Companies Section */}
          {filteredCompanies.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                Companies
              </div>
              {filteredCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={`/companies/${company.id}`}
                  onClick={onResultClick}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-muted/50 text-foreground transition-colors"
                >
                  <span className="p-1.5 rounded-full bg-blue-100 text-blue-600">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {company.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {company.industry}{company.address?.city && company.address?.state ? ` • ${company.address.city}, ${company.address.state}` : ""}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Deals Section */}
          {filteredDeals.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-bold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                Deals
              </div>
              {filteredDeals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.id}`}
                  onClick={onResultClick}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-muted/50 text-foreground transition-colors"
                >
                  <span className="p-1.5 rounded-full bg-purple-100 text-purple-600">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {deal.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate flex items-center justify-between">
                      <span>{deal.companyName}</span>
                      <span className="font-bold text-primary mr-1">
                        {formatCurrency(deal.value, deal.currency)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default SearchResults;
