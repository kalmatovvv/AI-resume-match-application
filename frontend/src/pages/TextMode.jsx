import React from 'react';
import { TextInput } from '../components/TextInput.jsx';

export function TextModePage({ onMatch, loading }) {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">
          Paste résumé text
        </h1>
        <p className="mt-1 text-sm text-slate-400 max-w-xl">
          Paste your experience, skills, and what you&apos;re looking for. We&apos;ll send
          it to the matcher and find the closest startups.
        </p>
      </div>
      <TextInput onSubmit={onMatch} loading={loading} />
    </section>
  );
}


