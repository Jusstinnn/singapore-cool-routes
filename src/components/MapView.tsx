interface MapViewProps {
  showRoutes: boolean;
  selectedRoute: 'hot' | 'cool' | null;
}

export function MapView({ showRoutes, selectedRoute }: MapViewProps) {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-secondary/60">
      {/* Map placeholder with Singapore aesthetic */}
      <div className="absolute inset-0 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Mock routes when shown */}
      {showRoutes && (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {/* Hot route - dashed red */}
          <path 
            d="M 40 60 L 45 55 L 50 50 L 55 48 L 60 45"
            stroke="#ef4444"
            strokeWidth={selectedRoute === 'hot' ? '1.5' : '0.8'}
            strokeDasharray="2,2"
            fill="none"
            opacity={selectedRoute === 'cool' ? 0.4 : 0.9}
          />
          
          {/* Cool route - solid blue/teal */}
          <path 
            d="M 40 60 L 42 58 L 46 60 L 50 55 L 54 52 L 58 48 L 60 45"
            stroke="#06b6d4"
            strokeWidth={selectedRoute === 'cool' ? '2' : '1'}
            fill="none"
            opacity={selectedRoute === 'hot' ? 0.4 : 1}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Start marker */}
          <circle cx="40" cy="60" r="2" fill="#14b8a6" stroke="white" strokeWidth="0.5" />
          
          {/* End marker */}
          <circle cx="60" cy="45" r="2.5" fill="#0891b2" stroke="white" strokeWidth="0.5" />
        </svg>
      )}
      
      {/* Location labels */}
      {showRoutes && (
        <>
          <div className="absolute left-[38%] top-[58%] text-xs font-medium text-foreground bg-card/80 px-2 py-1 rounded shadow-sm">
            Dhoby Ghaut
          </div>
          <div className="absolute left-[55%] top-[40%] text-xs font-medium text-foreground bg-card/80 px-2 py-1 rounded shadow-sm">
            Plaza Singapura
          </div>
        </>
      )}
      
      {/* Singapore text */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-muted-foreground/30 text-lg font-semibold tracking-widest">
        SINGAPORE
      </div>
    </div>
  );
}
