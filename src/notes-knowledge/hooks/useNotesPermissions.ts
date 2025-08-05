import { useMemo, useRef } from 'react';
import { useAdminPermissions } from '@/shared/hooks/useAdminPermissions';

// Cache global para throttling de logs
let lastLogTime = 0;
const LOG_THROTTLE_MS = 3000; // Solo log cada 3 segundos
let hasLoggedSuccess = false; // Flag para evitar logs de éxito repetidos

export const useNotesPermissions = () => {
  const { hasPermission } = useAdminPermissions();
  const lastPermissionState = useRef<boolean | null>(null);

  return useMemo(() => {
    // Función auxiliar para verificar múltiples permisos con logging optimizado
    const hasAnyPermission = (permissions: string[]): boolean => {
      const result = permissions.some(permission => {
        const hasIt = hasPermission(permission);
        if (hasIt) {
          // Solo marcar una vez cuando encuentra un permiso exitoso
          if (!hasLoggedSuccess) {
            hasLoggedSuccess = true;
            // Reset después de 10 segundos
            setTimeout(() => { hasLoggedSuccess = false; }, 10000);
          }
        }
        return hasIt;
      });
      
      // Solo log de fallos si hay cambio de estado y no se ha loggeado recientemente
      const now = Date.now();
      if (!result && lastPermissionState.current !== false && (now - lastLogTime > LOG_THROTTLE_MS)) {
        lastLogTime = now;
        lastPermissionState.current = false;
        // Permission debugging removed for production
      } else if (result && lastPermissionState.current !== true) {
        lastPermissionState.current = true;
      }
      
      return result;
    };

    // ===== PERMISOS DE LECTURA =====
    const canReadOwnNotes = hasPermission('notes.read_own');
    const canReadTeamNotes = hasPermission('notes.read_team');
    const canReadAllNotes = hasPermission('notes.read_all');

    // ===== PERMISOS DE CREACIÓN =====
    const canCreateOwnNotes = hasPermission('notes.create_own');
    const canCreateTeamNotes = hasPermission('notes.create_team');
    const canCreateAllNotes = hasPermission('notes.create_all');

    // ===== PERMISOS DE ACTUALIZACIÓN =====
    const canUpdateOwnNotes = hasPermission('notes.update_own');
    const canUpdateTeamNotes = hasPermission('notes.update_team');
    const canUpdateAllNotes = hasPermission('notes.update_all');

    // ===== PERMISOS DE ELIMINACIÓN =====
    const canDeleteOwnNotes = hasPermission('notes.delete_own');
    const canDeleteTeamNotes = hasPermission('notes.delete_team');
    const canDeleteAllNotes = hasPermission('notes.delete_all');

    // ===== PERMISOS DE ARCHIVO =====
    const canArchiveOwnNotes = hasPermission('notes.archive_own');
    const canArchiveTeamNotes = hasPermission('notes.archive_team');
    const canArchiveAllNotes = hasPermission('notes.archive_all');

    // ===== PERMISOS DE ASIGNACIÓN =====
    const canAssignOwnNotes = hasPermission('notes.assign_own');
    const canAssignTeamNotes = hasPermission('notes.assign_team');
    const canAssignAllNotes = hasPermission('notes.assign_all');

    // ===== PERMISOS ESPECIALES =====
    const canManageOwnTags = hasPermission('notes.manage_tags_own');
    const canManageTeamTags = hasPermission('notes.manage_tags_team');
    const canManageAllTags = hasPermission('notes.manage_tags_all');

    const canExportOwnNotes = hasPermission('notes.export_own');
    const canExportTeamNotes = hasPermission('notes.export_team');
    const canExportAllNotes = hasPermission('notes.export_all');

    const canAssociateCasesOwn = hasPermission('notes.associate_cases_own');
    const canAssociateCasesTeam = hasPermission('notes.associate_cases_team');
    const canAssociateCasesAll = hasPermission('notes.associate_cases_all');

    // ===== FUNCIONES DE VERIFICACIÓN DE SCOPE =====
    const getHighestReadScope = (): 'own' | 'team' | 'all' | null => {
      if (canReadAllNotes) return 'all';
      if (canReadTeamNotes) return 'team';
      if (canReadOwnNotes) return 'own';
      return null;
    };

    const canReadScope = (scope: 'own' | 'team' | 'all'): boolean => {
      switch (scope) {
        case 'own': return canReadOwnNotes || canReadTeamNotes || canReadAllNotes;
        case 'team': return canReadTeamNotes || canReadAllNotes;
        case 'all': return canReadAllNotes;
        default: return false;
      }
    };

    // ===== VERIFICACIÓN DE ACCIONES EN NOTA ESPECÍFICA =====
    const canPerformActionOnNote = (
      noteOwnerId: string | null,
      currentUserId: string,
      action: 'update' | 'delete' | 'archive' | 'assign'
    ): boolean => {
      // Si no hay owner o usuario actual, denegar acceso
      if (!noteOwnerId || !currentUserId) return false;

      const isOwner = noteOwnerId === currentUserId;

      switch (action) {
        case 'update':
          return (isOwner && canUpdateOwnNotes) || 
                 canUpdateTeamNotes || 
                 canUpdateAllNotes;
        case 'delete':
          return (isOwner && canDeleteOwnNotes) || 
                 canDeleteTeamNotes || 
                 canDeleteAllNotes;
        case 'archive':
          return (isOwner && canArchiveOwnNotes) || 
                 canArchiveTeamNotes || 
                 canArchiveAllNotes;
        case 'assign':
          return (isOwner && canAssignOwnNotes) || 
                 canAssignTeamNotes || 
                 canAssignAllNotes;
        default:
          return false;
      }
    };

    // ===== VERIFICACIONES GENERALES =====
    const hasAnyNotesPermission = hasAnyPermission([
      'notes.read_own', 'notes.read_team', 'notes.read_all',
      'notes.create_own', 'notes.create_team', 'notes.create_all',
      'notes.update_own', 'notes.update_team', 'notes.update_all',
      'notes.delete_own', 'notes.delete_team', 'notes.delete_all',
      'notes.archive_own', 'notes.archive_team', 'notes.archive_all',
      'notes.assign_own', 'notes.assign_team', 'notes.assign_all',
      'notes.manage_tags_own', 'notes.manage_tags_team', 'notes.manage_tags_all',
      'notes.export_own', 'notes.export_team', 'notes.export_all',
      'notes.associate_cases_own', 'notes.associate_cases_team', 'notes.associate_cases_all'
    ]);

    const canAccessNotesModule = hasAnyNotesPermission;

    return {
      // Permisos de lectura
      canReadOwnNotes,
      canReadTeamNotes,
      canReadAllNotes,
      
      // Permisos de creación
      canCreateOwnNotes,
      canCreateTeamNotes,
      canCreateAllNotes,
      
      // Permisos de actualización
      canUpdateOwnNotes,
      canUpdateTeamNotes,
      canUpdateAllNotes,
      
      // Permisos de eliminación
      canDeleteOwnNotes,
      canDeleteTeamNotes,
      canDeleteAllNotes,
      
      // Permisos de archivo
      canArchiveOwnNotes,
      canArchiveTeamNotes,
      canArchiveAllNotes,
      
      // Permisos de asignación
      canAssignOwnNotes,
      canAssignTeamNotes,
      canAssignAllNotes,

      // Permisos especiales
      canManageOwnTags,
      canManageTeamTags,
      canManageAllTags,
      canExportOwnNotes,
      canExportTeamNotes,
      canExportAllNotes,
      canAssociateCasesOwn,
      canAssociateCasesTeam,
      canAssociateCasesAll,

      // Funciones de utilidad
      getHighestReadScope,
      canReadScope,
      canPerformActionOnNote,
      hasAnyNotesPermission,
      canAccessNotesModule,

      // Backwards compatibility (legacy names para compatibilidad con código existente)
      canViewNotes: hasAnyNotesPermission,
      canViewAllNotes: canReadAllNotes,
      canCreateNotes: canCreateOwnNotes || canCreateTeamNotes || canCreateAllNotes,
      canEditNotes: canUpdateOwnNotes || canUpdateTeamNotes || canUpdateAllNotes,
      canEditAllNotes: canUpdateAllNotes,
      canDeleteNotes: canDeleteOwnNotes || canDeleteTeamNotes || canDeleteAllNotes,
      canAssignNotes: canAssignOwnNotes || canAssignTeamNotes || canAssignAllNotes,
      canArchiveNotes: canArchiveOwnNotes || canArchiveTeamNotes || canArchiveAllNotes,
      canManageTags: canManageOwnTags || canManageTeamTags || canManageAllTags,
      canAssociateCases: canAssociateCasesOwn || canAssociateCasesTeam || canAssociateCasesAll,
      canViewTeamNotes: canReadTeamNotes || canReadAllNotes,
      canExportNotes: canExportOwnNotes || canExportTeamNotes || canExportAllNotes
    };
  }, [hasPermission]);
};
