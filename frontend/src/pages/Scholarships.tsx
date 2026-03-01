import React, { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useTranslation } from '../hooks/useTranslation';
import { useListScholarships, useCheckEligibility } from '../hooks/useQueries';
import ScholarshipCard from '../components/ScholarshipCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, GraduationCap } from 'lucide-react';
import type { Scholarship } from '../backend';

// Individual card with eligibility check
function ScholarshipCardWithEligibility({
  scholarship,
  onApplyClick,
}: {
  scholarship: Scholarship;
  onApplyClick: (id: bigint) => void;
}) {
  const { data: eligibility } = useCheckEligibility(scholarship.id);
  return (
    <ScholarshipCard
      scholarship={scholarship}
      isEligible={eligibility?.isEligible ?? null}
      onApplyClick={onApplyClick}
    />
  );
}

export default function Scholarships() {
  const { t } = useTranslation();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: scholarships, isLoading } = useListScholarships();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('');

  // All hooks must be called before any conditional returns
  const filtered = useMemo(() => {
    if (!scholarships) return [];
    return scholarships.filter((s) => {
      const matchSearch =
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.provider.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase());

      const matchCategory = categoryFilter === 'all' || s.eligibility.category === categoryFilter;

      const matchProvider =
        !providerFilter || s.provider.toLowerCase().includes(providerFilter.toLowerCase());

      return matchSearch && matchCategory && matchProvider;
    });
  }, [scholarships, search, categoryFilter, providerFilter]);

  if (!identity) {
    navigate({ to: '/login' });
    return null;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-teal-900">{t('scholarships.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {scholarships?.length ?? 0} scholarships available
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-teal-100 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('scholarships.search')}
              className="pl-9 border-gray-200 focus:border-teal-400"
            />
          </div>

          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 border-gray-200">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                <SelectValue placeholder={t('scholarships.filter.category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('scholarships.filter.all')}</SelectItem>
                <SelectItem value="general">{t('scholarships.filter.general')}</SelectItem>
                <SelectItem value="obc">{t('scholarships.filter.obc')}</SelectItem>
                <SelectItem value="sc">{t('scholarships.filter.sc')}</SelectItem>
                <SelectItem value="st">{t('scholarships.filter.st')}</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              placeholder={t('scholarships.filter.provider')}
              className="w-40 border-gray-200 focus:border-teal-400"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{t('scholarships.noResults')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((scholarship) => (
            <ScholarshipCardWithEligibility
              key={scholarship.id.toString()}
              scholarship={scholarship}
              onApplyClick={(id) => navigate({ to: '/scholarships/$id', params: { id: id.toString() } })}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-4 text-gray-400 text-xs border-t border-gray-100 mt-4">
        © {new Date().getFullYear()} {t('nav.appName')} · Built with ❤️ using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'scholarpath')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
