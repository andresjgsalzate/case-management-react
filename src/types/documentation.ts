/**
 * =================================================================
 * TIPOS TYPESCRIPT - MÓDULO DE DOCUMENTACIÓN TIPO NOTION
 * =================================================================
 * Descripción: Interfaces y tipos para el sistema de documentación
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import { Case, User } from './index';

// ================================================================
// INTERFACES PRINCIPALES
// ================================================================

/**
 * Bloque de contenido tipo Notion
 * Representa una unidad de contenido estructurado
 */
export interface ContentBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'code' | 'list' | 'image' | 'divider' | 'callout' | 'table';
  content: string;
  metadata?: {
    level?: number; // Para headings (1-6)
    language?: string; // Para code blocks
    listType?: 'bullet' | 'numbered'; // Para listas
    items?: Array<{
      id: string;
      content: string;
      level: number;
    }>; // Para elementos de lista
    calloutType?: 'info' | 'warning' | 'error' | 'success';
    imageUrl?: string; // Para imágenes
    imageAlt?: string;
    tableHeaders?: string[];
    tableRows?: string[][];
  };
  children?: ContentBlock[];
}

/**
 * Documento de solución principal
 */
export interface SolutionDocument {
  id: string;
  title: string;
  content: ContentBlock[];
  caseId?: string;
  createdBy: string;
  updatedBy?: string;
  tags: string[];
  category?: string;
  difficultyLevel: number;
  estimatedSolutionTime?: number;
  isTemplate: boolean;
  isPublished: boolean;
  version: number;
  viewCount: number;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  
  // Relaciones pobladas
  case?: Case;
  createdByUser?: User;
  updatedByUser?: User;
  feedback?: SolutionFeedback[];
  avgRating?: number;
  categoryInfo?: SolutionCategory;
}

/**
 * Versión histórica de documento
 */
export interface SolutionDocumentVersion {
  id: string;
  documentId: string;
  content: ContentBlock[];
  version: number;
  createdBy: string;
  changeSummary?: string;
  createdAt: string;
  createdByUser?: User;
}

/**
 * Feedback/calificación de documento
 */
export interface SolutionFeedback {
  id: string;
  documentId: string;
  userId: string;
  rating?: number;
  comment?: string;
  wasHelpful: boolean;
  createdAt: string;
  user?: User;
}

/**
 * Categoría de soluciones
 */
export interface SolutionCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  documentCount?: number;
}

// ================================================================
// TIPOS DE FORMULARIOS
// ================================================================

/**
 * Datos para crear/actualizar documento
 */
export interface SolutionDocumentFormData {
  title: string;
  content: ContentBlock[];
  caseId?: string;
  tags: string[];
  category?: string;
  difficultyLevel: number;
  estimatedSolutionTime?: number;
  isTemplate: boolean;
  isPublished: boolean;
}

/**
 * Datos para crear feedback
 */
export interface SolutionFeedbackFormData {
  rating?: number;
  comment?: string;
  wasHelpful: boolean;
}

/**
 * Datos para crear categoría
 */
export interface SolutionCategoryFormData {
  name: string;
  description?: string;
  color: string;
  icon: string;
  isActive: boolean;
}

// ================================================================
// TIPOS DE FILTROS Y BÚSQUEDA
// ================================================================

/**
 * Filtros para búsqueda de documentos
 */
export interface SolutionDocumentFilters {
  search?: string;
  category?: string;
  tags?: string[];
  difficultyLevel?: number[];
  isTemplate?: boolean;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  minRating?: number;
  caseId?: string;
}

/**
 * Opciones de ordenamiento
 */
export type SolutionDocumentSortBy = 
  | 'created_at'
  | 'updated_at'
  | 'title'
  | 'view_count'
  | 'avg_rating'
  | 'relevance';

export type SortOrder = 'asc' | 'desc';

