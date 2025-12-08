import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Singapore Institute of Technology (Punggol Campus)
const SIT_PUNGGOL: L.LatLngExpression = [1.3784, 103.9097];

// Destinations
const WATERWAY_POINT: L.LatLngExpression = [1.4066, 103.9022];
const CONEY_ISLAND: L.LatLngExpression = [1.4094, 103.9216];
const SAFRA_PUNGGOL: L.LatLngExpression = [1.3936, 103.9104];

export type Destination = 'waterway' | 'coney' | 'safra';

// Routes from SIT to each destination
// Each route has a "hot" (direct/exposed) and "cool" (sheltered) version

// ========== WATERWAY POINT ROUTES ==========
const WATERWAY_HOT_ROUTE: L.LatLngExpression[] = [
  [1.3784, 103.9097],  // SIT Campus Heart
  [1.3810, 103.9095],  // Walk north along road
  [1.3850, 103.9090],  // Continue on pavement
  [1.3890, 103.9070],  // Exposed walkway
  [1.3930, 103.9050],  // Along Punggol Way
  [1.3980, 103.9035],  // Continue exposed
  [1.4020, 103.9025],  // Near waterway
  [1.4066, 103.9022],  // Waterway Point
];

const WATERWAY_COOL_ROUTE: L.LatLngExpression[] = [
  [1.3784, 103.9097],  // SIT Campus Heart
  [1.3790, 103.9100],  // Through campus covered walkway
  [1.3800, 103.9110],  // Underground connection
  [1.3820, 103.9115],  // Sheltered link
  [1.3860, 103.9105],  // Through covered HDB void deck
  [1.3900, 103.9095],  // MRT station (Punggol)
  [1.3950, 103.9080],  // Underground to mall
  [1.4000, 103.9050],  // Covered walkway
  [1.4030, 103.9035],  // Mall basement
  [1.4066, 103.9022],  // Waterway Point
];

// ========== CONEY ISLAND ROUTES ==========
const CONEY_HOT_ROUTE: L.LatLngExpression[] = [
  [1.3784, 103.9097],  // SIT Campus Heart
  [1.3810, 103.9120],  // Walk east
  [1.3840, 103.9150],  // Along main road
  [1.3870, 103.9170],  // Continue exposed
  [1.3910, 103.9185],  // Near canal
  [1.3960, 103.9195],  // Punggol Promenade
  [1.4010, 103.9205],  // Along beach
  [1.4050, 103.9210],  // Near entrance
  [1.4094, 103.9216],  // Coney Island
];

const CONEY_COOL_ROUTE: L.LatLngExpression[] = [
  [1.3784, 103.9097],  // SIT Campus Heart
  [1.3795, 103.9105],  // Campus covered area
  [1.3810, 103.9115],  // Through building
  [1.3835, 103.9130],  // Covered linkway
  [1.3860, 103.9145],  // HDB void decks
  [1.3890, 103.9160],  // Sheltered path
  [1.3930, 103.9175],  // Park connector (partial shade)
  [1.3970, 103.9190],  // Tree-lined path
  [1.4020, 103.9200],  // Shaded promenade
  [1.4060, 103.9210],  // Under trees
  [1.4094, 103.9216],  // Coney Island
];

// ========== SAFRA PUNGGOL ROUTES ==========
const SAFRA_HOT_ROUTE: L.LatLngExpression[] = [
  [1.3784, 103.9097],  // SIT Campus Heart
  [1.3810, 103.9098],  // Walk north
  [1.3840, 103.9100],  // Along road
  [1.3870, 103.9102],  // Exposed pavement
  [1.3900, 103.9103],  // Continue straight
  [1.3936, 103.9104],  // SAFRA Punggol
];

const SAFRA_COOL_ROUTE: L.LatLngExpression[] = [
  [1.3784, 103.9097],  // SIT Campus Heart
  [1.3790, 103.9102],  // Through campus
  [1.3805, 103.9108],  // Covered walkway
  [1.3825, 103.9112],  // HDB void deck route
  [1.3850, 103.9115],  // Sheltered link
  [1.3875, 103.9118],  // Through mall area
  [1.3900, 103.9115],  // Covered path
  [1.3920, 103.9110],  // Near destination
  [1.3936, 103.9104],  // SAFRA Punggol
];

const ROUTES = {
  waterway: {
    hot: WATERWAY_HOT_ROUTE,
    cool: WATERWAY_COOL_ROUTE,
    center: WATERWAY_POINT,
  },
  coney: {
    hot: CONEY_HOT_ROUTE,
    cool: CONEY_COOL_ROUTE,
    center: CONEY_ISLAND,
  },
  safra: {
    hot: SAFRA_HOT_ROUTE,
    cool: SAFRA_COOL_ROUTE,
    center: SAFRA_PUNGGOL,
  },
};

interface LeafletMapProps {
  showRoutes: boolean;
  selectedRoute: 'hot' | 'cool' | null;
  destination: Destination | null;
}

export default function LeafletMap({ showRoutes, selectedRoute, destination }: LeafletMapProps) {
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
      const currentRoutes = ROUTES[destination];
      const hotRoute = currentRoutes.hot;
      const coolRoute = currentRoutes.cool;
      const endPoint = currentRoutes.center;

      // Create bounds that include all route points
      const allPoints = [...hotRoute, ...coolRoute];
      const bounds = L.latLngBounds(allPoints);
      
      // Smoothly animate to show the full route
      mapRef.current.fitBounds(bounds.pad(0.3), { 
        animate: true,
        duration: 0.8,
        easeLinearity: 0.25,
        maxZoom: 16
      });

      // Hot route - red dashed
      L.polyline(hotRoute, {
        color: '#ef4444',
        weight: selectedRoute === 'hot' ? 6 : 4,
        opacity: selectedRoute === 'cool' ? 0.4 : 0.9,
        dashArray: '10, 10',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeLayersRef.current);

      // Cool route glow
      L.polyline(coolRoute, {
        color: '#0ea5e9',
        weight: selectedRoute === 'cool' ? 10 : 6,
        opacity: 0.3,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeLayersRef.current);

      // Cool route main
      L.polyline(coolRoute, {
        color: '#06b6d4',
        weight: selectedRoute === 'cool' ? 6 : 4,
        opacity: selectedRoute === 'hot' ? 0.4 : 1,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(routeLayersRef.current);

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
  }, [showRoutes, selectedRoute, destination]);

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
    />
  );
}
