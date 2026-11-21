import React from 'react';
import { Wind, ShieldCheck, Activity, MapPin, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
              <Wind className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Urban Air Quality Assistant
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                India Winter Smog Response
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-sm text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Milestone 1 Online
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>PromptWars Challenge 6: GenAI Operational Smog Assistant</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Actionable Smog Intelligence for Indian Metros
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Going beyond passive AQI numbers. Combining real-time CPCB monitoring with persona-driven
            Gemini intelligence to optimize daily commutes, indoor air interventions, and low-emission routines.
          </p>
        </div>

        {/* 3 Mandatory Pillars Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 hover:border-slate-700 transition-all shadow-lg shadow-black/20">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">1. Low-Emission Routines</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Diurnal temperature inversion timing, public transit / metro prioritization, and outdoor exercise rescheduling.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 hover:border-slate-700 transition-all shadow-lg shadow-black/20">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">2. Indoor Air Quality Interventions</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Intelligent air purifier cycles, brief mid-day ventilation windows, botanical filters, and wet-mopping dust suppression.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 hover:border-slate-700 transition-all shadow-lg shadow-black/20">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg text-white mb-2">3. Sustainable Alternatives</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Explicit causal justification quantifying both Personal Health Impact and Collective Ecological Impact.
            </p>
          </div>
        </div>

        {/* Milestone Roadmap Progress */}
        <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white">System Architecture &amp; Delivery Roadmap</h2>
              <p className="text-sm text-slate-400">Milestone execution status following the Master Project Blueprint</p>
            </div>
            <span className="text-xs font-mono px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-md">
              Next.js 15 • TypeScript • Tailwind
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Milestone 1</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">COMPLETE</span>
              </div>
              <h4 className="font-medium text-white text-sm">Next.js 15 Scaffold &amp; Testing</h4>
              <p className="text-xs text-slate-400 mt-1">TypeScript, Tailwind, Vitest, and guardrail scaffolding.</p>
            </div>

            <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Milestone 2</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">NEXT UP</span>
              </div>
              <h4 className="font-medium text-white text-sm">Live AQI Service</h4>
              <p className="text-xs text-slate-400 mt-1">WAQI / CPCB API integration across Indian metropolitan stations.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Milestone 3</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">QUEUED</span>
              </div>
              <h4 className="font-medium text-white text-sm">Gemini GenAI Engine</h4>
              <p className="text-xs text-slate-400 mt-1">Structured JSON schema, persona reasoning, anti-hallucination.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Milestone 4</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">QUEUED</span>
              </div>
              <h4 className="font-medium text-white text-sm">Interactive Dashboard UI</h4>
              <p className="text-xs text-slate-400 mt-1">Evaluator presets, live provenance card, responsive layouts.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Milestone 5</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">QUEUED</span>
              </div>
              <h4 className="font-medium text-white text-sm">Automated Test Suite</h4>
              <p className="text-xs text-slate-400 mt-1">Unit testing for Phase 1 automated scoring rubric.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Milestone 6</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">QUEUED</span>
              </div>
              <h4 className="font-medium text-white text-sm">Deployment &amp; Submission</h4>
              <p className="text-xs text-slate-400 mt-1">Vercel live deployment, demo video, and technical writeup.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
