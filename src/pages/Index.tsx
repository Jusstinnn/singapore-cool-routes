import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { WeatherWidget } from '@/components/WeatherWidget';
import { RoutePanel } from '@/components/RoutePanel';
import LeafletMap, { type Destination, LOCATIONS } from '@/components/LeafletMap';
import { getWalkingRoute, getDrivingRoute, getFallbackRoutes, type RouteResult } from '@/services/onemap';
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

      if (walkRoute && driveRoute) {
        setCoolRouteCoords(walkRoute.coordinates);
        setHotRouteCoords(driveRoute.coordinates);
        setRouteInfo({ hot: driveRoute, cool: walkRoute });
        toast.success(`Routes found: ${(walkRoute.totalDistance / 1000).toFixed(1)}km walk`);
      } else {
        // Use fallback hardcoded routes when API fails
        const fallback = getFallbackRoutes(dest);
        setCoolRouteCoords(fallback.cool);
        setHotRouteCoords(fallback.hot);
        setRouteInfo({ hot: null, cool: null });
        toast.info('Using demo routes (API token may have expired)');
      }

      setShowRoutes(true);
      setSelectedRoute('cool');
    } catch (error) {
      console.error('Error fetching routes:', error);
      // Use fallback routes on error
      const fallback = getFallbackRoutes(dest);
      setCoolRouteCoords(fallback.cool);
      setHotRouteCoords(fallback.hot);
      setRouteInfo({ hot: null, cool: null });
      setShowRoutes(true);
      setSelectedRoute('cool');
      toast.info('Using demo routes (API unavailable)');
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
        routeInfo={routeInfo}
        destination={destination ? LOCATIONS[destination].name : undefined}
      />

      {/* Attribution */}
      <div className="fixed bottom-2 left-2 z-[500] text-[10px] text-muted-foreground/60">
        © OpenStreetMap contributors | Powered by OneMap
      </div>
    </div>
  );
};

export default Index;
