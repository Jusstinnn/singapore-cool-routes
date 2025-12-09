import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Compass } from './Compass';
import { LayerSelector, MapStyle } from './LayerSelector';

// Map tile URLs for different styles
const MAP_TILES: Record<MapStyle, { url: string; attribution: string }> = {
  classic: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap',
  },
  '3d': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
  },
};

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
  isNavigating?: boolean;
  navigationStep?: number;
  currentRouteCoords?: [number, number][];
  userLocation?: { lat: number; lng: number } | null;
}

export default function LeafletMap({ 
  showRoutes, 
  selectedRoute, 
  destination,
  hotRouteCoords,
  coolRouteCoords,
  isNavigating,
  navigationStep = 0,
  currentRouteCoords = [],
  userLocation
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const routeLayersRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [mapStyle, setMapStyle] = useState<MapStyle>('classic');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: SIT_PUNGGOL,
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    const tileConfig = MAP_TILES[mapStyle];
    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
    }).addTo(mapRef.current);

    routeLayersRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update tile layer when style changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    const tileConfig = MAP_TILES[mapStyle];
    tileLayerRef.current = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
    }).addTo(mapRef.current);
  }, [mapStyle]);

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

      // Start marker (SIT) - Person icon with pulsing effect
      L.marker(SIT_PUNGGOL, {
        icon: L.divIcon({
          className: 'custom-marker start-marker',
          html: `<div style="position:relative;">
            <div style="position:absolute;width:32px;height:32px;background:rgba(20,184,166,0.3);border-radius:50%;animation:pulse 2s infinite;top:-6px;left:-6px;"></div>
            <div style="width:20px;height:20px;background:#14b8a6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="8" r="4"/><path d="M12 14c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z"/></svg>
            </div>
          </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      }).addTo(routeLayersRef.current);

      // End marker (Destination) - Flag icon
      L.marker(endPoint, {
        icon: L.divIcon({
          className: 'custom-marker end-marker',
          html: `<div style="width:28px;height:28px;background:#0891b2;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z"/></svg>
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      }).addTo(routeLayersRef.current);
    }
  }, [showRoutes, selectedRoute, destination, hotRouteCoords, coolRouteCoords]);

  // Handle navigation mode - zoom to current step location
  useEffect(() => {
    if (!mapRef.current) return;
    
    if (isNavigating && currentRouteCoords.length > 0) {
      // Calculate position along route based on step
      const totalSteps = Math.max(1, currentRouteCoords.length - 1);
      const coordIndex = Math.min(
        Math.floor((navigationStep / totalSteps) * currentRouteCoords.length),
        currentRouteCoords.length - 1
      );
      const targetCoord = currentRouteCoords[coordIndex] || currentRouteCoords[0];
      
      mapRef.current.flyTo([targetCoord[0], targetCoord[1]], 18, {
        animate: true,
        duration: 0.8,
      });
    } else if (isNavigating) {
      // Fallback to start location
      mapRef.current.flyTo(SIT_PUNGGOL, 18, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [isNavigating, navigationStep, currentRouteCoords]);

  // Show user location marker
  useEffect(() => {
    if (!mapRef.current) return;

    // Always remove existing user marker first
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation && userLocation.lat && userLocation.lng) {
      // Create pulsing blue dot for user location
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: `<div style="position:relative;">
            <div style="position:absolute;width:40px;height:40px;background:rgba(59,130,246,0.25);border-radius:50%;animation:userPulse 2s infinite;top:-12px;left:-12px;"></div>
            <div style="position:absolute;width:28px;height:28px;background:rgba(59,130,246,0.4);border-radius:50%;animation:userPulse 2s infinite 0.3s;top:-6px;left:-6px;"></div>
            <div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.5);"></div>
          </div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
        zIndexOffset: 1000,
      }).addTo(mapRef.current);

      // Fly to user location with smooth animation
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 16, {
        animate: true,
        duration: 1.2,
      });
    } else if (!showRoutes) {
      // Fly back to SIT when user location is cleared
      mapRef.current.flyTo(SIT_PUNGGOL, 15, {
        animate: true,
        duration: 1,
      });
    }
  }, [userLocation, showRoutes]);

  return (
    <div className="absolute inset-0">
      <div 
        ref={containerRef} 
        className="absolute inset-0 z-0"
      />
      <Compass />
      <LayerSelector currentStyle={mapStyle} onStyleChange={setMapStyle} />
    </div>
  );
}
