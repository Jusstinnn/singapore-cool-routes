import { useState } from 'react';
import { Navigation, MapPin, X, ChevronDown, ChevronUp } from 'lucide-react';
import { RouteCard } from '@/components/RouteCard';
import { NavigationView } from '@/components/NavigationView';
import { cn } from '@/lib/utils';
import { type RouteResult } from '@/services/onemap';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RoutePanelProps {
  isVisible: boolean;
  onClose: () => void;
  selectedRoute: 'hot' | 'cool' | null;
  onSelectRoute: (route: 'hot' | 'cool') => void;
  routeInfo?: { hot: RouteResult | null; cool: RouteResult | null };
  destination?: string;
  isNavigating?: boolean;
  onStartNavigation?: () => void;
  onStopNavigation?: () => void;
}

export function RoutePanel({ 
  isVisible, 
  onClose, 
  selectedRoute, 
  onSelectRoute, 
  routeInfo, 
  destination,
  isNavigating,
  onStartNavigation,
  onStopNavigation
}: RoutePanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isVisible) return null;

  const currentRouteInfo = selectedRoute === 'hot' ? routeInfo?.hot : routeInfo?.cool;
  const instructions = currentRouteInfo?.instructions?.filter(i => i && i.trim()) || [];

  // Show navigation view when navigating
  if (isNavigating && selectedRoute) {
    return (
      <NavigationView 
        routeInfo={currentRouteInfo || null}
        onStop={onStopNavigation || onClose}
        routeType={selectedRoute}
      />
    );
  }

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
                <span>SIT Punggol</span>
              </div>
              <span>→</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-accent" />
                <span>{destination || 'Destination'}</span>
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

            {/* Turn-by-turn instructions preview */}
            {selectedRoute && instructions.length > 0 && (
              <div className="mt-3 border border-border/50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-secondary/50 hover:bg-secondary/70 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">
                    Preview Directions ({instructions.length} steps)
                  </span>
                  {showInstructions ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {showInstructions && (
                  <ScrollArea className="max-h-40">
                    <div className="p-3 space-y-2">
                      {instructions.map((instruction, index) => (
                        <div key={index} className="flex gap-3 text-sm">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="text-muted-foreground pt-0.5">{instruction}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}

            {/* Start navigation button */}
            {selectedRoute && (
              <button
                onClick={() => {
                  console.log('Start navigation clicked, handler:', !!onStartNavigation);
                  if (onStartNavigation) onStartNavigation();
                }}
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
