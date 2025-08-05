import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/shared/hooks/useAuth';

interface SystemAccessResult {
  hasAccess: boolean;
  userRole: string | null;
  userEmail: string | null;
  isLoading: boolean;
  error: Error | null;
}

// Hook simplificado para verificar acceso al sistema
export const useSystemAccess = (): SystemAccessResult => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['systemAccess', user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          hasAccess: false,
          userRole: null,
          userEmail: null,
          userProfile: null,
        };
      }

      // Obtener perfil de usuario con información del rol
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          role:roles (
            id,
            name,
            description,
            is_active
          )
        `)
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw profileError;
      }

      // Si no existe perfil, crear uno por defecto
      let finalProfileData = profileData;
      if (!finalProfileData) {
        // Buscar el role_id del rol 'user' por defecto
        const { data: userRole } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'user')
          .single();

        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            role_id: userRole?.id || null,  // Usar role_id en lugar de role_name
            role_name: 'user',  // Mantener role_name para compatibilidad
            is_active: false  // ⚠️ CORREGIDO: Nuevos usuarios inactivos por defecto
          })
          .select(`
            *,
            role:roles (
              id,
              name,
              description,
              is_active
            )
          `)
          .single();
          
        if (createError) {
          console.error('Error creating user profile:', createError);
          throw createError;
        }
        
        finalProfileData = newProfile;
      }

      // Determinar el rol del usuario (priorizar la relación role sobre role_name)
      const userRole = finalProfileData?.role?.name || finalProfileData?.role_name || 'user';
      
      // Solo usuarios activos Y con rol diferente a 'user' tienen acceso
      const hasAccess = finalProfileData ? 
        (finalProfileData.is_active && userRole !== 'user') : false;

      return {
        hasAccess,
        userRole: userRole,
        userEmail: finalProfileData?.email || user.email || null,
        userProfile: finalProfileData,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // Cache por 2 minutos
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

// Hook simplificado para verificar roles específicos
export const useHasRole = (requiredRole: string | string[]) => {
  const { userRole } = useSystemAccess();
  
  if (!userRole) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  
  return userRole === requiredRole;
};

// Hook para verificar permisos - ahora siempre retorna true para usuarios activos
export const useHasPermission = (_permissionName: string) => {
  const { hasAccess } = useSystemAccess();

  return useQuery({
    queryKey: ['permission', _permissionName],
    queryFn: async () => {
      // Todos los usuarios activos tienen todos los permisos
      return hasAccess;
    },
    enabled: hasAccess,
    staleTime: 1000 * 60 * 5,
  });
};

// Constantes para los roles (simplificadas)
export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  ANALISTA: 'analista',
  USER: 'user',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];
