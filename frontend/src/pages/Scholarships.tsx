import React, { useState, useMemo } from 'react';
import { Search, Filter, Loader2, AlertCircle } from 'lucide-react';
import ScholarshipCard from '../components/ScholarshipCard';
import { useGetScholarships } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';

export default function Scholarships() {
  const { data: scholarships = [], isLoading, error } = useGetScholarships();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');

  const providers = useMemo(
    () => ['all', ...Array.from(new Set(scholarships.map((s) => s.provider)))],
    [scholarships],
  );

  const categories = useMemo(() => {
    const cats = new Set<string>();
    scholarships.forEach((s) => s.eligibleCategories.forEach((c) => cats.add(c)));
    return ['all', ...Array.from(cats)];
  }, [scholarships]);

  const filtered = useMemo(() => {
    return scholarships.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' || s.eligibleCategories.includes(categoryFilter);

      const matchesProvider = providerFilter === 'all' || s.provider === providerFilter;

      return matchesSearch && matchesCategory && matchesProvider;
    });
  }, [scholarships, searchQuery, categoryFilter, providerFilter]);

  const handleApply = (scholarshipId: string) => {
    navigate({ to: `/scholarships/${scholarshipId}` });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Browse Scholarships</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Find and apply for scholarships that match your profile
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search scholarships..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-8 pr-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Categories' : c.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {providers.map((p) => (
              <option key={p} value={p}>
                {p === 'all' ? 'All Providers' : p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading scholarships...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">Failed to load scholarships. Please try again.</p>
        </div>
      )}

      {/* Results count */}
      {!isLoading && !error && (
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} of {scholarships.length} scholarships
        </p>
      )}

      {/* Scholarship grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((scholarship) => (
            <ScholarshipCard
              key={scholarship.id.toString()}
              scholarship={scholarship}
              onApply={handleApply}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filtered.length === 0 && scholarships.length > 0 && (
        <div className="text-center py-12">
          <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">No scholarships found</h3>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