/**
 * Parámetros de paginación
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: SolutionDocumentSortBy;
  sortOrder?: SortOrder;
}

// ================================================================
// ESTADÍSTICAS Y MÉTRICAS
// ================================================================

/**
 * Estadísticas del módulo de documentación
 */
export interface SolutionDocumentStats {
  totalDocuments: number;
  publishedDocuments: number;
  templatesCount: number;
  avgRating: number;
  totalViews: number;
  myDocuments: number;
  categoriesCount: number;
}

/**
 * Métricas de un documento específico
 */
export interface DocumentMetrics {
  viewCount: number;
  avgRating: number;
  feedbackCount: number;
  helpfulCount: number;
  versionCount: number;
  lastUpdated: string;
}

// ================================================================
// TIPOS DE RESPUESTA DE API
// ================================================================

/**
 * Respuesta paginada de documentos
 */
export interface PaginatedDocuments {
  data: SolutionDocument[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Resultado de búsqueda con relevancia
 */
export interface DocumentSearchResult extends SolutionDocument {
  relevanceScore: number;
}

// ================================================================
// TIPOS DE EDITOR
// ================================================================

/**
 * Configuración del editor de bloques
 */
export interface BlockEditorConfig {
  readOnly?: boolean;
  showToolbar?: boolean;
  allowedBlockTypes?: ContentBlock['type'][];
  maxBlocks?: number;
  placeholder?: string;
}

/**
 * Estado del editor
 */
export interface EditorState {
  activeBlockId?: string;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  wordCount: number;
  estimatedReadTime: number; // en minutos
}

// ================================================================
// TIPOS DE EVENTOS
// ================================================================

/**
 * Eventos del editor
 */
export type EditorEvent = 
  | { type: 'BLOCK_ADDED'; blockId: string; blockType: ContentBlock['type'] }
  | { type: 'BLOCK_DELETED'; blockId: string }
  | { type: 'BLOCK_MOVED'; blockId: string; newPosition: number }
  | { type: 'BLOCK_UPDATED'; blockId: string; content: string }
  | { type: 'CONTENT_SAVED'; documentId: string }
  | { type: 'CONTENT_AUTOSAVED'; timestamp: string };

// ================================================================
// TIPOS DE PLANTILLAS
// ================================================================

/**
 * Template predefinido
 */
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  content: ContentBlock[];
  tags: string[];
  estimatedTime?: number;
  difficulty: number;
}

/**
 * Variables de plantilla
 */
export interface TemplateVariable {
  name: string;
  placeholder: string;
  required: boolean;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[]; // Para tipo select
}

// ================================================================
// TIPOS DE VALIDACIÓN
// ================================================================

/**
 * Errores de validación
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

// ================================================================
// TIPOS DE CONFIGURACIÓN
// ================================================================

/**
 * Configuración del módulo de documentación
 */
export interface DocumentationModuleConfig {
  maxDocumentSize: number; // en bytes
  allowedImageFormats: string[];
  maxImageSize: number;
  enableVersioning: boolean;
  enableComments: boolean;
  enableRating: boolean;
  autoSaveInterval: number; // en milisegundos
  maxVersionsToKeep: number;
}

// ================================================================
// TIPOS DE PERMISOS
// ================================================================

/**
 * Permisos específicos de documentación
 */
export type DocumentationPermission = 
  | 'documentation:read'
  | 'documentation:create'
  | 'documentation:update'
  | 'documentation:delete'
  | 'documentation:manage'
  | 'documentation:feedback'
  | 'documentation:categories'
  | 'documentation:templates'
  | 'documentation:versions'
  | 'documentation:publish';

/**
 * Contexto de permisos para un documento
 */
export interface DocumentPermissionContext {
  canRead: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
  canComment: boolean;
  canManageVersions: boolean;
  isOwner: boolean;
  isAdmin: boolean;
}

// ================================================================
// TIPOS EXPORTADOS
// ================================================================

// Todos los tipos se exportan como named exports arriba
