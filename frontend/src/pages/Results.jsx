import React from 'react';
import { CompanyCard } from '../components/CompanyCard.jsx';

export function ResultsPage({ results, loading }) {
  const [filters, setFilters] = React.useState({
    industry: '',
    funding: '',
    location: ''
  });
  const [showFilters, setShowFilters] = React.useState(false);

  // Reset filters when new results arrive
  React.useEffect(() => {
    setFilters({ industry: '', funding: '', location: '' });
  }, [results]);

  // Extract unique options
  const options = React.useMemo(() => {
    if (!results) return { industries: [], funding: [], locations: [] };

    const industries = new Set();
    const funding = new Set();
    const locations = new Set();

    results.forEach(r => {
      if (r.industry) industries.add(r.industry);
      if (r.latest_funding) funding.add(r.latest_funding);
      if (r.location) locations.add(r.location);
    });

    return {
      industries: Array.from(industries).sort(),
      funding: Array.from(funding).sort(),
      locations: Array.from(locations).sort()
    };
  }, [results]);

  const filteredResults = React.useMemo(() => {
    if (!results) return [];
    return results.filter(r => {
      const matchIndustry = !filters.industry || r.industry === filters.industry;
      const matchFunding = !filters.funding || r.latest_funding === filters.funding;
      const matchLocation = !filters.location || r.location === filters.location;
      return matchIndustry && matchFunding && matchLocation;
    });
  }, [results, filters]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <section className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h2 className="text-sm font-semibold tracking-tight text-slate-200">
              Matches
            </h2>
            {results && results.length > 0 && (
              <div className="text-[11px] text-slate-500">
                Showing {filteredResults.length} of {results.length} companies
              </div>
            )}
          </div>

          {results && results.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition border ${activeFilterCount > 0 || showFilters
                  ? 'bg-slate-800 border-slate-700 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
              >
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] text-emerald-500">
                    {activeFilterCount}
                  </span>
                )}
                <svg className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showFilters && (
                <div className="absolute right-0 top-full mt-2 w-64 p-4 rounded-xl border border-slate-800 bg-slate-900 shadow-xl z-20 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Industry</label>
                    <select
                      value={filters.industry}
                      onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="">Any Industry</option>
                      {options.industries.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Funding Round</label>
                    <select
                      value={filters.funding}
                      onChange={(e) => setFilters(prev => ({ ...prev, funding: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="">Any Funding</option>
                      {options.funding.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Location</label>
                    <select
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="">Any Location</option>
                      {options.locations.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => setFilters({ industry: '', funding: '', location: '' })}
                      className="text-xs text-slate-400 hover:text-white transition"
                    >
                      Reset all
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-900 bg-slate-950/40 max-h-[420px] overflow-y-auto">
        {!results || results.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            {loading
              ? 'Finding the best matches for your profile…'
              : 'No matches yet. Upload a résumé or paste text to see companies that might fit you.'}
          </div>
        ) : (
          <div className="p-3 grid gap-3 sm:grid-cols-2">
            {filteredResults.length > 0 ? (
              filteredResults.slice(0, 100).map((company, idx) => (
                <CompanyCard key={`${company.company_name}-${idx}`} company={company} />
              ))
            ) : (
              <div className="col-span-2 py-8 text-center">
                <p className="text-sm text-slate-400">No companies match this filter.</p>
                <button
                  onClick={() => setFilters({ industry: '', funding: '', location: '' })}
                  className="mt-2 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  Clear filters
                </button>
              </div>
            )}

            {results.length === 3 && filteredResults.length > 0 && (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/50 p-4 flex flex-col items-center justify-center text-center gap-2">
                <p className="text-sm text-slate-300">Want more matches?</p>
                <p className="text-xs text-slate-500">Sign in to unlock top 100 results.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}


