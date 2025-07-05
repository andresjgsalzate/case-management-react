import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Origen, Aplicacion } from '@/types';

// Hook para obtener todos los orígenes activos
export const useOrigenes = () => {
  return useQuery({
    queryKey: ['origenes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('origenes')
        .select('*')
        .eq('activo', true)
        .order('nombre');
      
      if (error) throw error;
      return data as Origen[];
    },
  });
};

// Hook para obtener todas las aplicaciones activas
export const useAplicaciones = () => {
  return useQuery({
    queryKey: ['aplicaciones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aplicaciones')
        .select('*')
        .eq('activo', true)
        .order('nombre');
      
      if (error) throw error;
      return data as Aplicacion[];
    },
  });
};

// Hook para obtener un origen específico
export const useOrigen = (id: string) => {
  return useQuery({
    queryKey: ['origen', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('origenes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Origen;
    },
    enabled: !!id,
  });
};

// Hook para obtener una aplicación específica
export const useAplicacion = (id: string) => {
  return useQuery({
    queryKey: ['aplicacion', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aplicaciones')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Aplicacion;
    },
    enabled: !!id,
  });
};
