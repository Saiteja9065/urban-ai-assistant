import React, { useState } from 'react';
import { AssistantAdvice } from '@/types/assistant';
import {
  Activity,
  ShieldCheck,
  Leaf,
  Clock,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  Wind,
  CheckCircle,
  Cpu,
  Layers,
} from 'lucide-react';

interface AssistantAdvicePanelProps {
  advice: AssistantAdvice;
  isLoading?: boolean;
}

export const AssistantAdvicePanel: React.FC<AssistantAdvicePanelProps> = ({ advice, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pillar1' | 'pillar2' | 'pillar3'>('all');

  const {
    summary,
    threatLevel,
    pillar1_lowEmissionRoutines,
    pillar2_indoorAirQuality,
    pillar3_sustainableAlternatives,
    metadata,
    personaProfile,
  } = advice;

  const getThreatBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'moderate':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'severe':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse';
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary Card with Threat Level & Model Provenance */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              GenAI Operational Guidance &amp; Smog Action Plan
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getThreatBadge(threatLevel)}`}>
              Threat Level: {threatLevel}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              {metadata.modelUsed}
            </span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 mb-4">
          {summary}
        </p>

        {/* Tab Filters for 3 Pillars */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            All 3 Pillars
          </button>
          <button
            onClick={() => setActiveTab('pillar1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pillar1'
                ? 'bg-blue-500 text-slate-950'
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            Pillar 1: Low-Emission &amp; Commute
          </button>
          <button
            onClick={() => setActiveTab('pillar2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pillar2'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            Pillar 2: Indoor Air Interventions
          </button>
          <button
            onClick={() => setActiveTab('pillar3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pillar3'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800/70 text-slate-400 hover:text-white'
            }`}
          >
            Pillar 3: Sustainable Alternatives &amp; Impact
          </button>
        </div>
      </div>

      {/* Grid of the 3 Pillars */}
      <div className="space-y-6">
        {/* PILLAR 1: Low-Emission Daily Routines & Commute Optimization */}
        {(activeTab === 'all' || activeTab === 'pillar1') && (
          <div className="rounded-2xl bg-slate-900/80 border border-blue-900/30 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Pillar 1</span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Low-Emission Daily Routines &amp; Commute Optimization
                </h3>
              </div>
            </div>

            {/* Commute Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Wind className="h-3.5 w-3.5 text-blue-400" />
                  Recommended Commute Mode &amp; Masking
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {pillar1_lowEmissionRoutines.commuteModeRecommendation}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                  Departure Timing Strategy
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {pillar1_lowEmissionRoutines.commuteDepartureStrategy}
                </p>
              </div>
            </div>

            {/* Inversion Warning Banner */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 mb-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                  Diurnal Temperature Inversion Warning
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {pillar1_lowEmissionRoutines.inversionWarning}
                </p>
              </div>
            </div>

            {/* Safe Diurnal Time Windows */}
            <div>
              <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Diurnal Outdoor Activity Windows:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {pillar1_lowEmissionRoutines.safeOutdoorTimeWindows.map((tw, idx) => {
                  const riskColor =
                    tw.riskLevel === 'danger'
                      ? 'border-rose-500/40 bg-rose-950/20 text-rose-300'
                      : tw.riskLevel === 'caution'
                      ? 'border-amber-500/40 bg-amber-950/20 text-amber-300'
                      : 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300';
                  return (
                    <div key={idx} className={`p-3 rounded-xl border ${riskColor}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">{tw.window}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border">
                          {tw.riskLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{tw.advice}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PILLAR 2: Indoor Air Quality Interventions & Management */}
        {(activeTab === 'all' || activeTab === 'pillar2') && (
          <div className="rounded-2xl bg-slate-900/80 border border-emerald-900/30 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Pillar 2</span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Indoor Air Quality Interventions &amp; Management
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Purifier Operating Schedule */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  Air Purifier Operational Schedule
                </h4>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p><strong className="text-white">Active Cycle:</strong> {pillar2_indoorAirQuality.purifierSchedule.recommendedHours}</p>
                  <p><strong className="text-white">Mode:</strong> {pillar2_indoorAirQuality.purifierSchedule.operatingMode}</p>
                  <p className="text-slate-400 text-[11px] pt-1">{pillar2_indoorAirQuality.purifierSchedule.rationale}</p>
                </div>
              </div>

              {/* Window Ventilation Protocol */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  Mid-Day Ventilation Protocol
                </h4>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p><strong className="text-white">Optimal Window:</strong> {pillar2_indoorAirQuality.ventilationWindows.optimalWindow}</p>
                  <p>{pillar2_indoorAirQuality.ventilationWindows.instructions}</p>
                  {pillar2_indoorAirQuality.ventilationWindows.warningNotice && (
                    <p className="text-amber-400 text-[11px] font-medium pt-1">
                      ⚠️ {pillar2_indoorAirQuality.ventilationWindows.warningNotice}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Botanical Filtering & Wet Mopping */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Leaf className="h-3.5 w-3.5 text-emerald-400" />
                Botanical Bio-Filtering &amp; Dust Suppression Protocol
              </h4>
              <ul className="space-y-2 mb-3">
                {pillar2_indoorAirQuality.botanicalAndPhysicalMeasures.map((measure, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{measure}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-slate-800 text-xs text-cyan-300 font-medium flex items-center gap-1.5">
                <span>💡 Dust Suppression Tip:</span>
                <span className="text-slate-300">{pillar2_indoorAirQuality.dustSuppressionTip}</span>
              </div>
            </div>
          </div>
        )}

        {/* PILLAR 3: Sustainable Alternatives with Dual-Impact Justifications */}
        {(activeTab === 'all' || activeTab === 'pillar3') && (
          <div className="rounded-2xl bg-slate-900/80 border border-amber-900/30 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Pillar 3</span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Sustainable Alternatives with Explicit &quot;Why &amp; Impact&quot; Justifications
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {pillar3_sustainableAlternatives.recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                        {idx + 1}
                      </span>
                      {rec.action}
                    </h4>
                  </div>

                  {/* Explicit Causal Why */}
                  <div className="mb-3.5 text-xs text-slate-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                    <strong className="text-amber-400 block mb-0.5">Scientific Causal Justification:</strong>
                    {rec.causalWhy}
                  </div>

                  {/* Dual Impact Quantification */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Personal Health Impact:
                      </div>
                      <p className="text-xs text-slate-200">{rec.personalHealthImpact}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
                        <Leaf className="h-3.5 w-3.5" />
                        Collective Ecological Impact:
                      </div>
                      <p className="text-xs text-slate-200">{rec.collectiveEcologicalImpact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
