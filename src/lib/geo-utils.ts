const FETCH_TIMEOUT_MS = 8000;
const GEO_QUERY_PATTERN = /^geo:(-?\d+(?:\.\d+)?);(-?\d+(?:\.\d+)?)$/i;

/**
 * Validates and parses a `geo:<lat>;<lon>` coordinate string.
 */
export function parseGeoQuery(query: string): { lat: number; lon: number } | null {
  const match = GEO_QUERY_PATTERN.exec(query.trim());
  if (!match) return null;

  const lat = Number(match[1]);
  const lon = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  return { lat, lon };
}

/**
 * Computes great-circle Haversine distance in kilometers between two [lat, lon] points.
 */
export function haversineDistanceKm(a: [number, number], b: [number, number]): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/**
 * Rounds an optional finite number to the given decimal places.
 */
export function roundOptional(value: number | undefined, decimals = 0): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  if (decimals <= 0) return Math.round(value);
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Fetches JSON with an AbortController timeout and Next.js ISR revalidation hint.
 */
export async function fetchJsonWithTimeout<T>(url: string, revalidateSeconds = 60): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) {
      throw new Error(`Upstream API responded with HTTP status ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Redacts API tokens or query secret fragments before surfacing error messages.
 */
export function redactTokenFromMessage(message: string, token?: string): string {
  let sanitized = message.replace(/token=[^&\s]+/gi, 'token=[REDACTED]');
  if (token && token.trim().length > 0) {
    sanitized = sanitized.split(token).join('[REDACTED]');
  }
  return sanitized;
}
