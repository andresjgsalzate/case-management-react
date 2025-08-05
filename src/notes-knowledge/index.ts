/**
 * =================================================================
 * MÓDULO DE DOCUMENTACIÓN - ÍNDICE PRINCIPAL
 * =================================================================
 * Descripción: Exportaciones principales del módulo de documentación
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

// Páginas principales
export { DocumentationPage } from './pages/DocumentationPage';

// Componentes principales
export { DocumentationEditor } from './components/documentation/editor/DocumentationEditor';
export { EnhancedDocumentationEditor } from './components/documentation/editor/EnhancedDocumentationEditor';
export { DocumentTypesAdmin } from './components/admin/DocumentTypesAdmin';

// Servicios
export { DocumentTypesService } from './services/documentTypesService';

// Hooks
export * from '../hooks/useSolutionDocuments';
export * from '../hooks/useSolutionFeedback';
export * from '../hooks/useSolutionCategories';
export { useDocumentTypes, useActiveDocumentTypes } from './hooks/useDocumentTypes';

// Hooks de notas (con permisos integrados)
export { useNotesWithPermissions } from './hooks/useNotesWithPermissions';
export { useNotesPermissions } from './hooks/useNotesPermissions';

// Hooks de documentación (con permisos integrados)
export { useDocumentationPermissions } from './hooks/useDocumentationPermissions';
export { useDocumentationWithPermissions } from './hooks/useDocumentationWithPermissions';

// Tipos
export type { DocumentType } from './types';
