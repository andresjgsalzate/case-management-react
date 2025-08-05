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
  roleDescription: string | null;
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

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      if (!data) {
        // Auto-crear perfil para nuevos usuarios
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
            role_id: userRole?.id || null,  // Usar role_id en lugar de solo role_name
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
        
        return {
          id: newProfile.id,
          email: newProfile.email,
          fullName: newProfile.full_name,
          avatarUrl: newProfile.avatar_url,
          isActive: newProfile.is_active,
          roleId: newProfile.role_id,
          roleName: newProfile.role?.name || newProfile.role_name,
          roleDescription: newProfile.role?.description,
          createdAt: newProfile.created_at,
          updatedAt: newProfile.updated_at,
        };
      }

      // Mapear de snake_case a camelCase
      const userProfile = {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
        isActive: data.is_active,
        roleId: data.role_id,
        roleName: data.role?.name || data.role_name,  // Priorizar la relación role
        roleDescription: data.role?.description,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      return userProfile;
    },
    enabled: true,
    staleTime: 1000 * 60 * 1, // Cache por 1 minuto
  });
};

// Hook simplificado para funciones básicas (SIN PERMISOS COMPLEJOS)
export const usePermissions = () => {
  const { data: userProfile } = useUserProfile();

  // Solo usuarios logueados y activos
  const isActiveUser = (): boolean => {
    return !!userProfile && userProfile.isActive;
  };

  const isAdmin = (): boolean => {
    return userProfile?.roleName?.toLowerCase() === 'admin' || false;
  };

  const isSupervisor = (): boolean => {
    return userProfile?.roleName === 'supervisor' || false;
  };

  const isAuditor = (): boolean => {
    return userProfile?.roleName === 'auditor' || false;
  };

  // ================================================================
  // PERMISOS BASADOS EN ROLES - NO TODOS LOS USUARIOS TIENEN ACCESO
  // ================================================================
  
  const canAccessAdmin = (): boolean => {
    return isAdmin();
  };

  const canViewUsers = (): boolean => {
    return isAdmin();
  };

  const canViewRoles = (): boolean => {
    return isAdmin();
  };

  const canViewPermissions = (): boolean => {
    return isAdmin();
  };

  const canViewOrigenes = (): boolean => {
    return isAdmin();
  };

  const canViewAplicaciones = (): boolean => {
    return isAdmin();
  };

  const canViewCaseStatuses = (): boolean => {
    return isAdmin();
  };

  const canManageUsers = (): boolean => {
    return isAdmin();
  };

  const canManageRoles = (): boolean => {
    return isAdmin();
  };

  const canManagePermissions = (): boolean => {
    return isAdmin();
  };

  const canManageOrigenes = (): boolean => {
    return isAdmin();
  };

  const canManageAplicaciones = (): boolean => {
    return isAdmin();
  };

  const canCreateCaseStatuses = (): boolean => {
    return isAdmin();
  };

  const canUpdateCaseStatuses = (): boolean => {
    return isAdmin();
  };

  const canDeleteCaseStatuses = (): boolean => {
    return isAdmin();
  };

  const canManageCaseStatuses = (): boolean => {
    return isAdmin();
  };

  const canViewAllCases = (): boolean => {
    // Los admins pueden ver todos los casos, otros usuarios solo los suyos
    return isAdmin();
  };

  // Función de permiso genérica que verifica si es admin
  const hasPermission = (_resource: string, _action: string): boolean => {
    return isAdmin();
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
