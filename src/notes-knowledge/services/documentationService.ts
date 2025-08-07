/**
 * =================================================================
 * SERVICIO: DOCUMENTACIÓN MEJORADA
 * =================================================================
 * Descripción: Servicio para manejar documentos con validación 
 * de casos archivados y etiquetas reutilizables
 * Versión: 2.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import { supabase } from '@/shared/lib/supabase';
import { SolutionTagsService } from './tagsService';
import type {
  SolutionDocument,
  CreateSolutionDocumentRequest,
  UpdateSolutionDocumentRequest,
  DocumentSearchFilters,
  DocumentSearchResponse,
  CaseValidationResult,
  SolutionFeedback,
  CreateFeedbackRequest,
  DocumentMetrics,
} from '../types';

export class DocumentationService {

  // ===== FUNCIÓN AUXILIAR: OBTENER PERFIL DE USUARIO =====
  private static async getUserProfile(userId: string): Promise<{full_name?: string, email?: string} | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      return data;
    } catch (error) {
      return null;
    }
  }

  // ===== FUNCIÓN AUXILIAR: OBTENER INFORMACIÓN DEL CASO =====
  private static async getCaseInfo(caseId: string, isArchived: boolean = false): Promise<{numero_caso?: string, descripcion?: string} | null> {
    try {
      if (isArchived) {
        // Buscar en casos archivados
        const { data, error } = await supabase
          .from('archived_cases')
          .select('case_number, description')
          .eq('id', caseId)
          .single();
        
        if (error || !data) {
          return null;
        }
        
        return {
          numero_caso: data.case_number,
          descripcion: data.description
        };
      } else {
        // Buscar en casos activos
        const { data, error } = await supabase
          .from('cases')
          .select('numero_caso, descripcion')
          .eq('id', caseId)
          .single();
        
        if (error || !data) {
          return null;
        }
        
        return {
          numero_caso: data.numero_caso,
          descripcion: data.descripcion
        };
      }
    } catch (error) {
      return null;
    }
  }

  // ===== FUNCIÓN AUXILIAR: LIMPIAR DATOS =====
  private static cleanDataForDatabase(data: any): any {
    const cleaned = { ...data };
    
    // Convertir undefined a null para campos opcionales
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined) {
        cleaned[key] = null;
      }
    });
    
    return cleaned;
  }

  // ===== BUSCAR CASOS CON AUTOCOMPLETADO =====
  static async searchCases(searchTerm: string, type: 'active' | 'archived' | 'both' = 'both', limit: number = 10): Promise<Array<{
    id: string;
    numero_caso: string;
    descripcion: string;
    classification?: string;
    type: 'active' | 'archived';
  }>> {
    try {
      if (!searchTerm.trim()) {
        return [];
      }

      // Usar función RPC para buscar casos
      const { data, error } = await supabase.rpc('search_cases_autocomplete', {
        search_term: searchTerm.trim(),
        case_type: type,
        search_limit: limit
      });

      if (error) {
        console.error('Error searching cases:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception in searchCases:', error);
      return [];
    }
  }

  // ===== VALIDAR REFERENCIA DE CASO =====
  static async validateCaseReference(caseIdentifier: string, type: 'active' | 'archived' = 'active'): Promise<CaseValidationResult> {
    try {
      // Usar la función segura RPC para validación de casos
      const { data, error } = await supabase.rpc('validate_case_exists', {
        case_identifier: caseIdentifier,
        case_type: type
      });

      if (error) {
        return {
          is_valid: false,
          case_exists: false,
          case_type: null,
          error_message: `Error al validar caso: ${error.message}`,
        };
      }

      // Convertir la respuesta de la función RPC al formato esperado
      if (data.exists) {
        return {
          is_valid: true,
          case_exists: true,
          case_type: data.type as 'active' | 'archived',
          case_data: {
            id: data.id,
            numero_caso: data.number || data.case_number,
            descripcion: data.description,
            classification: data.classification,
          },
        };
      } else {
        return {
          is_valid: false,
          case_exists: false,
          case_type: null,
          error_message: data.error || 'El caso no existe',
        };
      }
    } catch (error) {
      return {
        is_valid: false,
        case_exists: false,
        case_type: null,
        error_message: `Error al validar caso: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      };
    }
  }

  // ===== CREAR DOCUMENTO =====
  static async createDocument(documentData: CreateSolutionDocumentRequest): Promise<SolutionDocument> {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('Usuario no autenticado');
    }

    // Validar referencia de caso si se proporciona
    if (documentData.case_id) {
      const validation = await this.validateCaseReference(documentData.case_id, 'active');
      if (!validation.is_valid) {
        throw new Error(validation.error_message || 'Caso no válido');
      }
    }

    if (documentData.archived_case_id) {
      const validation = await this.validateCaseReference(documentData.archived_case_id, 'archived');
      if (!validation.is_valid) {
        throw new Error(validation.error_message || 'Caso archivado no válido');
      }
    }

    // Extraer tag_ids de los datos
    const { tag_ids, ...docData } = documentData;

    // Limpiar datos para la base de datos
    const cleanedData = this.cleanDataForDatabase(docData);

    // Crear el documento
    const { data, error } = await supabase
      .from('solution_documents')
      .insert({
        ...cleanedData,
        created_by: userData.user.id,
        updated_by: userData.user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear documento: ${error.message}`);
    }

    // Asociar etiquetas si se proporcionaron
    if (tag_ids && tag_ids.length > 0) {
      await SolutionTagsService.addTagsToDocument(data.id, tag_ids);
    }

    // Obtener el documento completo con etiquetas
    return await this.getDocumentById(data.id);
  }

  // ===== ACTUALIZAR DOCUMENTO =====
  static async updateDocument(id: string, documentData: UpdateSolutionDocumentRequest): Promise<SolutionDocument> {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('Usuario no autenticado');
    }

    // Validar referencias de caso si se proporcionan
    if (documentData.case_id) {
      const validation = await this.validateCaseReference(documentData.case_id, 'active');
      if (!validation.is_valid) {
        throw new Error(validation.error_message || 'Caso no válido');
      }
    }

    if (documentData.archived_case_id) {
      const validation = await this.validateCaseReference(documentData.archived_case_id, 'archived');
      if (!validation.is_valid) {
        throw new Error(validation.error_message || 'Caso archivado no válido');
      }
    }

    // Extraer tag_ids de los datos
    const { tag_ids, ...docData } = documentData;

    // Usar la función SQL simplificada para actualizar solo contenido
    const { error } = await supabase.rpc('update_solution_document_final', {
      p_document_id: id,
      p_content: docData.content || []
    });

    if (error) {
      throw new Error(`Error al actualizar documento: ${error.message}`);
    }

    // Actualizar etiquetas si se proporcionaron
    if (tag_ids !== undefined) {
      await SolutionTagsService.addTagsToDocument(id, tag_ids);
    }

    // Obtener el documento completo con etiquetas
    return await this.getDocumentById(id);
  }

  // ===== OBTENER DOCUMENTO POR ID =====
  static async getDocumentById(id: string): Promise<SolutionDocument> {
    const { data, error } = await supabase
      .from('solution_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new Error('Documento no encontrado');
    }

    // Obtener etiquetas del documento
    const tags = await SolutionTagsService.getDocumentTags(id);

    // Obtener perfil del usuario creador
    const userProfile = await this.getUserProfile(data.created_by);

    // Obtener información del caso si existe
    let caseInfo = null;
    if (data.case_id) {
      caseInfo = await this.getCaseInfo(data.case_id, false); // Caso activo
    } else if (data.archived_case_id) {
      caseInfo = await this.getCaseInfo(data.archived_case_id, true); // Caso archivado
    }

    return {
      ...data,
      tags,
      created_by_profile: userProfile,
      case_info: caseInfo // Agregar información del caso
    } as any; // Casting temporal mientras se actualiza la interface
  }

  // ===== BUSCAR DOCUMENTOS CON BÚSQUEDA AVANZADA =====
  static async searchDocuments(
    filters: DocumentSearchFilters,
    page: number = 1,
    perPage: number = 20
  ): Promise<DocumentSearchResponse> {
    const offset = (page - 1) * perPage;

    // Si hay término de búsqueda, usar la función avanzada de PostgreSQL
    if (filters.search && filters.search.trim()) {
      const { data, error } = await supabase.rpc('search_documents_full', {
        search_text: filters.search.trim(),
        category_filter: filters.solution_type?.[0] || null,
        limit_count: perPage * 10 // Obtener más resultados para filtrar después
      });

      if (error) {
        throw new Error(`Error en búsqueda avanzada: ${error.message}`);
      }

      // La función devuelve JSON, parseamos si es necesario
      const allResults = Array.isArray(data) ? data : (data ? JSON.parse(data) : []);
      
      // Procesar resultados para obtener etiquetas si no las tienen
      const processedResults = await Promise.all(
        allResults.map(async (doc: any) => {
          let tags = doc.tags;
          let userProfile = null;
          
          // Obtener etiquetas si no las tiene
          if (!tags || tags.length === 0) {
            tags = await SolutionTagsService.getDocumentTags(doc.id);
          }
          
          // Obtener perfil de usuario si no lo tiene
          if (!doc.created_by_name && doc.created_by) {
            userProfile = await this.getUserProfile(doc.created_by);
          }
          
          return { 
            ...doc, 
            tags,
            created_by_profile: userProfile || {
              full_name: doc.created_by_name,
              email: doc.created_by_email
            }
          };
        })
      );
      
      // Aplicar filtros adicionales
      const filteredResults = processedResults.filter((doc: any) => {
        if (filters.difficulty_level && filters.difficulty_level.length > 0 && !filters.difficulty_level.includes(doc.difficulty_level)) {
          return false;
        }
        if (filters.is_template !== undefined && doc.is_template !== filters.is_template) {
          return false;
        }
        return true;
      });

      const totalCount = filteredResults.length;
      const paginatedResults = filteredResults.slice(offset, offset + perPage);

      return {
        documents: paginatedResults,
        pagination: {
          page,
          per_page: perPage,
          total_count: totalCount,
          total_pages: Math.ceil(totalCount / perPage),
        },
      };
    }

    // Si no hay búsqueda, usar consulta tradicional optimizada
    let query = supabase
      .from('solution_documents')
      .select('*, solution_document_tags(solution_tags(*))', { count: 'exact' });

    // Aplicar filtros tradicionales
    if (filters.solution_type && filters.solution_type.length > 0) {
      query = query.in('solution_type', filters.solution_type);
    }

    if (filters.difficulty_level && filters.difficulty_level.length > 0) {
      query = query.in('difficulty_level', filters.difficulty_level);
    }

    if (filters.case_reference_type && filters.case_reference_type.length > 0) {
      query = query.in('case_reference_type', filters.case_reference_type);
    }

    if (filters.is_published !== undefined) {
      query = query.eq('is_published', filters.is_published);
    }

    if (filters.is_deprecated !== undefined) {
      query = query.eq('is_deprecated', filters.is_deprecated);
    }

    if (filters.is_template !== undefined) {
      query = query.eq('is_template', filters.is_template);
    }

    if (filters.created_by) {
      query = query.eq('created_by', filters.created_by);
    }

    if (filters.case_id) {
      query = query.eq('case_id', filters.case_id);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    // Si hay filtros de etiquetas, usar un filtro EXISTS
    if (filters.tag_ids && filters.tag_ids.length > 0) {
      // Primero obtener los IDs de documentos que tienen esas etiquetas
      const { data: documentIds } = await supabase
        .from('solution_document_tags')
        .select('document_id')
        .in('tag_id', filters.tag_ids);
      
      if (documentIds && documentIds.length > 0) {
        const ids = documentIds.map(item => item.document_id);
        query = query.in('id', ids);
      } else {
        // Si no hay documentos con esas etiquetas, devolver resultado vacío
        return {
          documents: [],
          pagination: {
            page,
            per_page: perPage,
            total_count: 0,
            total_pages: 0,
          },
        };
      }
    }

    // Paginación
    query = query
      .order('updated_at', { ascending: false })
      .range(offset, offset + perPage - 1);

    const { data, count, error } = await query;

    if (error) {
      throw new Error(`Error al buscar documentos: ${error.message}`);
    }

    // Procesar resultados para incluir etiquetas y perfiles de usuario
    const documents = await Promise.all(
      (data || []).map(async (doc: any) => {
        // Obtener etiquetas del documento
        const tags = await SolutionTagsService.getDocumentTags(doc.id);
        
        // Obtener perfil del usuario que creó el documento
        const userProfile = await this.getUserProfile(doc.created_by);
        
        return { 
          ...doc, 
          tags,
          created_by_profile: userProfile
        };
      })
    );

    return {
      documents,
      pagination: {
        page,
        per_page: perPage,
        total_count: count || 0,
        total_pages: Math.ceil((count || 0) / perPage),
      },
    };
  }

  // ===== ELIMINAR DOCUMENTO =====
  static async deleteDocument(id: string): Promise<void> {
    // Usar la función SQL que maneja eliminaciones en cascada correctamente
    const { error } = await supabase.rpc('delete_solution_document_final', {
      p_document_id: id
    });

    if (error) {
      console.error('Error eliminando documento:', error);
      throw new Error(`Error al eliminar documento: ${error.message}`);
    }
  }

  // ===== MARCAR COMO ÚTIL =====
  static async markAsHelpful(documentId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_helpful_count', {
      document_id: documentId,
    });

    if (error) {
      throw new Error(`Error al marcar como útil: ${error.message}`);
    }
  }

  // ===== INCREMENTAR CONTADOR DE VISTAS =====
  static async incrementViewCount(documentId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_view_count', {
      document_id: documentId,
    });

    if (error) {
      throw new Error(`Error al incrementar contador de vistas: ${error.message}`);
    }
  }

  // ===== CREAR FEEDBACK =====
  static async createFeedback(feedbackData: CreateFeedbackRequest): Promise<SolutionFeedback> {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await supabase
      .from('solution_feedback')
      .insert({
        ...feedbackData,
        user_id: userData.user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear feedback: ${error.message}`);
    }

    return data;
  }

  // ===== OBTENER MÉTRICAS =====
  static async getDocumentMetrics(): Promise<DocumentMetrics> {
    // Obtener estadísticas básicas
    const { data: stats, error } = await supabase.rpc('get_documentation_metrics');

    if (error) {
      throw new Error(`Error al obtener métricas: ${error.message}`);
    }

    // Obtener etiquetas más usadas
    const tagStats = await SolutionTagsService.getTagsStatistics();

    return {
      total_documents: stats?.total_documents || 0,
      published_documents: stats?.published_documents || 0,
      deprecated_documents: stats?.deprecated_documents || 0,
      documents_by_type: stats?.documents_by_type || {},
      documents_by_difficulty: stats?.documents_by_difficulty || {},
      most_used_tags: tagStats.most_used_tags,
      recent_activity: stats?.recent_activity || [],
    };
  }

  // ===== DEPRECAR DOCUMENTO =====
  static async deprecateDocument(
    id: string, 
    reason: string, 
    replacementId?: string
  ): Promise<SolutionDocument> {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('Usuario no autenticado');
    }

    const updateData: any = {
      is_deprecated: true,
      deprecation_reason: reason,
      updated_by: userData.user.id,
      updated_at: new Date().toISOString(),
    };

    if (replacementId) {
      updateData.replacement_document_id = replacementId;
    }

    const { error } = await supabase
      .from('solution_documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al deprecar documento: ${error.message}`);
    }

    return await this.getDocumentById(id);
  }

  // ===== OBTENER SUGERENCIAS DE BÚSQUEDA =====
  static async getSearchSuggestions(
    partialTerm: string,
    limit: number = 5
  ): Promise<Array<{ suggestion: string; frequency: number }>> {
    if (!partialTerm || partialTerm.trim().length < 2) {
      return [];
    }

    try {
      const { data, error } = await supabase.rpc('get_search_suggestions', {
        partial_term: partialTerm.trim(),
        suggestion_limit: limit
      });

      if (error) {
        console.warn('Error al obtener sugerencias:', error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Error al obtener sugerencias:', error);
      return [];
    }
  }

  // ===== BÚSQUEDA RÁPIDA CON FRAGMENTOS =====
  static async quickSearch(
    searchTerm: string,
    limit: number = 10
  ): Promise<Array<{
    id: string;
    title: string;
    matched_content: string;
    relevance_score: number;
    category: string;
  }>> {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    try {
      const { data, error } = await supabase.rpc('search_docs_v2', {
        search_text: searchTerm.trim()
      });

      if (error) {
        throw new Error(`Error en búsqueda rápida: ${error.message}`);
      }

      // La función devuelve JSON, parseamos si es necesario
      const results = Array.isArray(data) ? data : (data ? JSON.parse(data) : []);
      
      // Procesar resultados para incluir etiquetas y mapear datos
      const processedResults = await Promise.all(
        results.slice(0, limit).map(async (doc: any) => {
          let tags = doc.tags;
          if (!tags || tags.length === 0) {
            tags = await SolutionTagsService.getDocumentTags(doc.id);
          }
          
          return {
            id: doc.id,
            title: doc.title,
            matched_content: doc.matched_content || '',
            relevance_score: doc.relevance_score || 0,
            category: doc.solution_type || 'Sin categoría',
            tags: tags
          };
        })
      );

      return processedResults;
    } catch (error) {
      return [];
    }
  }

  // ===== OBTENER TEMPLATES DISPONIBLES =====
  static async getAvailableTemplates(): Promise<SolutionDocument[]> {
    try {
      const { data, error } = await supabase.rpc('get_available_templates');

      if (error) {
        console.error('Error getting templates:', error);
        throw new Error(`Error al obtener templates: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      // Procesar los resultados para incluir perfiles de usuario
      const processedTemplates = await Promise.all(
        data.map(async (template: any) => {
          // Obtener perfil del creador
          const createdByProfile = template.created_by 
            ? await this.getUserProfile(template.created_by)
            : null;

          return {
            ...template,
            created_by_profile: createdByProfile,
            tags: [] // Los templates no necesariamente tienen tags cargadas en esta función
          };
        })
      );

      return processedTemplates;
    } catch (error) {
      console.error('Error getting templates:', error);
      throw error;
    }
  }
}
