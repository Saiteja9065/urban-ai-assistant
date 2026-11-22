'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { AqiProvenanceCard } from '@/components/AqiProvenanceCard';
import { PersonaSelector } from '@/components/PersonaSelector';
import { AssistantAdvicePanel } from '@/components/AssistantAdvicePanel';
import { StationAqiData } from '@/types/aqi';
import { PersonaPresetId, UserProfile } from '@/types/persona';
import { AssistantAdvice } from '@/types/assistant';
import { DEFAULT_STATION_DATA } from '@/lib/aqi-constants';
import { EVALUATOR_PERSONA_PRESETS } from '@/lib/persona-constants';
import { generateDeterministicAdvice } from '@/lib/gemini-service';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [selectedStationId, setSelectedStationId] = useState<string>('delhi-anand-vihar');
  const [aqiData, setAqiData] = useState<StationAqiData>(DEFAULT_STATION_DATA);
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaPresetId>('commuter');
  const [customPersona, setCustomPersona] = useState<Partial<UserProfile> | undefined>();
  const [advice, setAdvice] = useState<AssistantAdvice>(
    generateDeterministicAdvice(DEFAULT_STATION_DATA, EVALUATOR_PERSONA_PRESETS.commuter)
  );
  const [isLoadingAqi, setIsLoadingAqi] = useState<boolean>(false);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch AQI data for the selected station
  const fetchStationAqi = useCallback(async (stationId: string) => {
    setIsLoadingAqi(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/aqi?station=${encodeURIComponent(stationId)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setAqiData(json.data);
      } else {
        throw new Error(json.error || 'Failed to retrieve AQI data');
      }
    } catch (err: unknown) {
      console.warn('AQI fetch fallback triggered:', err);
    } finally {
      setIsLoadingAqi(false);
    }
  }, []);

  // Fetch AI guidance from /api/assistant
  const fetchAdvice = useCallback(
    async (currentAqi: StationAqiData, personaId: PersonaPresetId, custom?: Partial<UserProfile>) => {
      setIsLoadingAi(true);
      try {
        const res = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stationQuery: currentAqi.station.id,
            aqiData: currentAqi,
            personaId,
            customPersona: custom,
          }),
        });

        const json = await res.json();
        if (json.success && json.data) {
          setAdvice(json.data);
        } else {
          throw new Error(json.error || 'Assistant API failure');
        }
      } catch (err: unknown) {
        console.warn('Assistant fetch fallback triggered:', err);
        const resolvedPersona =
          personaId !== 'custom'
            ? EVALUATOR_PERSONA_PRESETS[personaId as Exclude<PersonaPresetId, 'custom'>]
            : ({ ...EVALUATOR_PERSONA_PRESETS.commuter, ...(custom || {}), id: 'custom' } as UserProfile);
        setAdvice(generateDeterministicAdvice(currentAqi, resolvedPersona));
      } finally {
        setIsLoadingAi(false);
      }
    },
    []
  );

  // Station selection handler
  const handleSelectStation = (stationId: string) => {
    setSelectedStationId(stationId);
    fetchStationAqi(stationId);
  };

  // Persona selection handler
  const handleSelectPersona = (personaId: PersonaPresetId, customData?: Partial<UserProfile>) => {
    setSelectedPersonaId(personaId);
    if (customData) setCustomPersona(customData);
    fetchAdvice(aqiData, personaId, customData || customPersona);
  };

  // Refresh all data
  const handleRefresh = () => {
    fetchStationAqi(selectedStationId);
  };

  // Initial load
  useEffect(() => {
    fetchStationAqi(selectedStationId);
  }, [fetchStationAqi, selectedStationId]);

  // When aqiData changes, refresh advice
  useEffect(() => {
    fetchAdvice(aqiData, selectedPersonaId, customPersona);
  }, [aqiData, selectedPersonaId, customPersona, fetchAdvice]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Header
        onRefresh={handleRefresh}
        isLoading={isLoadingAqi}
        isAiLoading={isLoadingAi}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Evaluator Quick Overview Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border border-cyan-800/50 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-semibold mb-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                PromptWars Virtual Challenge 6 Prototype
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Urban Air Quality Assistant &amp; Smog Navigation System
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Combining real-time CPCB monitoring stations with demographic personas. Generating
                contextual low-emission commute routes, indoor air quality schedules, and sustainable alternatives with explicit health and ecological justifications.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono px-3 py-1 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg">
                Milestone 4 Online
              </span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 flex items-center gap-3 text-rose-200 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Real-Time Station AQI & Provenance Section */}
        <section aria-label="Live Air Quality Station">
          <AqiProvenanceCard
            aqiData={aqiData}
            selectedStationId={selectedStationId}
            onSelectStation={handleSelectStation}
            isLoading={isLoadingAqi}
          />
        </section>

        {/* 2. Evaluator Persona Presets Section */}
        <section aria-label="Evaluator Personas">
          <PersonaSelector
            selectedPersonaId={selectedPersonaId}
            onSelectPersona={handleSelectPersona}
            isLoading={isLoadingAi}
          />
        </section>

        {/* 3. Assistant Operational Advice Panel (3 Pillars) */}
        <section aria-label="Operational Advice Panel">
          <AssistantAdvicePanel
            advice={advice}
            isLoading={isLoadingAi}
          />
        </section>
      </div>
    </main>
  );
}
