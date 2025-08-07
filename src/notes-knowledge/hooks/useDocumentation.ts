/**
 * =================================================================
 * HOOK: DOCUMENTACIÓN MEJORADA
 * =================================================================
 * Descripción: Hook para manejar documentación con etiquetas
 * reutilizables y validación de casos archivados
 * Versión: 2.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DocumentationService } from '../services/documentationService';
import { SolutionTagsService } from '../services/tagsService';
import type {
  SolutionDocument,
  SolutionTag,
  DocumentSearchFilters,
  CreateSolutionDocumentRequest,
  UpdateSolutionDocumentRequest,
  UseDocumentationState,
  CaseValidationResult,
} from '../types';

export const useDocumentation = () => {
  // ===== ESTADO =====
  const [state, setState] = useState<UseDocumentationState>({
    documents: [],
    tags: [],
    currentDocument: undefined,
    filters: {},
    isLoading: false,
    error: undefined,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 20,
    totalPages: 0,
    totalCount: 0,
  });

  // ===== CARGAR ETIQUETAS =====
  const loadTags = useCallback(async () => {
    try {
      const tags = await SolutionTagsService.getAllTags();
      setState(prev => ({ ...prev, tags }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error al cargar etiquetas'
      }));
    }
  }, []);

  // ===== BUSCAR DOCUMENTOS =====
  const searchDocuments = useCallback(async (
    filters: DocumentSearchFilters = {},
    page: number = 1,
    perPage: number = 20
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await DocumentationService.searchDocuments(filters, page, perPage);

      setState(prev => ({
        ...prev,
        documents: response.documents,
        filters,
        isLoading: false,
      }));

      setPagination({
        page: response.pagination.page,
        perPage: response.pagination.per_page,
        totalPages: response.pagination.total_pages,
        totalCount: response.pagination.total_count,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al buscar documentos',
      }));
    }
  }, []);

  // ===== OBTENER DOCUMENTO POR ID =====
  const getDocument = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const document = await DocumentationService.getDocumentById(id);
      setState(prev => ({
        ...prev,
        currentDocument: document,
        isLoading: false,
      }));
      return document;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al obtener documento',
      }));
      return null;
    }
  }, []);

  // ===== CREAR DOCUMENTO =====
  const createDocument = useCallback(async (documentData: CreateSolutionDocumentRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const newDocument = await DocumentationService.createDocument(documentData);
      
      setState(prev => ({
        ...prev,
        documents: [newDocument, ...prev.documents],
        currentDocument: newDocument,
        isLoading: false,
      }));

      return newDocument;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al crear documento',
      }));
      return null;
    }
  }, []);

  // ===== ACTUALIZAR DOCUMENTO =====
  const updateDocument = useCallback(async (id: string, documentData: UpdateSolutionDocumentRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const updatedDocument = await DocumentationService.updateDocument(id, documentData);
      
      setState(prev => ({
        ...prev,
        documents: prev.documents.map(doc => 
          doc.id === id ? updatedDocument : doc
        ),
        currentDocument: prev.currentDocument?.id === id ? updatedDocument : prev.currentDocument,
        isLoading: false,
      }));

      return updatedDocument;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar documento',
      }));
      return null;
    }
  }, []);

  // ===== ELIMINAR DOCUMENTO =====
  const deleteDocument = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      await DocumentationService.deleteDocument(id);
      
      setState(prev => ({
        ...prev,
        documents: prev.documents.filter(doc => doc.id !== id),
        currentDocument: prev.currentDocument?.id === id ? undefined : prev.currentDocument,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al eliminar documento',
      }));
      return false;
    }
  }, []);

  // ===== BUSCAR CASOS CON AUTOCOMPLETADO =====
  const searchCases = useCallback(async (
    searchTerm: string, 
    type: 'active' | 'archived' | 'both' = 'both',
    limit: number = 10
  ) => {
    try {
      return await DocumentationService.searchCases(searchTerm, type, limit);
    } catch (error) {
      console.error('Error searching cases:', error);
      return [];
    }
  }, []);

  // ===== VALIDAR CASO =====
  const validateCase = useCallback(async (
    caseId: string, 
    type: 'active' | 'archived' = 'active'
  ): Promise<CaseValidationResult> => {
    try {
      return await DocumentationService.validateCaseReference(caseId, type);
    } catch (error) {
      return {
        is_valid: false,
        case_exists: false,
        case_type: null,
        error_message: error instanceof Error ? error.message : 'Error al validar caso',
      };
    }
  }, []);

  // ===== MARCAR COMO ÚTIL =====
  const markAsHelpful = useCallback(async (documentId: string) => {
    try {
      await DocumentationService.markAsHelpful(documentId);
      
      setState(prev => ({
        ...prev,
        documents: prev.documents.map(doc => 
          doc.id === documentId 
            ? { ...doc, helpful_count: doc.helpful_count + 1 }
            : doc
        ),
        currentDocument: prev.currentDocument?.id === documentId 
          ? { ...prev.currentDocument, helpful_count: prev.currentDocument.helpful_count + 1 }
          : prev.currentDocument,
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al marcar como útil',
      }));
      return false;
    }
  }, []);

  // ===== INCREMENTAR VISTA =====
  const incrementView = useCallback(async (documentId: string) => {
    try {
      await DocumentationService.incrementViewCount(documentId);
      
      setState(prev => ({
        ...prev,
        documents: prev.documents.map(doc => 
          doc.id === documentId 
            ? { ...doc, view_count: doc.view_count + 1 }
            : doc
        ),
        currentDocument: prev.currentDocument?.id === documentId 
          ? { ...prev.currentDocument, view_count: prev.currentDocument.view_count + 1 }
          : prev.currentDocument,
      }));
    } catch (error) {
      // Silenciosamente fallar - no es crítico
      console.warn('Error al incrementar vista:', error);
    }
  }, []);

  // ===== CARGAR DATOS INICIALES =====
  useEffect(() => {
    loadTags();
    searchDocuments();
  }, [loadTags, searchDocuments]);

  // ===== OBTENER TEMPLATES DISPONIBLES =====
  const getAvailableTemplates = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const templates = await DocumentationService.getAvailableTemplates();
      setState(prev => ({ ...prev, isLoading: false }));
      return templates;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al obtener templates',
      }));
      throw error;
    }
  }, []);

  // ===== VALORES COMPUTADOS =====
  const computedValues = useMemo(() => ({
    // Documentos filtrados localmente si es necesario
    filteredDocuments: state.documents,
    
    // Etiquetas por categoría
    tagsByCategory: state.tags.reduce((acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = [];
      }
      acc[tag.category].push(tag);
      return acc;
    }, {} as Record<string, SolutionTag[]>),
    
    // Estadísticas rápidas
    stats: {
      totalDocuments: pagination.totalCount,
      publishedDocuments: state.documents.filter(doc => doc.is_published).length,
      draftDocuments: state.documents.filter(doc => !doc.is_published).length,
      deprecatedDocuments: state.documents.filter(doc => doc.is_deprecated).length,
    },
  }), [state.documents, state.tags, pagination.totalCount]);

  // ===== RETORNO DEL HOOK =====
  return {
    // Estado
    ...state,
    pagination,
    
    // Valores computados
    ...computedValues,
    
    // Acciones
    searchDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    validateCase,
    searchCases,
    markAsHelpful,
    incrementView,
    loadTags,
    getAvailableTemplates,
    
    // Utilidades
    clearError: () => setState(prev => ({ ...prev, error: undefined })),
    setCurrentDocument: (document?: SolutionDocument) => 
      setState(prev => ({ ...prev, currentDocument: document })),
  };
};

// ===== HOOK PARA ETIQUETAS =====
export const useTags = () => {
  const [tags, setTags] = useState<SolutionTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const loadTags = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const tags = await SolutionTagsService.getAllTags();
      setTags(tags);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar etiquetas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTag = useCallback(async (tagData: { name: string; description?: string; color?: string; category: string }) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const newTag = await SolutionTagsService.createTag(tagData as any);
      setTags(prev => [newTag, ...prev]);
      return newTag;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear etiqueta');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTag = useCallback(async (id: string, tagData: { name?: string; description?: string; color?: string; category?: string }) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const updatedTag = await SolutionTagsService.updateTag(id, tagData as any);
      setTags(prev => prev.map(tag => tag.id === id ? updatedTag : tag));
      return updatedTag;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar etiqueta');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTag = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      await SolutionTagsService.deleteTag(id);
      setTags(prev => prev.filter(tag => tag.id !== id));
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar etiqueta');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  return {
    tags,
    isLoading,
    error,
    loadTags,
    createTag,
    updateTag,
    deleteTag,
    clearError: () => setError(undefined),
  };
};
