import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../components/AuthProvider.jsx';
import { api } from '../lib/api.js';

function ResumeRewriterInner() {
  const { user } = useAuth();
  const [rawText, setRawText] = useState('');
  const [style, setStyle] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await api.post(
        '/api/rewrite-resume',
        { rawText, style },
        { withCredentials: true }
      );
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to rewrite resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">AI Resume Rewriter</h1>
            <p className="text-sm text-slate-400">
              Paste your resume text and get a cleaner, ATS-friendly version plus bullet
              points.
            </p>
          </div>
          {user && (
            <div className="text-[11px] text-slate-500">
              Signed in as {user.attributes?.email || user.username}
            </div>
          )}
        </header>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-300">Style</span>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs outline-none focus:border-emerald-400"
            >
              <option value="professional">Professional</option>
              <option value="concise">Concise</option>
              <option value="technical">Technical</option>
            </select>
          </div>

          <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-3">
            <textarea
              className="w-full bg-transparent outline-none resize-none text-sm text-slate-100 placeholder:text-slate-500 min-h-[180px]"
              placeholder="Paste your current resume text here..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={!rawText.trim() || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 bg-emerald-500 text-slate-950 text-sm font-medium shadow-sm hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading && (
              <span className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            )}
            <span>{loading ? 'Rewriting…' : 'Rewrite resume'}</span>
          </button>
        </form>

        {error && <div className="text-xs text-red-400">{error}</div>}

        {result && (
          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 space-y-2">
              <h2 className="text-sm font-semibold text-slate-100">Rewritten resume</h2>
              <pre className="text-xs text-slate-200 whitespace-pre-wrap">
                {result.rewritten}
              </pre>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 space-y-2">
              <h2 className="text-sm font-semibold text-slate-100">Bullet points</h2>
              {result.bullets && result.bullets.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-200">
                  {result.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">No bullets returned.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResumeRewriterPage() {
  return (
    <AuthProvider>
      <ResumeRewriterInner />
    </AuthProvider>
  );
}







