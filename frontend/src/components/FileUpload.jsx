import React, { useCallback, useState } from 'react';

export function FileUpload({ onSubmit, loading }) {
  const [file, setFile] = useState(null);

  const onFileChange = useCallback((e) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const selected = e.dataTransfer.files?.[0];
    if (selected) setFile(selected);
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!file || loading) return;
      onSubmit(file);
    },
    [file, loading, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="border border-dashed border-slate-700 rounded-2xl bg-slate-900/40 px-6 py-8 flex flex-col items-center justify-center gap-3 text-center"
      >
        <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 mb-1">
          <span className="text-xl">⬆</span>
        </div>
        <div className="text-sm font-medium text-slate-100">
          Drag &amp; drop your résumé here
        </div>
        <div className="text-xs text-slate-400">
          PDF or DOCX, up to 10MB. We&apos;ll match you against startup companies.
        </div>
        <label className="mt-3 inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-900 text-xs font-medium cursor-pointer hover:bg-white transition">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={onFileChange}
          />
          Choose file
        </label>
        {file && (
          <div className="mt-2 text-xs text-slate-300">
            Selected: <span className="font-medium">{file.name}</span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!file || loading}
        className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 bg-emerald-500 text-slate-950 text-sm font-medium shadow-sm hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading && (
          <span className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        )}
        <span>{loading ? 'Matching résumé…' : 'Match my résumé'}</span>
      </button>
    </form>
  );
}


