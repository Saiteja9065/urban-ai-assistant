import React from 'react';
import {
  Pillar1LowEmissionRoutines,
  Pillar2IndoorAirQuality,
  Pillar3SustainableAlternatives,
} from '@/types/assistant';
import { cn } from '@/lib/cn';
import {
  Activity,
  ShieldCheck,
  Leaf,
  Clock,
  AlertTriangle,
  TrendingDown,
  Wind,
  CheckCircle,
} from 'lucide-react';

const RISK_WINDOW_CLASSES: Record<string, string> = {
  danger: 'border-rose-500/40 bg-rose-950/20 text-rose-300',
  caution: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
  safe: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
};

export const Pillar1Card: React.FC<{ data: Pillar1LowEmissionRoutines }> = ({ data }) => (
  <div className="rounded-2xl bg-slate-900/80 border border-blue-900/30 p-5 sm:p-6 shadow-xl">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
        <Activity className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Pillar 1</span>
        <h3 className="text-base sm:text-lg font-bold text-white">
          Low-Emission Daily Routines &amp; Commute Optimization
        </h3>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Wind className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
          Recommended Commute Mode &amp; Masking
        </h4>
        <p className="text-sm text-slate-200 leading-relaxed">{data.commuteModeRecommendation}</p>
      </div>

      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
          Departure Timing Strategy
        </h4>
        <p className="text-sm text-slate-200 leading-relaxed">{data.commuteDepartureStrategy}</p>
      </div>
    </div>

    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 mb-4 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
          Diurnal Temperature Inversion Warning
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">{data.inversionWarning}</p>
      </div>
    </div>

    <div>
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        Diurnal Outdoor Activity Windows:
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {data.safeOutdoorTimeWindows.map((tw, idx) => (
          <div
            key={`${tw.window}-${idx}`}
            className={cn('p-3 rounded-xl border', RISK_WINDOW_CLASSES[tw.riskLevel] ?? RISK_WINDOW_CLASSES.safe)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs">{tw.window}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border">
                {tw.riskLevel}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{tw.advice}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const Pillar2Card: React.FC<{ data: Pillar2IndoorAirQuality }> = ({ data }) => (
  <div className="rounded-2xl bg-slate-900/80 border border-emerald-900/30 p-5 sm:p-6 shadow-xl">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Pillar 2</span>
        <h3 className="text-base sm:text-lg font-bold text-white">
          Indoor Air Quality Interventions &amp; Management
        </h3>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
          Air Purifier Operational Schedule
        </h4>
        <div className="space-y-1.5 text-xs text-slate-300">
          <p><strong className="text-white">Active Cycle:</strong> {data.purifierSchedule.recommendedHours}</p>
          <p><strong className="text-white">Mode:</strong> {data.purifierSchedule.operatingMode}</p>
          <p className="text-slate-400 text-[11px] pt-1">{data.purifierSchedule.rationale}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
          Mid-Day Ventilation Protocol
        </h4>
        <div className="space-y-1.5 text-xs text-slate-300">
          <p><strong className="text-white">Optimal Window:</strong> {data.ventilationWindows.optimalWindow}</p>
          <p>{data.ventilationWindows.instructions}</p>
          {data.ventilationWindows.warningNotice && (
            <p className="text-amber-400 text-[11px] font-medium pt-1">
              ⚠️ {data.ventilationWindows.warningNotice}
            </p>
          )}
        </div>
      </div>
    </div>

    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Leaf className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
        Botanical Bio-Filtering &amp; Dust Suppression Protocol
      </h4>
      <ul className="space-y-2 mb-3">
        {data.botanicalAndPhysicalMeasures.map((measure, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{measure}</span>
          </li>
        ))}
      </ul>
      <div className="pt-2 border-t border-slate-800 text-xs text-cyan-300 font-medium flex items-center gap-1.5">
        <span>💡 Dust Suppression Tip:</span>
        <span className="text-slate-300">{data.dustSuppressionTip}</span>
      </div>
    </div>
  </div>
);

export const Pillar3Card: React.FC<{ data: Pillar3SustainableAlternatives }> = ({ data }) => (
  <div className="rounded-2xl bg-slate-900/80 border border-amber-900/30 p-5 sm:p-6 shadow-xl">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
        <TrendingDown className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Pillar 3</span>
        <h3 className="text-base sm:text-lg font-bold text-white">
          Sustainable Alternatives with Explicit &quot;Why &amp; Impact&quot; Justifications
        </h3>
      </div>
    </div>

    <div className="space-y-4">
      {data.recommendations.map((rec, idx) => (
        <div
          key={idx}
          className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold shrink-0">
                {idx + 1}
              </span>
              {rec.action}
            </h4>
          </div>

          <div className="mb-3.5 text-xs text-slate-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <strong className="text-amber-400 block mb-0.5">Scientific Causal Justification:</strong>
            {rec.causalWhy}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Personal Health Impact:
              </div>
              <p className="text-xs text-slate-200">{rec.personalHealthImpact}</p>
            </div>

            <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
                Collective Ecological Impact:
              </div>
              <p className="text-xs text-slate-200">{rec.collectiveEcologicalImpact}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
