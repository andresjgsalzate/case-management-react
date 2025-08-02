/**
 * =================================================================
 * TIPOS: MÓDULO DE DOCUMENTACIÓN MEJORADO
 * =================================================================
 * Descripción: Tipos TypeScript para el sistema de documentación
 * con etiquetas reutilizables y validación de casos archivados
 * Versión: 2.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import { YooptaContentValue } from '@yoopta/editor';

// ===== TIPOS BASE =====

export type SolutionType = 'solution' | 'guide' | 'faq' | 'template' | 'procedure';
export type CaseReferenceType = 'active' | 'archived' | 'both';
export type TagCategory = 'priority' | 'technical' | 'type' | 'technology' | 'module' | 'custom';

// ===== ETIQUETAS REUTILIZABLES =====

export interface SolutionTag {
  id: string;
  name: string;
  description?: string;
  color: string;
  category: TagCategory;
  usage_count: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSolutionTagRequest {
  name: string;
  description?: string;
  color?: string;
  category: TagCategory;
}

export interface UpdateSolutionTagRequest {
  name?: string;
  description?: string;
  color?: string;
  category?: TagCategory;
  is_active?: boolean;
}

// ===== DOCUMENTOS DE SOLUCIÓN MEJORADOS =====

export interface SolutionDocument {
  id: string;
  title: string;
  content: YooptaContentValue;
  
  // Referencias a casos
  case_id?: string;
  archived_case_id?: string;
  case_reference_type: CaseReferenceType;
  
  // Metadatos básicos
  created_by: string;
  updated_by?: string;
  solution_type: SolutionType;
  difficulty_level: number; // 1-5
  
  // Metadatos extendidos
  complexity_notes?: string;
  prerequisites?: string;
  related_applications: string[]; // IDs de aplicaciones
  estimated_solution_time?: number; // minutos
  
  // Estado y versionado
  is_template: boolean;
  is_published: boolean;
  is_deprecated: boolean;
  deprecation_reason?: string;
  replacement_document_id?: string;
  version: number;
  
  // Métricas
  view_count: number;
  helpful_count: number;
  
  // Revisión
  last_reviewed_at?: string;
  last_reviewed_by?: string;
  
  // Etiquetas (populadas)
  tags?: SolutionTag[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateSolutionDocumentRequest {
  title: string;
  content: YooptaContentValue;
  case_id?: string;
  archived_case_id?: string;
  case_reference_type?: CaseReferenceType;
  solution_type?: SolutionType;
  difficulty_level?: number;
  complexity_notes?: string;
  prerequisites?: string;
  related_applications?: string[];
  estimated_solution_time?: number;
  is_template?: boolean;
  is_published?: boolean;
  tag_ids?: string[]; // IDs de etiquetas a asociar
}

export interface UpdateSolutionDocumentRequest {
  title?: string;
  content?: YooptaContentValue;
  case_id?: string;
  archived_case_id?: string;
  case_reference_type?: CaseReferenceType;
  solution_type?: SolutionType;
  difficulty_level?: number;
  complexity_notes?: string;
  prerequisites?: string;
  related_applications?: string[];
  estimated_solution_time?: number;
  is_template?: boolean;
  is_published?: boolean;
  is_deprecated?: boolean;
  deprecation_reason?: string;
  replacement_document_id?: string;
  last_reviewed_at?: string;
  tag_ids?: string[]; // IDs de etiquetas a asociar
}

// ===== FILTROS Y BÚSQUEDA =====

export interface DocumentSearchFilters {
  search?: string;
  solution_type?: SolutionType[];
  difficulty_level?: number[];
  case_reference_type?: CaseReferenceType[];
  tag_ids?: string[];
  is_published?: boolean;
  is_deprecated?: boolean;
  is_template?: boolean;
  created_by?: string;
  case_id?: string;
  related_applications?: string[];
  date_from?: string;
  date_to?: string;
}

export interface DocumentSearchResponse {
  documents: SolutionDocument[];
  pagination: {
    page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
}

// ===== MÉTRICAS Y ANALYTICS =====

export interface DocumentMetrics {
  total_documents: number;
  published_documents: number;
  deprecated_documents: number;
  documents_by_type: Record<SolutionType, number>;
  documents_by_difficulty: Record<number, number>;
  most_used_tags: Array<{
    tag: SolutionTag;
    usage_count: number;
  }>;
  recent_activity: Array<{
    document_id: string;
    document_title: string;
    action: 'created' | 'updated' | 'published' | 'deprecated';
    user_name: string;
    timestamp: string;
  }>;
}

// ===== VALIDACIONES =====

export interface CaseValidationResult {
  is_valid: boolean;
  case_exists: boolean;
  case_type: 'active' | 'archived' | null;
  case_data?: {
    id: string;
    numero_caso?: string;
    case_number?: string;
    descripcion?: string;
    classification?: string;
  };
  error_message?: string;
}

// ===== FEEDBACK Y RATING =====

export interface SolutionFeedback {
  id: string;
  document_id: string;
  user_id: string;
  rating?: number; // 1-5
  comment?: string;
  was_helpful: boolean;
  created_at: string;
}

export interface CreateFeedbackRequest {
  document_id: string;
  rating?: number;
  comment?: string;
  was_helpful: boolean;
}

// ===== RESPUESTAS DE API =====

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// ===== HOOKS Y ESTADO =====

export interface UseDocumentationState {
  documents: SolutionDocument[];
  tags: SolutionTag[];
  currentDocument?: SolutionDocument;
  filters: DocumentSearchFilters;
  isLoading: boolean;
  error?: string;
}

export interface DocumentFormData {
  title: string;
  content: YooptaContentValue;
  case_id?: string;
  archived_case_id?: string;
  case_reference_type: CaseReferenceType;
  solution_type: SolutionType;
  difficulty_level: number;
  complexity_notes: string;
  prerequisites: string;
  related_applications: string[];
  estimated_solution_time?: number;
  is_template: boolean;
  is_published: boolean;
  selected_tag_ids: string[];
}

// ===== CONSTANTES =====

export const SOLUTION_TYPES: Array<{ value: SolutionType; label: string; description: string }> = [
  { value: 'solution', label: 'Solución', description: 'Solución a un problema específico' },
  { value: 'guide', label: 'Guía', description: 'Guía paso a paso para realizar una tarea' },
  { value: 'faq', label: 'FAQ', description: 'Preguntas frecuentes y respuestas' },
  { value: 'template', label: 'Plantilla', description: 'Plantilla reutilizable para documentos' },
  { value: 'procedure', label: 'Procedimiento', description: 'Procedimiento formal o protocolo' },
];

export const DIFFICULTY_LEVELS: Array<{ value: number; label: string; description: string; color: string }> = [
  { value: 1, label: 'Muy Fácil', description: 'Solución muy simple, no requiere conocimientos técnicos', color: '#22C55E' },
  { value: 2, label: 'Fácil', description: 'Solución simple, conocimientos básicos requeridos', color: '#84CC16' },
  { value: 3, label: 'Medio', description: 'Solución moderada, conocimientos intermedios requeridos', color: '#EAB308' },
  { value: 4, label: 'Difícil', description: 'Solución compleja, conocimientos avanzados requeridos', color: '#F97316' },
  { value: 5, label: 'Muy Difícil', description: 'Solución muy compleja, conocimientos especializados requeridos', color: '#EF4444' },
];

export const TAG_CATEGORIES: Array<{ value: TagCategory; label: string; description: string }> = [
  { value: 'priority', label: 'Prioridad', description: 'Etiquetas de prioridad' },
  { value: 'technical', label: 'Técnico', description: 'Etiquetas técnicas por área' },
  { value: 'type', label: 'Tipo', description: 'Tipo de trabajo realizado' },
  { value: 'technology', label: 'Tecnología', description: 'Tecnologías específicas' },
  { value: 'module', label: 'Módulo', description: 'Módulos del sistema' },
  { value: 'custom', label: 'Personalizado', description: 'Etiquetas personalizadas' },
];
