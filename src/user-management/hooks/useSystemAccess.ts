import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/shared/hooks/useAuth';

interface SystemAccessResult {
  hasAccess: boolean;
  userRole: string | null;
  userEmail: string | null;
  isLoading: boolean;
  error: Error | null;
}

export const useSystemAccess = (): SystemAccessResult => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Función para crear el perfil del usuario automáticamente
  const createUserProfile = async (userId: string, email: string) => {
try {
      // Obtener el ID del rol 'user' (sin acceso)
      const { data: userRole, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'user')
        .single();

      if (roleError) {
        console.error('Error obteniendo rol user:', roleError);
        throw new Error('No se pudo obtener el rol por defecto');
      }

      // Crear el perfil del usuario
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: email,
          full_name: email.split('@')[0], // Nombre temporal basado en email
          role_id: userRole.id,
          is_active: false, // Inactivo hasta que un admin lo active
        })
        .select(`
          id,
          email,
          full_name,
          is_active,
          roles (
            name,
            description
          )
        `)
        .single();

      if (insertError) {
        console.error('Error creando perfil:', insertError);
        throw insertError;
      }

return newProfile;
    } catch (error) {
      console.error('💥 Error en createUserProfile:', error);
      throw error;
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['systemAccess', user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          hasAccess: false,
          userRole: null,
          userEmail: null,
        };
      }

      // Primero intentar obtener el perfil existente
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          full_name,
          is_active,
          roles (
            name,
            description
          )
        `)
        .eq('id', user.id)
        .single();

      let finalProfileData = profileData;

      // Si no existe el perfil, crearlo automáticamente
      if (profileError && profileError.code === 'PGRST116') {
try {
          finalProfileData = await createUserProfile(user.id, user.email || '');
          // Invalidar la cache para refrescar todos los datos
          queryClient.invalidateQueries({ queryKey: ['systemAccess'] });
        } catch (createError) {
          console.error('Error creando perfil automáticamente:', createError);
          throw createError;
        }
      } else if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw profileError;
      }

      // Verificar si el usuario tiene acceso al sistema (solo si tiene perfil)
      let hasAccess = false;
      if (finalProfileData) {
        const { data: accessData, error: accessError } = await supabase
          .rpc('has_system_access');

        if (accessError) {
          console.error('Error checking system access:', accessError);
          // No lanzar error aquí, continuar con hasAccess = false
        } else {
          hasAccess = accessData || false;
        }
      }

      return {
        hasAccess,
        userRole: (finalProfileData?.roles as any)?.name || null,
        userEmail: finalProfileData?.email || user.email || null,
        userProfile: finalProfileData,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // Cache por 2 minutos (reducido para mejor reactivity)
    retry: 1,
  });

  return {
    hasAccess: data?.hasAccess || false,
    userRole: data?.userRole || null,
    userEmail: data?.userEmail || null,
    isLoading,
    error: error as Error | null,
  };
};

// Hook adicional para verificar roles específicos
export const useHasRole = (requiredRole: string | string[]) => {
  const { userRole } = useSystemAccess();
  
  if (!userRole) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  
  return userRole === requiredRole;
};

// Hook para verificar permisos específicos
export const useHasPermission = (permissionName: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['permission', permissionName, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .rpc('has_case_control_permission', { permission_name: permissionName });

      if (error) {
        console.error('Error checking permission:', error);
        return false;
      }

      return data || false;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
};

// Constantes para los roles
export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  ANALISTA: 'analista',
  USER: 'user', // Sin acceso
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];
