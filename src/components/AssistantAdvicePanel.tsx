import React, { useState } from 'react';
import { AssistantAdvice } from '@/types/assistant';
import { cn } from '@/lib/cn';
import { Sparkles, Cpu } from 'lucide-react';
import { Pillar1Card, Pillar2Card, Pillar3Card } from './PillarCards';

interface AssistantAdvicePanelProps {
  advice: AssistantAdvice;
  isLoading?: boolean;
}

type PillarTab = 'all' | 'pillar1' | 'pillar2' | 'pillar3';

const THREAT_BADGE_CLASSES: Record<string, string> = {
  low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  moderate: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  severe: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

const PILLAR_TABS: Array<{ id: PillarTab; label: string; activeClass: string }> = [
  { id: 'all', label: 'All 3 Pillars', activeClass: 'bg-cyan-500 text-slate-950' },
  { id: 'pillar1', label: 'Pillar 1: Low-Emission & Commute', activeClass: 'bg-blue-500 text-slate-950' },
  { id: 'pillar2', label: 'Pillar 2: Indoor Air Interventions', activeClass: 'bg-emerald-500 text-slate-950' },
  { id: 'pillar3', label: 'Pillar 3: Sustainable Alternatives & Impact', activeClass: 'bg-amber-500 text-slate-950' },
];

export const AssistantAdvicePanel: React.FC<AssistantAdvicePanelProps> = ({ advice, isLoading }) => {
  const [activeTab, setActiveTab] = useState<PillarTab>('all');

  const {
    summary,
    threatLevel,
    pillar1_lowEmissionRoutines,
    pillar2_indoorAirQuality,
    pillar3_sustainableAlternatives,
    metadata,
  } = advice;

  const threatBadgeClass =
    THREAT_BADGE_CLASSES[threatLevel.toLowerCase()] ??
    'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse';

  return (
    <div
      className={cn('space-y-6 transition-opacity', isLoading ? 'opacity-75' : 'opacity-100')}
      aria-busy={Boolean(isLoading)}
    >
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              GenAI Operational Guidance &amp; Smog Action Plan
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider',
                threatBadgeClass
              )}
            >
              Threat Level: {threatLevel}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
              {metadata.modelUsed}
            </span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 mb-4">
          {summary}
        </p>

        <div
          role="tablist"
          aria-label="Operational guidance pillars"
          className="flex flex-wrap gap-2 pt-2 border-t border-slate-800"
        >
          {PILLAR_TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500',
                  isSelected ? tab.activeClass : 'bg-slate-800/70 text-slate-300 hover:text-white'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {(activeTab === 'all' || activeTab === 'pillar1') && (
          <Pillar1Card data={pillar1_lowEmissionRoutines} />
        )}
        {(activeTab === 'all' || activeTab === 'pillar2') && (
          <Pillar2Card data={pillar2_indoorAirQuality} />
        )}
        {(activeTab === 'all' || activeTab === 'pillar3') && (
          <Pillar3Card data={pillar3_sustainableAlternatives} />
        )}
      </div>
    </div>
  );
};
