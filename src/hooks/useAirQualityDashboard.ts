'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { StationAqiData } from '@/types/aqi';
import { PersonaPresetId, UserProfile } from '@/types/persona';
import { AssistantAdvice } from '@/types/assistant';
import { DEFAULT_STATION_DATA } from '@/lib/aqi-constants';
import { DEFAULT_CUSTOM_PERSONA, EVALUATOR_PERSONA_PRESETS } from '@/lib/persona-constants';
import { generateDeterministicAdvice } from '@/lib/gemini-service';

function resolveClientPersona(personaId: PersonaPresetId, custom?: Partial<UserProfile>): UserProfile {
  if (personaId !== 'custom') {
    return EVALUATOR_PERSONA_PRESETS[personaId];
  }
  return {
    ...DEFAULT_CUSTOM_PERSONA,
    ...(custom || {}),
    id: 'custom',
  };
}

/**
 * Manages live station AQI fetching, persona selection, AbortController cancellation,
 * and deterministic offline fallbacks for the main dashboard.
 */
export function useAirQualityDashboard() {
  const [selectedStationId, setSelectedStationId] = useState<string>('delhi-anand-vihar');
  const [aqiData, setAqiData] = useState<StationAqiData>(DEFAULT_STATION_DATA);
  const [hasLoadedInitialAqi, setHasLoadedInitialAqi] = useState<boolean>(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaPresetId>('commuter');
  const [customPersona, setCustomPersona] = useState<Partial<UserProfile> | undefined>();
  const [advice, setAdvice] = useState<AssistantAdvice>(() =>
    generateDeterministicAdvice(DEFAULT_STATION_DATA, EVALUATOR_PERSONA_PRESETS.commuter)
  );
  const [isLoadingAqi, setIsLoadingAqi] = useState<boolean>(false);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const aqiAbortRef = useRef<AbortController | null>(null);
  const adviceAbortRef = useRef<AbortController | null>(null);

  const fetchStationAqi = useCallback(async (stationId: string) => {
    aqiAbortRef.current?.abort();
    const controller = new AbortController();
    aqiAbortRef.current = controller;

    setIsLoadingAqi(true);
    setErrorMessage(null);

    try {
      let url = `/api/aqi?station=${encodeURIComponent(stationId)}`;
      if (stationId.startsWith('geo:')) {
        const coords = stationId.replace('geo:', '').split(';');
        url = `/api/aqi?lat=${encodeURIComponent(coords[0] ?? '')}&lon=${encodeURIComponent(coords[1] ?? '')}`;
      }

      const res = await fetch(url, { signal: controller.signal });
      const json = await res.json();
      if (json.success && json.data) {
        setAqiData(json.data);
      } else {
        throw new Error(json.error || 'Failed to retrieve AQI data');
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.warn('AQI fetch fallback triggered:', err);
      setErrorMessage('Live AQI service temporarily unreachable; displaying verified CPCB benchmark data.');
    } finally {
      if (aqiAbortRef.current === controller) {
        setIsLoadingAqi(false);
        setHasLoadedInitialAqi(true);
      }
    }
  }, []);

  const fetchAdvice = useCallback(
    async (currentAqi: StationAqiData, personaId: PersonaPresetId, custom?: Partial<UserProfile>) => {
      adviceAbortRef.current?.abort();
      const controller = new AbortController();
      adviceAbortRef.current = controller;

      setIsLoadingAi(true);
      try {
        const res = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
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
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.warn('Assistant fetch fallback triggered:', err);
        setAdvice(generateDeterministicAdvice(currentAqi, resolveClientPersona(personaId, custom)));
      } finally {
        if (adviceAbortRef.current === controller) {
          setIsLoadingAi(false);
        }
      }
    },
    []
  );

  const handleSelectStation = useCallback((stationId: string) => {
    setSelectedStationId(stationId);
  }, []);

  const handleSelectPersona = useCallback(
    (personaId: PersonaPresetId, customData?: Partial<UserProfile>) => {
      setSelectedPersonaId(personaId);
      if (customData !== undefined) {
        setCustomPersona(customData);
      }
    },
    []
  );

  const handleRefresh = useCallback(() => {
    fetchStationAqi(selectedStationId);
  }, [fetchStationAqi, selectedStationId]);

  useEffect(() => {
    fetchStationAqi(selectedStationId);
    return () => {
      aqiAbortRef.current?.abort();
    };
  }, [fetchStationAqi, selectedStationId]);

  useEffect(() => {
    if (!hasLoadedInitialAqi) return;
    fetchAdvice(aqiData, selectedPersonaId, customPersona);
    return () => {
      adviceAbortRef.current?.abort();
    };
  }, [hasLoadedInitialAqi, aqiData, selectedPersonaId, customPersona, fetchAdvice]);

  return {
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
  };
}
