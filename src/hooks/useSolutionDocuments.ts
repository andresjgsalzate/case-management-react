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
      const { data, error } = await supabase
        .from('solution_documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
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
      return { 
        ...data, 
        avgRating,
        caseId: data.case_id,
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
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Usuario no autenticado');

      const insertData: any = {
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        difficulty_level: data.difficultyLevel,
        is_template: data.isTemplate,
        is_published: data.isPublished,
        created_by: user.data.user.id,
        updated_by: user.data.user.id
      };

      // Solo agregar campos opcionales si tienen valor
      if (data.caseId) insertData.case_id = data.caseId;
      if (data.category) insertData.category = data.category;
      if (data.estimatedSolutionTime) insertData.estimated_solution_time = data.estimatedSolutionTime;

      const { data: result, error } = await supabase
        .from('solution_documents')
        .insert(insertData)
        .select('*')
        .single();

      if (error) throw error;
      
      // Mapear campos snake_case a camelCase
      return {
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
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Usuario no autenticado');

      // Verificar si el contenido cambió para crear versión
      let newVersion = 1;
      if (data.content) {
        const currentDoc = await supabase
          .from('solution_documents')
          .select('content, version')
          .eq('id', id)
          .single();
        
        if (currentDoc.data && JSON.stringify(data.content) !== JSON.stringify(currentDoc.data.content)) {
          // Crear versión del contenido anterior
          await supabase.rpc('create_document_version', {
            document_id_param: id,
            content_param: currentDoc.data.content,
            change_summary_param: 'Actualización de contenido'
          });
          newVersion = (currentDoc.data.version || 1) + 1;
        } else {
          newVersion = currentDoc.data?.version || 1;
        }
      }

      const updateData: Record<string, any> = {};
      
      if (data.title !== undefined) updateData.title = data.title;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.caseId !== undefined) updateData.case_id = data.caseId;
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.difficultyLevel !== undefined) updateData.difficulty_level = data.difficultyLevel;
      if (data.estimatedSolutionTime !== undefined) updateData.estimated_solution_time = data.estimatedSolutionTime;
      if (data.isTemplate !== undefined) updateData.is_template = data.isTemplate;
      if (data.isPublished !== undefined) updateData.is_published = data.isPublished;
      
      updateData.updated_by = user.data.user.id;
      if (data.content) updateData.version = newVersion;

      const { data: result, error } = await supabase
        .from('solution_documents')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      
      // Mapear campos snake_case a camelCase
      return {
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
      const { error } = await supabase
        .from('solution_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
