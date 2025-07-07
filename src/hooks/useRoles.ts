import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Role, RoleFormData } from '@/types';

// Hook para obtener todos los roles
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async (): Promise<Role[]> => {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          role_permissions (
            permission:permissions (*)
          ),
          user_profiles (count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }

      // Mapear de snake_case a camelCase
      return data.map((role: any) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isActive: role.is_active,
        createdAt: role.created_at,
        updatedAt: role.updated_at,
        permissions: role.role_permissions?.map((rp: any) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          resource: rp.permission.resource,
          action: rp.permission.action,
          isActive: rp.permission.is_active,
          createdAt: rp.permission.created_at,
          updatedAt: rp.permission.updated_at,
        })) || [],
        userCount: role.user_profiles?.[0]?.count || 0
      }));
    },
  });
};

// Hook para obtener un rol específico
export const useRole = (roleId: string) => {
  return useQuery({
    queryKey: ['roles', roleId],
    queryFn: async (): Promise<Role> => {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          role_permissions (
            permission:permissions (*)
          )
        `)
        .eq('id', roleId)
        .single();

      if (error) {
        console.error('Error fetching role:', error);
        throw error;
      }

      // Mapear de snake_case a camelCase
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        permissions: data.role_permissions?.map((rp: any) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          resource: rp.permission.resource,
          action: rp.permission.action,
          isActive: rp.permission.is_active,
          createdAt: rp.permission.created_at,
          updatedAt: rp.permission.updated_at,
        })) || []
      };
    },
    enabled: !!roleId,
  });
};

// Hook para crear un nuevo rol
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleData: RoleFormData): Promise<Role> => {
      // Crear el rol
      const { data: roleResult, error: roleError } = await supabase
        .from('roles')
        .insert({
          name: roleData.name,
          description: roleData.description,
          is_active: roleData.isActive,
        })
        .select()
        .single();

      if (roleError) {
        console.error('Error creating role:', roleError);
        throw roleError;
      }

      // Asignar permisos al rol
      if (roleData.permissionIds.length > 0) {
        const rolePermissions = roleData.permissionIds.map(permissionId => ({
          role_id: roleResult.id,
          permission_id: permissionId,
        }));

        const { error: permissionsError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);

        if (permissionsError) {
          console.error('Error assigning permissions to role:', permissionsError);
          throw permissionsError;
        }
      }

      // Obtener el rol completo con permisos
      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          role_permissions (
            permission:permissions (*)
          )
        `)
        .eq('id', roleResult.id)
        .single();

      if (error) {
        console.error('Error fetching created role:', error);
        throw error;
      }

      // Mapear de snake_case a camelCase
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        permissions: data.role_permissions?.map((rp: any) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          resource: rp.permission.resource,
          action: rp.permission.action,
          isActive: rp.permission.is_active,
          createdAt: rp.permission.created_at,
          updatedAt: rp.permission.updated_at,
        })) || []
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      console.error('Error creating role:', error);
    },
  });
};

// Hook para actualizar un rol
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, roleData }: { id: string; roleData: Partial<RoleFormData> }): Promise<Role> => {
      // Actualizar el rol
      const { error: roleError } = await supabase
        .from('roles')
        .update({
          name: roleData.name,
          description: roleData.description,
          is_active: roleData.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (roleError) {
        console.error('Error updating role:', roleError);
        throw roleError;
      }

      // Si se proporcionaron permisos, actualizar las asignaciones
      if (roleData.permissionIds) {
        // Eliminar permisos existentes
        const { error: deleteError } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', id);

        if (deleteError) {
          console.error('Error deleting existing role permissions:', deleteError);
          throw deleteError;
        }

        // Asignar nuevos permisos
        if (roleData.permissionIds.length > 0) {
          const rolePermissions = roleData.permissionIds.map(permissionId => ({
            role_id: id,
            permission_id: permissionId,
          }));

          const { error: permissionsError } = await supabase
            .from('role_permissions')
            .insert(rolePermissions);

          if (permissionsError) {
            console.error('Error assigning new permissions to role:', permissionsError);
            throw permissionsError;
          }
        }
      }

      // Obtener el rol completo con permisos
      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          role_permissions (
            permission:permissions (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching updated role:', error);
        throw error;
      }

      // Mapear de snake_case a camelCase
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        permissions: data.role_permissions?.map((rp: any) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          resource: rp.permission.resource,
          action: rp.permission.action,
          isActive: rp.permission.is_active,
          createdAt: rp.permission.created_at,
          updatedAt: rp.permission.updated_at,
        })) || []
      };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', id] });
    },
    onError: (error: any) => {
      console.error('Error updating role:', error);
    },
  });
};

// Hook para eliminar un rol
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string): Promise<void> => {
      // Eliminar permisos del rol primero
      const { error: permissionsError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId);

      if (permissionsError) {
        console.error('Error deleting role permissions:', permissionsError);
        throw permissionsError;
      }

      // Eliminar el rol
      const { error: roleError } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (roleError) {
        console.error('Error deleting role:', roleError);
        throw roleError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      console.error('Error deleting role:', error);
    },
  });
};
