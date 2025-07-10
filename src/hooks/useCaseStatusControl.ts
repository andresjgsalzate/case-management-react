import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CaseStatusControl } from '@/types';

// Interfaces para formularios
export interface CaseStatusFormData {
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  displayOrder: number;
}

// Hook para obtener todos los estados
export const useCaseStatuses = () => {
  return useQuery({
    queryKey: ['caseStatuses'],
    queryFn: async (): Promise<CaseStatusControl[]> => {
      const { data, error } = await supabase
        .from('case_status_control')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching case statuses:', error);
        throw new Error('Error al cargar los estados de control de casos');
      }

      return data || [];
    },
    select: (data: any[]) => {
      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        color: row.color,
        isActive: row.is_active,
        displayOrder: row.display_order,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    },
  });
};

// Hook para crear un nuevo estado
export const useCreateCaseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CaseStatusFormData): Promise<CaseStatusControl> => {
      const { data: result, error } = await supabase
        .from('case_status_control')
        .insert([{
          name: data.name,
          description: data.description,
          color: data.color,
          is_active: data.isActive,
          display_order: data.displayOrder,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating case status:', error);
        throw new Error('Error al crear el estado de control');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseStatuses'] });
    },
  });
};

// Hook para actualizar un estado
export const useUpdateCaseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CaseStatusFormData }): Promise<CaseStatusControl> => {
const { data: result, error } = await supabase
        .from('case_status_control')
        .update({
          name: data.name,
          description: data.description,
          color: data.color,
          is_active: data.isActive,
          display_order: data.displayOrder,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating case status:', error);
        throw new Error('Error al actualizar el estado de control');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseStatuses'] });
    },
  });
};

// Hook para eliminar un estado
export const useDeleteCaseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Verificar si el estado está siendo usado
      const { data: usageCheck, error: checkError } = await supabase
        .from('case_control')
        .select('id')
        .eq('status_id', id)
        .limit(1);

      if (checkError) {
        console.error('Error checking case status usage:', checkError);
        throw new Error('Error al verificar el uso del estado');
      }

      if (usageCheck && usageCheck.length > 0) {
        throw new Error('No se puede eliminar este estado porque está siendo usado por casos activos');
      }

      const { error } = await supabase
        .from('case_status_control')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting case status:', error);
        throw new Error('Error al eliminar el estado de control');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseStatuses'] });
    },
  });
};

// Hook para reordenar estados
export const useReorderCaseStatuses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reorderedStatuses: { id: string; displayOrder: number }[]): Promise<void> => {
      const updates = reorderedStatuses.map(({ id, displayOrder }) =>
        supabase
          .from('case_status_control')
          .update({ display_order: displayOrder })
          .eq('id', id)
      );

      const results = await Promise.all(updates);
      
      for (const { error } of results) {
        if (error) {
          console.error('Error reordering case statuses:', error);
          throw new Error('Error al reordenar los estados');
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caseStatuses'] });
    },
  });
};
