/**
 * =================================================================
 * HOOK PRINCIPAL - SOLUTION DOCUMENTS
 * =================================================================
 * Descripción: Hook principal para gestionar documentos de solución
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { 
  SolutionDocument, 
  SolutionDocumentFormData, 
  SolutionDocumentFilters,
  SolutionDocumentStats,
  PaginatedDocuments,
  PaginationParams
} from '@/types/documentation';

// ================================================================
// QUERY KEYS
// ================================================================
const QUERY_KEYS = {
  documents: 'solution-documents',
  document: 'solution-document',
  categories: 'solution-categories',
  feedback: 'solution-feedback',
  stats: 'solution-stats',
  templates: 'solution-templates',
  versions: 'solution-versions',
  popular: 'popular-documents',
  caseDocuments: 'case-documents'
} as const;

// ================================================================
// HOOKS PRINCIPALES
// ================================================================

/**
 * Hook para obtener documentos con filtros y paginación
 */
export const useSolutionDocuments = (
  filters?: SolutionDocumentFilters,
  pagination?: PaginationParams
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.documents, filters, pagination],
    queryFn: async (): Promise<PaginatedDocuments> => {
      try {
        if (filters?.search) {
          // TEMPORALMENTE: Usar consulta directa para búsqueda en lugar de RPC
          // hasta que se solucione el problema de GROUP BY en la función RPC
          let query = supabase
            .from('solution_documents')
            .select(`
              *
            `, { count: 'exact' });

          // Aplicar filtros de búsqueda
          const searchTerm = filters.search.toLowerCase();
          
          // Usar solo título por ahora para asegurar que funcione
          // Los tags usan un formato array y pueden requerir sintaxis especial
          query = query.ilike('title', `%${searchTerm}%`);

          // Filtros adicionales
          if (filters?.category) {
            query = query.eq('solution_type', filters.category);
          }
          
          if (filters?.isTemplate !== undefined) {
            query = query.eq('is_template', filters.isTemplate);
          }
          
          if (filters?.difficultyLevel && filters.difficultyLevel.length > 0) {
            query = query.in('difficulty_level', filters.difficultyLevel);
          }

          if (filters?.createdBy) {
            query = query.eq('created_by', filters.createdBy);
          }

          if (filters?.caseId) {
            query = query.eq('case_id', filters.caseId);
          }

          // Solo documentos publicados (simplificado para depuración)
          query = query.eq('is_published', true);

          // Paginación
          if (pagination) {
            const offset = (pagination.page - 1) * pagination.pageSize;
            query = query.range(offset, offset + pagination.pageSize - 1);
          }

          // Ordenamiento
          const sortBy = pagination?.sortBy || 'updated_at';
          const sortOrder = pagination?.sortOrder || 'desc';
          query = query.order(sortBy, { ascending: sortOrder === 'asc' });

          const { data, error, count } = await query;
          
          if (error) {
            console.error('Error en búsqueda directa:', error);
            throw error;
          }

          // Mapear campos snake_case a camelCase
          const enrichedData = data?.map(doc => ({
            ...doc,
            avgRating: null,
            caseId: doc.case_id,
            createdBy: doc.created_by,
            updatedBy: doc.updated_by,
            difficultyLevel: doc.difficulty_level,
            estimatedSolutionTime: doc.estimated_solution_time,
            isTemplate: doc.is_template,
            isPublished: doc.is_published,
            viewCount: doc.view_count,
            helpfulCount: doc.helpful_count,
            createdAt: doc.created_at,
            updatedAt: doc.updated_at
          })) || [];

          return {
            data: enrichedData,
            pagination: {
              page: pagination?.page || 1,
              pageSize: pagination?.pageSize || 20,
              totalItems: count || 0,
              totalPages: Math.ceil((count || 0) / (pagination?.pageSize || 20)),
              hasNext: (pagination?.page || 1) * (pagination?.pageSize || 20) < (count || 0),
              hasPrev: (pagination?.page || 1) > 1
            }
          };
        } else {
          // Para consultas sin búsqueda, usar consulta directa simplificada
          let query = supabase
            .from('solution_documents')
            .select(`
              *
            `, { count: 'exact' });

          // Obtener usuario actual para filtros
          const user = await supabase.auth.getUser();
          const userId = user.data.user?.id;

          // Filtros básicos
          if (filters?.category) {
            query = query.eq('solution_type', filters.category);
          }
          
          if (filters?.isTemplate !== undefined) {
            query = query.eq('is_template', filters.isTemplate);
          }
          
          if (filters?.difficultyLevel && filters.difficultyLevel.length > 0) {
            query = query.in('difficulty_level', filters.difficultyLevel);
          }

          if (filters?.createdBy) {
            query = query.eq('created_by', filters.createdBy);
          }

          if (filters?.caseId) {
            query = query.eq('case_id', filters.caseId);
          }

          // Solo documentos publicados excepto los propios
          if (userId) {
            query = query.or(`is_published.eq.true,created_by.eq.${userId}`);
          } else {
            query = query.eq('is_published', true);
          }

          // Paginación
          if (pagination) {
            const offset = (pagination.page - 1) * pagination.pageSize;
            query = query.range(offset, offset + pagination.pageSize - 1);
          }

          // Ordenamiento
          const sortBy = pagination?.sortBy || 'updated_at';
          const sortOrder = pagination?.sortOrder || 'desc';
          query = query.order(sortBy, { ascending: sortOrder === 'asc' });

          const { data, error, count } = await query;
          
          if (error) throw error;
          
          // Calcular rating promedio para cada documento (simplificado)
          const enrichedData = data?.map(doc => ({
            ...doc,
            avgRating: null, // Se puede calcular por separado si es necesario
            // Mapear campos snake_case a camelCase
            caseId: doc.case_id,
            createdBy: doc.created_by,
            updatedBy: doc.updated_by,
            difficultyLevel: doc.difficulty_level,
            estimatedSolutionTime: doc.estimated_solution_time,
            isTemplate: doc.is_template,
            isPublished: doc.is_published,
            viewCount: doc.view_count,
            helpfulCount: doc.helpful_count,
            createdAt: doc.created_at,
            updatedAt: doc.updated_at
          })) || [];
          
          return {
            data: enrichedData,
            pagination: {
              page: pagination?.page || 1,
              pageSize: pagination?.pageSize || 20,
              totalItems: count || 0,
              totalPages: Math.ceil((count || 0) / (pagination?.pageSize || 20)),
              hasNext: (pagination?.page || 1) * (pagination?.pageSize || 20) < (count || 0),
              hasPrev: (pagination?.page || 1) > 1
            }
          };
        }
      } catch (error) {
        console.error('Error en useSolutionDocuments:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para obtener un documento específico por ID
 */
export const useSolutionDocument = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.document, id],
    queryFn: async (): Promise<SolutionDocument> => {
      console.log('🔍 [useSolutionDocument] Obteniendo documento con etiquetas:', id);
      
      // Obtener documento principal con información del caso
      const { data, error } = await supabase
        .from('solution_documents')
        .select(`
          *,
          cases:case_id (
            numero_caso
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Obtener etiquetas relacionadas
      console.log('🏷️ [useSolutionDocument] Obteniendo etiquetas para documento:', id);
      const { data: tagsData, error: tagsError } = await supabase
        .from('solution_document_tags')
        .select(`
          solution_tags:tag_id (
            id,
            name,
            color,
            category
          )
        `)
        .eq('document_id', id);
      
      if (tagsError) {
        console.error('❌ [useSolutionDocument] Error obteniendo etiquetas:', tagsError);
      }
      
      // Procesar etiquetas
      const documentTags = tagsData?.map(tagRelation => {
        const tag = (tagRelation as any).solution_tags;
        return tag ? tag.name : null;
      }).filter(Boolean) || [];
      
      console.log('🏷️ [useSolutionDocument] Etiquetas procesadas:', documentTags);
      
      // También verificar etiquetas en el campo tags (array directo)
      const directTags = Array.isArray(data.tags) ? data.tags : [];
      console.log('🏷️ [useSolutionDocument] Etiquetas directas:', directTags);
      
      // Combinar ambas fuentes de etiquetas
      const allTags = [...new Set([...documentTags, ...directTags])];
      console.log('🏷️ [useSolutionDocument] Etiquetas finales:', allTags);
      
      // Obtener feedback separadamente si es necesario para el rating
      let avgRating = null;
      if (data.is_published) {
        const { data: feedbackData } = await supabase
          .from('solution_feedback')
          .select('rating')
          .eq('document_id', id)
          .not('rating', 'is', null);
        
        if (feedbackData && feedbackData.length > 0) {
          avgRating = feedbackData.reduce((sum: number, f: any) => sum + (f.rating || 0), 0) / feedbackData.length;
        }
      }

      // Incrementar contador de vistas (solo si no es el creador)
      const user = await supabase.auth.getUser();
      if (user.data.user?.id !== data.created_by && data.is_published) {
        supabase.rpc('increment_document_views', { document_id_param: id });
      }
      
      // Mapear campos snake_case a camelCase
      console.log('🔍 [useSolutionDocument] Datos obtenidos:', JSON.stringify(data, null, 2));
      console.log('🔍 [useSolutionDocument] Cases data:', data.cases);
      
      return { 
        ...data, 
        avgRating,
        tags: allTags, // Usar las etiquetas combinadas
        caseId: data.case_id,
        caseNumber: data.cases?.numero_caso || data.cases?.numero_caso || null, // ✅ NÚMERO DEL CASO
        createdBy: data.created_by,
        updatedBy: data.updated_by,
        difficultyLevel: data.difficulty_level,
        estimatedSolutionTime: data.estimated_solution_time,
        isTemplate: data.is_template,
        isPublished: data.is_published,
        viewCount: data.view_count,
        helpfulCount: data.helpful_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

/**
 * Hook para obtener estadísticas del módulo
 */
export const useSolutionDocumentStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.stats],
    queryFn: async (): Promise<SolutionDocumentStats> => {
      const { data, error } = await supabase.rpc('get_solution_document_stats');
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para obtener templates disponibles
 */
export const useSolutionTemplates = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.templates],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_available_templates');
      if (error) throw error;
      return data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
};

/**
 * Hook para obtener documentos populares
 */
export const usePopularDocuments = (limit = 10) => {
  return useQuery({
    queryKey: [QUERY_KEYS.popular, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_popular_documents', { limit_count: limit });
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
};

/**
 * Hook para obtener documentos relacionados a un caso
 */
export const useCaseDocuments = (caseId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.caseDocuments, caseId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_documents_by_case', { case_id_param: caseId });
      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
    staleTime: 5 * 60 * 1000,
  });
};

// ================================================================
// MUTATIONS
// ================================================================

/**
 * Hook para crear un nuevo documento
 */
export const useCreateSolutionDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: SolutionDocumentFormData): Promise<SolutionDocument> => {
      console.log('🚀 [useCreateSolutionDocument] Iniciando creación de documento');
      console.log('📋 [useCreateSolutionDocument] Datos recibidos:', data);

      const user = await supabase.auth.getUser();
      console.log('👤 [useCreateSolutionDocument] Usuario obtenido:', user.data.user?.id);
      
      if (!user.data.user) {
        console.error('❌ [useCreateSolutionDocument] Usuario no autenticado');
        throw new Error('Usuario no autenticado');
      }

      // 🏷️ CONVERTIR IDs DE TAGS A NOMBRES DE TAGS
      let tagNames: string[] = [];
      if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
        console.log('🏷️ [useCreateSolutionDocument] Convirtiendo IDs de tags a nombres:', data.tags);
        
        const { data: tagsData, error: tagsError } = await supabase
          .from('solution_tags')
          .select('name')
          .in('id', data.tags);
        
        if (tagsError) {
          console.error('❌ [useCreateSolutionDocument] Error obteniendo nombres de tags:', tagsError);
        } else {
          tagNames = tagsData?.map(tag => tag.name) || [];
          console.log('✅ [useCreateSolutionDocument] Nombres de tags obtenidos:', tagNames);
        }
      }

      // Usar la función SQL completa con todos los parámetros
      console.log('📡 [useCreateSolutionDocument] Llamando función SQL create_solution_document_final');
      
      const params = {
        p_title: data.title,
        p_content: data.content || [],
        p_solution_type: data.category || 'solution',
        p_difficulty_level: data.difficultyLevel || 1,
        p_case_id: data.caseId || null,
        p_archived_case_id: null, // Por ahora no manejamos casos archivados en creación
        p_case_reference_type: 'active',
        p_complexity_notes: null,
        p_prerequisites: null,
        p_estimated_solution_time: data.estimatedSolutionTime || null,
        p_is_template: data.isTemplate || false,
        p_is_published: data.isPublished || false,
        p_tags: tagNames // ✅ USAR NOMBRES DE TAGS EN LUGAR DE IDs
      };
      
      console.log('📝 [useCreateSolutionDocument] Parámetros SQL:', params);
      console.log('🏷️ [useCreateSolutionDocument] Tags a guardar:', data.tags);

      const { data: documentId, error } = await supabase.rpc('create_solution_document_final', params);

      if (error) {
        console.error('❌ [useCreateSolutionDocument] Error en función SQL:', error);
        throw error;
      }

      console.log('✅ [useCreateSolutionDocument] Documento creado con ID:', documentId);

      // Obtener el documento creado
      console.log('📡 [useCreateSolutionDocument] Obteniendo documento creado desde BD');
      const { data: result, error: fetchError } = await supabase
        .from('solution_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        console.error('❌ [useCreateSolutionDocument] Error al obtener documento:', fetchError);
        throw fetchError;
      }
      
      console.log('✅ [useCreateSolutionDocument] Documento obtenido de BD:', result);

      // Mapear campos snake_case a camelCase
      const mappedResult = {
        ...result,
        caseId: result.case_id,
        createdBy: result.created_by,
        updatedBy: result.updated_by,
        difficultyLevel: result.difficulty_level,
        estimatedSolutionTime: result.estimated_solution_time,
        isTemplate: result.is_template,
        isPublished: result.is_published,
        viewCount: result.view_count,
        helpfulCount: result.helpful_count,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      };

      console.log('🔄 [useCreateSolutionDocument] Documento mapeado:', mappedResult);
      return mappedResult;
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.documents] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stats] });
      
      if (data.caseId) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.caseDocuments, data.caseId] });
      }
      
      if (data.isTemplate) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.templates] });
      }
    }
  });
};

/**
 * Hook para actualizar un documento existente
 */
export const useUpdateSolutionDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<SolutionDocumentFormData>): Promise<SolutionDocument> => {
      console.log('🔄 [useUpdateSolutionDocument] Iniciando actualización de documento');
      console.log('📋 [useUpdateSolutionDocument] ID del documento:', id);
      console.log('📋 [useUpdateSolutionDocument] Datos a actualizar:', data);

      const user = await supabase.auth.getUser();
      console.log('👤 [useUpdateSolutionDocument] Usuario obtenido:', user.data.user?.id);
      
      if (!user.data.user) {
        console.error('❌ [useUpdateSolutionDocument] Usuario no autenticado');
        throw new Error('Usuario no autenticado');
      }

      // 🏷️ CONVERTIR IDs DE TAGS A NOMBRES DE TAGS (si se proporcionaron)
      let tagNames: string[] | null = null;
      if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
        console.log('🏷️ [useUpdateSolutionDocument] Convirtiendo IDs de tags a nombres:', data.tags);
        
        const { data: tagsData, error: tagsError } = await supabase
          .from('solution_tags')
          .select('name')
          .in('id', data.tags);
        
        if (tagsError) {
          console.error('❌ [useUpdateSolutionDocument] Error obteniendo nombres de tags:', tagsError);
        } else {
          tagNames = tagsData?.map(tag => tag.name) || [];
          console.log('✅ [useUpdateSolutionDocument] Nombres de tags obtenidos:', tagNames);
        }
      } else if (data.tags && Array.isArray(data.tags) && data.tags.length === 0) {
        // Si se pasa un array vacío, significa que se quieren eliminar todos los tags
        tagNames = [];
        console.log('🏷️ [useUpdateSolutionDocument] Eliminando todos los tags');
      }

      // Usar la función SQL completa para actualización
      if (data.content || data.title || data.category || data.difficultyLevel || data.isPublished || data.isTemplate || data.tags) {
        console.log('📡 [useUpdateSolutionDocument] Llamando función SQL update_solution_document_final');
        
        const params = {
          p_document_id: id,
          p_title: data.title || null,
          p_content: data.content || null,
          p_solution_type: data.category || null,
          p_difficulty_level: data.difficultyLevel || null,
          p_case_id: data.caseId || null,
          p_archived_case_id: null,
          p_case_reference_type: null,
          p_complexity_notes: null,
          p_prerequisites: null,
          p_estimated_solution_time: data.estimatedSolutionTime || null,
          p_is_template: data.isTemplate !== undefined ? data.isTemplate : null,
          p_is_published: data.isPublished !== undefined ? data.isPublished : null,
          p_tags: tagNames // ✅ USAR NOMBRES DE TAGS EN LUGAR DE IDs
        };
        
        console.log('📝 [useUpdateSolutionDocument] === PARÁMETROS RECIBIDOS EN HOOK ===');
        console.log('🎯 [useUpdateSolutionDocument] data.category (mapped to solution_type):', data.category);
        console.log('⭐ [useUpdateSolutionDocument] data.difficultyLevel:', data.difficultyLevel);
        console.log('📄 [useUpdateSolutionDocument] data.title:', data.title);
        console.log('🏷️ [useUpdateSolutionDocument] p_tags:', params.p_tags);
        console.log('📝 [useUpdateSolutionDocument] data completo:', data);
        
        console.log('📝 [useUpdateSolutionDocument] === PARÁMETROS SQL FINALES ===');
        console.log('🎯 [useUpdateSolutionDocument] p_solution_type:', params.p_solution_type);
        console.log('⭐ [useUpdateSolutionDocument] p_difficulty_level:', params.p_difficulty_level);
        console.log('📄 [useUpdateSolutionDocument] p_title:', params.p_title);
        console.log('🏷️ [useUpdateSolutionDocument] p_tags:', params.p_tags);
        console.log('🔧 [useUpdateSolutionDocument] params completos:', params);

        const { error } = await supabase.rpc('update_solution_document_final', params);

        if (error) {
          console.error('❌ [useUpdateSolutionDocument] Error en función SQL:', error);
          throw error;
        }

        console.log('✅ [useUpdateSolutionDocument] Función SQL ejecutada exitosamente');
        
        // Verificar inmediatamente qué se guardó en la BD
        console.log('🔍 [useUpdateSolutionDocument] === VERIFICANDO DATOS EN BD ===');
        const { data: verificacion, error: errorVerificacion } = await supabase
          .from('solution_documents')
          .select('id, title, solution_type, difficulty_level, is_template, is_published')
          .eq('id', id)
          .single();
        
        if (!errorVerificacion && verificacion) {
          console.log('📋 [useUpdateSolutionDocument] Datos actuales en BD:', verificacion);
          console.log('🎯 [useUpdateSolutionDocument] BD solution_type:', verificacion.solution_type);
          console.log('⭐ [useUpdateSolutionDocument] BD difficulty_level:', verificacion.difficulty_level);
        }

        console.log('✅ [useUpdateSolutionDocument] Documento actualizado con éxito');
      }

      // Obtener el documento actualizado
      console.log('📡 [useUpdateSolutionDocument] Obteniendo documento actualizado');
      const { data: result, error: fetchError } = await supabase
        .from('solution_documents')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('❌ [useUpdateSolutionDocument] Error al obtener documento actualizado:', fetchError);
        throw fetchError;
      }
      
      console.log('✅ [useUpdateSolutionDocument] Documento actualizado obtenido:', result);

      // Obtener etiquetas relacionadas
      console.log('🏷️ [useUpdateSolutionDocument] Obteniendo etiquetas para documento:', id);
      const { data: tagsData, error: tagsError } = await supabase
        .from('solution_document_tags')
        .select(`
          solution_tags:tag_id (
            id,
            name,
            color,
            category
          )
        `)
        .eq('document_id', id);
      
      if (tagsError) {
        console.error('❌ [useUpdateSolutionDocument] Error obteniendo etiquetas:', tagsError);
      }
      
      // Procesar etiquetas
      const documentTags = tagsData?.map(tagRelation => {
        const tag = (tagRelation as any).solution_tags;
        return tag ? tag.name : null;
      }).filter(Boolean) || [];
      
      console.log('🏷️ [useUpdateSolutionDocument] Etiquetas procesadas:', documentTags);
      
      // También verificar etiquetas en el campo tags (array directo)
      const directTags = Array.isArray(result.tags) ? result.tags : [];
      console.log('🏷️ [useUpdateSolutionDocument] Etiquetas directas:', directTags);
      
      // Combinar ambas fuentes de etiquetas
      const allTags = [...new Set([...documentTags, ...directTags])];
      console.log('🏷️ [useUpdateSolutionDocument] Etiquetas finales:', allTags);

      // Mapear campos snake_case a camelCase
      const mappedResult = {
        ...result,
        tags: allTags, // Usar las etiquetas combinadas
        caseId: result.case_id,
        createdBy: result.created_by,
        updatedBy: result.updated_by,
        difficultyLevel: result.difficulty_level,
        estimatedSolutionTime: result.estimated_solution_time,
        isTemplate: result.is_template,
        isPublished: result.is_published,
        viewCount: result.view_count,
        helpfulCount: result.helpful_count,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      };

      console.log('🔄 [useUpdateSolutionDocument] Documento mapeado final:', mappedResult);
      return mappedResult;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries específicas
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.documents] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.document, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stats] });
      
      if (data.caseId) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.caseDocuments, data.caseId] });
      }
      
      if (data.isTemplate) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.templates] });
      }
    }
  });
};

/**
 * Hook para eliminar un documento
 */
export const useDeleteSolutionDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      console.log('🗑️ [useDeleteSolutionDocument] Iniciando eliminación de documento');
      console.log('📋 [useDeleteSolutionDocument] ID del documento:', id);

      // Usar la función SQL que maneja eliminaciones con validación de permisos
      console.log('📡 [useDeleteSolutionDocument] Llamando función SQL delete_solution_document');
      const { error } = await supabase.rpc('delete_solution_document', {
        p_document_id: id
      });

      if (error) {
        console.error('❌ [useDeleteSolutionDocument] Error en función SQL:', error);
        throw error;
      }

      console.log('✅ [useDeleteSolutionDocument] Documento eliminado con éxito');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.documents] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stats] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.templates] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.popular] });
    }
  });
};

/**
 * Hook para duplicar un documento (crear copia)
 */
export const useDuplicateSolutionDocument = () => {
  const createDocument = useCreateSolutionDocument();
  
  return useMutation({
    mutationFn: async (sourceId: string): Promise<SolutionDocument> => {
      // Obtener documento original
      const { data: sourceDoc, error } = await supabase
        .from('solution_documents')
        .select('*')
        .eq('id', sourceId)
        .single();

      if (error) throw error;

      // Crear copia con nuevo título
      const duplicateData: SolutionDocumentFormData = {
        title: `${sourceDoc.title} (Copia)`,
        content: sourceDoc.content,
        caseId: sourceDoc.case_id,
        tags: sourceDoc.tags,
        category: sourceDoc.category,
        difficultyLevel: sourceDoc.difficulty_level,
        estimatedSolutionTime: sourceDoc.estimated_solution_time,
        isTemplate: false, // Las copias no son templates por defecto
        isPublished: false // Las copias no se publican automáticamente
      };

      return createDocument.mutateAsync(duplicateData);
    }
  });
};
