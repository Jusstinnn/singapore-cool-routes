import { useState, useEffect } from 'react';

interface WeatherData {
  temperature: number | null;
  uvIndex: number | null;
  isLoading: boolean;
}

export function useWeather(): WeatherData {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [uvIndex, setUvIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const [tempRes, uvRes] = await Promise.all([
          fetch('https://api-open.data.gov.sg/v2/real-time/api/air-temperature'),
          fetch('https://api-open.data.gov.sg/v2/real-time/api/uv')
        ]);

        const [tempData, uvData] = await Promise.all([
          tempRes.json(),
          uvRes.json()
        ]);

        // Get temperature (prioritize Paya Lebar station S06)
        const readings = tempData?.data?.readings?.[0]?.data || [];
        const payaLebar = readings.find((r: any) => r.stationId === 'S06');
        const temp = payaLebar?.value || readings[0]?.value || null;
        setTemperature(temp);

        // Get UV index (latest reading)
        const uvRecords = uvData?.data?.records?.[0]?.index || [];
        const latestUV = uvRecords[0]?.value ?? null;
        setUvIndex(latestUV);
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { temperature, uvIndex, isLoading };
}

// Calculate comfort score out of 100
export function calculateComfortScore(
  type: 'hot' | 'cool',
  temperature: number | null,
  uvIndex: number | null
): number {
  const baseTemp = temperature ?? 30;
  const baseUV = uvIndex ?? 5;
  
  // Shelter percentage (hot = 0%, cool = 90%)
  const shelterPercent = type === 'cool' ? 90 : 0;
  
  // Temperature score (ideal is 25°C, worse as it gets hotter)
  // 25°C = 100, 35°C = 0
  const tempScore = Math.max(0, Math.min(100, 100 - (baseTemp - 25) * 10));
  
  // UV score (0-2 = 100, 11+ = 0)
  const uvScore = Math.max(0, Math.min(100, 100 - baseUV * 9));
  
  // Shelter bonus (shelter reduces heat/UV impact significantly)
  const shelterMultiplier = 1 + (shelterPercent / 100) * 0.5;
  
  // Weighted comfort score
  const rawScore = (tempScore * 0.4 + uvScore * 0.3 + shelterPercent * 0.3) * (type === 'cool' ? shelterMultiplier : 1);
  
  return Math.round(Math.max(0, Math.min(100, rawScore)));
}
