import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { UserProfile, UserFormData } from '@/types';

// Hook para obtener todos los usuarios (solo admin)
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserProfile[]> => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          role:roles (
            id,
            name,
            description
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
          *,
          role:roles (*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        throw error;
      }

      // Mapear de snake_case a camelCase
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        roleId: data.role_id,
        isActive: data.is_active,
        lastLoginAt: data.last_login_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        role: data.role ? {
          id: data.role.id,
          name: data.role.name,
          description: data.role.description,
          isActive: data.role.is_active,
          createdAt: data.role.created_at,
          updatedAt: data.role.updated_at,
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
      // Usar función RPC para bypass de RLS
      const { data, error } = await supabase.rpc('admin_update_user', {
        user_id: id,
        user_email: userData.email!,
        user_full_name: userData.fullName!,
        user_role_id: userData.roleId!,
        is_active: userData.isActive ?? true
      });

      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }

      // Los datos ya vienen mapeados de la función RPC
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        roleId: data.role_id,
        isActive: data.is_active,
        lastLoginAt: data.last_login_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        role: data.role ? {
          id: data.role.id,
          name: data.role.name,
          description: data.role.description,
          isActive: data.role.is_active,
          createdAt: data.role.created_at,
          updatedAt: data.role.updated_at,
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
