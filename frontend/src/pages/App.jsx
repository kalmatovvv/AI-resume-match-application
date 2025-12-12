import React, { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useMutation } from '@tanstack/react-query';
import { Layout } from '../components/Layout.jsx';
import { UploadPage } from './Upload.jsx';
import { TextModePage } from './TextMode.jsx';
import { ResultsPage } from './Results.jsx';
import { Toast } from '../components/Toast.jsx';
import { matchResumeFile } from '../api/match.js';
import { matchResumeText } from '../api/matchText.js';

export default function App() {
  const [mode, setMode] = useState('upload');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const fileMutation = useMutation({
    mutationFn: matchResumeFile,
    onSuccess: (data) => {
      setError('');
      setResults(data?.matches || data || []);
    },
    onError: (err) => {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Unable to match résumé. Please try again.';
      setError(message);
    }
  });

  const textMutation = useMutation({
    mutationFn: matchResumeText,
    onSuccess: (data) => {
      setError('');
      setResults(data?.matches || data || []);
    },
    onError: (err) => {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Unable to match résumé. Please try again.';
      setError(message);
    }
  });

  const loading = fileMutation.isPending || textMutation.isPending;

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
  };

  const { user } = useAuth();
  const token = user?.access_token;

  const handleFileMatch = (file) => {
    setResults(null);
    fileMutation.mutate({ file, token });
  };

  const handleTextMatch = (text) => {
    setResults(null);
    textMutation.mutate({ text, token });
  };

  return (
    <>
      <Layout mode={mode} onModeChange={handleModeChange}>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <>
              {mode === 'upload' ? (
                <UploadPage onMatch={handleFileMatch} loading={loading} />
              ) : (
                <TextModePage onMatch={handleTextMatch} loading={loading} />
              )}
              <ResultsPage results={results} loading={loading} />
            </>
          </div>
        </div>
      </Layout>
      <Toast message={error} onClose={() => setError('')} />
    </>
  );
}


