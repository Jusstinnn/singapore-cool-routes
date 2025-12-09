import { useEffect, useState } from 'react';

interface WindData {
  speed: number | null;
  direction: number | null;
  isLoading: boolean;
}

export function useWind(): WindData {
  const [speed, setSpeed] = useState<number | null>(null);
  const [direction, setDirection] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWindData = async () => {
      try {
        const [speedRes, directionRes] = await Promise.all([
          fetch('https://api-open.data.gov.sg/v2/real-time/api/wind-speed'),
          fetch('https://api-open.data.gov.sg/v2/real-time/api/wind-direction'),
        ]);

        const speedData = await speedRes.json();
        const directionData = await directionRes.json();

        // Find Paya Lebar or any available station
        const speedReadings = speedData?.data?.readings?.[0]?.data || [];
        const directionReadings = directionData?.data?.readings?.[0]?.data || [];

        // Try to find Punggol/Sengkang area first, then fall back to any station
        const targetStations = ['S117', 'S116', 'S06', 'S104'];
        
        let speedReading = speedReadings.find((r: any) => targetStations.includes(r.stationId));
        if (!speedReading && speedReadings.length > 0) {
          speedReading = speedReadings[0];
        }

        let directionReading = directionReadings.find((r: any) => targetStations.includes(r.stationId));
        if (!directionReading && directionReadings.length > 0) {
          directionReading = directionReadings[0];
        }

        if (speedReading?.value !== undefined) {
          setSpeed(speedReading.value);
        }
        if (directionReading?.value !== undefined) {
          setDirection(directionReading.value);
        }
      } catch (error) {
        console.error('Error fetching wind data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWindData();
    const interval = setInterval(fetchWindData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { speed, direction, isLoading };
}
