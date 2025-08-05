import { useMemo, useRef } from 'react';
import { useAdminPermissions } from '@/shared/hooks/useAdminPermissions';
import { useUserProfile } from '@/user-management/hooks/useUserProfile';

// Cache global para throttling de logs
let lastLogTime = 0;
const LOG_THROTTLE_MS = 3000; // Solo log cada 3 segundos
let hasLoggedSuccess = false; // Flag para evitar logs de éxito repetidos

/**
 * Hook para gestionar permisos del módulo de Documentación
 * Basado en el patrón de scopes: own/team/all
 */
export const useDocumentationPermissions = () => {
  const { hasPermission } = useAdminPermissions();
  const { data: userProfile } = useUserProfile();
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
    const canReadOwnDocuments = hasPermission('documentation.read_own');
    const canReadTeamDocuments = hasPermission('documentation.read_team');
    const canReadAllDocuments = hasPermission('documentation.read_all');

    // ===== PERMISOS DE CREACIÓN =====
    const canCreateOwnDocuments = hasPermission('documentation.create_own');
    const canCreateTeamDocuments = hasPermission('documentation.create_team');
    const canCreateAllDocuments = hasPermission('documentation.create_all');

    // ===== PERMISOS DE ACTUALIZACIÓN =====
    const canUpdateOwnDocuments = hasPermission('documentation.update_own');
    const canUpdateTeamDocuments = hasPermission('documentation.update_team');
    const canUpdateAllDocuments = hasPermission('documentation.update_all');

    // ===== PERMISOS DE ELIMINACIÓN =====
    const canDeleteOwnDocuments = hasPermission('documentation.delete_own');
    const canDeleteTeamDocuments = hasPermission('documentation.delete_team');
    const canDeleteAllDocuments = hasPermission('documentation.delete_all');

    // ===== PERMISOS DE PUBLICACIÓN =====
    const canPublishOwnDocuments = hasPermission('documentation.publish_own');
    const canPublishTeamDocuments = hasPermission('documentation.publish_team');
    const canPublishAllDocuments = hasPermission('documentation.publish_all');

    // ===== PERMISOS DE ARCHIVO =====
    const canArchiveOwnDocuments = hasPermission('documentation.archive_own');
    const canArchiveTeamDocuments = hasPermission('documentation.archive_team');
    const canArchiveAllDocuments = hasPermission('documentation.archive_all');

    // ===== PERMISOS DE TEMPLATES =====
    const canManageOwnTemplates = hasPermission('documentation.template_own');
    const canManageTeamTemplates = hasPermission('documentation.template_team');
    const canManageAllTemplates = hasPermission('documentation.template_all');

    // ===== PERMISOS DE CATEGORÍAS =====
    const canManageOwnCategories = hasPermission('documentation.category_own');
    const canManageTeamCategories = hasPermission('documentation.category_team');
    const canManageAllCategories = hasPermission('documentation.category_all');

    // ===== PERMISOS DE FEEDBACK =====
    const canManageOwnFeedback = hasPermission('documentation.feedback_own');
    const canManageTeamFeedback = hasPermission('documentation.feedback_team');
    const canManageAllFeedback = hasPermission('documentation.feedback_all');

    // ===== PERMISOS DE EXPORTACIÓN =====
    const canExportOwnDocuments = hasPermission('documentation.export_own');
    const canExportTeamDocuments = hasPermission('documentation.export_team');
    const canExportAllDocuments = hasPermission('documentation.export_all');

    // ===== PERMISOS DE ANALYTICS =====
    const canViewOwnAnalytics = hasPermission('documentation.analytics_own');
    const canViewTeamAnalytics = hasPermission('documentation.analytics_team');
    const canViewAllAnalytics = hasPermission('documentation.analytics_all');

    // ===== FUNCIONES UTILITARIAS =====

    /**
     * Obtiene el scope más alto de lectura disponible para el usuario
     */
    const getHighestReadScope = (() => {
      if (canReadAllDocuments) return 'all';
      if (canReadTeamDocuments) return 'team';
      if (canReadOwnDocuments) return 'own';
      return null;
    })();

    /**
     * Obtiene el scope más alto de creación disponible para el usuario
     */
    const getHighestCreateScope = (() => {
      if (canCreateAllDocuments) return 'all';
      if (canCreateTeamDocuments) return 'team';
      if (canCreateOwnDocuments) return 'own';
      return null;
    })();

    /**
     * Verifica si puede realizar una acción específica sobre un documento
     */
    const canPerformActionOnDocument = (documentCreatedBy: string, currentUserId: string, action: 'read' | 'update' | 'delete' | 'publish' | 'archive') => {
      const isOwner = documentCreatedBy === currentUserId;
      
      switch (action) {
        case 'read':
          return canReadAllDocuments || (canReadTeamDocuments && true) || (canReadOwnDocuments && isOwner);
        case 'update':
          return canUpdateAllDocuments || (canUpdateTeamDocuments && true) || (canUpdateOwnDocuments && isOwner);
        case 'delete':
          return canDeleteAllDocuments || (canDeleteTeamDocuments && true) || (canDeleteOwnDocuments && isOwner);
        case 'publish':
          return canPublishAllDocuments || (canPublishTeamDocuments && true) || (canPublishOwnDocuments && isOwner);
        case 'archive':
          return canArchiveAllDocuments || (canArchiveTeamDocuments && true) || (canArchiveOwnDocuments && isOwner);
        default:
          return false;
      }
    };

    // ===== VERIFICACIÓN GENERAL DE ACCESO =====
    const hasAnyDocumentationPermission = hasAnyPermission([
      'documentation.read_own', 'documentation.read_team', 'documentation.read_all',
      'documentation.create_own', 'documentation.create_team', 'documentation.create_all',
      'documentation.update_own', 'documentation.update_team', 'documentation.update_all',
      'documentation.delete_own', 'documentation.delete_team', 'documentation.delete_all',
      'documentation.publish_own', 'documentation.publish_team', 'documentation.publish_all',
      'documentation.archive_own', 'documentation.archive_team', 'documentation.archive_all',
      'documentation.template_own', 'documentation.template_team', 'documentation.template_all',
      'documentation.category_own', 'documentation.category_team', 'documentation.category_all',
      'documentation.feedback_own', 'documentation.feedback_team', 'documentation.feedback_all',
      'documentation.export_own', 'documentation.export_team', 'documentation.export_all',
      'documentation.analytics_own', 'documentation.analytics_team', 'documentation.analytics_all'
    ]);

    // ===== COMPATIBILIDAD HACIA ATRÁS =====
    const canCreateDocuments = canCreateOwnDocuments || canCreateTeamDocuments || canCreateAllDocuments;
    const canAccessDocumentationModule = hasAnyDocumentationPermission;
    const canViewAllDocuments = canReadAllDocuments;

    return {
      // Estado general
      hasAnyDocumentationPermission,
      userProfile,

      // Permisos de lectura
      canReadOwnDocuments,
      canReadTeamDocuments,
      canReadAllDocuments,

      // Permisos de creación
      canCreateOwnDocuments,
      canCreateTeamDocuments,
      canCreateAllDocuments,

      // Permisos de actualización
      canUpdateOwnDocuments,
      canUpdateTeamDocuments,
      canUpdateAllDocuments,

      // Permisos de eliminación
      canDeleteOwnDocuments,
      canDeleteTeamDocuments,
      canDeleteAllDocuments,

      // Permisos de publicación
      canPublishOwnDocuments,
      canPublishTeamDocuments,
      canPublishAllDocuments,

      // Permisos de archivo
      canArchiveOwnDocuments,
      canArchiveTeamDocuments,
      canArchiveAllDocuments,

      // Permisos de templates
      canManageOwnTemplates,
      canManageTeamTemplates,
      canManageAllTemplates,

      // Permisos de categorías
      canManageOwnCategories,
      canManageTeamCategories,
      canManageAllCategories,

      // Permisos de feedback
      canManageOwnFeedback,
      canManageTeamFeedback,
      canManageAllFeedback,

      // Permisos de exportación
      canExportOwnDocuments,
      canExportTeamDocuments,
      canExportAllDocuments,

      // Permisos de analytics
      canViewOwnAnalytics,
      canViewTeamAnalytics,
      canViewAllAnalytics,

      // Funciones utilitarias
      getHighestReadScope,
      getHighestCreateScope,
      canPerformActionOnDocument,

      // Compatibilidad hacia atrás
      canCreateDocuments,
      canAccessDocumentationModule,
      canViewAllDocuments
    };
  }, [hasPermission, userProfile]);
};
