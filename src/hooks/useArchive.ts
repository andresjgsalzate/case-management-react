import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { 
  ArchivedCase, 
  ArchivedTodo, 
  ArchiveStats, 
  ArchiveFilters,
  ArchiveActionData,
  RestoreActionData
} from '../types';
import { useAuth } from './useAuth';

export function useArchive() {
  const [archivedCases, setArchivedCases] = useState<ArchivedCase[]>([]);
  const [archivedTodos, setArchivedTodos] = useState<ArchivedTodo[]>([]);
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Cargar elementos archivados
  const fetchArchivedItems = useCallback(async (filters?: ArchiveFilters) => {
    try {
      setLoading(true);
      setError(null);

      const promises = [];

      // Cargar casos archivados
      if (!filters?.type || filters.type === 'cases' || filters.type === 'all') {
        let casesQuery = supabase
          .from('archived_cases')
          .select(`
            *,
            archived_by_user:user_profiles!archived_cases_archived_by_fkey(
              id,
              full_name,
              email
            ),
            restored_by_user:user_profiles!archived_cases_restored_by_fkey(
              id,
              full_name,
              email
            )
          `)
          .order('archived_at', { ascending: false });

        // Aplicar filtros
        if (filters) {
          if (filters.archivedBy) {
            casesQuery = casesQuery.eq('archived_by', filters.archivedBy);
          }
          if (filters.dateFrom) {
            casesQuery = casesQuery.gte('archived_at', filters.dateFrom);
          }
          if (filters.dateTo) {
            casesQuery = casesQuery.lte('archived_at', filters.dateTo);
          }
          if (filters.classification) {
            casesQuery = casesQuery.eq('classification', filters.classification);
          }
          if (filters.search) {
            casesQuery = casesQuery.or(
              `case_number.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
            );
          }
          if (filters.showRestored !== undefined) {
            casesQuery = casesQuery.eq('is_restored', filters.showRestored);
          }
        }

        promises.push(casesQuery);
      }

      // Cargar TODOs archivados
      if (!filters?.type || filters.type === 'todos' || filters.type === 'all') {
        let todosQuery = supabase
          .from('archived_todos')
          .select(`
            *,
            archived_by_user:user_profiles!archived_todos_archived_by_fkey(
              id,
              full_name,
              email
            ),
            restored_by_user:user_profiles!archived_todos_restored_by_fkey(
              id,
              full_name,
              email
            )
          `)
          .order('archived_at', { ascending: false });

        // Aplicar filtros
        if (filters) {
          if (filters.archivedBy) {
            todosQuery = todosQuery.eq('archived_by', filters.archivedBy);
          }
          if (filters.dateFrom) {
            todosQuery = todosQuery.gte('archived_at', filters.dateFrom);
          }
          if (filters.dateTo) {
            todosQuery = todosQuery.lte('archived_at', filters.dateTo);
          }
          if (filters.priority) {
            todosQuery = todosQuery.eq('priority', filters.priority);
          }
          if (filters.search) {
            todosQuery = todosQuery.or(
              `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
            );
          }
          if (filters.showRestored !== undefined) {
            todosQuery = todosQuery.eq('is_restored', filters.showRestored);
          }
        }

        promises.push(todosQuery);
      }

      const results = await Promise.all(promises);
      
      // Procesar resultados
      if (results.length === 2) {
        const [casesResult, todosResult] = results;
        if (casesResult.error) throw casesResult.error;
        if (todosResult.error) throw todosResult.error;
        
        setArchivedCases(casesResult.data?.map(mapArchivedCaseFromDB) || []);
        setArchivedTodos(todosResult.data?.map(mapArchivedTodoFromDB) || []);
      } else if (results.length === 1) {
        const [result] = results;
        if (result.error) throw result.error;
        
        if (filters?.type === 'cases') {
          setArchivedCases(result.data?.map(mapArchivedCaseFromDB) || []);
          setArchivedTodos([]);
        } else {
          setArchivedTodos(result.data?.map(mapArchivedTodoFromDB) || []);
          setArchivedCases([]);
        }
      }

    } catch (err) {
      console.error('Error fetching archived items:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar estadísticas
  const fetchStats = useCallback(async () => {
    try {
      // Obtener estadísticas básicas
      const { data: basicStats, error: basicError } = await supabase
        .from('archive_stats')
        .select('*')
        .single();

      if (basicError) throw basicError;

      // Obtener estadísticas por usuario
      const { data: userStats, error: userError } = await supabase
        .rpc('get_archive_stats_by_user');

      if (userError) throw userError;

      // Obtener estadísticas mensuales
      const { data: monthlyStats, error: monthlyError } = await supabase
        .rpc('get_archive_stats_monthly');

      if (monthlyError) throw monthlyError;

      setStats({
        totalArchivedCases: basicStats.total_archived_cases || 0,
        totalArchivedTodos: basicStats.total_archived_todos || 0,
        totalArchivedTimeMinutes: basicStats.total_archived_time_minutes || 0,
        archivedThisMonth: basicStats.archived_this_month || 0,
        restoredThisMonth: basicStats.restored_this_month || 0,
        byUser: userStats || [],
        monthlyStats: monthlyStats || []
      });

    } catch (err) {
      console.error('Error fetching archive stats:', err);
    }
  }, []);

  // Archivar caso
  const archiveCase = useCallback(async (data: ArchiveActionData) => {
    try {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .rpc('archive_case', {
          p_case_id: data.id,
          p_archived_by: user.id,
          p_reason: data.reason
        });

      if (error) throw error;

      // Invalidar queries relacionadas para que todas las páginas se actualicen
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['caseControls'] });
      queryClient.invalidateQueries({ queryKey: ['caseControl'] });

      // Recargar datos del archivo
      await fetchArchivedItems();
      await fetchStats();

      return { success: true };
    } catch (err) {
      console.error('Error archiving case:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error desconocido' 
      };
    }
  }, [user?.id, fetchArchivedItems, fetchStats, queryClient]);

  // Archivar TODO
  const archiveTodo = useCallback(async (data: ArchiveActionData) => {
    try {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .rpc('archive_todo', {
          p_todo_id: data.id,
          p_archived_by: user.id,
          p_reason: data.reason
        });

      if (error) throw error;

      // Invalidar queries relacionadas para que todas las páginas se actualicen
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todoControls'] });
      queryClient.invalidateQueries({ queryKey: ['todoControl'] });

      // Recargar datos del archivo
      await fetchArchivedItems();
      await fetchStats();

      return { success: true };
    } catch (err) {
      console.error('Error archiving todo:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error desconocido' 
      };
    }
  }, [user?.id, fetchArchivedItems, fetchStats, queryClient]);

  // Restaurar caso
  const restoreCase = useCallback(async (data: RestoreActionData) => {
    try {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .rpc('restore_case', {
          p_archived_id: data.id,
          p_restored_by: user.id,
          p_reason: data.reason
        });

      if (error) throw error;

      // Invalidar queries relacionadas para que todas las páginas se actualicen
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['caseControls'] });
      queryClient.invalidateQueries({ queryKey: ['caseControl'] });

      // Recargar datos del archivo
      await fetchArchivedItems();
      await fetchStats();

      return { success: true };
    } catch (err) {
      console.error('Error restoring case:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error desconocido' 
      };
    }
  }, [user?.id, fetchArchivedItems, fetchStats, queryClient]);

  // Restaurar TODO
  const restoreTodo = useCallback(async (data: RestoreActionData) => {
    try {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .rpc('restore_todo', {
          p_archived_id: data.id,
          p_restored_by: user.id,
          p_reason: data.reason
        });

      if (error) throw error;

      // Invalidar queries relacionadas para que todas las páginas se actualicen
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todoControls'] });
      queryClient.invalidateQueries({ queryKey: ['todoControl'] });

      // Recargar datos del archivo
      await fetchArchivedItems();
      await fetchStats();

      return { success: true };
    } catch (err) {
      console.error('Error restoring todo:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error desconocido' 
      };
    }
  }, [user?.id, fetchArchivedItems, fetchStats, queryClient]);

  // Verificar permisos
  const canArchive = useCallback(async () => {
    if (!user?.id) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('can_archive_items', { user_id: user.id });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error checking archive permissions:', err);
      return false;
    }
  }, [user?.id]);

  const canRestore = useCallback(async () => {
    if (!user?.id) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('can_restore_items', { user_id: user.id });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error checking restore permissions:', err);
      return false;
    }
  }, [user?.id]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchArchivedItems();
    fetchStats();
  }, [fetchArchivedItems, fetchStats]);

  return {
    archivedCases,
    archivedTodos,
    stats,
    loading,
    error,
    fetchArchivedItems,
    fetchStats,
    archiveCase,
    archiveTodo,
    restoreCase,
    restoreTodo,
    canArchive,
    canRestore
  };
}

