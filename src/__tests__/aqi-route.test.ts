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

  it('validates lat/lon coordinates and rejects out-of-range values with 400', async () => {
    const invalidLatReq = new NextRequest('http://localhost:3000/api/aqi?lat=120&lon=77.2');
    const invalidRes = await GET(invalidLatReq);
    expect(invalidRes.status).toBe(400);

    const invalidJson = await invalidRes.json();
    expect(invalidJson.success).toBe(false);
    expect(invalidJson.error).toContain('Invalid latitude or longitude');
  });

  it('accepts valid lat/lon coordinates', async () => {
    const validGeoReq = new NextRequest('http://localhost:3000/api/aqi?lat=17.44&lon=78.35');
    const response = await GET(validGeoReq);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.station.coordinates).toEqual([17.44, 78.35]);
  });
});
