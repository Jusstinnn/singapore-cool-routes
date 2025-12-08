import { Sun, AlertTriangle, Loader2, Shield, Umbrella } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WeatherData {
  temperature: number;
  uvIndex: number;
  stationName: string;
}

function getUVAdvice(uvIndex: number): { level: string; advice: string; color: string } {
  if (uvIndex <= 2) {
    return { level: 'Low', advice: 'Safe to be outdoors', color: 'text-green-500' };
  } else if (uvIndex <= 5) {
    return { level: 'Moderate', advice: 'Seek shade during midday', color: 'text-yellow-500' };
  } else if (uvIndex <= 7) {
    return { level: 'High', advice: 'Stay sheltered!', color: 'text-orange-500' };
  } else if (uvIndex <= 10) {
    return { level: 'Very High', advice: 'Avoid sun exposure!', color: 'text-red-500' };
  } else {
    return { level: 'Extreme', advice: 'Stay indoors!', color: 'text-purple-500' };
  }
}

export function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        // Fetch both temperature and UV in parallel
        const [tempResponse, uvResponse] = await Promise.all([
          fetch('https://api-open.data.gov.sg/v2/real-time/api/air-temperature'),
          fetch('https://api-open.data.gov.sg/v2/real-time/api/uv'),
        ]);

        const [tempData, uvData] = await Promise.all([
          tempResponse.json(),
          uvResponse.json(),
        ]);

        let temperature = 33;
        let stationName = 'Singapore';

        if (tempData.code === 0 && tempData.data?.readings?.[0]?.data) {
          const readings = tempData.data.readings[0].data;
          const stations = tempData.data.stations;
          const payaLebar = readings.find((r: any) => r.stationId === 'S06');
          const reading = payaLebar || readings[0];
          const station = stations.find((s: any) => s.id === reading.stationId);
          temperature = reading.value;
          stationName = station?.name || 'Singapore';
        }

        // Get most recent UV index
        let uvIndex = 0;
        if (uvData.code === 0 && uvData.data?.records?.[0]?.index) {
          const uvReadings = uvData.data.records[0].index;
          // Get the most recent reading (first in array)
          uvIndex = uvReadings[0]?.value ?? 0;
        }

        setWeatherData({ temperature, uvIndex, stationName });
      } catch (error) {
        console.error('Failed to fetch weather data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const temperature = weatherData?.temperature ?? 33;
  const uvIndex = weatherData?.uvIndex ?? 0;
  const feelsLike = Math.round(temperature + 4);
  const isHot = temperature >= 30;
  const uvAdvice = getUVAdvice(uvIndex);

  return (
    <div className="absolute right-4 top-4 z-[1000]">
      <div className="bg-card/95 backdrop-blur-xl rounded-xl shadow-lg border border-border/50 p-3 space-y-2">
        {/* Temperature Row */}
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
          </div>
        </div>

        {/* UV Index Row */}
        <div className="flex items-center gap-2 pt-1 border-t border-border/30">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${uvIndex > 5 ? 'bg-hot/10' : 'bg-primary/10'}`}>
            {uvIndex > 5 ? (
              <AlertTriangle className={`h-5 w-5 ${uvAdvice.color}`} />
            ) : (
              <Shield className={`h-5 w-5 ${uvAdvice.color}`} />
            )}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground text-sm">
                UV {uvIndex}
              </span>
              <span className={`text-xs font-medium ${uvAdvice.color}`}>
                {uvAdvice.level}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Umbrella className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{uvAdvice.advice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
