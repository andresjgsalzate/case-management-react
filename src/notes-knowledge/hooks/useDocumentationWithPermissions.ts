import { useCallback, useMemo } from 'react';
import { useDocumentation } from './useDocumentation';
import { useDocumentationPermissions } from './useDocumentationPermissions';
import { useUserProfile } from '@/user-management/hooks/useUserProfile';
import { SolutionDocument, DocumentSearchFilters, CreateSolutionDocumentRequest } from '../types';

/**
 * Hook que combina operaciones CRUD de documentación con validación de permisos
 * Proporciona una interfaz unificada para gestionar documentos con controles de seguridad
 */
export const useDocumentationWithPermissions = () => {
  const { data: userProfile } = useUserProfile();
  const {
    documents,
    pagination,
    isLoading,
    searchDocuments: baseSearchDocuments,
    createDocument: baseCreateDocument,
    updateDocument: baseUpdateDocument,
    deleteDocument: baseDeleteDocument
  } = useDocumentation();

  const {
    canCreateOwnDocuments,
    canCreateTeamDocuments,
    canCreateAllDocuments,
    canReadOwnDocuments,
    canReadTeamDocuments,
    canReadAllDocuments,
    getHighestReadScope,
    canPerformActionOnDocument
  } = useDocumentationPermissions();

  /**
   * Obtiene documentos aplicando filtros basados en permisos
   */
  const fetchDocuments = useCallback(async (
    filters: DocumentSearchFilters = {},
    page: number = 1,
    limit: number = 20
  ) => {
    if (!userProfile?.id) {
      console.warn('⚠️ [DocumentationWithPermissions] Usuario no autenticado');
      return;
    }

    // Determinar el scope de lectura más alto disponible
    const readScope = getHighestReadScope;
    
    if (!readScope) {
      console.warn('⚠️ [DocumentationWithPermissions] Usuario sin permisos de lectura');
      return;
    }

    // Aplicar filtros de permisos a la búsqueda
    const permissionFilters: DocumentSearchFilters = { ...filters };
    
    // Si solo puede ver documentos propios, agregar filtro por creador
    if (readScope === 'own') {
      permissionFilters.created_by = userProfile.id;
    } else if (readScope === 'team') {
      // Filtro de equipo (implementar lógica específica si es necesario)
    }

    return baseSearchDocuments(permissionFilters, page, limit);
  }, [userProfile?.id, getHighestReadScope, baseSearchDocuments]);

  /**
   * Crea un nuevo documento con validación de permisos
   */
  const createDocument = useCallback(async (documentData: CreateSolutionDocumentRequest) => {
    if (!userProfile?.id) {
      console.error('Usuario no autenticado');
      return false;
    }

    // Verificar permisos de creación
    if (!canCreateOwnDocuments && !canCreateTeamDocuments && !canCreateAllDocuments) {
      console.error('No tienes permisos para crear documentos');
      return false;
    }

    const result = await baseCreateDocument(documentData);
    
    if (result) {
      // Refrescar la lista de documentos
      await fetchDocuments();
    }
    
    return result;
  }, [
    userProfile?.id,
    canCreateOwnDocuments,
    canCreateTeamDocuments,
    canCreateAllDocuments,
    baseCreateDocument,
    fetchDocuments
  ]);

  /**
   * Actualiza un documento con validación de permisos
   */
  const updateDocument = useCallback(async (
    documentId: string,
    documentData: Partial<SolutionDocument>,
    documentCreatedBy: string
  ) => {
    if (!userProfile?.id) {
      console.error('Usuario no autenticado');
      return false;
    }

    // Verificar permisos usando la función de validación
    const canUpdate = canPerformActionOnDocument(documentCreatedBy, userProfile.id, 'update');
    
    if (!canUpdate) {
      console.error('No tienes permisos para actualizar este documento');
      return false;
    }

    const result = await baseUpdateDocument(documentId, documentData);
    
    if (result) {
      // Refrescar la lista
      await fetchDocuments();
    }
    
    return result;
  }, [userProfile?.id, canPerformActionOnDocument, baseUpdateDocument, fetchDocuments]);

  /**
   * Elimina un documento con validación de permisos
   */
  const deleteDocument = useCallback(async (documentId: string, documentCreatedBy: string) => {
    if (!userProfile?.id) {
      console.error('Usuario no autenticado');
      return false;
    }

    // Verificar permisos de eliminación
    const canDelete = canPerformActionOnDocument(documentCreatedBy, userProfile.id, 'delete');
    
    if (!canDelete) {
      console.error('No tienes permisos para eliminar este documento');
      return false;
    }

    const result = await baseDeleteDocument(documentId);
    
    if (result) {
      // Refrescar la lista
      await fetchDocuments();
    }
    
    return result;
  }, [userProfile?.id, canPerformActionOnDocument, baseDeleteDocument, fetchDocuments]);

  /**
   * Documentos filtrados por permisos
   */
  const filteredDocuments = useMemo(() => {
    if (!userProfile?.id || !documents) return documents;

    // Si tiene permisos completos, devolver todos los documentos
    if (canReadAllDocuments) {
      return documents;
    }

    // Si solo puede ver documentos propios, filtrar
    if (canReadOwnDocuments && !canReadTeamDocuments) {
      return documents.filter(doc => doc.created_by === userProfile.id);
    }

    // Para team scope, devolver todos por ahora (se puede mejorar con lógica de equipo)
    return documents;
  }, [documents, userProfile?.id, canReadAllDocuments, canReadOwnDocuments, canReadTeamDocuments]);

  /**
   * Verifica si el usuario puede realizar una acción específica en un documento
   */
  const canUserPerformAction = useCallback((
    document: SolutionDocument,
    action: 'read' | 'update' | 'delete' | 'archive'
  ) => {
    if (!userProfile?.id) return false;
    return canPerformActionOnDocument(document.created_by, userProfile.id, action);
  }, [userProfile?.id, canPerformActionOnDocument]);

  return {
    // Datos
    documents: filteredDocuments,
    pagination,
    isLoading,

    // Operaciones CRUD con permisos
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,

    // Verificación de permisos
    canUserPerformAction,

    // Permisos individuales (para UI condicional)
    canCreateDocuments: canCreateOwnDocuments || canCreateTeamDocuments || canCreateAllDocuments,
    canReadScope: getHighestReadScope,

    // Estado del usuario
    userProfile
  };
};
