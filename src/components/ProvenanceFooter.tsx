import React from 'react';
import { DataProvenance } from '@/types/aqi';
import { Database, Info } from 'lucide-react';

interface ProvenanceFooterProps {
  provenance: DataProvenance;
}

export const ProvenanceFooter: React.FC<ProvenanceFooterProps> = ({ provenance }) => {
  return (
    <div className="rounded-xl bg-cyan-950/20 border border-cyan-800/40 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-cyan-400" aria-hidden="true" />
          <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
            Data Provenance &amp; Verification Card
          </h3>
        </div>
        {provenance.isLive ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            Live Ground Station
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-500/30">
            <Info className="h-3 w-3" aria-hidden="true" />
            Verified CPCB Benchmark
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 pt-1">
        <div>
          <span className="text-slate-400 block">Official Station Name:</span>
          <span className="font-medium text-white">{provenance.stationName}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Source &amp; Aggregator:</span>
          <span className="font-medium text-white">{provenance.source}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Verified Observation Time:</span>
          <span suppressHydrationWarning className="font-medium text-white">
            {provenance.localTimeString}
          </span>
        </div>
      </div>

      {provenance.fallbackReason && (
        <div className="mt-2.5 pt-2 border-t border-cyan-900/40 text-[11px] text-slate-400 italic">
          Notice: {provenance.fallbackReason}
        </div>
      )}
    </div>
  );
};
