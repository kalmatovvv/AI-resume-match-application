import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../components/AuthProvider.jsx';
import { api } from '../lib/api.js';

function CoverLetterInner() {
  const { user } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [letter, setLetter] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLetter('');
    setLoading(true);
    try {
      const res = await api.post(
        '/api/cover-letter',
        { resumeText, jobDescription },
        { withCredentials: true }
      );
      setLetter(res.data.coverLetter || '');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">AI Cover Letter</h1>
            <p className="text-sm text-slate-400">
              Generate a tailored cover letter from your resume and the job description.
            </p>
          </div>
          {user && (
            <div className="text-[11px] text-slate-500">
              Signed in as {user.attributes?.email || user.username}
            </div>
          )}
        </header>

        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs text-slate-300">Resume text</label>
            <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-3">
              <textarea
                className="w-full bg-transparent outline-none resize-none text-sm text-slate-100 placeholder:text-slate-500 min-h-[180px]"
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-300">Job description</label>
            <div className="border border-slate-800 rounded-2xl bg-slate-900/60 p-3">
              <textarea
                className="w-full bg-transparent outline-none resize-none text-sm text-slate-100 placeholder:text-slate-500 min-h-[180px]"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={!resumeText.trim() || !jobDescription.trim() || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 bg-emerald-500 text-slate-950 text-sm font-medium shadow-sm hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading && (
                <span className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              )}
              <span>{loading ? 'Generating…' : 'Generate cover letter'}</span>
            </button>
            {error && <div className="text-xs text-red-400">{error}</div>}
          </div>
        </form>

        {letter && (
          <div className="mt-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 space-y-2">
            <h2 className="text-sm font-semibold text-slate-100">Generated cover letter</h2>
            <pre className="text-xs text-slate-200 whitespace-pre-wrap">{letter}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoverLetterPage() {
  return (
    <AuthProvider>
      <CoverLetterInner />
    </AuthProvider>
  );
}







