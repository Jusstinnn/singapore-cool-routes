import { Wind } from 'lucide-react';

interface WindToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

export function WindToggle({ isActive, onToggle }: WindToggleProps) {
  return (
    <div className="absolute top-32 left-6 z-[1000]">
      <button
        onClick={onToggle}
        className={`w-10 h-10 rounded-lg shadow-lg border flex items-center justify-center transition-all ${
          isActive
            ? 'bg-primary text-primary-foreground border-primary shadow-glow-cool'
            : 'bg-background/95 backdrop-blur-sm border-border text-foreground hover:bg-muted'
        }`}
        aria-label="Toggle wind overlay"
        title="Wind patterns"
      >
        <Wind className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
      </button>
    </div>
  );
}
