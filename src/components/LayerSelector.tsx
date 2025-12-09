import { useState } from 'react';
import { Layers, Map, Moon, Box } from 'lucide-react';

export type MapStyle = 'classic' | 'dark' | '3d';

interface LayerSelectorProps {
  currentStyle: MapStyle;
  onStyleChange: (style: MapStyle) => void;
}

const styles: { id: MapStyle; label: string; icon: React.ReactNode }[] = [
  { id: 'classic', label: 'Classic', icon: <Map className="w-4 h-4" /> },
  { id: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  { id: '3d', label: '3D', icon: <Box className="w-4 h-4" /> },
];

export function LayerSelector({ currentStyle, onStyleChange }: LayerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-20 left-6 z-[1000]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
        aria-label="Map layers"
      >
        <Layers className="w-5 h-5 text-foreground" />
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 z-[1100] bg-background backdrop-blur-sm rounded-lg shadow-lg border border-border overflow-hidden min-w-[120px]">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => {
                onStyleChange(style.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
                currentStyle === style.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {style.icon}
              <span>{style.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
