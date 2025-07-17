import { useMemo } from 'react';
import { usePermissions } from './useUserProfile';

/**
 * Hook para manejar permisos específicos del módulo de Notas
 * Sigue el mismo patrón que otros módulos del sistema
 */
export const useNotesPermissions = () => {
  const { userProfile, isAdmin, hasPermission } = usePermissions();

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
    const canViewAllNotes = hasPermission('notes', 'view_all') || isAdmin();
    const canCreateNotes = hasPermission('notes', 'create');
    const canEditNotes = hasPermission('notes', 'edit');
    const canEditAllNotes = hasPermission('notes', 'edit_all') || isAdmin();
    const canDeleteNotes = hasPermission('notes', 'delete');
    const canDeleteAllNotes = hasPermission('notes', 'delete_all') || isAdmin();
    const canAssignNotes = hasPermission('notes', 'assign');
    const canArchiveNotes = hasPermission('notes', 'archive');
    const canManageTags = hasPermission('notes', 'manage_tags') || isAdmin();
    const canAssociateCases = hasPermission('notes', 'associate_cases');
    const canViewTeamNotes = hasPermission('notes', 'view_team');
    const canExportNotes = hasPermission('notes', 'export');

    // Acceso al módulo si tiene cualquier permiso relacionado con notas
    const canAccessNotesModule = canViewNotes || canCreateNotes || canEditNotes || 
                                canDeleteNotes || canViewAllNotes || canAssignNotes ||
                                canArchiveNotes || canViewTeamNotes;

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
