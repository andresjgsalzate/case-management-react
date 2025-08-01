import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
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
      // Usar función RPC para bypass de RLS
      const { data, error } = await supabase.rpc('admin_create_origen', {
        origen_name: origenData.nombre,
        origen_description: origenData.descripcion || '',
        is_active: origenData.activo ?? true
      });

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
      // Usar función RPC para bypass de RLS
      const { data: result, error } = await supabase.rpc('admin_update_origen', {
        origen_id: id,
        origen_name: data.nombre!,
        origen_description: data.descripcion || '',
        is_active: data.activo ?? true
      });

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
      // Usar función RPC para bypass de RLS
      const { error } = await supabase.rpc('admin_delete_origen', {
        origen_id: origenId
      });

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
      // Usar función RPC para bypass de RLS
      const { data, error } = await supabase.rpc('admin_create_aplicacion', {
        aplicacion_name: aplicacionData.nombre,
        aplicacion_description: aplicacionData.descripcion || '',
        is_active: aplicacionData.activo ?? true
      });

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
      // Usar función RPC para bypass de RLS
      const { data: result, error } = await supabase.rpc('admin_update_aplicacion', {
        aplicacion_id: id,
        aplicacion_name: data.nombre!,
        aplicacion_description: data.descripcion || '',
        is_active: data.activo ?? true
      });

      if (error) {
        console.error('Error updating aplicacion:', error);
        throw error;
      }

      // Mapear el resultado JSON
      return {
        id: result.id,
        nombre: result.nombre,
        descripcion: result.descripcion,
        activo: result.activo,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      };
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
      // Usar función RPC para bypass de RLS
      const { error } = await supabase.rpc('admin_delete_aplicacion', {
        aplicacion_id: aplicacionId
      });

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
