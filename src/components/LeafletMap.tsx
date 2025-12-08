import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// Singapore center coordinates
const SINGAPORE_CENTER: [number, number] = [1.2990, 103.8450];
const ZOOM_LEVEL = 16;

// Demo route coordinates - Dhoby Ghaut MRT to Plaza Singapura
const DHOBY_GHAUT: [number, number] = [1.2988, 103.8456];
const PLAZA_SINGAPURA: [number, number] = [1.3008, 103.8451];

// Hot route - straight along the road (exposed)
const HOT_ROUTE: [number, number][] = [
  DHOBY_GHAUT,
  [1.2992, 103.8455],
  [1.2998, 103.8453],
  [1.3003, 103.8452],
  PLAZA_SINGAPURA,
];

// Cool route - winding through buildings/underground (sheltered)
const COOL_ROUTE: [number, number][] = [
  DHOBY_GHAUT,
  [1.2990, 103.8460],
  [1.2993, 103.8462],
  [1.2997, 103.8458],
  [1.3002, 103.8455],
  [1.3005, 103.8453],
  PLAZA_SINGAPURA,
];

// Custom marker icons
const createIcon = (color: string, size: number = 20) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const startIcon = createIcon('#14b8a6', 20);
const endIcon = createIcon('#0891b2', 24);

function FitBounds({ showRoutes }: { showRoutes: boolean }) {
  const map = useMap();
  
  useEffect(() => {
    if (showRoutes) {
      const bounds = L.latLngBounds([DHOBY_GHAUT, PLAZA_SINGAPURA]);
      map.fitBounds(bounds.pad(0.5), { animate: true, duration: 0.5 });
    }
  }, [showRoutes, map]);
  
  return null;
}

interface LeafletMapProps {
  showRoutes: boolean;
  selectedRoute: 'hot' | 'cool' | null;
}

export default function LeafletMap({ showRoutes, selectedRoute }: LeafletMapProps) {
  return (
    <MapContainer
      center={SINGAPORE_CENTER}
      zoom={ZOOM_LEVEL}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap'
      />
      
      <FitBounds showRoutes={showRoutes} />
      
      {showRoutes && (
        <>
          {/* Hot route - red dashed */}
          <Polyline
            positions={HOT_ROUTE}
            pathOptions={{
              color: '#ef4444',
              weight: selectedRoute === 'hot' ? 6 : 4,
              opacity: selectedRoute === 'cool' ? 0.4 : 0.9,
              dashArray: '10, 10',
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
          
          {/* Cool route - blue solid with glow effect */}
          <Polyline
            positions={COOL_ROUTE}
            pathOptions={{
              color: '#0ea5e9',
              weight: selectedRoute === 'cool' ? 10 : 6,
              opacity: 0.3,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
          <Polyline
            positions={COOL_ROUTE}
            pathOptions={{
              color: '#06b6d4',
              weight: selectedRoute === 'cool' ? 6 : 4,
              opacity: selectedRoute === 'hot' ? 0.4 : 1,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
          
          {/* Markers */}
          <Marker position={DHOBY_GHAUT} icon={startIcon} />
          <Marker position={PLAZA_SINGAPURA} icon={endIcon} />
        </>
      )}
    </MapContainer>
  );
}
