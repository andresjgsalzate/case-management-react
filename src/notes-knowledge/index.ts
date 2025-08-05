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

// Tipos
export type { DocumentType } from './types';
