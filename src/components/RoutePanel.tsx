import { useState } from 'react';
import { Navigation, MapPin, X } from 'lucide-react';
import { RouteCard } from '@/components/RouteCard';
import { cn } from '@/lib/utils';

interface RoutePanelProps {
  isVisible: boolean;
  onClose: () => void;
  selectedRoute: 'hot' | 'cool' | null;
  onSelectRoute: (route: 'hot' | 'cool') => void;
}

export function RoutePanel({ isVisible, onClose, selectedRoute, onSelectRoute }: RoutePanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000]">
      <div className="bg-card/95 backdrop-blur-xl rounded-t-3xl shadow-lg border-t border-border/50 max-h-[70vh] overflow-hidden">
        {/* Handle bar */}
        <div 
          className="flex justify-center py-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-12 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg text-foreground">Choose your route</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Dhoby Ghaut MRT</span>
              </div>
              <span>→</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-accent" />
                <span>Plaza Singapura</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Route cards */}
        {isExpanded && (
          <div className="px-4 pb-6 space-y-3">
            <RouteCard
              type="cool"
              isSelected={selectedRoute === 'cool'}
              onSelect={() => onSelectRoute('cool')}
            />
            <RouteCard
              type="hot"
              isSelected={selectedRoute === 'hot'}
              onSelect={() => onSelectRoute('hot')}
            />

            {/* Start navigation button */}
            {selectedRoute && (
              <button
                className={cn(
                  "w-full rounded-xl py-4 font-medium mt-4",
                  "flex items-center justify-center gap-2",
                  "shadow-lg text-primary-foreground",
                  selectedRoute === 'cool' 
                    ? "bg-gradient-to-r from-primary to-cool" 
                    : "bg-gradient-to-r from-destructive to-hot"
                )}
              >
                <Navigation className="h-4 w-4" />
                Start Navigation
              </button>
            )}

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-6 rounded bg-destructive/30 border border-dashed border-destructive" />
                <span className="text-xs text-muted-foreground">Hot route</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-6 rounded bg-cool" />
                <span className="text-xs text-muted-foreground">ShadeWalk</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
