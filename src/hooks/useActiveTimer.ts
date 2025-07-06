import { useState, useEffect, useRef } from 'react';

interface UseActiveTimerProps {
  isActive: boolean;
  startedAt?: string;
  totalMinutes: number;
}

export function useActiveTimer({ isActive, startedAt, totalMinutes }: UseActiveTimerProps) {
  const [currentTime, setCurrentTime] = useState(totalMinutes);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && startedAt) {
      // Calcular el tiempo transcurrido desde que se inició
      const startTime = new Date(startedAt).getTime();
      const now = new Date().getTime();
      const elapsedMinutes = Math.floor((now - startTime) / (1000 * 60));
      
      // Establecer el tiempo actual como base + tiempo transcurrido
      const baseMinutes = totalMinutes || 0;
      setCurrentTime(baseMinutes + elapsedMinutes);

      // Crear intervalo para actualizar cada minuto
      intervalRef.current = setInterval(() => {
        const currentNow = new Date().getTime();
        const currentElapsedMinutes = Math.floor((currentNow - startTime) / (1000 * 60));
        setCurrentTime(baseMinutes + currentElapsedMinutes);
      }, 60000); // Actualizar cada minuto

      // También crear un intervalo más frecuente para los segundos (opcional)
      const secondInterval = setInterval(() => {
        const currentNow = new Date().getTime();
        const currentElapsedMinutes = Math.floor((currentNow - startTime) / (1000 * 60));
        setCurrentTime(baseMinutes + currentElapsedMinutes);
      }, 1000); // Actualizar cada segundo para mayor precisión visual

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        clearInterval(secondInterval);
      };
    } else {
      // Si no está activo, usar el tiempo total guardado
      setCurrentTime(totalMinutes);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isActive, startedAt, totalMinutes]);

  return currentTime;
}

// Hook para formatear tiempo con segundos en tiempo real
export function useRealTimeTimer({ isActive, startedAt }: { isActive: boolean; startedAt?: string }) {
  const [displayTime, setDisplayTime] = useState('0s');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && startedAt) {
      const startTime = new Date(startedAt).getTime();

      const updateTime = () => {
        const now = new Date().getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const hours = Math.floor(elapsedSeconds / 3600);
        const minutes = Math.floor((elapsedSeconds % 3600) / 60);
        const seconds = elapsedSeconds % 60;
        
        if (hours > 0) {
          setDisplayTime(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setDisplayTime(`${minutes}m ${seconds}s`);
        } else {
          setDisplayTime(`${seconds}s`);
        }
      };

      // Actualizar inmediatamente
      updateTime();

      // Actualizar cada segundo
      intervalRef.current = setInterval(updateTime, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      setDisplayTime('0s');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isActive, startedAt]);

  return displayTime;
}
