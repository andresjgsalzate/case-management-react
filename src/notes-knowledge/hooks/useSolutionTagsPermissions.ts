import { useMemo } from 'react';
import { usePermissions } from '@/user-management/hooks/useUserProfile';

/**
 * Hook para manejar permisos específicos de Solution Tags
 */
export const useSolutionTagsPermissions = () => {
  const { userProfile, isAdmin, isSupervisor, isAuditor, hasPermission } = usePermissions();

  return useMemo(() => {
    if (!userProfile?.role?.permissions) {
      return {
        canViewTags: false,
        canCreateTags: false,
        canUpdateTags: false,
        canDeleteTags: false,
        canManageTags: false,
        canAccessTagsModule: false
      };
    }

    // Verificar permisos específicos usando los nuevos permisos de la BD
    const canViewTags = hasPermission('solution_tags', 'read') || isAuditor();
    const canCreateTags = hasPermission('solution_tags', 'create') && !isAuditor();
    const canUpdateTags = hasPermission('solution_tags', 'update') && !isAuditor();
    const canDeleteTags = hasPermission('solution_tags', 'delete') && !isAuditor();
    const canManageTags = hasPermission('solution_tags', 'manage') && !isAuditor();

    // Acceso al módulo si tiene cualquier permiso relacionado con tags
    const canAccessTagsModule = canViewTags || canCreateTags || canUpdateTags || 
                               canDeleteTags || canManageTags || isAuditor();

    return {
      canViewTags,
      canCreateTags,
      canUpdateTags,
      canDeleteTags,
      canManageTags,
      canAccessTagsModule
    };
  }, [userProfile, isAdmin, isSupervisor, isAuditor, hasPermission]);
};
