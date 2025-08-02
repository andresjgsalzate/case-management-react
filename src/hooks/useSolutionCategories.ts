/**
 * =================================================================
 * HOOK PARA CATEGORÍAS DE DOCUMENTOS
 * =================================================================
 * Descripción: Hook para gestionar categorías de soluciones
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { SolutionCategory, SolutionCategoryFormData } from '@/types/documentation';

// ================================================================
// QUERY KEYS
// ================================================================
const CATEGORY_QUERY_KEYS = {
  categories: 'solution-categories',
  category: 'solution-category',
  categoryStats: 'category-stats'
} as const;

// ================================================================
// HOOKS DE CONSULTA
// ================================================================

/**
 * Hook para obtener todas las categorías activas
 */
export const useSolutionCategories = () => {
  return useQuery({
    queryKey: [CATEGORY_QUERY_KEYS.categories],
    queryFn: async (): Promise<SolutionCategory[]> => {
      const { data, error } = await supabase
        .from('solution_categories')
        .select(`
          *,
          documentCount:solution_documents(count)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      // Mapear campos snake_case a camelCase y procesar el conteo de documentos
      return data?.map(category => ({
        ...category,
        isActive: category.is_active,
        createdBy: category.created_by,
        createdAt: category.created_at,
        documentCount: category.documentCount?.[0]?.count || 0
      })) || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para obtener una categoría específica por ID
 */
export const useSolutionCategory = (id: string) => {
  return useQuery({
    queryKey: [CATEGORY_QUERY_KEYS.category, id],
    queryFn: async (): Promise<SolutionCategory> => {
      const { data, error } = await supabase
        .from('solution_categories')
        .select(`
          *,
          documentCount:solution_documents(count)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Mapear campos snake_case a camelCase
      return {
        ...data,
        isActive: data.is_active,
        createdBy: data.created_by,
        createdAt: data.created_at,
        documentCount: data.documentCount?.[0]?.count || 0
      };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener estadísticas de categorías
 */
export const useCategoryStats = () => {
  return useQuery({
    queryKey: [CATEGORY_QUERY_KEYS.categoryStats],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solution_categories')
        .select(`
          id,
          name,
          color,
          solution_documents!category(
            id,
            is_published,
            view_count,
            feedback:solution_feedback(rating)
          )
        `)
        .eq('is_active', true);

      if (error) throw error;

      return data?.map(category => {
        const documents = category.solution_documents || [];
        const publishedDocs = documents.filter(doc => doc.is_published);
        const totalViews = documents.reduce((sum, doc) => sum + (doc.view_count || 0), 0);
        
        // Calcular rating promedio
        const allRatings = documents.flatMap(doc => 
          doc.feedback?.map(f => f.rating).filter(r => r !== null) || []
        );
        const avgRating = allRatings.length > 0 
          ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
          : 0;

        return {
          id: category.id,
          name: category.name,
          color: category.color,
          totalDocuments: documents.length,
          publishedDocuments: publishedDocs.length,
          totalViews,
          avgRating
        };
      }) || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
};

// ================================================================
// MUTATIONS (Solo para administradores)
// ================================================================

/**
 * Hook para crear una nueva categoría
 */
export const useCreateSolutionCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: SolutionCategoryFormData): Promise<SolutionCategory> => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Usuario no autenticado');

      const { data: result, error } = await supabase
        .from('solution_categories')
        .insert([{
          name: data.name,
          description: data.description,
          color: data.color,
          icon: data.icon,
          created_by: user.data.user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Mapear campos snake_case a camelCase
      return {
        ...result,
        isActive: result.is_active,
        createdBy: result.created_by,
        createdAt: result.created_at
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.categories] });
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.categoryStats] });
    }
  });
};

/**
 * Hook para actualizar una categoría existente
 */
export const useUpdateSolutionCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      ...data 
    }: { 
      id: string 
    } & Partial<SolutionCategoryFormData>): Promise<SolutionCategory> => {
      const updateData: Record<string, any> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.icon !== undefined) updateData.icon = data.icon;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;

      const { data: result, error } = await supabase
        .from('solution_categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Mapear campos snake_case a camelCase
      return {
        ...result,
        isActive: result.is_active,
        createdBy: result.created_by,
        createdAt: result.created_at
      };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.categories] });
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.category, variables.id] });
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.categoryStats] });
    }
  });
};

/**
 * Hook para desactivar una categoría
 */
export const useDeactivateSolutionCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('solution_categories')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.categories] });
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.category, id] });
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.categoryStats] });
    }
  });
};

/**
 * Hook para reactivar una categoría
 */
export const useActivateSolutionCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('solution_categories')
        .update({ is_active: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.categories] });
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.category, id] });
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEYS.categoryStats] });
    }
  });
};

/**
 * Hook para obtener todas las categorías (incluyendo inactivas) - Solo administradores
 */
export const useAllSolutionCategories = () => {
  return useQuery({
    queryKey: [CATEGORY_QUERY_KEYS.categories, 'all'],
    queryFn: async (): Promise<SolutionCategory[]> => {
      const { data, error } = await supabase
        .from('solution_categories')
        .select(`
          *,
          documentCount:solution_documents(count)
        `)
        .order('name');

      if (error) throw error;
      
      return data?.map(category => ({
        ...category,
        documentCount: category.documentCount?.[0]?.count || 0
      })) || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
