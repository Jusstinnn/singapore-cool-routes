import { Sun, AlertTriangle } from 'lucide-react';

export function WeatherWidget() {
  return (
    <div className="absolute right-4 top-[180px] z-[1000] md:top-4">
      <div className="bg-card/95 backdrop-blur-xl rounded-xl shadow-lg border border-border/50 p-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-hot/10 flex items-center justify-center">
            <Sun className="h-5 w-5 text-hot" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground text-sm">33°C</span>
              <span className="text-xs text-muted-foreground">(Feels 38°C)</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-hot" />
              <span className="text-xs font-medium text-hot">UV High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
