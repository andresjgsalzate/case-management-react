import { useMemo } from 'react';
import { useAdminPermissions } from '@/shared/hooks/useAdminPermissions';
import { useUserProfile } from '@/user-management/hooks/useUserProfile';

/**
 * Hook específico para permisos de rutas administrativas
 * Determina si un usuario puede acceder a rutas administrativas
 */
export const useAdminRoutePermissions = () => {
  const adminPermissions = useAdminPermissions();
  const { data: userProfile } = useUserProfile();

  const permissions = useMemo(() => {
    return {
      // ================================================================
      // VERIFICACIONES DE USUARIO ACTIVO
      // ================================================================
      
      /**
       * Verifica si el usuario está logueado y activo
       */
      isActiveUser: (): boolean => {
        return !!userProfile && userProfile.isActive;
      },
      
      /**
       * Verifica si el usuario es administrador
       */
      isAdmin: (): boolean => {
        return adminPermissions.isAdmin;
      },
      
      /**
       * Verifica si el usuario tiene algún permiso administrativo
       */
      hasAnyAdminPermission: (): boolean => {
        return adminPermissions.hasAnyAdminPermission;
      },
      
      /**
       * Verifica si el usuario puede acceder a rutas administrativas
       * CORREGIDO: Solo para admins con permisos reales (NO users.read_own)
       */
      canAccessAdminRoutes: (): boolean => {
        return adminPermissions.hasPermission('users.read_all') ||
               adminPermissions.hasPermission('users.admin_all') ||
               adminPermissions.hasPermission('config.read_all') ||
               adminPermissions.hasPermission('config.admin_all') ||
               adminPermissions.hasPermission('roles.read_all') ||
               adminPermissions.hasPermission('roles.admin_all');
      },
      
      /**
       * Verifica si el usuario puede acceder a rutas que requieren permisos específicos
       */
      canAccessPermissionedRoutes: (): boolean => {
        return adminPermissions.hasAnyAdminPermission;
      },
      
      // ================================================================
      // INFORMACIÓN DEL USUARIO
      // ================================================================
      userProfile,
      
      // ================================================================
      // PROPIEDADES HEREDADAS
      // ================================================================
      adminPermissions
    };
  }, [adminPermissions, userProfile]);

  return permissions;
};

export default useAdminRoutePermissions;
