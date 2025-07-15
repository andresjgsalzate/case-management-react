import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { TodoMetrics } from '../types';
import { useAuth } from './useAuth';

export function useTodoMetrics() {
  const [metrics, setMetrics] = useState<TodoMetrics>({
    totalTodos: 0,
    pendingTodos: 0,
    inProgressTodos: 0,
    completedTodos: 0,
    overdueTodos: 0,
    totalTimeToday: 0,
    totalTimeWeek: 0,
    totalTimeMonth: 0,
    averageCompletionTime: 0,
    productivityScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Calcular métricas
  const calculateMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fechas para cálculos
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      const monthStart = new Date(today);
      monthStart.setMonth(today.getMonth() - 1);

      // Obtener IDs de estados para filtros de control
      const { data: statuses } = await supabase
        .from('case_status_control')
        .select('id, name');

      const pendingStatusId = statuses?.find(s => s.name === 'PENDIENTE')?.id;
      const inProgressStatusId = statuses?.find(s => s.name === 'EN CURSO')?.id;

      // Obtener todos los TODOs del usuario (según rol)
      let todosQuery = supabase
        .from('todos')
        .select(`
          id,
          due_date,
          created_at,
          created_by_user_id,
          assigned_user_id,
          is_completed,
          control:todo_control(
            id,
            status_id,
            total_time_minutes,
            completed_at,
            created_at
          )
        `);

      // Filtrar según rol del usuario
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('role_id, roles(name)')
        .eq('id', user?.id)
        .single();

      const userRole = (userProfile as any)?.roles?.name;

      if (userRole === 'analista') {
        // Analistas solo ven sus TODOs
        todosQuery = todosQuery.or(`created_by_user_id.eq.${user?.id},assigned_user_id.eq.${user?.id}`);
      }
      // Admin y supervisor ven todos

      const { data: todos, error: todosError } = await todosQuery;

      if (todosError) throw todosError;

      // Calcular métricas básicas
      const totalTodos = todos?.length || 0;
      
      // Usar is_completed de la tabla todos para determinar completados
      const completedTodos = todos?.filter(t => t.is_completed === true).length || 0;
      
      // Para pendientes e in progress, usar el control solo si existe, sino considerar pendiente
      const pendingTodos = todos?.filter(t => 
        !t.is_completed && (!t.control?.[0] || t.control?.[0]?.status_id === pendingStatusId)
      ).length || 0;
      
      const inProgressTodos = todos?.filter(t => 
        !t.is_completed && t.control?.[0]?.status_id === inProgressStatusId
      ).length || 0;

      // TODOs vencidos (solo los que NO están completados)
      const overdueTodos = todos?.filter(t => 
        t.due_date && 
        t.due_date < todayStr && 
        !t.is_completed
      ).length || 0;

      // Obtener entradas de tiempo para cálculos temporales
      let timeQuery = supabase
        .from('todo_time_entries')
        .select(`
          duration_minutes,
          start_time,
          todo_control_id,
          todo_control!inner(
            user_id,
            todo_id,
            todos!inner(created_by_user_id, assigned_user_id)
          )
        `)
        .not('duration_minutes', 'is', null);

      if (userRole === 'analista') {
        // Filtrar entradas de tiempo del usuario
        timeQuery = timeQuery.eq('todo_control.user_id', user?.id);
      }

      const { data: timeEntries } = await timeQuery;

      // Tiempo trabajado hoy
      const totalTimeToday = timeEntries?.filter(entry => {
        const entryDate = new Date(entry.start_time).toISOString().split('T')[0];
        return entryDate === todayStr;
      }).reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) || 0;

      // Tiempo trabajado esta semana
      const totalTimeWeek = timeEntries?.filter(entry => {
        const entryDate = new Date(entry.start_time);
        return entryDate >= weekStart;
      }).reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) || 0;

      // Tiempo trabajado este mes
      const totalTimeMonth = timeEntries?.filter(entry => {
        const entryDate = new Date(entry.start_time);
        return entryDate >= monthStart;
      }).reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) || 0;

      // Tiempo promedio de completación (usar is_completed en lugar del status)
      const completedTodosWithTime = todos?.filter(t => 
        t.is_completed && 
        t.control?.[0]?.total_time_minutes > 0
      ) || [];

      const averageCompletionTime = completedTodosWithTime.length > 0
        ? Math.round(
            completedTodosWithTime.reduce((sum, t) => sum + (t.control?.[0]?.total_time_minutes || 0), 0) /
            completedTodosWithTime.length
          )
        : 0;

      // Score de productividad (basado en TODOs completados vs pendientes/vencidos)
      let productivityScore = 0;
      if (totalTodos > 0) {
        const completionRate = completedTodos / totalTodos;
        const overdueRate = overdueTodos / totalTodos;
        productivityScore = Math.max(0, Math.min(100, 
          Math.round((completionRate * 70) + ((1 - overdueRate) * 30))
        ));
      }

      // Obtener tiempo manual adicional
      let manualTimeQuery = supabase
        .from('todo_manual_time_entries')
        .select(`
          duration_minutes,
          date,
          todo_control_id,
          todo_control!inner(
            user_id,
            todo_id,
            todos!inner(created_by_user_id, assigned_user_id)
          )
        `);

      if (userRole === 'analista') {
        manualTimeQuery = manualTimeQuery.eq('todo_control.user_id', user?.id);
      }

      const { data: manualEntries } = await manualTimeQuery;

      // Agregar tiempo manual a los totales
      const manualTimeToday = manualEntries?.filter(entry => entry.date === todayStr)
        .reduce((sum, entry) => sum + entry.duration_minutes, 0) || 0;

      const manualTimeWeek = manualEntries?.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekStart;
      }).reduce((sum, entry) => sum + entry.duration_minutes, 0) || 0;

      const manualTimeMonth = manualEntries?.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= monthStart;
      }).reduce((sum, entry) => sum + entry.duration_minutes, 0) || 0;

      // Actualizar métricas
      setMetrics({
        totalTodos,
        pendingTodos,
        inProgressTodos,
        completedTodos,
        overdueTodos,
        totalTimeToday: totalTimeToday + manualTimeToday,
        totalTimeWeek: totalTimeWeek + manualTimeWeek,
        totalTimeMonth: totalTimeMonth + manualTimeMonth,
        averageCompletionTime,
        productivityScore
      });

    } catch (err) {
      console.error('Error calculating todo metrics:', err);
      setError(err instanceof Error ? err.message : 'Error al calcular métricas');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Formatear tiempo en horas y minutos
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Obtener métricas formateadas para display
  const getFormattedMetrics = () => ({
    ...metrics,
    totalTimeTodayFormatted: formatTime(metrics.totalTimeToday),
    totalTimeWeekFormatted: formatTime(metrics.totalTimeWeek),
    totalTimeMonthFormatted: formatTime(metrics.totalTimeMonth),
    averageCompletionTimeFormatted: formatTime(metrics.averageCompletionTime),
    completionRate: metrics.totalTodos > 0 
      ? Math.round((metrics.completedTodos / metrics.totalTodos) * 100)
      : 0,
    overdueRate: metrics.totalTodos > 0
      ? Math.round((metrics.overdueTodos / metrics.totalTodos) * 100)
      : 0
  });

  // Calcular métricas al montar el componente
  useEffect(() => {
    if (user?.id) {
      calculateMetrics();
    }
  }, [calculateMetrics, user?.id]);

  return {
    metrics,
    loading,
    error,
    calculateMetrics,
    formatTime,
    getFormattedMetrics,
    // Métricas rápidas para cards
    todayTime: formatTime(metrics.totalTimeToday),
    weekTime: formatTime(metrics.totalTimeWeek),
    monthTime: formatTime(metrics.totalTimeMonth),
    avgTime: formatTime(metrics.averageCompletionTime),
    isProductivityHigh: metrics.productivityScore >= 70,
    isProductivityMedium: metrics.productivityScore >= 40 && metrics.productivityScore < 70,
    isProductivityLow: metrics.productivityScore < 40
  };
}
