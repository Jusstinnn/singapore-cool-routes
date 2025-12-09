// OneMap API Service for Singapore routing

const ONEMAP_API_URL = 'https://www.onemap.gov.sg/api/public/routingsvc/route';

// Token provided by user - short-lived JWT (expires after ~3 days)
// User needs to get a new token from https://www.onemap.gov.sg/apidocs/ when this expires
const ONEMAP_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMDM4OSwiZm9yZXZlciI6ZmFsc2UsImlzcyI6Ik9uZU1hcCIsImlhdCI6MTc2NTIxNDIzNiwibmJmIjoxNzY1MjE0MjM2LCJleHAiOjE3NjU0NzM0MzYsImp0aSI6ImI3ZTAwZmZmLWEzODUtNDY5Mi04MzIzLTM1ZjcwYzhkMGJmNCJ9.AcRvUjQ0GYlKX-diV8NHk6IBlFgA5l5RYlMPz0BeGFPZNw-0_jplDpx5DqFe8MKfAr5851_Tbe18zKsbbIZ0uL3yeXbPsOHvnaGZoEI0QqCcRkj1D-rZtaH4s9gdvtZUoTScqNUY7Oy7Q-Uym26VqkNhKiCBxBQCGjKV1LqFgmicxAQQeiOGNymAOT_spvO6CtaqtXSKEscQ5muBk_TJYOKsEds7onKCcbk0ByD5CjE6cGzbc-TnDU0HJ5hiG2ChfGwpvHa_sV0nk-JeC3pFbwQsXWZWVaC-UJ6Eyj5_Zzm6SNTM9fAFRsLSON3lml2rmKM5wAmcFhCcR0J2WIv0Xw';

export interface RouteResult {
  coordinates: [number, number][]; // [lat, lng][]
  totalDistance: number; // in meters
  totalTime: number; // in seconds
  instructions: string[];
}

// Fallback hardcoded routes when API fails
const FALLBACK_ROUTES = {
  waterway: {
    hot: [
      [1.41417, 103.91222], // SIT
      [1.4120, 103.9100],
      [1.4100, 103.9060],
      [1.4080, 103.9040],
      [1.4067, 103.9020], // Waterway Point
    ] as [number, number][],
    cool: [
      [1.41417, 103.91222], // SIT
      [1.4130, 103.9110],
      [1.4110, 103.9080],
      [1.4090, 103.9050],
      [1.4080, 103.9035],
      [1.4067, 103.9020], // Waterway Point
    ] as [number, number][],
  },
  coney: {
    hot: [
      [1.41417, 103.91222], // SIT
      [1.4130, 103.9160],
      [1.4110, 103.9200],
      [1.4094, 103.9240], // Coney Island
    ] as [number, number][],
    cool: [
      [1.41417, 103.91222], // SIT
      [1.4135, 103.9140],
      [1.4120, 103.9180],
      [1.4105, 103.9210],
      [1.4094, 103.9240], // Coney Island
    ] as [number, number][],
  },
  safra: {
    hot: [
      [1.41417, 103.91222], // SIT
      [1.4100, 103.9100],
      [1.4050, 103.9085],
      [1.3966, 103.9073], // SAFRA Punggol
    ] as [number, number][],
    cool: [
      [1.41417, 103.91222], // SIT
      [1.4110, 103.9105],
      [1.4070, 103.9090],
      [1.4020, 103.9080],
      [1.3966, 103.9073], // SAFRA Punggol
    ] as [number, number][],
  },
};

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
        'Authorization': `Bearer ${ONEMAP_TOKEN}`,
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
    const instructions = data.route_instructions?.map((instruction: any[]) => {
      const text = instruction[9] || '';  // e.g., "Head Northwest", "Turn Right"
      const street = instruction[1] || ''; // Street name
      const distance = instruction[5] || ''; // e.g., "802m"
      const heading = instruction[6] || ''; // e.g., "North West"
      
      // Build more descriptive instruction
      if (street) {
        return `${text} onto ${street} (${distance})`;
      } else if (distance && distance !== '0m') {
        return `${text} heading ${heading} for ${distance}`;
      }
      return text;
    }) || [];

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
        'Authorization': `Bearer ${ONEMAP_TOKEN}`,
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
    const instructions = data.route_instructions?.map((instruction: any[]) => {
      const text = instruction[9] || '';
      const street = instruction[1] || '';
      const distance = instruction[5] || '';
      const heading = instruction[6] || '';
      
      if (street) {
        return `${text} onto ${street} (${distance})`;
      } else if (distance && distance !== '0m') {
        return `${text} heading ${heading} for ${distance}`;
      }
      return text;
    }) || [];

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

// Get fallback routes when API fails
export function getFallbackRoutes(destination: 'waterway' | 'coney' | 'safra') {
  return FALLBACK_ROUTES[destination];
}
