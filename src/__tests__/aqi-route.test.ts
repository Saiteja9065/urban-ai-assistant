import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/aqi/route';
import { NextRequest } from 'next/server';

describe('/api/aqi Route Handler (Milestone 2)', () => {
  it('returns valid JSON with AQI metrics and provenance for default station', async () => {
    const req = new NextRequest('http://localhost:3000/api/aqi');
    const response = await GET(req);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.aqi).toBeGreaterThan(0);
    expect(json.data.category).toBeDefined();
    expect(json.data.provenance).toBeDefined();
    expect(json.data.provenance.stationName).toBeDefined();
    expect(json.data.provenance.timestamp).toBeDefined();
  });

  it('handles query parameters for different metropolitan stations', async () => {
    const req = new NextRequest('http://localhost:3000/api/aqi?station=mumbai-bkc');
    const response = await GET(req);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.station.city).toBe('Mumbai');
  });

  it('returns list of station presets when ?stations=list', async () => {
    const req = new NextRequest('http://localhost:3000/api/aqi?stations=list');
    const response = await GET(req);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.presets)).toBe(true);
    expect(json.data.presets.length).toBeGreaterThan(4);
  });
});
