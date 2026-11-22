import React from 'react';
import Link from 'next/link';
import { Wind } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4 text-center">
      <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
        <Wind className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        The air quality monitoring resource or persona you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
      >
        Return to Live Dashboard
      </Link>
    </div>
  );
}
