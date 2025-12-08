import { Clock, Thermometer, Umbrella, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RouteCardProps {
  type: 'hot' | 'cool';
  isSelected: boolean;
  onSelect: () => void;
}

const routeData = {
  hot: {
    emoji: '🔥',
    label: 'Hot & Fast',
    time: '12 mins',
    temp: '32°C Exposure',
    shelter: '0% Sheltered',
    description: 'Fastest route via open roads',
  },
  cool: {
    emoji: '❄️',
    label: 'ShadeWalk',
    time: '15 mins',
    temp: '26°C Comfort',
    shelter: '90% Sheltered',
    description: 'Via Dhoby Ghaut Station & covered walkways',
  },
};

export function RouteCard({ type, isSelected, onSelect }: RouteCardProps) {
  const data = routeData[type];
  const isCool = type === 'cool';

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
          <div className="grid grid-cols-3 gap-2 mb-2">
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
