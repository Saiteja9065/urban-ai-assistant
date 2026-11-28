import React from 'react';
import { StationAqiData } from '@/types/aqi';
import { cn } from '@/lib/cn';
import { Thermometer, Droplets } from 'lucide-react';
import { StationSelectorControls } from './StationSelectorControls';
import { ProvenanceFooter } from './ProvenanceFooter';

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

  const severityBadgeClass =
    SEVERITY_BADGE_CLASSES[category.label.toLowerCase()] ??
    'bg-rose-900/40 text-rose-200 border-rose-500/60';

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
      value:
        weather?.temperature !== undefined
          ? `${Math.round(weather.temperature * 10) / 10}°C`
          : 'N/A',
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
      <StationSelectorControls
        station={station}
        selectedStationId={selectedStationId}
        onSelectStation={onSelectStation}
        isLoading={isLoading}
      />

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
              <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold border', severityBadgeClass)}>
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

        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {metricCards.map((metric) => (
            <div key={metric.label} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block">{metric.label}</span>
              <div className={cn('flex items-center gap-1 text-base font-bold', metric.valueClass)}>
                {metric.icon}
                <span>{metric.value}</span>
              </div>
              <span className="text-[10px] text-slate-400 block">{metric.subtitle}</span>
            </div>
          ))}
        </div>
      </div>

      <ProvenanceFooter provenance={provenance} />
    </div>
  );
};
