import { useState } from 'react';
import { MapPin, Navigation, Search, ArrowRight, ChevronDown } from 'lucide-react';
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
              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
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
              Singapore Institute of Technology
            </button>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            
            {isOriginOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                <div
                  className="px-4 py-3 hover:bg-secondary/50 cursor-pointer text-sm"
                  onClick={() => setIsOriginOpen(false)}
                >
                  Singapore Institute of Technology
                </div>
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
