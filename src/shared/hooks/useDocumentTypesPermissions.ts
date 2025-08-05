import { useMemo } from 'react';
import { useAdminPermissions } from '@/shared/hooks/useAdminPermissions';

/**
 * Hook específico para permisos del módulo Document Types
 * Maneja permisos con scopes: own, team, all
 */
export const useDocumentTypesPermissions = () => {
  const adminPermissions = useAdminPermissions();

  const permissions = useMemo(() => {
    return {
      // ================================================================
      // PERMISOS DE LECTURA (VER TIPOS DE DOCUMENTOS)
      // ================================================================
      canReadOwnDocumentTypes: adminPermissions.hasPermission('document_types.read_own'),
      canReadTeamDocumentTypes: adminPermissions.hasPermission('document_types.read_team'),
      canReadAllDocumentTypes: adminPermissions.hasPermission('document_types.read_all'),
      
      // ================================================================
      // PERMISOS DE CREACIÓN
      // ================================================================
      canCreateOwnDocumentTypes: adminPermissions.hasPermission('document_types.create_own'),
      canCreateTeamDocumentTypes: adminPermissions.hasPermission('document_types.create_team'),
      canCreateAllDocumentTypes: adminPermissions.hasPermission('document_types.create_all'),
      
      // ================================================================
      // PERMISOS DE ACTUALIZACIÓN
      // ================================================================
      canUpdateOwnDocumentTypes: adminPermissions.hasPermission('document_types.update_own'),
      canUpdateTeamDocumentTypes: adminPermissions.hasPermission('document_types.update_team'),
      canUpdateAllDocumentTypes: adminPermissions.hasPermission('document_types.update_all'),
      
      // ================================================================
      // PERMISOS DE ELIMINACIÓN
      // ================================================================
      canDeleteOwnDocumentTypes: adminPermissions.hasPermission('document_types.delete_own'),
      canDeleteTeamDocumentTypes: adminPermissions.hasPermission('document_types.delete_team'),
      canDeleteAllDocumentTypes: adminPermissions.hasPermission('document_types.delete_all'),
      
      // ================================================================
      // PERMISOS ADMINISTRATIVOS
      // ================================================================
      canAdminOwnDocumentTypes: adminPermissions.hasPermission('document_types.admin_own'),
      canAdminTeamDocumentTypes: adminPermissions.hasPermission('document_types.admin_team'),
      canAdminAllDocumentTypes: adminPermissions.hasPermission('document_types.admin_all'),
      
      // ================================================================
      // FUNCIONES DE CONVENIENCIA
      // ================================================================
      
      /**
       * Verifica si el usuario puede leer tipos de documentos en general
       */
      canReadDocumentTypes(): boolean {
        return adminPermissions.hasPermission('document_types.read_own') ||
               adminPermissions.hasPermission('document_types.read_team') ||
               adminPermissions.hasPermission('document_types.read_all');
      },
      
      /**
       * Verifica si el usuario puede crear tipos de documentos en general
       */
      canCreateDocumentTypes(): boolean {
        return adminPermissions.hasPermission('document_types.create_own') ||
               adminPermissions.hasPermission('document_types.create_team') ||
               adminPermissions.hasPermission('document_types.create_all');
      },
      
      /**
       * Verifica si el usuario puede actualizar tipos de documentos en general
       */
      canUpdateDocumentTypes(): boolean {
        return adminPermissions.hasPermission('document_types.update_own') ||
               adminPermissions.hasPermission('document_types.update_team') ||
               adminPermissions.hasPermission('document_types.update_all');
      },
      
      /**
       * Verifica si el usuario puede eliminar tipos de documentos en general
       */
      canDeleteDocumentTypes(): boolean {
        return adminPermissions.hasPermission('document_types.delete_own') ||
               adminPermissions.hasPermission('document_types.delete_team') ||
               adminPermissions.hasPermission('document_types.delete_all');
      },
      
      /**
       * Verifica si el usuario puede administrar tipos de documentos en general
       */
      canAdminDocumentTypes(): boolean {
        return adminPermissions.hasPermission('document_types.admin_own') ||
               adminPermissions.hasPermission('document_types.admin_team') ||
               adminPermissions.hasPermission('document_types.admin_all');
      },
      
      // ================================================================
      // FUNCIONES DE UTILIDAD PARA VERIFICAR SCOPES
      // ================================================================
      
      /**
       * Obtiene el scope más alto de lectura que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestReadScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('document_types.read_all')) return 'all';
        if (adminPermissions.hasPermission('document_types.read_team')) return 'team';
        if (adminPermissions.hasPermission('document_types.read_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de creación que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestCreateScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('document_types.create_all')) return 'all';
        if (adminPermissions.hasPermission('document_types.create_team')) return 'team';
        if (adminPermissions.hasPermission('document_types.create_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de actualización que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestUpdateScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('document_types.update_all')) return 'all';
        if (adminPermissions.hasPermission('document_types.update_team')) return 'team';
        if (adminPermissions.hasPermission('document_types.update_own')) return 'own';
        return null;
      },
      
      /**
       * Obtiene el scope más alto de eliminación que el usuario tiene
       * @returns 'all' | 'team' | 'own' | null
       */
      getHighestDeleteScope(): 'all' | 'team' | 'own' | null {
        if (adminPermissions.hasPermission('document_types.delete_all')) return 'all';
        if (adminPermissions.hasPermission('document_types.delete_team')) return 'team';
        if (adminPermissions.hasPermission('document_types.delete_own')) return 'own';
        return null;
      }
    };
  }, [adminPermissions]);

  return permissions;
};
