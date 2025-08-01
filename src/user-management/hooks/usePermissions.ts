import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { Permission, PermissionFormData } from '@/types';

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
      // Usar función RPC para bypass de RLS
      const { data, error } = await supabase.rpc('admin_create_permission', {
        permission_name: permissionData.name,
        permission_description: permissionData.description || '',
        permission_resource: permissionData.resource,
        permission_action: permissionData.action,
        is_active: permissionData.isActive ?? true
      });

      if (error) {
        console.error('Error creating permission:', error);
        throw error;
      }

      // Los datos ya vienen mapeados de la función RPC
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
    },
    onError: (error: any) => {
      console.error('Error creating permission:', error);
    },
  });
};

// Hook para actualizar un permiso
export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, permissionData }: { id: string; permissionData: Partial<PermissionFormData> }): Promise<Permission> => {
      // Usar función RPC para bypass de RLS
      const { data, error } = await supabase.rpc('admin_update_permission', {
        permission_id: id,
        permission_name: permissionData.name!,
        permission_description: permissionData.description || '',
        permission_resource: permissionData.resource!,
        permission_action: permissionData.action!,
        is_active: permissionData.isActive ?? true
      });

      if (error) {
        console.error('Error updating permission:', error);
        throw error;
      }

      // Los datos ya vienen mapeados de la función RPC
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
    },
    onError: (error: any) => {
      console.error('Error updating permission:', error);
    },
  });
};

// Hook para eliminar un permiso
export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permissionId: string): Promise<void> => {
      // Usar función RPC para bypass de RLS
      const { error } = await supabase.rpc('admin_delete_permission', {
        permission_id: permissionId
      });

      if (error) {
        console.error('Error deleting permission:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] }); // También invalidar roles porque pueden tener estos permisos
    },
    onError: (error: any) => {
      console.error('Error deleting permission:', error);
    },
  });
};
