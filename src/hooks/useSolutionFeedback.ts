/**
 * =================================================================
 * HOOK PARA FEEDBACK DE DOCUMENTOS
 * =================================================================
 * Descripción: Hook para gestionar feedback y calificaciones
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { SolutionFeedback, SolutionFeedbackFormData } from '@/types/documentation';

// ================================================================
// QUERY KEYS
// ================================================================
const FEEDBACK_QUERY_KEYS = {
  documentFeedback: 'document-feedback',
  userFeedback: 'user-feedback',
  feedbackStats: 'feedback-stats'
} as const;

// ================================================================
// HOOKS DE CONSULTA
// ================================================================

/**
 * Hook para obtener feedback de un documento específico
 */
export const useDocumentFeedback = (documentId: string) => {
  return useQuery({
    queryKey: [FEEDBACK_QUERY_KEYS.documentFeedback, documentId],
    queryFn: async (): Promise<SolutionFeedback[]> => {
      const { data, error } = await supabase
        .from('solution_feedback')
        .select(`
          *,
          user:user_profiles(id, full_name, email)
        `)
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapear campos snake_case a camelCase
      const mappedData = data?.map(feedback => ({
        ...feedback,
        documentId: feedback.document_id,
        userId: feedback.user_id,
        wasHelpful: feedback.was_helpful,
        createdAt: feedback.created_at
      })) || [];
      
      return mappedData;
    },
    enabled: !!documentId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

/**
 * Hook para obtener el feedback del usuario actual para un documento
 */
export const useUserDocumentFeedback = (documentId: string) => {
  return useQuery({
    queryKey: [FEEDBACK_QUERY_KEYS.userFeedback, documentId],
    queryFn: async (): Promise<SolutionFeedback | null> => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return null;

      const { data, error } = await supabase
        .from('solution_feedback')
        .select('*')
        .eq('document_id', documentId)
        .eq('user_id', user.data.user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Mapear campos snake_case a camelCase si hay datos
      if (data) {
        return {
          ...data,
          documentId: data.document_id,
          userId: data.user_id,
          wasHelpful: data.was_helpful,
          createdAt: data.created_at
        };
      }
      
      return data;
    },
    enabled: !!documentId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener estadísticas de feedback de un documento
 */
export const useDocumentFeedbackStats = (documentId: string) => {
  return useQuery({
    queryKey: [FEEDBACK_QUERY_KEYS.feedbackStats, documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solution_feedback')
        .select('rating, was_helpful')
        .eq('document_id', documentId);

      if (error) throw error;

      const stats = {
        totalFeedback: data.length,
        avgRating: 0,
        helpfulCount: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };

      if (data.length > 0) {
        // Calcular rating promedio
        const ratingsWithValue = data.filter(f => f.rating !== null);
        if (ratingsWithValue.length > 0) {
          stats.avgRating = ratingsWithValue.reduce((sum, f) => sum + (f.rating || 0), 0) / ratingsWithValue.length;
        }

        // Contar feedback útil
        stats.helpfulCount = data.filter(f => f.was_helpful).length;

        // Distribución de ratings
        ratingsWithValue.forEach(f => {
          if (f.rating) {
            stats.ratingDistribution[f.rating as keyof typeof stats.ratingDistribution]++;
          }
        });
      }

      return stats;
    },
    enabled: !!documentId,
    staleTime: 5 * 60 * 1000,
  });
};

// ================================================================
// MUTATIONS
// ================================================================

/**
 * Hook para crear feedback en un documento
 */
export const useCreateDocumentFeedback = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      documentId, 
      feedback 
    }: { 
      documentId: string; 
      feedback: SolutionFeedbackFormData 
    }): Promise<SolutionFeedback> => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('solution_feedback')
        .insert([{
          document_id: documentId,
          user_id: user.data.user.id,
          rating: feedback.rating,
          comment: feedback.comment,
          was_helpful: feedback.wasHelpful
        }])
        .select(`
          *,
          user:user_profiles(id, full_name, email)
        `)
        .single();

      if (error) throw error;
      
      // Mapear campos snake_case a camelCase
      return {
        ...data,
        documentId: data.document_id,
        userId: data.user_id,
        wasHelpful: data.was_helpful,
        createdAt: data.created_at
      };
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: [FEEDBACK_QUERY_KEYS.documentFeedback, variables.documentId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [FEEDBACK_QUERY_KEYS.userFeedback, variables.documentId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [FEEDBACK_QUERY_KEYS.feedbackStats, variables.documentId] 
      });
      
      // También invalidar el documento para actualizar avgRating
      queryClient.invalidateQueries({ 
        queryKey: ['solution-document', variables.documentId] 
      });
    }
  });
};

