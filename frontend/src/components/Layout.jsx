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
    </div>
  );
}


