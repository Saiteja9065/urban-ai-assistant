import React, { useState } from 'react';
import { StationAqiData } from '@/types/aqi';
import { INDIAN_METRO_STATIONS, METRO_REGIONS, MetroRegion } from '@/lib/aqi-constants';
import {
  MapPin,
  Database,
  Thermometer,
  Droplets,
  Search,
  Navigation,
  Info,
  Building2,
} from 'lucide-react';

interface AqiProvenanceCardProps {
  aqiData: StationAqiData;
  selectedStationId: string;
  onSelectStation: (stationId: string) => void;
  isLoading?: boolean;
}

const SEVERITY_BADGE_CLASSES: Record<string, string> = {
  good: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  moderate: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  poor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  unhealthy: 'bg-red-500/20 text-red-300 border-red-500/40',
  'very poor': 'bg-red-500/20 text-red-300 border-red-500/40',
  severe: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
};

export const AqiProvenanceCard: React.FC<AqiProvenanceCardProps> = ({
  aqiData,
  selectedStationId,
  onSelectStation,
  isLoading,
}) => {
  const { aqi, category, dominantPollutant, pollutants, weather, provenance, station } = aqiData;

  const [searchInput, setSearchInput] = useState('');
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  const currentCityLower = (station.city || '').toLowerCase();
  const activeRegion: MetroRegion =
    METRO_REGIONS.find((r) => r.matchKeys.some((k) => currentCityLower.includes(k))) ||
    METRO_REGIONS[0];

  const citySpecificHotspots = INDIAN_METRO_STATIONS.filter((s) =>
    activeRegion.matchKeys.some((k) => s.city.toLowerCase().includes(k) || s.state.toLowerCase().includes(k))
  );

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsGpsLoading(true);
    setGpsStatus('Accessing device GPS location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const geoQuery = `geo:${latitude.toFixed(4)};${longitude.toFixed(4)}`;
        setGpsStatus(`GPS detected (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E). Locating nearest CPCB station...`);
        setIsGpsLoading(false);
        onSelectStation(geoQuery);
      },
      (error) => {
        setIsGpsLoading(false);
        setGpsStatus(`Location access denied or unavailable: ${error.message}. Please select a city above.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;
    setGpsStatus(`Searching nearest CPCB station for "${query}"...`);
    onSelectStation(query);
  };

  const severityBadgeClass =
    SEVERITY_BADGE_CLASSES[category.label.toLowerCase()] ?? 'bg-rose-900/40 text-rose-200 border-rose-500/60';

  const isCustomOrGps =
    selectedStationId.startsWith('geo:') || !INDIAN_METRO_STATIONS.some((s) => s.id === selectedStationId);

  const metricCards = [
    {
      label: 'PM2.5',
      value: pollutants.pm25 !== undefined ? `${Math.round(pollutants.pm25)} µg/m³` : 'N/A',
      valueClass: 'text-rose-400',
      subtitle: 'Fine respirable',
    },
    {
      label: 'PM10',
      value: pollutants.pm10 !== undefined ? `${Math.round(pollutants.pm10)} µg/m³` : 'N/A',
      valueClass: 'text-amber-400',
      subtitle: 'Coarse dust',
    },
    {
      label: 'Temperature',
      value: weather?.temperature !== undefined ? `${Math.round(weather.temperature * 10) / 10}°C` : 'N/A',
      valueClass: 'text-slate-200',
      subtitle: 'Ambient',
      icon: <Thermometer className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />,
    },
    {
      label: 'Humidity',
      value: weather?.humidity !== undefined ? `${Math.round(weather.humidity)}%` : 'N/A',
      valueClass: 'text-slate-200',
      subtitle: 'Relative',
      icon: <Droplets className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />,
    },
  ];

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 shadow-xl shadow-black/40">
      {/* Top Controls: Location & Search Header */}
      <div className="mb-6 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label
            htmlFor="station-select"
            className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"
          >
            <MapPin className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            Monitoring Station &amp; Location Finder:
          </label>

          <button
            onClick={handleUseMyLocation}
            disabled={isLoading || isGpsLoading}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <Navigation className={`h-3.5 w-3.5 ${isGpsLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
            {isGpsLoading ? 'Locating...' : 'Use My Exact Location (GPS)'}
          </button>
        </div>

        {/* 1. Metro Cities Selector Row */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <Building2 className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            Select Metropolitan Region:
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Metropolitan regions">
            {METRO_REGIONS.map((region) => {
              const isRegionActive = activeRegion.id === region.id;
              return (
                <button
                  key={region.id}
                  type="button"
                  aria-pressed={isRegionActive}
                  onClick={() => onSelectStation(region.defaultStationId)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isRegionActive
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                      : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-700/80'
                  }`}
                >
                  {region.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. City-Specific Monitoring Hotspots */}
        {citySpecificHotspots.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" aria-hidden="true" />
                {activeRegion.name} Monitoring Hotspots:
              </span>
              <span className="text-[10px] text-slate-400">
                {citySpecificHotspots.length} Stations in {activeRegion.name}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={`${activeRegion.name} monitoring hotspots`}>
              {citySpecificHotspots.map((s) => {
                const isSelected = selectedStationId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onSelectStation(s.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 font-bold shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {s.name.split(',')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Search Bar for Custom Cities / Districts */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <label htmlFor="city-search-input" className="sr-only">
              Search any Indian city, neighborhood, or district
            </label>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              id="city-search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search any Indian city, neighborhood or district (e.g. Pune, Jaipur, Lucknow, Dwarka, Noida...)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchInput.trim()}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            Find
          </button>
        </form>

        {/* GPS or Search Status Toast */}
        {gpsStatus && (
          <div
            role="status"
            aria-live="polite"
            className="p-2.5 rounded-lg bg-slate-950/80 border border-cyan-800/40 text-xs text-cyan-300 flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {gpsStatus}
            </span>
            <button
              type="button"
              onClick={() => setGpsStatus(null)}
              aria-label="Dismiss status message"
              className="text-slate-400 hover:text-white text-[11px] ml-2 px-1 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              ✕
            </button>
          </div>
        )}

        {/* Dropdown Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-12">
            <select
              id="station-select"
              aria-label="Select Indian Metropolitan Monitoring Station"
              value={isCustomOrGps ? '' : selectedStationId}
              onChange={(e) => onSelectStation(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {isCustomOrGps && <option value="">Custom Location: {station.name}</option>}
              {INDIAN_METRO_STATIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.city}: {s.name} ({s.state})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Primary AQI Metrics Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 rounded-xl bg-slate-950/60 border border-slate-800 mb-6">
        <div className="md:col-span-5 text-center md:text-left flex flex-col md:flex-row items-center gap-4">
          <div
            className="h-28 w-28 rounded-2xl flex flex-col items-center justify-center border-2 shadow-inner"
            style={{
              backgroundColor: category.bgColor,
              borderColor: category.borderColor,
            }}
          >
            <span className="text-4xl font-extrabold tracking-tight" style={{ color: category.color }}>
              {aqi}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mt-0.5">
              AQI (NAQI)
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${severityBadgeClass}`}>
                {category.label}
              </span>
              <span className="text-xs text-slate-400">
                Primary: <strong className="text-slate-200">{dominantPollutant.toUpperCase()}</strong>
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">{station.name}</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">{category.healthSummary}</p>
          </div>
        </div>

        {/* Detailed Pollutants & Weather Breakdown */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {metricCards.map((metric) => (
            <div key={metric.label} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block">{metric.label}</span>
              <div className={`flex items-center gap-1 text-base font-bold ${metric.valueClass}`}>
                {metric.icon}
                <span>{metric.value}</span>
              </div>
              <span className="text-[10px] text-slate-400 block">{metric.subtitle}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Data Provenance Card (Strict Challenge Guardrail) */}
      <div className="rounded-xl bg-cyan-950/20 border border-cyan-800/40 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-400" aria-hidden="true" />
            <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              Data Provenance &amp; Verification Card
            </h3>
          </div>
          {provenance.isLive ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              Live Ground Station
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-500/30">
              <Info className="h-3 w-3" aria-hidden="true" />
              Verified CPCB Benchmark
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 pt-1">
          <div>
            <span className="text-slate-400 block">Official Station Name:</span>
            <span className="font-medium text-white">{provenance.stationName}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Source &amp; Aggregator:</span>
            <span className="font-medium text-white">{provenance.source}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Verified Observation Time:</span>
            <span suppressHydrationWarning className="font-medium text-white">{provenance.localTimeString}</span>
          </div>
        </div>

        {provenance.fallbackReason && (
          <div className="mt-2.5 pt-2 border-t border-cyan-900/40 text-[11px] text-slate-400 italic">
            Notice: {provenance.fallbackReason}
          </div>
        )}
      </div>
    </div>
  );
};
