import React, { useState } from 'react';
import { UserProfile } from '@/types/persona';

interface CustomPersonaFormProps {
  isLoading?: boolean;
  onSubmitCustomPersona: (customData: Partial<UserProfile>) => void;
}

export const CustomPersonaForm: React.FC<CustomPersonaFormProps> = ({
  isLoading,
  onSubmitCustomPersona,
}) => {
  const [customName, setCustomName] = useState('Sunil Kumar');
  const [customRole, setCustomRole] = useState('Delivery Driver / Cyclist');
  const [customAge, setCustomAge] = useState(27);
  const [customRoutine, setCustomRoutine] = useState('8-10 hours outdoor road travel in Delhi NCR');
  const [customConditions, setCustomConditions] = useState('Mild allergic rhinitis');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitCustomPersona({
      name: customName.trim() || 'Custom Citizen',
      role: customRole.trim() || 'Urban Resident',
      age: Number.isFinite(customAge) ? Math.min(120, Math.max(1, Math.round(customAge))) : 35,
      routine: customRoutine.trim() || 'Standard urban daily routine',
      healthConditions: customConditions.trim() ? [customConditions.trim()] : ['Healthy'],
      locationContext: 'Indian Metropolitan City',
      sensitivityLevel: 'high',
    });
  };

  return (
    <form
      id="custom-persona-form"
      onSubmit={handleSubmit}
      className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-cyan-800/40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5"
    >
      <div>
        <label htmlFor="custom-persona-name" className="text-xs text-slate-400 block mb-1">
          Full Name
        </label>
        <input
          id="custom-persona-name"
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          placeholder="e.g. Ramesh"
        />
      </div>

      <div>
        <label htmlFor="custom-persona-role" className="text-xs text-slate-400 block mb-1">
          Role / Occupation
        </label>
        <input
          id="custom-persona-role"
          type="text"
          value={customRole}
          onChange={(e) => setCustomRole(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          placeholder="e.g. Delivery Driver"
        />
      </div>

      <div>
        <label htmlFor="custom-persona-age" className="text-xs text-slate-400 block mb-1">
          Age
        </label>
        <input
          id="custom-persona-age"
          type="number"
          min={1}
          max={120}
          value={customAge}
          onChange={(e) => setCustomAge(Number(e.target.value))}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="custom-persona-routine" className="text-xs text-slate-400 block mb-1">
          Daily Schedule &amp; Commute
        </label>
        <input
          id="custom-persona-routine"
          type="text"
          value={customRoutine}
          onChange={(e) => setCustomRoutine(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          placeholder="e.g. Commutes by two-wheeler 25 km daily"
        />
      </div>

      <div>
        <label htmlFor="custom-persona-conditions" className="text-xs text-slate-400 block mb-1">
          Health Vulnerabilities
        </label>
        <input
          id="custom-persona-conditions"
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
          className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-cyan-400 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          Apply Custom Persona &amp; Generate Guidance
        </button>
      </div>
    </form>
  );
};
