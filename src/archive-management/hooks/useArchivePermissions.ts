import { useMemo } from 'react';
import { useAdminPermissions } from '@/shared/hooks/useAdminPermissions';

/**
 * Hook específico para permisos del módulo Archive Management
 * Maneja permisos con scopes: own, team, all
 */
export const useArchivePermissions = () => {
  const adminPermissions = useAdminPermissions();

  const permissions = useMemo(() => {
    return {
      // ================================================================
      // PERMISOS DE VISUALIZACIÓN (VER ELEMENTOS ARCHIVADOS)
      // ================================================================
      canViewOwnArchive: adminPermissions.hasPermission('archive.view_own'),
      canViewTeamArchive: adminPermissions.hasPermission('archive.view_team'),
      canViewAllArchive: adminPermissions.hasPermission('archive.view_all'),
      
      // ================================================================
      // PERMISOS DE RESTAURACIÓN
      // ================================================================
      canRestoreOwnArchive: adminPermissions.hasPermission('archive.restore_own'),
      canRestoreTeamArchive: adminPermissions.hasPermission('archive.restore_team'),
      canRestoreAllArchive: adminPermissions.hasPermission('archive.restore_all'),
      
      // ================================================================
      // PERMISOS DE ELIMINACIÓN PERMANENTE
      // ================================================================
      canDeleteOwnArchive: adminPermissions.hasPermission('archive.delete_own'),
      canDeleteTeamArchive: adminPermissions.hasPermission('archive.delete_team'),
      canDeleteAllArchive: adminPermissions.hasPermission('archive.delete_all'),
      
      // ================================================================
      // PERMISOS DE ANALYTICS
      // ================================================================
      canViewOwnAnalytics: adminPermissions.hasPermission('archive.analytics_own'),
      canViewTeamAnalytics: adminPermissions.hasPermission('archive.analytics_team'),
      canViewAllAnalytics: adminPermissions.hasPermission('archive.analytics_all'),
      
      // ================================================================
      // PERMISOS DE EXPORTACIÓN
      // ================================================================
      canExportOwnArchive: adminPermissions.hasPermission('archive.export_own'),
      canExportTeamArchive: adminPermissions.hasPermission('archive.export_team'),
      canExportAllArchive: adminPermissions.hasPermission('archive.export_all'),
      
      // ================================================================
      // FUNCIONES DE UTILIDAD PARA VERIFICAR SCOPES
      // ================================================================
      
      /**
       * Obtiene el scope más alto de visualización que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestViewScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('archive.view_all')) return 'all';
        if (adminPermissions.hasPermission('archive.view_team')) return 'team';
        if (adminPermissions.hasPermission('archive.view_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de restauración que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestRestoreScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('archive.restore_all')) return 'all';
        if (adminPermissions.hasPermission('archive.restore_team')) return 'team';
        if (adminPermissions.hasPermission('archive.restore_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de eliminación que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestDeleteScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('archive.delete_all')) return 'all';
        if (adminPermissions.hasPermission('archive.delete_team')) return 'team';
        if (adminPermissions.hasPermission('archive.delete_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de analytics que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestAnalyticsScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('archive.analytics_all')) return 'all';
        if (adminPermissions.hasPermission('archive.analytics_team')) return 'team';
        if (adminPermissions.hasPermission('archive.analytics_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de exportación que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestExportScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('archive.export_all')) return 'all';
        if (adminPermissions.hasPermission('archive.export_team')) return 'team';
        if (adminPermissions.hasPermission('archive.export_own')) return 'own';
        return null;
      },
      
      /**
       * Verifica si el usuario puede ver elementos archivados de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canViewScope(scope: 'own' | 'team' | 'all'): boolean {
        switch (scope) {
          case 'own':
            return adminPermissions.hasPermission('archive.view_own');
          case 'team':
            return adminPermissions.hasPermission('archive.view_team');
          case 'all':
            return adminPermissions.hasPermission('archive.view_all');
          default:
            return false;
        }
      },
      
      /**
       * Verifica si el usuario puede restaurar elementos archivados de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canRestoreScope(scope: 'own' | 'team' | 'all'): boolean {
        switch (scope) {
          case 'own':
            return adminPermissions.hasPermission('archive.restore_own');
          case 'team':
            return adminPermissions.hasPermission('archive.restore_team');
          case 'all':
            return adminPermissions.hasPermission('archive.restore_all');
          default:
            return false;
        }
      },
      
      /**
       * Verifica si el usuario puede eliminar elementos archivados de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canDeleteScope(scope: 'own' | 'team' | 'all'): boolean {
        switch (scope) {
          case 'own':
            return adminPermissions.hasPermission('archive.delete_own');
          case 'team':
            return adminPermissions.hasPermission('archive.delete_team');
          case 'all':
            return adminPermissions.hasPermission('archive.delete_all');
          default:
            return false;
        }
      },
      
      /**
       * Verifica si el usuario puede ver analytics de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canViewAnalyticsScope(scope: 'own' | 'team' | 'all'): boolean {
        switch (scope) {
          case 'own':
            return adminPermissions.hasPermission('archive.analytics_own');
          case 'team':
            return adminPermissions.hasPermission('archive.analytics_team');
          case 'all':
            return adminPermissions.hasPermission('archive.analytics_all');
          default:
            return false;
        }
      },
      
      /**
       * Verifica si el usuario puede exportar elementos archivados de un scope específico
       * @param scope - 'own', 'team', o 'all'
       */
      canExportScope(scope: 'own' | 'team' | 'all'): boolean {
        switch (scope) {
          case 'own':
            return adminPermissions.hasPermission('archive.export_own');
          case 'team':
            return adminPermissions.hasPermission('archive.export_team');
          case 'all':
            return adminPermissions.hasPermission('archive.export_all');
          default:
            return false;
        }
      },
      
      /**
       * Verifica si el usuario puede realizar una acción específica sobre un elemento archivado
       * @param archivedByUserId - ID del usuario que archivó el elemento
       * @param currentUserId - ID del usuario actual
       * @param action - 'view', 'restore', 'delete'
       */
      canPerformActionOnArchivedItem(
        archivedByUserId: string,
        currentUserId: string,
        action: 'view' | 'restore' | 'delete'
      ): boolean {
        if (!archivedByUserId || !currentUserId) return false;

        const isOwner = archivedByUserId === currentUserId;

        switch (action) {
          case 'view':
            return (isOwner && adminPermissions.hasPermission('archive.view_own')) ||
                   adminPermissions.hasPermission('archive.view_team') ||
                   adminPermissions.hasPermission('archive.view_all');
          case 'restore':
            return (isOwner && adminPermissions.hasPermission('archive.restore_own')) ||
                   adminPermissions.hasPermission('archive.restore_team') ||
                   adminPermissions.hasPermission('archive.restore_all');
          case 'delete':
            return (isOwner && adminPermissions.hasPermission('archive.delete_own')) ||
                   adminPermissions.hasPermission('archive.delete_team') ||
                   adminPermissions.hasPermission('archive.delete_all');
          default:
            return false;
        }
      },
      
      /**
       * Verifica si el usuario tiene algún permiso de archivo
       */
      hasAnyArchivePermission(): boolean {
        return adminPermissions.hasPermission('archive.view_own') ||
               adminPermissions.hasPermission('archive.view_team') ||
               adminPermissions.hasPermission('archive.view_all') ||
               adminPermissions.hasPermission('archive.restore_own') ||
               adminPermissions.hasPermission('archive.restore_team') ||
               adminPermissions.hasPermission('archive.restore_all') ||
               adminPermissions.hasPermission('archive.delete_own') ||
               adminPermissions.hasPermission('archive.delete_team') ||
               adminPermissions.hasPermission('archive.delete_all');
      },
      
      // ================================================================
      // FUNCIONES DE CONVENIENCIA PARA COMPATIBILIDAD
      // ================================================================
      
      // Acceso general al módulo
      canAccessArchive: () => adminPermissions.hasPermission('archive.view_own') || adminPermissions.hasPermission('archive.view_team') || adminPermissions.hasPermission('archive.view_all'),
      
      // Visualización
      canViewArchive: () => adminPermissions.hasPermission('archive.view_own') || adminPermissions.hasPermission('archive.view_team') || adminPermissions.hasPermission('archive.view_all'),
      canViewAllArchiveItems: () => adminPermissions.hasPermission('archive.view_all'),
      canViewOwnArchiveItems: () => adminPermissions.hasPermission('archive.view_own'),
      
      // Restauración
      canRestoreArchive: () => adminPermissions.hasPermission('archive.restore_own') || adminPermissions.hasPermission('archive.restore_team') || adminPermissions.hasPermission('archive.restore_all'),
      canRestoreAnyItem: () => adminPermissions.hasPermission('archive.restore_team') || adminPermissions.hasPermission('archive.restore_all'),
      
      // Eliminación
      canDeleteArchive: () => adminPermissions.hasPermission('archive.delete_own') || adminPermissions.hasPermission('archive.delete_team') || adminPermissions.hasPermission('archive.delete_all'),
      canDeleteAnyItem: () => adminPermissions.hasPermission('archive.delete_team') || adminPermissions.hasPermission('archive.delete_all'),
      
      // Analytics y exportación
      canViewArchiveAnalytics: () => adminPermissions.hasPermission('archive.analytics_own') || adminPermissions.hasPermission('archive.analytics_team') || adminPermissions.hasPermission('archive.analytics_all'),
      canExportArchive: () => adminPermissions.hasPermission('archive.export_own') || adminPermissions.hasPermission('archive.export_team') || adminPermissions.hasPermission('archive.export_all'),
      
      // Estado administrativo
      isAdmin: adminPermissions.isAdmin
    };
  }, [adminPermissions]);

  return permissions;
};

export default useArchivePermissions;
