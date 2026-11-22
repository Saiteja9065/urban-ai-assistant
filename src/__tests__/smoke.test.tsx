import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '@/app/page';
import { DEFAULT_STATION_DATA } from '@/lib/aqi-constants';
import { generateDeterministicAdvice } from '@/lib/gemini-service';
import { EVALUATOR_PERSONA_PRESETS } from '@/lib/persona-constants';

describe('Urban Air Quality Assistant Landing Page', () => {
  beforeEach(() => {
    const mockAdvice = generateDeterministicAdvice(
      DEFAULT_STATION_DATA,
      EVALUATOR_PERSONA_PRESETS.commuter
    );

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/aqi')) {
        return Promise.resolve({
          json: () => Promise.resolve({ success: true, data: DEFAULT_STATION_DATA }),
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ success: true, data: mockAdvice }),
      });
    });
  });

  it('renders the main heading and milestone 4 dashboard elements', async () => {
    await act(async () => {
      render(<Home />);
    });

    expect(screen.getAllByText(/Urban Air Quality Assistant/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Milestone 4 Online/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Indian Metropolitan Monitoring Station:/i)).toBeInTheDocument();
  });
});
