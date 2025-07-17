import { useMemo } from 'react';
import { usePermissions } from './useUserProfile';

/**
 * Hook para manejar permisos específicos del módulo de Archivo
 * El auditor puede ver todo pero no puede modificar nada
 */
export const useArchivePermissions = () => {
  const { userProfile, isAdmin, isSupervisor, isAuditor, hasPermission } = usePermissions();

  return useMemo(() => {
    if (!userProfile?.role?.permissions) {
      return {
        canViewArchive: false,
        canArchiveItems: false,
        canRestoreItems: false,
        canDeletePermanently: false,
        canViewAllArchived: false,
        canExportArchive: false,
        canAccessArchiveModule: false
      };
    }

    // Verificar permisos específicos
    const canViewArchive = hasPermission('archive', 'view') || isAuditor();
    const canArchiveItems = hasPermission('archive', 'archive') && !isAuditor();
    const canRestoreItems = hasPermission('archive', 'restore') && !isAuditor();
    const canDeletePermanently = hasPermission('archive', 'delete') && !isAuditor();
    const canViewAllArchived = hasPermission('archive', 'view_all') || isAdmin() || isSupervisor() || isAuditor();
    const canExportArchive = hasPermission('archive', 'export') || isAuditor();

    // Acceso al módulo si tiene cualquier permiso relacionado con archivo
    const canAccessArchiveModule = canViewArchive || canArchiveItems || canRestoreItems || 
                                  canDeletePermanently || canViewAllArchived || isAuditor();

    return {
      canViewArchive,
      canArchiveItems,
      canRestoreItems,
      canDeletePermanently,
      canViewAllArchived,
      canExportArchive,
      canAccessArchiveModule
    };
  }, [userProfile, isAdmin, isSupervisor, isAuditor, hasPermission]);
};
