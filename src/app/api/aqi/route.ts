import { NextRequest, NextResponse } from 'next/server';
import { getLiveAqi, INDIAN_METRO_STATIONS } from '@/lib/waqi-service';
import { AqiApiResponse } from '@/types/aqi';

export const dynamic = 'force-dynamic';

const MAX_STATION_QUERY_LENGTH = 120;

function parseCoordinateParam(raw: string | null, min: number, max: number): number | null {
  if (raw === null || raw.trim() === '') return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return null;
  }
  return parsed;
}

export async function GET(request: NextRequest): Promise<NextResponse<AqiApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);

    // Support listing all available stations if ?stations=list
    if (searchParams.get('stations') === 'list') {
      return NextResponse.json({
        success: true,
        data: {
          presets: INDIAN_METRO_STATIONS,
        },
      });
    }

    const rawLat = searchParams.get('lat');
    const rawLon = searchParams.get('lon');
    let stationQuery = (searchParams.get('station') || searchParams.get('city') || 'delhi-anand-vihar').trim();

    if (rawLat !== null || rawLon !== null) {
      const lat = parseCoordinateParam(rawLat, -90, 90);
      const lon = parseCoordinateParam(rawLon, -180, 180);
      if (lat === null || lon === null) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid latitude or longitude coordinates.',
          },
          { status: 400 }
        );
      }
      stationQuery = `geo:${lat};${lon}`;
    } else if (stationQuery.length === 0) {
      stationQuery = 'delhi-anand-vihar';
    } else if (stationQuery.length > MAX_STATION_QUERY_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: 'Station query exceeds maximum allowed length.',
        },
        { status: 400 }
      );
    }

    const data = await getLiveAqi(stationQuery);

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: unknown) {
    console.error('[GET /api/aqi] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve AQI data',
      },
      { status: 500 }
    );
  }
}
