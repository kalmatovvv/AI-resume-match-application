import React from 'react';

export function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed inset-x-0 top-4 flex justify-center z-50 pointer-events-none">
      <div className="pointer-events-auto max-w-md w-full mx-4 rounded-xl border border-red-500/40 bg-red-950/80 px-4 py-3 shadow-lg flex items-start gap-3">
        <div className="mt-[2px] text-red-400">!</div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-red-200 mb-0.5">
            Something went wrong
          </div>
          <div className="text-xs text-red-100/90">{message}</div>
        </div>
        <button
          type="button"
          className="text-xs text-red-200/80 hover:text-red-50"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}


