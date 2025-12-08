import { useState, useEffect } from 'react';
import { X, Navigation, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type RouteResult } from '@/services/onemap';

interface NavigationViewProps {
  routeInfo: RouteResult | null;
  onStop: () => void;
  routeType: 'hot' | 'cool';
  onStepChange?: (step: number) => void;
  routeCoords?: [number, number][];
}

// Simulated distance remaining for each step (since OneMap doesn't always provide this)
function getStepDistance(index: number, totalSteps: number, totalDistance: number): number {
  const remaining = totalDistance * (1 - index / totalSteps);
  return Math.round(remaining);
}

export function NavigationView({ routeInfo, onStop, routeType, onStepChange, routeCoords }: NavigationViewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const instructions = routeInfo?.instructions?.filter(i => i && i.trim()) || [];
  const totalDistance = routeInfo?.totalDistance || 0;
  const totalSteps = instructions.length;

  // Notify parent when step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  // Simulated auto-advance (in real app, this would be based on GPS)
  useEffect(() => {
    if (instructions.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < instructions.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 8000); // Advance every 8 seconds for demo

    return () => clearInterval(timer);
  }, [instructions.length]);

  if (instructions.length === 0) {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-[1000] p-4">
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-lg border border-border/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Navigation Active</h3>
            <button onClick={onStop} className="p-2 rounded-full bg-secondary hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">No turn-by-turn instructions available. Follow the route on the map.</p>
        </div>
      </div>
    );
  }

  const currentInstruction = instructions[currentStep];
  const distanceToNext = getStepDistance(currentStep, totalSteps, totalDistance);
  const isLastStep = currentStep === instructions.length - 1;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] animate-fade-in">
      {/* Current instruction card */}
      <div className={cn(
        "mx-4 mb-4 rounded-2xl shadow-xl border overflow-hidden",
        routeType === 'cool' 
          ? "bg-gradient-to-br from-primary/90 to-cool/90 border-primary/30" 
          : "bg-gradient-to-br from-destructive/90 to-hot/90 border-destructive/30",
        "backdrop-blur-xl"
      )}>
        {/* Top bar with distance */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/20">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-white" />
            <span className="text-white font-medium">
              {isLastStep ? 'Arriving' : `In ${distanceToNext}m`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
            </button>
            <button 
              onClick={onStop}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Main instruction */}
        <div className="px-4 py-5">
          <p className="text-white text-lg font-medium leading-relaxed">
            {currentInstruction}
          </p>
        </div>

        {/* Navigation controls */}
        <div className="px-4 py-3 bg-black/20 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-1 text-white/80 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm">Previous</span>
          </button>
          
          <div className="flex items-center gap-1.5">
            {instructions.map((_, index) => (
              <div 
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === currentStep 
                    ? "w-4 bg-white" 
                    : index < currentStep 
                      ? "w-1.5 bg-white/60" 
                      : "w-1.5 bg-white/30"
                )}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentStep(prev => Math.min(instructions.length - 1, prev + 1))}
            disabled={isLastStep}
            className="flex items-center gap-1 text-white/80 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="text-sm">Next</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* End navigation button */}
      <div className="mx-4 mb-4">
        <button
          onClick={onStop}
          className="w-full py-3 rounded-xl bg-card border border-border text-foreground font-medium hover:bg-secondary transition-colors"
        >
          End Navigation
        </button>
      </div>
    </div>
  );
}
