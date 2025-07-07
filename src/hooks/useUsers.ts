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
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          email: userData.email,
          full_name: userData.fullName,
          role_id: userData.roleId,
          is_active: userData.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          role:roles (*)
        `)
        .single();

      if (error) {
        console.error('Error updating user:', error);
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
      // Primero eliminar el perfil
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Error deleting user profile:', profileError);
        throw profileError;
      }

      // Luego eliminar del auth (opcional, depende de la política de la empresa)
      // const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      // if (authError) {
      //   console.error('Error deleting auth user:', authError);
      //   throw authError;
      // }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('Error deleting user:', error);
    },
  });
};
