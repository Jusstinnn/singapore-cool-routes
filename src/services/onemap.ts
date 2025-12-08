// OneMap API Service for Singapore routing

const ONEMAP_API_URL = 'https://www.onemap.gov.sg/api/public/routingsvc/route';

// Token provided by user - short-lived JWT
const ONEMAP_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMDM4NiwiZm9yZXZlciI6ZmFsc2UsImlzcyI6Ik9uZU1hcCIsImlhdCI6MTc2NTIwNDcxNiwibmJmIjoxNzY1MjA0NzE2LCJleHAiOjE3NjU0NjM5MTYsImp0aSI6ImE2ZjJlYzExLTI2ZTMtNDQ5ZC1iMmYxLTNhMzE2Yzc1ODYxMCJ9.0CqHcGYGe3g-yHPV9eYEoVVCIKyk5-Bc7HEfEIgY_mNLmQuPq5I1MC3XVadxa3SPPD9e3B1Q1FyG6faz1a3SyUBc4USJX4QZj-kxpFoV4i373QP3EMCUlPQI14pksES3Nj---T5iwiXr1POITMc3L3MgRtkRLpkTWw-IPpKs-XGxyavJJnXvboVaoXa1I6z7fu8fTsslEXixBQWr3801JDOxRrBY3_KBNhKimiTVVeBjfymfRmcEmxAv--zXbKZrXC0SIuQVxk18txhIpGLX_Aq-LDul4AZfhnFtwFeecox89NtS5Wl4IFdbgXhqH1eFXIk4YXGlHsekNlQsMgww';

export interface RouteResult {
  coordinates: [number, number][]; // [lat, lng][]
  totalDistance: number; // in meters
  totalTime: number; // in seconds
  instructions: string[];
}

// Decode Google Polyline encoded string to coordinates
function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += deltaLng;

    coordinates.push([lat / 1e5, lng / 1e5]);
  }

  return coordinates;
}

export async function getWalkingRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<RouteResult | null> {
  try {
    const params = new URLSearchParams({
      start: `${startLat},${startLng}`,
      end: `${endLat},${endLng}`,
      routeType: 'walk',
    });

    const response = await fetch(`${ONEMAP_API_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': ONEMAP_TOKEN,
      },
    });

    if (!response.ok) {
      console.error('OneMap API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.status !== 0) {
      console.error('OneMap routing error:', data.status_message);
      return null;
    }

    // Decode the polyline
    const coordinates = decodePolyline(data.route_geometry);

    // Extract instructions
    const instructions = data.route_instructions?.map((instruction: any[]) => instruction[9]) || [];

    return {
      coordinates,
      totalDistance: data.route_summary?.total_distance || 0,
      totalTime: data.route_summary?.total_time || 0,
      instructions,
    };
  } catch (error) {
    console.error('Error fetching route from OneMap:', error);
    return null;
  }
}

export async function getDrivingRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<RouteResult | null> {
  try {
    const params = new URLSearchParams({
      start: `${startLat},${startLng}`,
      end: `${endLat},${endLng}`,
      routeType: 'drive',
    });

    const response = await fetch(`${ONEMAP_API_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': ONEMAP_TOKEN,
      },
    });

    if (!response.ok) {
      console.error('OneMap API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.status !== 0) {
      console.error('OneMap routing error:', data.status_message);
      return null;
    }

    const coordinates = decodePolyline(data.route_geometry);
    const instructions = data.route_instructions?.map((instruction: any[]) => instruction[9]) || [];

    return {
      coordinates,
      totalDistance: data.route_summary?.total_distance || 0,
      totalTime: data.route_summary?.total_time || 0,
      instructions,
    };
  } catch (error) {
    console.error('Error fetching route from OneMap:', error);
    return null;
  }
}
