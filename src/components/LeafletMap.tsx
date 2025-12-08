import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Singapore Institute of Technology (Punggol Campus)
const SIT_PUNGGOL: L.LatLngExpression = [1.3784, 103.9097];

// Destinations
const WATERWAY_POINT: L.LatLngExpression = [1.4066, 103.9022];
const CONEY_ISLAND: L.LatLngExpression = [1.4094, 103.9216];
const SAFRA_PUNGGOL: L.LatLngExpression = [1.3936, 103.9104];

export type Destination = 'waterway' | 'coney' | 'safra';

// Location coordinates for API calls
export const LOCATIONS = {
  sit: { lat: 1.3784, lng: 103.9097, name: 'Singapore Institute of Technology' },
  waterway: { lat: 1.4066, lng: 103.9022, name: 'Waterway Point' },
  coney: { lat: 1.4094, lng: 103.9216, name: 'Coney Island' },
  safra: { lat: 1.3936, lng: 103.9104, name: 'SAFRA Punggol' },
};

// Map destination to end point
const DESTINATION_COORDS = {
  waterway: WATERWAY_POINT,
  coney: CONEY_ISLAND,
  safra: SAFRA_PUNGGOL,
};

interface LeafletMapProps {
  showRoutes: boolean;
  selectedRoute: 'hot' | 'cool' | null;
  destination: Destination | null;
  hotRouteCoords?: [number, number][];
  coolRouteCoords?: [number, number][];
}

export default function LeafletMap({ 
  showRoutes, 
  selectedRoute, 
  destination,
  hotRouteCoords,
  coolRouteCoords
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const routeLayersRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: SIT_PUNGGOL,
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(mapRef.current);

    routeLayersRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update routes
  useEffect(() => {
    if (!mapRef.current || !routeLayersRef.current) return;

    routeLayersRef.current.clearLayers();

    if (showRoutes && destination) {
      const endPoint = DESTINATION_COORDS[destination];

      // Use API routes if available, otherwise show markers only
      const hasRoutes = hotRouteCoords && hotRouteCoords.length > 0 && coolRouteCoords && coolRouteCoords.length > 0;

      if (hasRoutes) {
        // Create bounds that include all route points
        const allPoints = [
          ...hotRouteCoords.map(c => L.latLng(c[0], c[1])),
          ...coolRouteCoords.map(c => L.latLng(c[0], c[1]))
        ];
        const bounds = L.latLngBounds(allPoints);
        
        // Smoothly animate to show the full route
        mapRef.current.fitBounds(bounds.pad(0.2), { 
          animate: true,
          duration: 0.8,
          easeLinearity: 0.25,
          maxZoom: 15
        });

        // Hot route (driving route) - red dashed
        const hotLatLngs: L.LatLngExpression[] = hotRouteCoords.map(c => [c[0], c[1]] as L.LatLngExpression);
        L.polyline(hotLatLngs, {
          color: '#ef4444',
          weight: selectedRoute === 'hot' ? 6 : 4,
          opacity: selectedRoute === 'cool' ? 0.4 : 0.9,
          dashArray: '10, 10',
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(routeLayersRef.current);

        // Cool route (walking route) glow
        const coolLatLngs: L.LatLngExpression[] = coolRouteCoords.map(c => [c[0], c[1]] as L.LatLngExpression);
        L.polyline(coolLatLngs, {
          color: '#0ea5e9',
          weight: selectedRoute === 'cool' ? 10 : 6,
          opacity: 0.3,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(routeLayersRef.current);

        // Cool route main
        L.polyline(coolLatLngs, {
          color: '#06b6d4',
          weight: selectedRoute === 'cool' ? 6 : 4,
          opacity: selectedRoute === 'hot' ? 0.4 : 1,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(routeLayersRef.current);
      } else {
        // Fallback: just zoom to show start and end points
        const bounds = L.latLngBounds([SIT_PUNGGOL, endPoint]);
        mapRef.current.fitBounds(bounds.pad(0.3), { 
          animate: true,
          duration: 0.8,
        });
      }

      // Start marker (SIT)
      L.marker(SIT_PUNGGOL, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="width:20px;height:20px;background:#14b8a6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      }).addTo(routeLayersRef.current);

      // End marker
      L.marker(endPoint, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="width:24px;height:24px;background:#0891b2;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      }).addTo(routeLayersRef.current);
    }
  }, [showRoutes, selectedRoute, destination, hotRouteCoords, coolRouteCoords]);

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
    />
  );
}
