import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { WeatherWidget } from '@/components/WeatherWidget';
import { RoutePanel } from '@/components/RoutePanel';
import LeafletMap from '@/components/LeafletMap';

const Index = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<'hot' | 'cool' | null>(null);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setShowRoutes(true);
      setSelectedRoute('cool');
    }, 1500);
  };

  const handleClosePanel = () => {
    setShowRoutes(false);
    setSelectedRoute(null);
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-background">
      {/* Full screen OpenStreetMap via Leaflet */}
      <LeafletMap showRoutes={showRoutes} selectedRoute={selectedRoute} />
      
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
        © OpenStreetMap contributors
      </div>
    </div>
  );
};

export default Index;
