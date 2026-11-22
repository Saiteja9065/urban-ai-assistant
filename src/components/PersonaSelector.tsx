import React, { useState } from 'react';
import { PersonaPresetId, UserProfile } from '@/types/persona';
import { EVALUATOR_PERSONA_PRESETS } from '@/lib/persona-constants';
import {
  Briefcase,
  Baby,
  HeartPulse,
  Trophy,
  Sliders,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface PersonaSelectorProps {
  selectedPersonaId: PersonaPresetId;
  onSelectPersona: (personaId: PersonaPresetId, customData?: Partial<UserProfile>) => void;
  isLoading?: boolean;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  selectedPersonaId,
  onSelectPersona,
  isLoading,
}) => {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('Sunil Kumar');
  const [customRole, setCustomRole] = useState('Delivery Driver / Cyclist');
  const [customAge, setCustomAge] = useState(27);
  const [customRoutine, setCustomRoutine] = useState('8-10 hours outdoor road travel in Delhi NCR');
  const [customConditions, setCustomConditions] = useState('Mild allergic rhinitis');

  const presets = [
    {
      id: 'commuter' as PersonaPresetId,
      data: EVALUATOR_PERSONA_PRESETS.commuter,
      icon: Briefcase,
      badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    },
    {
      id: 'parent' as PersonaPresetId,
      data: EVALUATOR_PERSONA_PRESETS.parent,
      icon: Baby,
      badgeColor: 'border-pink-500/30 bg-pink-500/10 text-pink-400',
    },
    {
      id: 'senior' as PersonaPresetId,
      data: EVALUATOR_PERSONA_PRESETS.senior,
      icon: HeartPulse,
      badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    },
    {
      id: 'athlete' as PersonaPresetId,
      data: EVALUATOR_PERSONA_PRESETS.athlete,
      icon: Trophy,
      badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectPersona('custom', {
      name: customName,
      role: customRole,
      age: Number(customAge),
      routine: customRoutine,
      healthConditions: [customConditions],
      locationContext: 'Indian Metropolitan City',
      sensitivityLevel: 'high',
    });
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 shadow-xl shadow-black/40">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            Persona-Driven Personalization &amp; Evaluator Presets
          </h3>
          <p className="text-xs text-slate-400">
            One-click evaluator presets testing distinct physiological vulnerabilities and commute needs
          </p>
        </div>

        <button
          onClick={() => {
            setShowCustomForm(!showCustomForm);
            if (!showCustomForm) onSelectPersona('custom');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
            selectedPersonaId === 'custom'
              ? 'bg-cyan-500 text-slate-950 font-semibold'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          {showCustomForm ? 'Close Custom Form' : 'Custom Persona Input'}
        </button>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {presets.map(({ id, data, icon: Icon, badgeColor }) => {
          const isSelected = selectedPersonaId === id;
          return (
            <button
              key={id}
              onClick={() => onSelectPersona(id)}
              disabled={isLoading}
              className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 text-cyan-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                    Age {data.age}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white">{data.role}</h4>
                <p className="text-xs text-cyan-300 font-medium mb-1.5">{data.name}</p>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {data.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Vulnerability:</span>
                <span className="font-semibold uppercase tracking-wider text-slate-300">
                  {data.sensitivityLevel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Persona Drawer Form */}
      {showCustomForm && (
        <form
          onSubmit={handleCustomSubmit}
          className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-cyan-800/40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5"
        >
          <div>
            <label className="text-xs text-slate-400 block mb-1">Full Name</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="e.g. Ramesh"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Role / Occupation</label>
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="e.g. Delivery Driver"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Age</label>
            <input
              type="number"
              value={customAge}
              onChange={(e) => setCustomAge(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-slate-400 block mb-1">Daily Schedule &amp; Commute</label>
            <input
              type="text"
              value={customRoutine}
              onChange={(e) => setCustomRoutine(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="e.g. Commutes by two-wheeler 25 km daily"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Health Vulnerabilities</label>
            <input
              type="text"
              value={customConditions}
              onChange={(e) => setCustomConditions(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="e.g. Asthma, allergies"
            />
          </div>

          <div className="sm:col-span-2 md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-cyan-400 transition-colors"
            >
              Apply Custom Persona &amp; Generate Guidance
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
