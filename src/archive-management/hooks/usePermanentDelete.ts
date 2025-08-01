import { useState } from 'react';
import { supabase } from '@/shared/lib/supabase';

export interface PermanentDeleteResult {
  success: boolean;
  error?: string;
}

export interface DeleteActionData {
  id: string;
  type: 'case' | 'todo';
  reason?: string;
}

export const usePermanentDelete = () => {
  const [isLoading, setIsLoading] = useState(false);

  const deleteArchivedCase = async (data: DeleteActionData): Promise<PermanentDeleteResult> => {
    setIsLoading(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const { data: result, error } = await supabase
        .rpc('delete_archived_case_permanently', {
          p_archived_id: data.id,
          p_deleted_by: user.user.id,
          p_reason: data.reason
        });

      if (error) {
        throw error;
      }

      return { success: result };
    } catch (error) {
      console.error('Error deleting archived case:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteArchivedTodo = async (data: DeleteActionData): Promise<PermanentDeleteResult> => {
    setIsLoading(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const { data: result, error } = await supabase
        .rpc('delete_archived_todo_permanently', {
          p_archived_id: data.id,
          p_deleted_by: user.user.id,
          p_reason: data.reason
        });

      if (error) {
        throw error;
      }

      return { success: result };
    } catch (error) {
      console.error('Error deleting archived todo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const canDelete = async (): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return false;

      const { data, error } = await supabase
        .rpc('can_delete_archived_items', { user_id: user.user.id });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking delete permissions:', error);
      return false;
    }
  };

  return {
    deleteArchivedCase,
    deleteArchivedTodo,
    canDelete,
    isLoading
  };
};
