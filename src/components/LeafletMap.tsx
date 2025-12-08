import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Singapore center coordinates
const SINGAPORE_CENTER: L.LatLngExpression = [1.2990, 103.8450];
const ZOOM_LEVEL = 16;

// Demo route coordinates - Dhoby Ghaut MRT to Plaza Singapura
const DHOBY_GHAUT: L.LatLngExpression = [1.2988, 103.8456];
const PLAZA_SINGAPURA: L.LatLngExpression = [1.3008, 103.8451];

// Hot route - straight along the road (exposed)
const HOT_ROUTE: L.LatLngExpression[] = [
  [1.2988, 103.8456],
  [1.2992, 103.8455],
  [1.2998, 103.8453],
  [1.3003, 103.8452],
  [1.3008, 103.8451],
];

// Cool route - winding through buildings/underground (sheltered)
const COOL_ROUTE: L.LatLngExpression[] = [
  [1.2988, 103.8456],
  [1.2990, 103.8460],
  [1.2993, 103.8462],
  [1.2997, 103.8458],
  [1.3002, 103.8455],
  [1.3005, 103.8453],
  [1.3008, 103.8451],
];

interface LeafletMapProps {
  showRoutes: boolean;
  selectedRoute: 'hot' | 'cool' | null;
}

export default function LeafletMap({ showRoutes, selectedRoute }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const routeLayersRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: SINGAPORE_CENTER,
      zoom: ZOOM_LEVEL,
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

    if (showRoutes) {
      // Fit bounds
      const bounds = L.latLngBounds([DHOBY_GHAUT, PLAZA_SINGAPURA]);
      mapRef.current.fitBounds(bounds.pad(0.5), { animate: true });

      // Hot route - red dashed
      L.polyline(HOT_ROUTE, {
        color: '#ef4444',
        weight: selectedRoute === 'hot' ? 6 : 4,
        opacity: selectedRoute === 'cool' ? 0.4 : 0.9,
        dashArray: '10, 10',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeLayersRef.current);

      // Cool route glow
      L.polyline(COOL_ROUTE, {
        color: '#0ea5e9',
        weight: selectedRoute === 'cool' ? 10 : 6,
        opacity: 0.3,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeLayersRef.current);

      // Cool route main
      L.polyline(COOL_ROUTE, {
        color: '#06b6d4',
        weight: selectedRoute === 'cool' ? 6 : 4,
        opacity: selectedRoute === 'hot' ? 0.4 : 1,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeLayersRef.current);

      // Start marker
      L.marker(DHOBY_GHAUT, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="width:20px;height:20px;background:#14b8a6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      }).addTo(routeLayersRef.current);

      // End marker
      L.marker(PLAZA_SINGAPURA, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="width:24px;height:24px;background:#0891b2;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      }).addTo(routeLayersRef.current);
    }
  }, [showRoutes, selectedRoute]);

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
    />
  );
}
