import { Sun, AlertTriangle, Loader2, Shield, Umbrella, CloudRain, Cloud, Droplets } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WeatherData {
  temperature: number;
  uvIndex: number;
  stationName: string;
}

interface RainData {
  isRaining: boolean;
  forecast: string;
  likelihood: number;
  intensity: 'none' | 'light' | 'moderate' | 'heavy';
  validPeriod: string;
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

function parseRainForecast(forecast: string): RainData {
  const lowerForecast = forecast.toLowerCase();
  
  // Determine if it's raining and intensity
  let isRaining = false;
  let likelihood = 0;
  let intensity: 'none' | 'light' | 'moderate' | 'heavy' = 'none';
  
  if (lowerForecast.includes('thundery showers')) {
    isRaining = true;
    likelihood = 90;
    intensity = 'heavy';
  } else if (lowerForecast.includes('heavy') && lowerForecast.includes('rain')) {
    isRaining = true;
    likelihood = 95;
    intensity = 'heavy';
  } else if (lowerForecast.includes('showers') && !lowerForecast.includes('passing')) {
    isRaining = true;
    likelihood = 80;
    intensity = 'moderate';
  } else if (lowerForecast.includes('passing showers')) {
    isRaining = true;
    likelihood = 60;
    intensity = 'light';
  } else if (lowerForecast.includes('light rain') || lowerForecast.includes('drizzle')) {
    isRaining = true;
    likelihood = 70;
    intensity = 'light';
  } else if (lowerForecast.includes('cloudy')) {
    isRaining = false;
    likelihood = 20;
    intensity = 'none';
  } else if (lowerForecast.includes('fair') || lowerForecast.includes('sunny')) {
    isRaining = false;
    likelihood = 5;
    intensity = 'none';
  } else {
    isRaining = false;
    likelihood = 10;
    intensity = 'none';
  }
  
  return {
    isRaining,
    forecast,
    likelihood,
    intensity,
    validPeriod: '',
  };
}

function getIntensityInfo(intensity: 'none' | 'light' | 'moderate' | 'heavy'): { label: string; color: string } {
  switch (intensity) {
    case 'heavy':
      return { label: 'Heavy', color: 'text-red-500' };
    case 'moderate':
      return { label: 'Moderate', color: 'text-orange-500' };
    case 'light':
      return { label: 'Light', color: 'text-blue-400' };
    default:
      return { label: 'None', color: 'text-green-500' };
  }
}

export function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [rainData, setRainData] = useState<RainData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        // Fetch temperature, UV, and rain forecast in parallel
        const [tempResponse, uvResponse, forecastResponse] = await Promise.all([
          fetch('https://api-open.data.gov.sg/v2/real-time/api/air-temperature'),
          fetch('https://api-open.data.gov.sg/v2/real-time/api/uv'),
          fetch('https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast'),
        ]);

        const [tempData, uvData, forecastData] = await Promise.all([
          tempResponse.json(),
          uvResponse.json(),
          forecastResponse.json(),
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
          uvIndex = uvReadings[0]?.value ?? 0;
        }

        setWeatherData({ temperature, uvIndex, stationName });

        // Get rain forecast for Punggol area
        if (forecastData.code === 0 && forecastData.data?.items?.[0]) {
          const item = forecastData.data.items[0];
          const forecasts = item.forecasts;
          const validPeriod = item.valid_period?.text || '';
          
          // Find Punggol or nearby areas
          const punggolForecast = forecasts.find((f: any) => f.area === 'Punggol');
          const sengkangForecast = forecasts.find((f: any) => f.area === 'Sengkang');
          const forecast = punggolForecast || sengkangForecast || forecasts[0];
          
          if (forecast) {
            const parsed = parseRainForecast(forecast.forecast);
            setRainData({
              ...parsed,
              validPeriod,
            });
          }
        }
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
  const intensityInfo = rainData ? getIntensityInfo(rainData.intensity) : null;

  return (
    <div className="absolute right-4 top-4 z-[1000]">
      <div className="bg-card/95 backdrop-blur-xl rounded-xl shadow-lg border border-border/50 p-3 space-y-2">
        {/* Temperature Row */}
        <div className="flex items-center gap-2">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${rainData?.isRaining ? 'bg-blue-500/10' : isHot ? 'bg-hot/10' : 'bg-primary/10'}`}>
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            ) : rainData?.isRaining ? (
              <CloudRain className="h-5 w-5 text-blue-500" />
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
              {rainData?.isRaining && (
                <span className="text-xs text-blue-500 font-medium">• Raining</span>
              )}
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

        {/* Rain Forecast Row */}
        {rainData && (
          <div className="flex items-center gap-2 pt-1 border-t border-border/30">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${rainData.likelihood > 50 ? 'bg-blue-500/10' : 'bg-muted/50'}`}>
              {rainData.likelihood > 50 ? (
                <Droplets className="h-5 w-5 text-blue-500" />
              ) : (
                <Cloud className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="text-left flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground text-sm">
                  {rainData.likelihood}%
                </span>
                <span className="text-xs text-muted-foreground">chance</span>
                {intensityInfo && rainData.intensity !== 'none' && (
                  <span className={`text-xs font-medium ${intensityInfo.color}`}>
                    • {intensityInfo.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {rainData.validPeriod}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
