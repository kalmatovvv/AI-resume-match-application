import React from 'react';
import { useAuth } from 'react-oidc-context';

export function Layout({ children, mode, onModeChange }) {
  const auth = useAuth();

  const login = () => auth.signinRedirect();
  const signup = () => auth.signinRedirect();
  const logout = () => {
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = window.location.origin;
    const cognitoDomain = `https://${import.meta.env.VITE_COGNITO_DOMAIN || 'your-domain'}`;

    auth.removeUser();
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-semibold">
                AI
              </div>
              <div>
                <div className="font-semibold tracking-tight">AI Resume Matcher</div>
                <div className="text-xs text-slate-400 hidden sm:block">
                  Find the best-fit startups for your background.
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="inline-flex items-center rounded-full bg-slate-900 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => onModeChange('upload')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${mode === 'upload'
                  ? 'bg-slate-100 text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100'
                  }`}
              >
                Upload mode
              </button>
              <button
                type="button"
                onClick={() => onModeChange('text')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${mode === 'text'
                  ? 'bg-slate-100 text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100'
                  }`}
              >
                Text mode
              </button>
            </div>

            <div className="h-6 w-px bg-slate-800" />

            {auth.isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-xs text-slate-400">Authenticated</span>
                  <span className="text-[10px] text-slate-500 max-w-[100px] truncate">{auth.user?.profile.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-xs font-medium text-slate-300 hover:text-white transition"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={login}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition"
                >
                  Log in
                </button>
                <button
                  onClick={signup}
                  className="px-3 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition"
                >
                  Sign up
                </button>
              </div>
            )}

          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">{children}</div>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 py-6">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} AI Resume Matcher
          </div>
          <a
            href="https://github.com/kalmatovvv/AI-resume-match-application"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-slate-300 transition"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.597 1.028 2.688 0 3.848-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span>View on GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
}