// Funciones auxiliares para mapear datos
const mapArchivedCaseFromDB = (dbCase: any): ArchivedCase => ({
  id: dbCase.id,
  originalCaseId: dbCase.original_case_id,
  caseNumber: dbCase.case_number,
  description: dbCase.description,
  classification: dbCase.classification,
  totalTimeMinutes: dbCase.total_time_minutes,
  completedAt: dbCase.completed_at,
  archivedAt: dbCase.archived_at,
  archivedBy: dbCase.archived_by,
  originalData: dbCase.original_data,
  controlData: dbCase.control_data,
  archivedByUser: dbCase.archived_by_user,
  restoredAt: dbCase.restored_at,
  restoredBy: dbCase.restored_by,
  restoredByUser: dbCase.restored_by_user,
  isRestored: dbCase.is_restored
});

const mapArchivedTodoFromDB = (dbTodo: any): ArchivedTodo => ({
  id: dbTodo.id,
  originalTodoId: dbTodo.original_todo_id,
  title: dbTodo.title,
  description: dbTodo.description,
  priority: dbTodo.priority,
  totalTimeMinutes: dbTodo.total_time_minutes,
  completedAt: dbTodo.completed_at,
  archivedAt: dbTodo.archived_at,
  archivedBy: dbTodo.archived_by,
  originalData: dbTodo.original_data,
  controlData: dbTodo.control_data,
  archivedByUser: dbTodo.archived_by_user,
  restoredAt: dbTodo.restored_at,
  restoredBy: dbTodo.restored_by,
  restoredByUser: dbTodo.restored_by_user,
  isRestored: dbTodo.is_restored
});

export default useArchive;
