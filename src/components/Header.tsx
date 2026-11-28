import React from 'react';
import { Wind, RefreshCw, Sparkles } from 'lucide-react';

interface HeaderProps {
  onRefresh?: () => void;
  isLoading?: boolean;
  isAiLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading, isAiLoading }) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
            <Wind className="h-5 w-5 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Urban Air Quality Assistant
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                India Winter Smog Response
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Real-Time CPCB Metrics • Persona-Driven Gemini AI Intelligence
            </p>
          </div>
        </div>

        {/* Actions & Live Status */}
        <div className="flex items-center space-x-3">
          <div role="status" aria-live="polite">
            {isAiLoading ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Gemini Reasoning...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                Live Air Monitoring
              </span>
            )}
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading || isAiLoading}
              aria-label="Refresh live data"
              className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              title="Refresh live AQI & AI Guidance"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
