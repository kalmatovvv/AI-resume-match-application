import React from 'react';
import { CompanyCard } from '../components/CompanyCard.jsx';

export function ResultsPage({ results, loading }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-200">
          Matches
        </h2>
        {results && results.length > 0 && (
          <div className="text-[11px] text-slate-500">
            Showing top {Math.min(results.length, 100)} companies
          </div>
        )}
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
            {results.slice(0, 100).map((company, idx) => (
              <CompanyCard key={`${company.company_name}-${idx}`} company={company} />
            ))}
            {results.length === 3 && (
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


