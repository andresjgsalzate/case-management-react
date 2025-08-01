import { useState, useEffect } from 'react';

/**
 * Hook para manejar un contador en tiempo real del timer
 */
export function useTimerCounter(startTime: string | null, isActive: boolean) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isActive || !startTime) {
      setElapsedTime(0);
      return;
    }

    // Calcular tiempo inicial transcurrido
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const initialElapsed = Math.floor((now - start) / 1000);
    setElapsedTime(initialElapsed);

    // Actualizar cada segundo
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - start) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isActive]);

  // Formatear tiempo en HH:MM:SS
  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    elapsedTime,
    formattedTime: formatElapsedTime(elapsedTime)
  };
}
