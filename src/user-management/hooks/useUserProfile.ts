import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';

// Tipo simplificado para UserProfile sin permisos complejos
interface SimpleUserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  roleId: string | null;
  roleName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// Hook principal para obtener el perfil del usuario logueado
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async (): Promise<SimpleUserProfile | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      if (!data) {
        // Auto-crear perfil para nuevos usuarios
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            role_name: 'user',
            is_active: true
          })
          .select('*')
          .single();
          
        if (createError) {
          console.error('Error creating user profile:', createError);
          throw createError;
        }
        
        return {
          id: newProfile.id,
          email: newProfile.email,
          fullName: newProfile.full_name,
          avatarUrl: newProfile.avatar_url,
          isActive: newProfile.is_active,
          roleId: newProfile.role_id,
          roleName: newProfile.role_name,
          createdAt: newProfile.created_at,
          updatedAt: newProfile.updated_at,
        };
      }

      // Mapear de snake_case a camelCase
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
        isActive: data.is_active,
        roleId: data.role_id,
        roleName: data.role_name,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
  });
};

// Hook simplificado para funciones básicas (SIN PERMISOS COMPLEJOS)
export const usePermissions = () => {
  const { data: userProfile } = useUserProfile();

  // TODOS los usuarios logueados y activos tienen acceso completo
  const isActiveUser = (): boolean => {
    return !!userProfile && userProfile.isActive;
  };

  const isAdmin = (): boolean => {
    // 🔥 TEMPORAL: Todos los usuarios activos son admin durante desarrollo
    return !!userProfile && userProfile.isActive;
    // return userProfile?.roleName === 'admin' || false;
  };

  const isSupervisor = (): boolean => {
    return userProfile?.roleName === 'supervisor' || false;
  };

  const isAuditor = (): boolean => {
    return userProfile?.roleName === 'auditor' || false;
  };

  // TODAS las funciones retornan TRUE para usuarios activos
  // Ya no hay sistema de permisos complejo
  const canAccessAdmin = (): boolean => {
    return isActiveUser();
  };

  const canViewUsers = (): boolean => {
    return isActiveUser();
  };

  const canViewRoles = (): boolean => {
    return isActiveUser();
  };

  const canViewPermissions = (): boolean => {
    return isActiveUser();
  };

  const canViewOrigenes = (): boolean => {
    return isActiveUser();
  };

  const canViewAplicaciones = (): boolean => {
    return isActiveUser();
  };

  const canViewCaseStatuses = (): boolean => {
    return isActiveUser();
  };

  const canManageUsers = (): boolean => {
    return isActiveUser();
  };

  const canManageRoles = (): boolean => {
    return isActiveUser();
  };

  const canManagePermissions = (): boolean => {
    return isActiveUser();
  };

  const canManageOrigenes = (): boolean => {
    return isActiveUser();
  };

  const canManageAplicaciones = (): boolean => {
    return isActiveUser();
  };

  const canCreateCaseStatuses = (): boolean => {
    return isActiveUser();
  };

  const canUpdateCaseStatuses = (): boolean => {
    return isActiveUser();
  };

  const canDeleteCaseStatuses = (): boolean => {
    return isActiveUser();
  };

  const canManageCaseStatuses = (): boolean => {
    return isActiveUser();
  };

  const canViewAllCases = (): boolean => {
    return isActiveUser();
  };

  // Función de permiso genérica que siempre retorna true para usuarios activos
  const hasPermission = (_resource: string, _action: string): boolean => {
    return isActiveUser();
  };

  return {
    userProfile,
    hasPermission,
    isAdmin,
    isSupervisor,
    isAuditor,
    isActiveUser,
    canAccessAdmin,
    // Funciones de visualización
    canViewUsers,
    canViewRoles,
    canViewPermissions,
    canViewOrigenes,
    canViewAplicaciones,
    canViewCaseStatuses,
    // Funciones de administración
    canManageUsers,
    canManageRoles,
    canManagePermissions,
    canManageOrigenes,
    canManageAplicaciones,
    canCreateCaseStatuses,
    canUpdateCaseStatuses,
    canDeleteCaseStatuses,
    canManageCaseStatuses,
    // Funciones específicas
    canViewAllCases,
  };
};