/**
 * Hook para actualizar feedback existente
 */
export const useUpdateDocumentFeedback = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      feedbackId, 
      // @ts-ignore - documentId is used in onSuccess callback
      documentId,
      feedback 
    }: { 
      feedbackId: string;
      documentId: string;
      feedback: Partial<SolutionFeedbackFormData> 
    }): Promise<SolutionFeedback> => {
      const updateData: Record<string, any> = {};
      if (feedback.rating !== undefined) updateData.rating = feedback.rating;
      if (feedback.comment !== undefined) updateData.comment = feedback.comment;
      if (feedback.wasHelpful !== undefined) updateData.was_helpful = feedback.wasHelpful;

      const { data, error } = await supabase
        .from('solution_feedback')
        .update(updateData)
        .eq('id', feedbackId)
        .select(`
          *,
          user:user_profiles(id, full_name, email)
        `)
        .single();

      if (error) throw error;
      
      // Mapear campos snake_case a camelCase
      return {
        ...data,
        documentId: data.document_id,
        userId: data.user_id,
        wasHelpful: data.was_helpful,
        createdAt: data.created_at
      };
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: [FEEDBACK_QUERY_KEYS.documentFeedback, variables.documentId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [FEEDBACK_QUERY_KEYS.userFeedback, variables.documentId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [FEEDBACK_QUERY_KEYS.feedbackStats, variables.documentId] 
      });
      
      // También invalidar el documento
      queryClient.invalidateQueries({ 
        queryKey: ['solution-document', variables.documentId] 
      });
    }
  });
};

/**
 * Hook para eliminar feedback
 */
export const useDeleteDocumentFeedback = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      feedbackId, 
      // @ts-ignore - documentId is used in onSuccess callback
      documentId
    }: { 
      feedbackId: string;
      documentId: string;
    }): Promise<void> => {
      const { error } = await supabase
        .from('solution_feedback')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: [FEEDBACK_QUERY_KEYS.documentFeedback, variables.documentId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [FEEDBACK_QUERY_KEYS.userFeedback, variables.documentId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [FEEDBACK_QUERY_KEYS.feedbackStats, variables.documentId] 
      });
      
      // También invalidar el documento
      queryClient.invalidateQueries({ 
        queryKey: ['solution-document', variables.documentId] 
      });
    }
  });
};

/**
 * Hook para marcar/desmarcar un documento como útil
 */
export const useToggleDocumentHelpful = () => {
  const createFeedback = useCreateDocumentFeedback();
  const updateFeedback = useUpdateDocumentFeedback();
  
  return useMutation({
    mutationFn: async ({ 
      documentId, 
      wasHelpful 
    }: { 
      documentId: string; 
      wasHelpful: boolean 
    }) => {
      // Verificar si ya existe feedback del usuario
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Usuario no autenticado');

      const { data: existingFeedback } = await supabase
        .from('solution_feedback')
        .select('id')
        .eq('document_id', documentId)
        .eq('user_id', user.data.user.id)
        .maybeSingle();

      if (existingFeedback) {
        // Actualizar feedback existente
        return updateFeedback.mutateAsync({
          feedbackId: existingFeedback.id,
          documentId,
          feedback: { wasHelpful }
        });
      } else {
        // Crear nuevo feedback
        return createFeedback.mutateAsync({
          documentId,
          feedback: { wasHelpful }
        });
      }
    }
  });
};
