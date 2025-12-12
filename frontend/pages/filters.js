import React from 'react';
import { AuthProvider } from '../components/AuthProvider.jsx';

function FiltersPageInner() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="max-w-xl w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-3">
        <h1 className="text-lg font-semibold tracking-tight">Search filters</h1>
        <p className="text-sm text-slate-400">
          This page is a placeholder for a richer filters UI. The backend already supports
          industry, location, funding_stage, and min_similarity filters via the
          <code className="px-1 mx-1 rounded bg-slate-800 text-[11px]">filters</code> object
          on <code className="px-1 mx-1 rounded bg-slate-800 text-[11px]">/api/match</code>{' '}
          and <code className="px-1 mx-1 rounded bg-slate-800 text-[11px]">/api/match/text</code>.
        </p>
      </div>
    </div>
  );
}

export default function FiltersPage() {
  return (
    <AuthProvider>
      <FiltersPageInner />
    </AuthProvider>
  );
}







