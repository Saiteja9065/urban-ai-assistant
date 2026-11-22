import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getAqiCategory,
  INDIAN_METRO_STATIONS,
  BENCHMARK_STATION_FALLBACKS,
} from '@/lib/aqi-constants';
import {
  findStationMetadata,
  parseWaqiResponse,
  getFallbackData,
  getLiveAqi,
} from '@/lib/waqi-service';

describe('AQI Service & Constants (Milestone 2)', () => {
  describe('AQI Categorization', () => {
    it('correctly maps NAQI scale breakpoints', () => {
      expect(getAqiCategory(30).category).toBe('good');
      expect(getAqiCategory(50).category).toBe('good');
      expect(getAqiCategory(75).category).toBe('moderate');
      expect(getAqiCategory(100).category).toBe('moderate');
      expect(getAqiCategory(150).category).toBe('poor');
      expect(getAqiCategory(200).category).toBe('poor');
      expect(getAqiCategory(250).category).toBe('unhealthy');
      expect(getAqiCategory(300).category).toBe('unhealthy');
      expect(getAqiCategory(380).category).toBe('severe');
      expect(getAqiCategory(400).category).toBe('severe');
      expect(getAqiCategory(450).category).toBe('hazardous');
      expect(getAqiCategory(550).category).toBe('hazardous');
    });
  });

  describe('Indian Metropolitan Presets', () => {
    it('contains major metropolitan smog centers', () => {
      const cities = INDIAN_METRO_STATIONS.map((s) => s.city.toLowerCase());
      expect(cities).toContain('delhi');
      expect(cities).toContain('mumbai');
      expect(cities).toContain('kolkata');
      expect(cities).toContain('bengaluru');
    });

    it('locates station metadata by query', () => {
      const anandVihar = findStationMetadata('delhi-anand-vihar');
      expect(anandVihar).toBeDefined();
      expect(anandVihar?.name).toContain('Anand Vihar');

      const mumbai = findStationMetadata('mumbai');
      expect(mumbai).toBeDefined();
      expect(mumbai?.city).toBe('Mumbai');
    });
  });

  describe('Fallback Mechanism', () => {
    it('returns verified CPCB ground-truth benchmark without crashing', () => {
      const fallback = getFallbackData('delhi-anand-vihar', 'Test reason');
      expect(fallback.aqi).toBe(388);
      expect(fallback.category.category).toBe('severe');
      expect(fallback.provenance.isLive).toBe(false);
      expect(fallback.provenance.fallbackReason).toBe('Test reason');
      expect(fallback.provenance.stationName).toContain('Anand Vihar');
    });

    it('falls back to default when station query is unknown', () => {
      const fallback = getFallbackData('unknown-station-123');
      expect(fallback).toBeDefined();
      expect(fallback.aqi).toBeGreaterThan(0);
    });
  });

  describe('WAQI API Response Parsing', () => {
    it('transforms valid WAQI JSON payload into typed StationAqiData', () => {
      const mockWaqiJson: any = {
        status: 'ok',
        data: {
          aqi: 312,
          idx: 7022,
          attributions: [{ name: 'CPCB', url: 'https://cpcb.nic.in' }],
          city: {
            name: 'Anand Vihar, Delhi, India',
            geo: [28.647, 77.315],
            url: 'https://aqicn.org/city/delhi/anand-vihar',
          },
          dominentpol: 'pm25',
          iaqi: {
            pm25: { v: 280 },
            pm10: { v: 390 },
            no2: { v: 62 },
            so2: { v: 14 },
            co: { v: 34 },
            o3: { v: 22 },
            t: { v: 18.5 },
            h: { v: 75 },
            w: { v: 1.2 },
          },
          time: {
            iso: '2026-11-22T06:00:00+05:30',
          },
        },
      };

      const result = parseWaqiResponse(mockWaqiJson);
      expect(result.aqi).toBe(312);
      expect(result.category.category).toBe('severe');
      expect(result.dominantPollutant).toBe('pm25');
      expect(result.pollutants.pm25).toBe(280);
      expect(result.pollutants.pm10).toBe(390);
      expect(result.weather?.temperature).toBe(18.5);
      expect(result.provenance.isLive).toBe(true);
      expect(result.provenance.stationName).toBe('Anand Vihar, Delhi, India');
    });

    it('throws error on non-ok status', () => {
      expect(() =>
        parseWaqiResponse({ status: 'error', message: 'Unknown station' })
      ).toThrow('Unknown station');
    });
  });

  describe('getLiveAqi Function', () => {
    const originalEnv = process.env.WAQI_API_TOKEN;

    afterEach(() => {
      process.env.WAQI_API_TOKEN = originalEnv;
      vi.restoreAllMocks();
    });

    it('gracefully uses benchmark fallback when WAQI_API_TOKEN is unset', async () => {
      delete process.env.WAQI_API_TOKEN;
      const data = await getLiveAqi('delhi-anand-vihar');
      expect(data.provenance.isLive).toBe(false);
      expect(data.provenance.fallbackReason).toContain('WAQI_API_TOKEN is not configured');
      expect(data.aqi).toBe(388);
    });

    it('fetches live data when token is provided and network succeeds', async () => {
      process.env.WAQI_API_TOKEN = 'test-token-valid';

      const mockFetchResponse = {
        ok: true,
        json: async () => ({
          status: 'ok',
          data: {
            aqi: 295,
            idx: 8899,
            city: { name: 'ITO, Delhi', geo: [28.628, 77.241] },
            dominentpol: 'pm25',
            iaqi: { pm25: { v: 240 } },
            time: { iso: '2026-11-22T10:00:00+05:30' },
          },
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockFetchResponse);

      const data = await getLiveAqi('delhi-ito');
      expect(data.aqi).toBe(295);
      expect(data.provenance.isLive).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('falls back gracefully to verified benchmark if fetch throws', async () => {
      process.env.WAQI_API_TOKEN = 'test-token-valid';
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error (DNS lookup failed)'));

      const data = await getLiveAqi('delhi-anand-vihar');
      expect(data.provenance.isLive).toBe(false);
      expect(data.provenance.fallbackReason).toContain('Live WAQI API fetch failed');
      expect(data.aqi).toBe(388);
    });
  });
});
