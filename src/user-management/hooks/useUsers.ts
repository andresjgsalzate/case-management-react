import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { UserProfile, UserFormData } from '@/types';

// Hook para obtener todos los usuarios (solo admin)
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserProfile[]> => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          full_name,
          role_id,
          role_name,
          is_active,
          last_login_at,
          created_at,
          updated_at,
          role:roles(
            id,
            name,
            description,
            is_active,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      // Mapear de snake_case a camelCase
      return data.map((user: any) => ({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        roleId: user.role_id,
        roleName: user.role_name,
        isActive: user.is_active,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        role: user.role ? {
          id: user.role.id,
          name: user.role.name,
          description: user.role.description,
          isActive: user.role.is_active,
          createdAt: user.role.created_at,
          updatedAt: user.role.updated_at,
        } : undefined
      }));
    },
  });
};

// Hook para obtener un usuario específico
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: async (): Promise<UserProfile> => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          full_name,
          role_id,
          role_name,
          is_active,
          last_login_at,
          created_at,
          updated_at,
          role:roles(*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        throw error;
      }

      // Mapear de snake_case a camelCase
      const roleData = Array.isArray(data.role) ? data.role[0] : data.role;
      
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        roleId: data.role_id,
        roleName: data.role_name,
        isActive: data.is_active,
        lastLoginAt: data.last_login_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        role: roleData ? {
          id: roleData.id,
          name: roleData.name,
          description: roleData.description,
          isActive: roleData.is_active,
          createdAt: roleData.created_at,
          updatedAt: roleData.updated_at,
        } : undefined
      };
    },
    enabled: !!userId,
  });
};

// Hook para actualizar un usuario
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: Partial<UserFormData> }): Promise<UserProfile> => {
      // Usar la función SQL que garantiza la sincronización del role_name
      const { error: functionError } = await supabase
        .rpc('update_user_with_role_sync', {
          user_id: id,
          new_email: userData.email || null,
          new_full_name: userData.fullName || null,
          new_role_id: userData.roleId || null,
          new_is_active: userData.isActive ?? null
        });

      if (functionError) {
        console.error('Error updating user with role sync:', functionError);
        throw functionError;
      }

      // La función devuelve los datos básicos, ahora obtenemos los datos completos con relaciones
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          full_name,
          role_id,
          role_name,
          is_active,
          last_login_at,
          created_at,
          updated_at,
          role:roles(
            id,
            name,
            description,
            is_active,
            created_at,
            updated_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }

      // Mapear los datos
      const roleData = Array.isArray(data.role) ? data.role[0] : data.role;
      
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        roleId: data.role_id,
        roleName: data.role_name,
        isActive: data.is_active,
        lastLoginAt: data.last_login_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        role: roleData ? {
          id: roleData.id,
          name: roleData.name,
          description: roleData.description,
          isActive: roleData.is_active,
          createdAt: roleData.created_at,
          updatedAt: roleData.updated_at,
        } : undefined
      };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', id] });
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
    },
  });
};

// Hook para eliminar un usuario
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      // Usar función RPC para bypass de RLS
      const { error } = await supabase.rpc('admin_delete_user', {
        user_id: userId
      });

      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('Error deleting user:', error);
    },
  });
};
