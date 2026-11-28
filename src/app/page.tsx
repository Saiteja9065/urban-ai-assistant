'use client';

import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { AqiProvenanceCard } from '@/components/AqiProvenanceCard';
import { PersonaSelector } from '@/components/PersonaSelector';
import { AssistantAdvicePanel } from '@/components/AssistantAdvicePanel';
import { useAirQualityDashboard } from '@/hooks/useAirQualityDashboard';

export default function Home() {
  const {
    selectedStationId,
    aqiData,
    selectedPersonaId,
    advice,
    isLoadingAqi,
    isLoadingAi,
    errorMessage,
    handleSelectStation,
    handleSelectPersona,
    handleRefresh,
  } = useAirQualityDashboard();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Header onRefresh={handleRefresh} isLoading={isLoadingAqi} isAiLoading={isLoadingAi} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border border-cyan-800/50 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-semibold mb-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
                PromptWars Virtual Challenge 6 Prototype
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Urban Air Quality Assistant &amp; Smog Navigation System
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Combining real-time CPCB monitoring stations with demographic personas. Generating
                contextual low-emission commute routes, indoor air quality schedules, and sustainable
                alternatives with explicit health and ecological justifications.
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
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 flex items-center gap-3 text-rose-200 text-xs"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        <section aria-label="Live Air Quality Station">
          <AqiProvenanceCard
            aqiData={aqiData}
            selectedStationId={selectedStationId}
            onSelectStation={handleSelectStation}
            isLoading={isLoadingAqi}
          />
        </section>

        <section aria-label="Evaluator Personas">
          <PersonaSelector
            selectedPersonaId={selectedPersonaId}
            onSelectPersona={handleSelectPersona}
            isLoading={isLoadingAi}
          />
        </section>

        <section aria-label="Operational Advice Panel">
          <AssistantAdvicePanel advice={advice} isLoading={isLoadingAi} />
        </section>
      </div>
    </main>
  );
}
