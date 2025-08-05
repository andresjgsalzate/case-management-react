import { useMemo } from 'react';
import { usePermissions } from '@/user-management/hooks/useUserProfile';

/**
 * Hook para manejar permisos específicos de Solution Categories
 */
export const useSolutionCategoriesPermissions = () => {
  const { userProfile, isAdmin, isSupervisor, isAuditor, hasPermission } = usePermissions();

  return useMemo(() => {
    if (!userProfile?.role?.permissions) {
      return {
        canViewCategories: false,
        canCreateCategories: false,
        canUpdateCategories: false,
        canDeleteCategories: false,
        canManageCategories: false,
        canAccessCategoriesModule: false
      };
    }

    // Verificar permisos específicos usando los nuevos permisos de la BD
    const canViewCategories = hasPermission('solution_categories', 'read') || isAuditor();
    const canCreateCategories = hasPermission('solution_categories', 'create') && !isAuditor();
    const canUpdateCategories = hasPermission('solution_categories', 'update') && !isAuditor();
    const canDeleteCategories = hasPermission('solution_categories', 'delete') && !isAuditor();
    const canManageCategories = hasPermission('solution_categories', 'manage') && !isAuditor();

    // Acceso al módulo si tiene cualquier permiso relacionado con categorías
    const canAccessCategoriesModule = canViewCategories || canCreateCategories || canUpdateCategories || 
                                     canDeleteCategories || canManageCategories || isAuditor();

    return {
      canViewCategories,
      canCreateCategories,
      canUpdateCategories,
      canDeleteCategories,
      canManageCategories,
      canAccessCategoriesModule
    };
  }, [userProfile, isAdmin, isSupervisor, isAuditor, hasPermission]);
};
