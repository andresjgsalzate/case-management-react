import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Permission, PermissionFormData } from '@/types';
import toast from 'react-hot-toast';

// Hook para obtener todos los permisos
export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async (): Promise<Permission[]> => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('resource', { ascending: true })
        .order('action', { ascending: true });

      if (error) {
        console.error('Error fetching permissions:', error);
        throw error;
      }

      // Mapear de snake_case a camelCase
      return data.map((permission: any) => ({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        resource: permission.resource,
        action: permission.action,
        isActive: permission.is_active,
        createdAt: permission.created_at,
        updatedAt: permission.updated_at,
      }));
    },
  });
};

// Hook para obtener un permiso específico
export const usePermission = (permissionId: string) => {
  return useQuery({
    queryKey: ['permissions', permissionId],
    queryFn: async (): Promise<Permission> => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .eq('id', permissionId)
        .single();

      if (error) {
        console.error('Error fetching permission:', error);
        throw error;
      }

      // Mapear de snake_case a camelCase
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        resource: data.resource,
        action: data.action,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    },
    enabled: !!permissionId,
  });
};

// Hook para crear un nuevo permiso
export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permissionData: PermissionFormData): Promise<Permission> => {
      const { data, error } = await supabase
        .from('permissions')
        .insert({
          name: permissionData.name,
          description: permissionData.description,
          resource: permissionData.resource,
          action: permissionData.action,
          is_active: permissionData.isActive,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating permission:', error);
        throw error;
      }

      // Mapear de snake_case a camelCase
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        resource: data.resource,
        action: data.action,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Permiso creado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error creating permission:', error);
      toast.error('Error al crear permiso: ' + (error.message || 'Error desconocido'));
    },
  });
};

// Hook para actualizar un permiso
export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, permissionData }: { id: string; permissionData: Partial<PermissionFormData> }): Promise<Permission> => {
      const { data, error } = await supabase
        .from('permissions')
        .update({
          name: permissionData.name,
          description: permissionData.description,
          resource: permissionData.resource,
          action: permissionData.action,
          is_active: permissionData.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating permission:', error);
        throw error;
      }

      // Mapear de snake_case a camelCase
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        resource: data.resource,
        action: data.action,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permissions', id] });
      toast.success('Permiso actualizado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error updating permission:', error);
      toast.error('Error al actualizar permiso: ' + (error.message || 'Error desconocido'));
    },
  });
};

// Hook para eliminar un permiso
export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permissionId: string): Promise<void> => {
      // Primero eliminar las asignaciones de roles
      const { error: rolePermissionsError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('permission_id', permissionId);

      if (rolePermissionsError) {
        console.error('Error deleting role permissions:', rolePermissionsError);
        throw rolePermissionsError;
      }

      // Luego eliminar el permiso
      const { error: permissionError } = await supabase
        .from('permissions')
        .delete()
        .eq('id', permissionId);

      if (permissionError) {
        console.error('Error deleting permission:', permissionError);
        throw permissionError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] }); // También invalidar roles porque pueden tener estos permisos
      toast.success('Permiso eliminado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error deleting permission:', error);
      toast.error('Error al eliminar permiso: ' + (error.message || 'Error desconocido'));
    },
  });
};
