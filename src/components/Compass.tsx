import { Navigation2 } from 'lucide-react';

export function Compass() {
  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <div className="w-14 h-14 rounded-full bg-card/90 backdrop-blur-md border border-border/50 shadow-lg flex items-center justify-center">
        <div className="relative w-10 h-10">
          {/* Cardinal directions */}
          <span className="absolute top-0 left-1/2 -translate-x-1/2 text-xs font-bold text-destructive">
            N
          </span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground">
            S
          </span>
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
            W
          </span>
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
            E
          </span>
          
          {/* North arrow */}
          <Navigation2 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-destructive fill-destructive/20" 
          />
        </div>
      </div>
    </div>
  );
}
