'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Route-level React Error Boundary for graceful failure recovery.
 */
export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('[Dashboard ErrorBoundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4 text-center">
      <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h1 className="text-xl font-bold mb-2">Unable to Render Air Quality Dashboard</h1>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        An unexpected error occurred while loading monitoring station data. You can retry safely below.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Retry Dashboard
      </button>
    </div>
  );
}
