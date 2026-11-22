import { NextRequest, NextResponse } from 'next/server';
import { getLiveAqi, INDIAN_METRO_STATIONS } from '@/lib/waqi-service';
import { AqiApiResponse } from '@/types/aqi';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse<AqiApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    let stationQuery = searchParams.get('station') || searchParams.get('city') || 'delhi-anand-vihar';

    if (lat && lon) {
      stationQuery = `geo:${lat};${lon}`;
    }

    // Support listing all available stations if ?stations=list
    if (searchParams.get('stations') === 'list') {
      return NextResponse.json({
        success: true,
        data: {
          presets: INDIAN_METRO_STATIONS,
        } as unknown as any,
      });
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
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve AQI data';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
