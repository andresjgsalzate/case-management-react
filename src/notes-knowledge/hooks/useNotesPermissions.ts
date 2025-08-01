import { useMemo } from 'react';
import { usePermissions } from '@/user-management/hooks/useUserProfile';

/**
 * Hook para manejar permisos específicos del módulo de Notas
 * Sigue el mismo patrón que otros módulos del sistema
 */
export const useNotesPermissions = () => {
  const { userProfile, isAdmin, isAuditor, hasPermission } = usePermissions();

  return useMemo(() => {
    if (!userProfile?.role?.permissions) {
      return {
        canViewNotes: false,
        canViewAllNotes: false,
        canCreateNotes: false,
        canEditNotes: false,
        canEditAllNotes: false,
        canDeleteNotes: false,
        canDeleteAllNotes: false,
        canAssignNotes: false,
        canArchiveNotes: false,
        canManageTags: false,
        canAssociateCases: false,
        canViewTeamNotes: false,
        canExportNotes: false,
        canAccessNotesModule: false
      };
    }

    // Verificar permisos específicos
    const canViewNotes = hasPermission('notes', 'view');
    const canViewAllNotes = hasPermission('notes', 'view_all') || isAdmin() || isAuditor();
    const canCreateNotes = hasPermission('notes', 'create') && !isAuditor();
    const canEditNotes = hasPermission('notes', 'edit') && !isAuditor();
    const canEditAllNotes = (hasPermission('notes', 'edit_all') || isAdmin()) && !isAuditor();
    const canDeleteNotes = hasPermission('notes', 'delete') && !isAuditor();
    const canDeleteAllNotes = (hasPermission('notes', 'delete_all') || isAdmin()) && !isAuditor();
    const canAssignNotes = hasPermission('notes', 'assign') && !isAuditor();
    const canArchiveNotes = hasPermission('notes', 'archive') && !isAuditor();
    const canManageTags = (hasPermission('notes', 'manage_tags') || isAdmin()) && !isAuditor();
    const canAssociateCases = hasPermission('notes', 'associate_cases') && !isAuditor();
    const canViewTeamNotes = hasPermission('notes', 'view_team') || isAuditor();
    const canExportNotes = hasPermission('notes', 'export') || isAuditor();

    // Acceso al módulo si tiene cualquier permiso relacionado con notas
    const canAccessNotesModule = canViewNotes || canCreateNotes || canEditNotes || 
                                canDeleteNotes || canViewAllNotes || canAssignNotes ||
                                canArchiveNotes || canViewTeamNotes || isAuditor();

    return {
      canViewNotes,
      canViewAllNotes,
      canCreateNotes,
      canEditNotes,
      canEditAllNotes,
      canDeleteNotes,
      canDeleteAllNotes,
      canAssignNotes,
      canArchiveNotes,
      canManageTags,
      canAssociateCases,
      canViewTeamNotes,
      canExportNotes,
      canAccessNotesModule
    };
  }, [userProfile, isAdmin, hasPermission]);
};
