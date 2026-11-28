import React, { useState } from 'react';
import { PersonaPresetId, UserProfile } from '@/types/persona';
import { EVALUATOR_PERSONA_PRESETS } from '@/lib/persona-constants';
import { cn } from '@/lib/cn';
import {
  Briefcase,
  Baby,
  HeartPulse,
  Trophy,
  Sliders,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { CustomPersonaForm } from './CustomPersonaForm';

interface PersonaSelectorProps {
  selectedPersonaId: PersonaPresetId;
  onSelectPersona: (personaId: PersonaPresetId, customData?: Partial<UserProfile>) => void;
  isLoading?: boolean;
}

const PRESET_CARDS = [
  {
    id: 'commuter' as const,
    data: EVALUATOR_PERSONA_PRESETS.commuter,
    icon: Briefcase,
    badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    ageBracket: 'Age 25–30',
  },
  {
    id: 'parent' as const,
    data: EVALUATOR_PERSONA_PRESETS.parent,
    icon: Baby,
    badgeColor: 'border-pink-500/30 bg-pink-500/10 text-pink-400',
    ageBracket: 'Age 28–40',
  },
  {
    id: 'senior' as const,
    data: EVALUATOR_PERSONA_PRESETS.senior,
    icon: HeartPulse,
    badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    ageBracket: 'Age 65+',
  },
  {
    id: 'athlete' as const,
    data: EVALUATOR_PERSONA_PRESETS.athlete,
    icon: Trophy,
    badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    ageBracket: 'Age 14–18',
  },
];

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  selectedPersonaId,
  onSelectPersona,
  isLoading,
}) => {
  const [showCustomForm, setShowCustomForm] = useState(false);

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 shadow-xl shadow-black/40">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" aria-hidden="true" />
            Persona-Driven Personalization &amp; Evaluator Presets
          </h2>
          <p className="text-xs text-slate-400">
            One-click evaluator presets testing distinct physiological vulnerabilities and commute needs
          </p>
        </div>

        <button
          type="button"
          aria-expanded={showCustomForm}
          aria-controls="custom-persona-form"
          onClick={() => {
            const nextOpen = !showCustomForm;
            setShowCustomForm(nextOpen);
            if (nextOpen) onSelectPersona('custom');
          }}
          className={cn(
            'px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500',
            selectedPersonaId === 'custom'
              ? 'bg-cyan-500 text-slate-950 font-semibold'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          )}
        >
          <Sliders className="h-3.5 w-3.5" aria-hidden="true" />
          {showCustomForm ? 'Close Custom Form' : 'Custom Persona Input'}
        </button>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
        role="group"
        aria-label="Persona presets"
      >
        {PRESET_CARDS.map(({ id, data, icon: Icon, badgeColor, ageBracket }) => {
          const isSelected = selectedPersonaId === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectPersona(id)}
              disabled={isLoading}
              className={cn(
                'p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-cyan-500',
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 text-cyan-400" aria-hidden="true">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border', badgeColor)}>
                    {ageBracket}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white">{data.role}</h3>
                <p className="text-xs text-cyan-300/90 font-medium mb-1.5">{data.locationContext}</p>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {data.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Vulnerability:</span>
                <span className="font-semibold uppercase tracking-wider text-slate-300">
                  {data.sensitivityLevel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {showCustomForm && (
        <CustomPersonaForm
          isLoading={isLoading}
          onSubmitCustomPersona={(customData) => onSelectPersona('custom', customData)}
        />
      )}
    </div>
  );
};
