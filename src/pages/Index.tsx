import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { WeatherWidget } from '@/components/WeatherWidget';
import { RoutePanel } from '@/components/RoutePanel';
import LeafletMap, { type Destination, LOCATIONS } from '@/components/LeafletMap';
import { getWalkingRoute, getDrivingRoute, type RouteResult } from '@/services/onemap';
import { toast } from 'sonner';

const Index = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<'hot' | 'cool' | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [hotRouteCoords, setHotRouteCoords] = useState<[number, number][]>([]);
  const [coolRouteCoords, setCoolRouteCoords] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<{ hot: RouteResult | null; cool: RouteResult | null }>({ hot: null, cool: null });

  const handleSearch = async (dest: Destination) => {
    setIsSearching(true);
    setDestination(dest);

    const start = LOCATIONS.sit;
    const end = LOCATIONS[dest];

    try {
      // Fetch both walking (cool/sheltered) and driving (hot/fast) routes in parallel
      const [walkRoute, driveRoute] = await Promise.all([
        getWalkingRoute(start.lat, start.lng, end.lat, end.lng),
        getDrivingRoute(start.lat, start.lng, end.lat, end.lng),
      ]);

      if (walkRoute) {
        setCoolRouteCoords(walkRoute.coordinates);
        toast.success(`Walking route found: ${(walkRoute.totalDistance / 1000).toFixed(1)}km, ~${Math.ceil(walkRoute.totalTime / 60)} min`);
      } else {
        toast.error('Could not fetch walking route from OneMap');
      }

      if (driveRoute) {
        setHotRouteCoords(driveRoute.coordinates);
      }

      setRouteInfo({ hot: driveRoute, cool: walkRoute });
      setShowRoutes(true);
      setSelectedRoute('cool');
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast.error('Failed to fetch routes. The API token may have expired.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClosePanel = () => {
    setShowRoutes(false);
    setSelectedRoute(null);
    setHotRouteCoords([]);
    setCoolRouteCoords([]);
    setRouteInfo({ hot: null, cool: null });
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-background">
      {/* Full screen OpenStreetMap via Leaflet */}
      <LeafletMap 
        showRoutes={showRoutes} 
        selectedRoute={selectedRoute} 
        destination={destination}
        hotRouteCoords={hotRouteCoords}
        coolRouteCoords={coolRouteCoords}
      />
      
      {/* UI Overlays */}
      {!showRoutes && <SearchBar onSearch={handleSearch} isSearching={isSearching} />}
      
      <WeatherWidget />
      
      <RoutePanel
        isVisible={showRoutes}
        onClose={handleClosePanel}
        selectedRoute={selectedRoute}
        onSelectRoute={setSelectedRoute}
      />

      {/* Attribution */}
      <div className="fixed bottom-2 left-2 z-[500] text-[10px] text-muted-foreground/60">
        © OpenStreetMap contributors | Powered by OneMap
      </div>
    </div>
  );
};

export default Index;
