import { useEffect, useRef, useState } from 'react';
import { useWind } from '@/hooks/use-wind';
import { Wind, Loader2 } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  age: number;
  maxAge: number;
}

export function WindOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const { speed, direction, isLoading } = useWind();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize and animate particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const particleCount = 150;
    const windSpeed = speed || 5; // Default to 5 km/h if no data
    const windDirection = direction || 45; // Default to NE if no data
    
    // Convert wind direction to radians (meteorological convention: 0 = N, 90 = E)
    const windRad = ((windDirection - 90) * Math.PI) / 180;

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          age: Math.random() * 100,
          maxAge: 80 + Math.random() * 40,
        });
      }
    };

    initParticles();

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Speed factor based on actual wind speed
      const speedFactor = Math.min(windSpeed / 10, 2) * 2;

      particlesRef.current.forEach((particle) => {
        // Update position based on wind direction
        particle.x += Math.cos(windRad) * speedFactor;
        particle.y += Math.sin(windRad) * speedFactor;
        particle.age++;

        // Reset particle if off screen or too old
        if (
          particle.x < 0 ||
          particle.x > dimensions.width ||
          particle.y < 0 ||
          particle.y > dimensions.height ||
          particle.age > particle.maxAge
        ) {
          // Respawn from the upwind edge
          const upwindAngle = windRad + Math.PI;
          if (Math.abs(Math.cos(upwindAngle)) > Math.abs(Math.sin(upwindAngle))) {
            // More horizontal wind
            particle.x = Math.cos(upwindAngle) > 0 ? 0 : dimensions.width;
            particle.y = Math.random() * dimensions.height;
          } else {
            // More vertical wind
            particle.x = Math.random() * dimensions.width;
            particle.y = Math.sin(upwindAngle) > 0 ? 0 : dimensions.height;
          }
          particle.age = 0;
          particle.maxAge = 80 + Math.random() * 40;
        }

        // Calculate opacity based on age (fade in and out)
        const fadeIn = Math.min(particle.age / 20, 1);
        const fadeOut = Math.max(0, 1 - (particle.age - particle.maxAge + 20) / 20);
        const opacity = Math.min(fadeIn, fadeOut) * 0.6;

        // Draw particle as a small line/streak
        const streakLength = 8 + speedFactor * 4;
        const startX = particle.x - Math.cos(windRad) * streakLength;
        const startY = particle.y - Math.sin(windRad) * streakLength;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(particle.x, particle.y);
        ctx.strokeStyle = `rgba(147, 197, 253, ${opacity})`;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, speed, direction]);

  // Get direction label
  const getDirectionLabel = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-[500]"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Wind info badge */}
      <div className="absolute top-32 left-[72px] z-[1000] bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border px-3 py-2">
        <div className="flex items-center gap-2 text-sm">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Wind className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">
                {speed !== null ? `${speed.toFixed(1)} km/h` : '--'}
              </span>
              <span className="text-muted-foreground">
                {direction !== null ? getDirectionLabel(direction) : '--'}
              </span>
              <div
                className="w-4 h-4 text-primary"
                style={{
                  transform: `rotate(${(direction || 0) + 90}deg)`,
                }}
              >
                →
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
