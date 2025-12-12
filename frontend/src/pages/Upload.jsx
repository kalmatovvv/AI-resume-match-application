import React from 'react';
import { FileUpload } from '../components/FileUpload.jsx';

export function UploadPage({ onMatch, loading }) {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">
          Upload your résumé
        </h1>
        <p className="mt-1 text-sm text-slate-400 max-w-xl">
          We&apos;ll embed your résumé and search against startup companies that might be a
          strong fit. Nothing is stored permanently.
          <span className="block mt-2 text-emerald-400 font-medium">
            Log in to see top 100 matches (guests see top 3).
          </span>
        </p>
      </div>
      <FileUpload onSubmit={onMatch} loading={loading} />
    </section>
  );
}


