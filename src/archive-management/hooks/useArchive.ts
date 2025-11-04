import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import {
  ArchivedCase,
  ArchivedTodo,
  ArchiveStats,
  ArchiveFilters,
  ArchiveActionData,
  RestoreActionData,
} from "@/types";
import { useAuth } from "@/shared/hooks/useAuth";
import { usePermissions } from "@/user-management/hooks/useUserProfile";

export function useArchive() {
  const [archivedCases, setArchivedCases] = useState<ArchivedCase[]>([]);
  const [archivedTodos, setArchivedTodos] = useState<ArchivedTodo[]>([]);
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  // Cargar elementos archivados
  const fetchArchivedItems = useCallback(
    async (filters?: ArchiveFilters) => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.id) {
          setArchivedCases([]);
          setArchivedTodos([]);
          return;
        }

        // Cargar casos archivados usando función con permisos granulares
        if (
          !filters?.type ||
          filters.type === "cases" ||
          filters.type === "all"
        ) {
          const { data: casesData, error: casesError } = await supabase.rpc(
            "get_accessible_archived_cases",
            {
              p_user_id: user.id,
              p_limit: 1000, // Aumentar límite para obtener todos los casos
              p_offset: 0,
            }
          );

          if (casesError) throw casesError;

          let filteredCases = casesData || [];

          // Aplicar filtros del lado del cliente
          if (filters) {
            if (filters.archivedBy) {
              filteredCases = filteredCases.filter(
                (c: any) => c.archived_by === filters.archivedBy
              );
            }
            if (filters.dateFrom) {
              filteredCases = filteredCases.filter(
                (c: any) => c.archived_at >= filters.dateFrom!
              );
            }
            if (filters.dateTo) {
              filteredCases = filteredCases.filter(
                (c: any) => c.archived_at <= filters.dateTo!
              );
            }
            if (filters.search) {
              const searchLower = filters.search.toLowerCase();
              filteredCases = filteredCases.filter(
                (c: any) =>
                  c.case_number?.toLowerCase().includes(searchLower) ||
                  c.description?.toLowerCase().includes(searchLower)
              );
            }
            if (filters.showRestored !== undefined) {
              filteredCases = filteredCases.filter((c: any) =>
                filters.showRestored ? c.restored_at : !c.restored_at
              );
            }
          }

          setArchivedCases(filteredCases.map(mapArchivedCaseFromDB) || []);
        }

        // Cargar TODOs archivados usando función con permisos granulares
        if (
          !filters?.type ||
          filters.type === "todos" ||
          filters.type === "all"
        ) {
          const { data: todosData, error: todosError } = await supabase.rpc(
            "get_accessible_archived_todos",
            {
              p_user_id: user.id,
              p_limit: 1000, // Aumentar límite para obtener todos los todos
              p_offset: 0,
            }
          );

          if (todosError) throw todosError;

          let filteredTodos = todosData || [];

          // Aplicar filtros del lado del cliente
          if (filters) {
            if (filters.archivedBy) {
              filteredTodos = filteredTodos.filter(
                (t: any) => t.archived_by === filters.archivedBy
              );
            }
            if (filters.dateFrom) {
              filteredTodos = filteredTodos.filter(
                (t: any) => t.archived_at >= filters.dateFrom!
              );
            }
            if (filters.dateTo) {
              filteredTodos = filteredTodos.filter(
                (t: any) => t.archived_at <= filters.dateTo!
              );
            }
            if (filters.search) {
              const searchLower = filters.search.toLowerCase();
              filteredTodos = filteredTodos.filter(
                (t: any) =>
                  t.title?.toLowerCase().includes(searchLower) ||
                  t.description?.toLowerCase().includes(searchLower)
              );
            }
            if (filters.showRestored !== undefined) {
              filteredTodos = filteredTodos.filter((t: any) =>
                filters.showRestored ? t.restored_at : !t.restored_at
              );
            }
          }

          setArchivedTodos(filteredTodos.map(mapArchivedTodoFromDB) || []);
        }
      } catch (err) {
        console.error("Error fetching archived items:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  // Cargar estadísticas
  const fetchStats = useCallback(async () => {
    try {
      // Usar los datos ya cargados en lugar de hacer consultas separadas
      const totalArchivedCases = archivedCases.length;
      const totalArchivedTodos = archivedTodos.length;

      const currentMonth = new Date()
        .toISOString()
        .split("T")[0]
        .substring(0, 7); // YYYY-MM

      const archivedThisMonth = [
        ...archivedCases.map((c) => ({ archived_at: c.archivedAt })),
        ...archivedTodos.map((t) => ({ archived_at: t.archivedAt })),
      ].filter((item) => item.archived_at?.startsWith(currentMonth)).length;

      const restoredThisMonth = [
        ...archivedCases.filter((c) => c.restoredAt),
        ...archivedTodos.filter((t) => t.restoredAt),
      ].filter((item) => {
        const restoredAt = "restoredAt" in item ? item.restoredAt : null;
        return restoredAt?.startsWith(currentMonth);
      }).length;

      const totalArchivedTimeMinutes = [
        ...archivedCases.map((c) => c.totalTimeMinutes || 0),
        ...archivedTodos.map((t) => t.totalTimeMinutes || 0),
      ].reduce((sum, time) => sum + time, 0);

      setStats({
        totalArchivedCases,
        totalArchivedTodos,
        totalArchivedTimeMinutes,
        archivedThisMonth,
        restoredThisMonth,
        byUser: [], // Se puede implementar más adelante
        monthlyStats: [], // Se puede implementar más adelante
      });
    } catch (err) {
      console.error("Error fetching archive stats:", err);
    }
  }, [archivedCases, archivedTodos]);

  // Archivar caso
  const archiveCase = useCallback(
    async (data: ArchiveActionData) => {
      try {
        if (!user?.id) throw new Error("Usuario no autenticado");

        const { error } = await supabase.rpc("archive_case", {
          p_case_id: data.id,
          p_archive_reason: data.reason,
          p_user_id: user.id,
        });

        if (error) throw error;

        // Invalidar queries relacionadas para que todas las páginas se actualicen
        queryClient.invalidateQueries({ queryKey: ["cases"] });
        queryClient.invalidateQueries({ queryKey: ["caseControls"] });
        queryClient.invalidateQueries({ queryKey: ["caseControl"] });

        // Recargar datos del archivo
        await fetchArchivedItems();
        await fetchStats();

        return { success: true };
      } catch (err) {
        console.error("Error archiving case:", err);
        return {
          success: false,
          error: err instanceof Error ? err.message : "Error desconocido",
        };
      }
    },
    [user?.id, fetchArchivedItems, fetchStats, queryClient]
  );

  // Archivar TODO
  const archiveTodo = useCallback(
    async (data: ArchiveActionData) => {
      try {
        if (!user?.id) throw new Error("Usuario no autenticado");

        const { error } = await supabase.rpc("archive_todo", {
          p_todo_id: data.id,
          p_archive_reason: data.reason,
          p_user_id: user.id,
        });

        if (error) throw error;

        // Invalidar queries relacionadas para que todas las páginas se actualicen
        queryClient.invalidateQueries({ queryKey: ["todos"] });
        queryClient.invalidateQueries({ queryKey: ["todoControls"] });
        queryClient.invalidateQueries({ queryKey: ["todoControl"] });

        // Recargar datos del archivo
        await fetchArchivedItems();
        await fetchStats();

        return { success: true };
      } catch (err) {
        console.error("Error archiving todo:", err);
        return {
          success: false,
          error: err instanceof Error ? err.message : "Error desconocido",
        };
      }
    },
    [user?.id, fetchArchivedItems, fetchStats, queryClient]
  );

  // Restaurar caso
  const restoreCase = useCallback(
    async (data: RestoreActionData) => {
      try {
        if (!user?.id) throw new Error("Usuario no autenticado");

        const { error } = await supabase.rpc("restore_case", {
          p_archived_id: data.id,
          p_restored_by: user.id,
          p_reason: data.reason,
        });

        if (error) throw error;

        // Invalidar queries relacionadas para que todas las páginas se actualicen
        queryClient.invalidateQueries({ queryKey: ["cases"] });
        queryClient.invalidateQueries({ queryKey: ["caseControls"] });
        queryClient.invalidateQueries({ queryKey: ["caseControl"] });

        // Recargar datos del archivo
        await fetchArchivedItems();
        await fetchStats();

        return { success: true };
      } catch (err) {
        console.error("Error restoring case:", err);
        return {
          success: false,
          error: err instanceof Error ? err.message : "Error desconocido",
        };
      }
    },
    [user?.id, fetchArchivedItems, fetchStats, queryClient]
  );

  // Restaurar TODO
  const restoreTodo = useCallback(
    async (data: RestoreActionData) => {
      try {
        if (!user?.id) throw new Error("Usuario no autenticado");

        const { error } = await supabase.rpc("restore_todo", {
          p_archived_id: data.id,
          p_restored_by: user.id,
          p_reason: data.reason,
        });

        if (error) throw error;

        // Invalidar queries relacionadas para que todas las páginas se actualicen
        queryClient.invalidateQueries({ queryKey: ["todos"] });
        queryClient.invalidateQueries({ queryKey: ["todoControls"] });
        queryClient.invalidateQueries({ queryKey: ["todoControl"] });

        // Recargar datos del archivo
        await fetchArchivedItems();
        await fetchStats();

        return { success: true };
      } catch (err) {
        console.error("Error restoring todo:", err);
        return {
          success: false,
          error: err instanceof Error ? err.message : "Error desconocido",
        };
      }
    },
    [user?.id, fetchArchivedItems, fetchStats, queryClient]
  );

  // Verificar permisos usando el sistema granular local
  const canArchive = useCallback(async () => {
    if (!user?.id) return false;

    // Usar el sistema de permisos granulares del hook
    return (
      hasPermission("archive.create_own") ||
      hasPermission("archive.create_team") ||
      hasPermission("archive.create_all")
    );
  }, [user?.id, hasPermission]);

  const canRestore = useCallback(async () => {
    if (!user?.id) return false;

    // Usar el sistema de permisos granulares del hook
    return (
      hasPermission("archive.restore_own") ||
      hasPermission("archive.restore_team") ||
      hasPermission("archive.restore_all")
    );
  }, [user?.id, hasPermission]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchArchivedItems();
  }, [fetchArchivedItems]);

  // Actualizar estadísticas cuando cambien los datos
  useEffect(() => {
    if (archivedCases.length > 0 || archivedTodos.length > 0) {
      fetchStats();
    }
  }, [archivedCases, archivedTodos, fetchStats]);

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
    canRestore,
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
  isRestored: dbCase.is_restored,
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
  isRestored: dbTodo.is_restored,
});

export default useArchive;
