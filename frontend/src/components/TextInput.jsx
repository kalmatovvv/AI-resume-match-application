import React, { useCallback, useState } from 'react';

export function TextInput({ onSubmit, loading }) {
  const [text, setText] = useState('');

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!text.trim() || loading) return;
      onSubmit(text.trim());
    },
    [text, loading, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-slate-800 rounded-2xl bg-slate-900/40 px-4 py-3">
        <textarea
          className="w-full bg-transparent outline-none resize-none text-sm text-slate-100 placeholder:text-slate-500 min-h-[180px]"
          placeholder="Paste your résumé text here. Focus on your experience, skills, and what you’re looking for next…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={!text.trim() || loading}
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


