import { Sun, AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TemperatureData {
  temperature: number;
  stationName: string;
  timestamp: string;
}

export function WeatherWidget() {
  const [tempData, setTempData] = useState<TemperatureData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTemperature() {
      try {
        const response = await fetch('https://api-open.data.gov.sg/v2/real-time/api/air-temperature');
        const data = await response.json();
        
        if (data.code === 0 && data.data?.readings?.[0]?.data) {
          // Find Paya Lebar station (S06) - closest to Punggol area
          // Or Pulau Ubin (S106) which is also nearby
          const readings = data.data.readings[0].data;
          const stations = data.data.stations;
          
          // Try to find Paya Lebar or use first available
          const payaLebar = readings.find((r: any) => r.stationId === 'S06');
          const reading = payaLebar || readings[0];
          
          const station = stations.find((s: any) => s.id === reading.stationId);
          
          setTempData({
            temperature: reading.value,
            stationName: station?.name || 'Singapore',
            timestamp: data.data.readings[0].timestamp,
          });
        }
      } catch (error) {
        console.error('Failed to fetch temperature:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTemperature();
    // Refresh every 5 minutes
    const interval = setInterval(fetchTemperature, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const temperature = tempData?.temperature ?? 33;
  // Estimate feels-like (simplified: add 3-5°C for humidity)
  const feelsLike = Math.round(temperature + 4);
  const isHot = temperature >= 30;

  return (
    <div className="absolute right-4 top-20 z-[1000] md:top-4">
      <div className="bg-card/95 backdrop-blur-xl rounded-xl shadow-lg border border-border/50 p-3">
        <div className="flex items-center gap-2">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${isHot ? 'bg-hot/10' : 'bg-primary/10'}`}>
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            ) : (
              <Sun className={`h-5 w-5 ${isHot ? 'text-hot' : 'text-primary'}`} />
            )}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground text-sm">
                {Math.round(temperature)}°C
              </span>
              <span className="text-xs text-muted-foreground">
                (Feels {feelsLike}°C)
              </span>
            </div>
            <div className="flex items-center gap-1">
              {isHot ? (
                <>
                  <AlertTriangle className="h-3 w-3 text-hot" />
                  <span className="text-xs font-medium text-hot">Hot Weather</span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Pleasant</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
