import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Origen, Aplicacion, OrigenFormData, AplicacionFormData } from '@/types';

// Funciones de mapeo
const mapOrigenFromDB = (dbOrigen: any): Origen => ({
  id: dbOrigen.id,
  nombre: dbOrigen.nombre,
  descripcion: dbOrigen.descripcion,
  activo: dbOrigen.activo,
  createdAt: dbOrigen.created_at,
  updatedAt: dbOrigen.updated_at,
});

const mapAplicacionFromDB = (dbAplicacion: any): Aplicacion => ({
  id: dbAplicacion.id,
  nombre: dbAplicacion.nombre,
  descripcion: dbAplicacion.descripcion,
  activo: dbAplicacion.activo,
  createdAt: dbAplicacion.created_at,
  updatedAt: dbAplicacion.updated_at,
});

// Hook para obtener todos los orígenes (incluyendo inactivos para admin)
export const useOrigenes = (includeInactive = true) => {
  return useQuery({
    queryKey: ['origenes', includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('origenes')
        .select('*')
        .order('nombre');
      
      if (!includeInactive) {
        query = query.eq('activo', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data.map(mapOrigenFromDB);
    },
  });
};

// Hook para obtener todas las aplicaciones (incluyendo inactivas para admin)
export const useAplicaciones = (includeInactive = true) => {
  return useQuery({
    queryKey: ['aplicaciones', includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('aplicaciones')
        .select('*')
        .order('nombre');
      
      if (!includeInactive) {
        query = query.eq('activo', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data.map(mapAplicacionFromDB);
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
      return mapOrigenFromDB(data);
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
      return mapAplicacionFromDB(data);
    },
    enabled: !!id,
  });
};

// CRUD Operations for Orígenes

// Hook para crear un nuevo origen
export const useCreateOrigen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (origenData: OrigenFormData): Promise<Origen> => {
      const { data, error } = await supabase
        .from('origenes')
        .insert({
          nombre: origenData.nombre,
          descripcion: origenData.descripcion,
          activo: origenData.activo,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating origen:', error);
        throw error;
      }

      return mapOrigenFromDB(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['origenes'] });
    },
    onError: (error: any) => {
      console.error('Error creating origen:', error);
    },
  });
};

// Hook para actualizar un origen
export const useUpdateOrigen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OrigenFormData> }): Promise<Origen> => {
      const { data: result, error } = await supabase
        .from('origenes')
        .update({
          nombre: data.nombre,
          descripcion: data.descripcion,
          activo: data.activo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating origen:', error);
        throw error;
      }

      return mapOrigenFromDB(result);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['origenes'] });
      queryClient.invalidateQueries({ queryKey: ['origen', id] });
    },
    onError: (error: any) => {
      console.error('Error updating origen:', error);
    },
  });
};

// Hook para eliminar un origen
export const useDeleteOrigen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (origenId: string): Promise<void> => {
      const { error } = await supabase
        .from('origenes')
        .delete()
        .eq('id', origenId);

      if (error) {
        console.error('Error deleting origen:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['origenes'] });
    },
    onError: (error: any) => {
      console.error('Error deleting origen:', error);
    },
  });
};

// CRUD Operations for Aplicaciones

// Hook para crear una nueva aplicación
export const useCreateAplicacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (aplicacionData: AplicacionFormData): Promise<Aplicacion> => {
      const { data, error } = await supabase
        .from('aplicaciones')
        .insert({
          nombre: aplicacionData.nombre,
          descripcion: aplicacionData.descripcion,
          activo: aplicacionData.activo,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating aplicacion:', error);
        throw error;
      }

      return mapAplicacionFromDB(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aplicaciones'] });
    },
    onError: (error: any) => {
      console.error('Error creating aplicacion:', error);
    },
  });
};

// Hook para actualizar una aplicación
export const useUpdateAplicacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AplicacionFormData> }): Promise<Aplicacion> => {
      const { data: result, error } = await supabase
        .from('aplicaciones')
        .update({
          nombre: data.nombre,
          descripcion: data.descripcion,
          activo: data.activo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating aplicacion:', error);
        throw error;
      }

      return mapAplicacionFromDB(result);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['aplicaciones'] });
      queryClient.invalidateQueries({ queryKey: ['aplicacion', id] });
    },
    onError: (error: any) => {
      console.error('Error updating aplicacion:', error);
    },
  });
};

// Hook para eliminar una aplicación
export const useDeleteAplicacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (aplicacionId: string): Promise<void> => {
      const { error } = await supabase
        .from('aplicaciones')
        .delete()
        .eq('id', aplicacionId);

      if (error) {
        console.error('Error deleting aplicacion:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aplicaciones'] });
    },
    onError: (error: any) => {
      console.error('Error deleting aplicacion:', error);
    },
  });
};
