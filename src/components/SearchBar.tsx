import { useState } from 'react';
import { MapPin, Navigation, Search, ArrowRight, ChevronDown, Locate, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Destination } from './LeafletMap';

interface SearchBarProps {
  onSearch: (destination: Destination) => void;
  isSearching: boolean;
}

const DESTINATIONS = [
  { value: 'waterway' as Destination, label: 'Waterway Point' },
  { value: 'coney' as Destination, label: 'Coney Island' },
  { value: 'safra' as Destination, label: 'SAFRA Punggol' },
];

export function SearchBar({ onSearch, isSearching }: SearchBarProps) {
  const [selectedDestination, setSelectedDestination] = useState<Destination | ''>('');
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);
  const [originMode, setOriginMode] = useState<'sit' | 'current'>('sit');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setOriginMode('current');
        setIsLocating(false);
        setIsOriginOpen(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location unavailable');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out');
            break;
          default:
            setLocationError('Unable to get location');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const getOriginLabel = () => {
    if (originMode === 'current' && currentLocation) {
      return 'Current Location';
    }
    return 'Singapore Institute of Technology';
  };

  const handleSearch = () => {
    if (selectedDestination) {
      onSearch(selectedDestination);
    }
  };

  return (
    <div className="absolute left-4 right-4 top-4 z-[1000] md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-lg">
      <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-lg border border-border/50 p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Navigation className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground text-sm">ShadeWalk SG</h1>
            <p className="text-xs text-muted-foreground">Stay cool, walk smart</p>
          </div>
        </div>

        {/* Search dropdowns */}
        <div className="space-y-2">
          {/* Origin dropdown */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              {originMode === 'current' ? (
                <Locate className="h-3 w-3 text-primary" />
              ) : (
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </div>
            <button
              onClick={() => setIsOriginOpen(!isOriginOpen)}
              className={cn(
                "w-full rounded-xl bg-secondary/50 border border-border/50 py-3 pl-9 pr-10",
                "text-sm text-foreground text-left",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
                "transition-all duration-200"
              )}
            >
              {getOriginLabel()}
            </button>
            <ChevronDown className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform",
              isOriginOpen && "rotate-180"
            )} />
            
            {isOriginOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                <div
                  className={cn(
                    "px-4 py-3 hover:bg-secondary/50 cursor-pointer text-sm flex items-center gap-2",
                    originMode === 'sit' && "bg-primary/10 text-primary"
                  )}
                  onClick={() => {
                    setOriginMode('sit');
                    setIsOriginOpen(false);
                  }}
                >
                  <MapPin className="h-4 w-4" />
                  Singapore Institute of Technology
                </div>
                <div
                  className={cn(
                    "px-4 py-3 hover:bg-secondary/50 cursor-pointer text-sm flex items-center gap-2",
                    originMode === 'current' && currentLocation && "bg-primary/10 text-primary"
                  )}
                  onClick={handleUseCurrentLocation}
                >
                  {isLocating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Locate className="h-4 w-4" />
                  )}
                  {isLocating ? 'Getting location...' : 'Use current location'}
                </div>
                {locationError && (
                  <div className="px-4 py-2 text-xs text-destructive bg-destructive/10">
                    {locationError}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Connection line */}
          <div className="flex items-center gap-2 pl-4">
            <div className="w-0.5 h-4 bg-border rounded-full" />
          </div>
          
          {/* Destination dropdown */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              <MapPin className="h-3.5 w-3.5 text-accent" />
            </div>
            <button
              onClick={() => setIsDestOpen(!isDestOpen)}
              className={cn(
                "w-full rounded-xl bg-secondary/50 border border-border/50 py-3 pl-9 pr-10",
                "text-sm text-left",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
                "transition-all duration-200",
                selectedDestination ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {selectedDestination 
                ? DESTINATIONS.find(d => d.value === selectedDestination)?.label 
                : "Select destination..."}
            </button>
            <ChevronDown className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform",
              isDestOpen && "rotate-180"
            )} />
            
            {isDestOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                {DESTINATIONS.map((dest) => (
                  <div
                    key={dest.value}
                    className={cn(
                      "px-4 py-3 hover:bg-secondary/50 cursor-pointer text-sm",
                      selectedDestination === dest.value && "bg-primary/10 text-primary"
                    )}
                    onClick={() => {
                      setSelectedDestination(dest.value);
                      setIsDestOpen(false);
                    }}
                  >
                    {dest.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={isSearching || !selectedDestination}
          className={cn(
            "w-full mt-4 rounded-xl py-3.5 font-medium",
            "bg-gradient-to-r from-primary to-accent",
            "text-primary-foreground shadow-lg",
            "hover:opacity-90 transition-opacity",
            "disabled:opacity-50",
            "flex items-center justify-center gap-2"
          )}
        >
          {isSearching ? (
            <>
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              <span>Finding cool routes...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Find Route</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Demo hint */}
        <p className="text-xs text-center text-muted-foreground mt-3">
          Demo: SIT Punggol → 3 destinations
        </p>
      </div>
    </div>
  );
}
