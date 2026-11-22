import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '@/components/Header';
import { AqiProvenanceCard } from '@/components/AqiProvenanceCard';
import { PersonaSelector } from '@/components/PersonaSelector';
import { AssistantAdvicePanel } from '@/components/AssistantAdvicePanel';
import { DEFAULT_STATION_DATA } from '@/lib/aqi-constants';
import { EVALUATOR_PERSONA_PRESETS } from '@/lib/persona-constants';
import { generateDeterministicAdvice } from '@/lib/gemini-service';

describe('Dashboard UI Components (Milestone 4)', () => {
  describe('Header Component', () => {
    it('renders app branding and trigger refresh callback', () => {
      const handleRefresh = vi.fn();
      render(<Header onRefresh={handleRefresh} />);

      expect(screen.getByText(/Urban Air Quality Assistant/i)).toBeInTheDocument();
      const refreshBtn = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshBtn);
      expect(handleRefresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('AqiProvenanceCard Component', () => {
    it('displays verified AQI metrics and mandatory data provenance information', () => {
      const handleSelectStation = vi.fn();
      render(
        <AqiProvenanceCard
          aqiData={DEFAULT_STATION_DATA}
          selectedStationId="delhi-anand-vihar"
          onSelectStation={handleSelectStation}
        />
      );

      // AQI score and label
      expect(screen.getByText('388')).toBeInTheDocument();
      expect(screen.getByText(/Severe/i)).toBeInTheDocument();

      // Station and Pollutant details
      expect(screen.getAllByText(/Anand Vihar, Delhi/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/342 µg\/m³/i)).toBeInTheDocument(); // PM2.5

      // Mandatory Provenance Card
      expect(screen.getByText(/Data Provenance & Verification Card/i)).toBeInTheDocument();
      expect(screen.getByText(/CPCB \/ DPCC Monitoring Station/i)).toBeInTheDocument();
    });

    it('triggers station change when dropdown selection changes', () => {
      const handleSelectStation = vi.fn();
      render(
        <AqiProvenanceCard
          aqiData={DEFAULT_STATION_DATA}
          selectedStationId="delhi-anand-vihar"
          onSelectStation={handleSelectStation}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'mumbai-bkc' } });
      expect(handleSelectStation).toHaveBeenCalledWith('mumbai-bkc');
    });

    it('supports searching a custom city or neighborhood', () => {
      const handleSelectStation = vi.fn();
      render(
        <AqiProvenanceCard
          aqiData={DEFAULT_STATION_DATA}
          selectedStationId="delhi-anand-vihar"
          onSelectStation={handleSelectStation}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search any Indian city/i);
      fireEvent.change(searchInput, { target: { value: 'Pune' } });
      const findBtn = screen.getByRole('button', { name: /find/i });
      fireEvent.click(findBtn);

      expect(handleSelectStation).toHaveBeenCalledWith('Pune');
    });

    it('renders the GPS location detection button', () => {
      const handleSelectStation = vi.fn();
      render(
        <AqiProvenanceCard
          aqiData={DEFAULT_STATION_DATA}
          selectedStationId="delhi-anand-vihar"
          onSelectStation={handleSelectStation}
        />
      );

      expect(screen.getByRole('button', { name: /Use My Exact Location/i })).toBeInTheDocument();
    });
  });

  describe('PersonaSelector Component', () => {
    it('renders all 4 evaluator presets', () => {
      const handleSelectPersona = vi.fn();
      render(
        <PersonaSelector
          selectedPersonaId="commuter"
          onSelectPersona={handleSelectPersona}
        />
      );

      expect(screen.getAllByText(/Daily Office Commuter/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Parent of a Toddler/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Senior Citizen with Asthma/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Student \/ School Athlete/i).length).toBeGreaterThan(0);
    });

    it('calls onSelectPersona when a preset card is clicked', () => {
      const handleSelectPersona = vi.fn();
      render(
        <PersonaSelector
          selectedPersonaId="commuter"
          onSelectPersona={handleSelectPersona}
        />
      );

      const seniorCard = screen.getAllByText(/Senior Citizen with Asthma/i)[0];
      fireEvent.click(seniorCard);
      expect(handleSelectPersona).toHaveBeenCalledWith('senior');
    });
  });

  describe('AssistantAdvicePanel Component', () => {
    it('renders all 3 Mandatory Pillars and dual-impact justifications', () => {
      const advice = generateDeterministicAdvice(DEFAULT_STATION_DATA, EVALUATOR_PERSONA_PRESETS.commuter);
      render(<AssistantAdvicePanel advice={advice} />);

      // Pillar 1
      expect(screen.getByText(/Low-Emission Daily Routines & Commute Optimization/i)).toBeInTheDocument();
      expect(screen.getByText(/Diurnal Temperature Inversion Warning/i)).toBeInTheDocument();

      // Pillar 2
      expect(screen.getByText(/Indoor Air Quality Interventions & Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Air Purifier Operational Schedule/i)).toBeInTheDocument();

      // Pillar 3
      expect(screen.getByText(/Sustainable Alternatives with Explicit "Why & Impact" Justifications/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Personal Health Impact:/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Collective Ecological Impact:/i).length).toBeGreaterThan(0);
    });
  });
});
