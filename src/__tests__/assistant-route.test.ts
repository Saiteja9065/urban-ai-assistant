import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/assistant/route';
import { NextRequest } from 'next/server';

describe('/api/assistant Route Handler (Milestone 3)', () => {
  it('generates structured 3-pillar advice for commuter preset', async () => {
    const req = new NextRequest('http://localhost:3000/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stationQuery: 'delhi-anand-vihar',
        personaId: 'commuter',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(json.data.verifiedAqiSnapshot.aqi).toBeGreaterThan(0);
    expect(json.data.pillar1_lowEmissionRoutines).toBeDefined();
    expect(json.data.pillar2_indoorAirQuality).toBeDefined();
    expect(json.data.pillar3_sustainableAlternatives.recommendations.length).toBeGreaterThan(0);
  });

  it('handles custom persona input', async () => {
    const req = new NextRequest('http://localhost:3000/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personaId: 'custom',
        customPersona: {
          name: 'Sunil Kumar',
          role: 'Cyclist / Delivery Partner',
          age: 26,
          routine: 'Outdoor cycling 8 hours daily',
          healthConditions: ['Sinusitis'],
        },
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.personaProfile.id).toBe('custom');
  });
});
