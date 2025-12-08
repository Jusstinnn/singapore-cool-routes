import { Clock, Thermometer, Umbrella, Check, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateComfortScore } from '@/hooks/use-weather';

interface RouteCardProps {
  type: 'hot' | 'cool';
  isSelected: boolean;
  onSelect: () => void;
  destination?: string;
  temperature?: number | null;
  uvIndex?: number | null;
}

const routeDescriptions: Record<string, { hot: string; cool: string }> = {
  'Waterway Point': {
    hot: 'Direct route via Punggol Walk',
    cool: 'Via Waterway Terraces covered walkway & Oasis Terraces',
  },
  'Coney Island': {
    hot: 'Direct route via Punggol Promenade',
    cool: 'Via Punggol Waterway Park shelters & covered bridges',
  },
  'SAFRA Punggol': {
    hot: 'Direct route via Punggol Central',
    cool: 'Via Waterway Point mall & HDB void decks',
  },
};

const getRouteData = (destination?: string, temperature?: number | null) => {
  const realTemp = temperature ?? 30;
  const hotExposureTemp = Math.round(realTemp + 2); // Direct sun adds ~2°C
  const coolComfortTemp = Math.round(realTemp - 4); // Shade reduces ~4°C
  
  return {
    hot: {
      emoji: '🔥',
      label: 'Hot & Fast',
      time: '12 mins',
      temp: `${hotExposureTemp}°C Exposure`,
      shelter: '0% Sheltered',
      description: routeDescriptions[destination || '']?.hot || 'Fastest route via open roads',
    },
    cool: {
      emoji: '❄️',
      label: 'ShadeWalk',
      time: '15 mins',
      temp: `${coolComfortTemp}°C Comfort`,
      shelter: '90% Sheltered',
      description: routeDescriptions[destination || '']?.cool || 'Via covered walkways & sheltered paths',
    },
  };
};

function getComfortLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: 'text-green-500' };
  if (score >= 60) return { label: 'Good', color: 'text-cool' };
  if (score >= 40) return { label: 'Moderate', color: 'text-yellow-500' };
  if (score >= 20) return { label: 'Poor', color: 'text-orange-500' };
  return { label: 'Very Poor', color: 'text-destructive' };
}

export function RouteCard({ type, isSelected, onSelect, destination, temperature, uvIndex }: RouteCardProps) {
  const data = getRouteData(destination, temperature)[type];
  const isCool = type === 'cool';
  const comfortScore = calculateComfortScore(type, temperature, uvIndex);
  const { label: comfortLabel, color: comfortColor } = getComfortLabel(comfortScore);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-2xl p-4 transition-all duration-300",
        "border-2",
        isSelected && isCool && "border-cool bg-cool/5 shadow-lg animate-pulse-glow",
        isSelected && !isCool && "border-destructive bg-destructive/5",
        !isSelected && "border-transparent bg-secondary/50 hover:bg-secondary",
        isCool && !isSelected && "relative"
      )}
    >
      {/* Recommended badge */}
      {isCool && !isSelected && (
        <div className="absolute -top-2 right-4 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
          Recommended
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{data.emoji}</span>
            <span className={cn(
              "font-semibold text-base",
              isCool ? "text-cool" : "text-destructive"
            )}>
              {data.label}
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{data.time}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Thermometer className={cn(
                "h-3.5 w-3.5",
                isCool ? "text-cool" : "text-destructive"
              )} />
              <span className={cn(
                "text-sm font-medium",
                isCool ? "text-cool" : "text-destructive"
              )}>{data.temp}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Umbrella className={cn(
                "h-3.5 w-3.5",
                isCool ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-sm font-medium",
                isCool ? "text-primary" : "text-muted-foreground"
              )}>{data.shelter}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className={cn("h-3.5 w-3.5", comfortColor)} />
              <span className={cn("text-sm font-medium", comfortColor)}>
                {comfortScore}/100 {comfortLabel}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground">{data.description}</p>
        </div>

        {/* Selection indicator */}
        <div className={cn(
          "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
          isSelected && isCool && "bg-cool text-cool-foreground",
          isSelected && !isCool && "bg-destructive text-destructive-foreground",
          !isSelected && "border-2 border-border"
        )}>
          {isSelected && <Check className="h-3.5 w-3.5" />}
        </div>
      </div>
    </button>
  );
}
