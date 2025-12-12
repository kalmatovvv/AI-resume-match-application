import React from 'react';

export function CompanyCard({ company }) {
  const {
    company_name,
    industry,
    location,
    latest_funding,
    website,
    similarity,
    description
  } = company;

  const similarityPercent =
    typeof similarity === 'number' ? Math.round(similarity * 100) : null;

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col gap-2 hover:border-slate-700 transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-50">{company_name}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-slate-400">
            {industry && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800/80">
                {industry}
              </span>
            )}
            {location && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800/80">
                {location}
              </span>
            )}
            {latest_funding && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800/80">
                {latest_funding}
              </span>
            )}
          </div>
        </div>
        {similarityPercent !== null && (
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs font-medium text-emerald-400">
              {similarityPercent}% match
            </span>
            <span className="text-[10px] text-slate-500">similarity score</span>
          </div>
        )}
      </div>

      {description && (
        <p className="mt-1 text-xs leading-relaxed text-slate-300 line-clamp-4">
          {description}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-slate-400">
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
          >
            <span>Visit website</span>
            <span aria-hidden>↗</span>
          </a>
        )}
      </div>
    </article>
  );
}


