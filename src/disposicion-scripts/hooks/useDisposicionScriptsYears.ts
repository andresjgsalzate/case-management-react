import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';

// Hook para obtener los años disponibles de las disposiciones existentes
export const useDisposicionScriptsYears = () => {
  return useQuery({
    queryKey: ['disposiciones-scripts-years'],
    queryFn: async (): Promise<number[]> => {
      const { data, error } = await supabase
        .from('disposiciones_scripts')
        .select('fecha')
        .order('fecha', { ascending: false });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        // Si no hay datos, devolver el año actual
        return [new Date().getFullYear()];
      }

      // Extraer años únicos de las fechas
      const years = Array.from(
        new Set(
          data.map(item => new Date(item.fecha).getFullYear())
        )
      ).sort((a, b) => b - a); // Ordenar descendente

      return years;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};
