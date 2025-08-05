import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { 
  TodoControl, 
  TodoControlUpdate,
  CreateTodoManualTimeEntryData,
  TodoTimeEntry,
  TodoManualTimeEntry
} from '@/types';
import { useAuth } from '@/shared/hooks/useAuth';
import { usePermissions } from '@/user-management/hooks/useUserProfile';
import { useTodoPermissions } from './useTodoPermissions';

// Cache para throttling de errores
const controlErrorLogCache = new Map<string, number>();

export const useTodoControl = () => {
  const [controls, setControls] = useState<TodoControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermissionError, setHasPermissionError] = useState<boolean>(false);
  const { user } = useAuth();
  const { userProfile } = usePermissions();
  const todoPermissions = useTodoPermissions();
  const queryClient = useQueryClient();

  // Cargar controles de TODO con permisos
  const fetchControls = useCallback(async (filters?: { userId?: string; todoId?: string }) => {
    try {
      setLoading(true);
      setError(null);

      // Verificar permisos de control
      if (!todoPermissions.canControlOwnTodos && !todoPermissions.canControlTeamTodos && !todoPermissions.canControlAllTodos) {
        const errorMsg = 'No tiene permisos para acceder al control de TODOs';
        setHasPermissionError(true);
        // Log solo una vez cada 5 segundos para evitar spam
        const now = Date.now();
        const errorKey = 'todo-control-permission-error';
        const lastLog = controlErrorLogCache.get(errorKey) || 0;
        if (now - lastLog > 5000) {
          controlErrorLogCache.set(errorKey, now);
          console.warn('🔒 [useTodoControl] Sin permisos de control de TODOs');
        }
        throw new Error(errorMsg);
      }

      let query = supabase
        .from('todo_control')
        .select(`
          *,
          user:user_profiles(*),
          status:case_status_control(*),
          todo:todos(
            *,
            priority:todo_priorities(*)
          ),
          time_entries:todo_time_entries(*),
          manual_time_entries:todo_manual_time_entries(*)
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros de scope de permisos
      if (todoPermissions.canControlOwnTodos && !todoPermissions.canControlAllTodos && userProfile?.id) {
        // Solo controles de TODOs propios
        query = query.eq('user_id', userProfile.id);
      }

      // Aplicar filtros adicionales
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.todoId) {
        query = query.eq('todo_id', filters.todoId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedControls: TodoControl[] = (data || []).map(control => ({
        id: control.id,
        todoId: control.todo_id,
        userId: control.user_id,
        statusId: control.status_id,
        totalTimeMinutes: control.total_time_minutes,
        timerStartAt: control.timer_start_at,
        isTimerActive: control.is_timer_active,
        assignedAt: control.assigned_at,
        startedAt: control.started_at,
        completedAt: control.completed_at,
        createdAt: control.created_at,
        updatedAt: control.updated_at,
        user: control.user ? {
          id: control.user.id,
          email: control.user.email,
          fullName: control.user.full_name,
          roleId: control.user.role_id,
          isActive: control.user.is_active,
          lastLoginAt: control.user.last_login_at,
          createdAt: control.user.created_at,
          updatedAt: control.user.updated_at
        } : undefined,
        status: control.status ? {
          id: control.status.id,
          name: control.status.name,
          description: control.status.description,
          color: control.status.color,
          isActive: control.status.is_active,
          displayOrder: control.status.display_order,
          createdAt: control.status.created_at,
          updatedAt: control.status.updated_at
        } : undefined,
        todo: control.todo ? {
          id: control.todo.id,
          title: control.todo.title,
          description: control.todo.description,
          priorityId: control.todo.priority_id,
          assignedUserId: control.todo.assigned_user_id,
          estimatedMinutes: control.todo.estimated_minutes,
          dueDate: control.todo.due_date,
          isCompleted: control.todo.is_completed,
          completedAt: control.todo.completed_at,
          createdBy: control.todo.created_by_user_id,
          createdAt: control.todo.created_at,
          updatedAt: control.todo.updated_at,
          priority: control.todo.priority ? {
            id: control.todo.priority.id,
            name: control.todo.priority.name,
            description: control.todo.priority.description,
            color: control.todo.priority.color,
            level: control.todo.priority.level,
            isActive: control.todo.priority.is_active,
            displayOrder: control.todo.priority.display_order,
            createdAt: control.todo.priority.created_at,
            updatedAt: control.todo.priority.updated_at
          } : undefined
        } : undefined,
        timeEntries: (control.time_entries || []).map((entry: any) => ({
          id: entry.id,
          todoControlId: entry.todo_control_id,
          userId: entry.user_id,
          startTime: entry.start_time,
          endTime: entry.end_time,
          durationMinutes: entry.duration_minutes,
          entryType: entry.entry_type,
          description: entry.description,
          createdAt: entry.created_at,
          updatedAt: entry.updated_at
        })),
        manualTimeEntries: (control.manual_time_entries || []).map((entry: any) => ({
          id: entry.id,
          todoControlId: entry.todo_control_id,
          userId: entry.user_id,
          date: entry.date,
          durationMinutes: entry.duration_minutes,
          description: entry.description,
          createdAt: entry.created_at,
          createdBy: entry.created_by
        }))
      }));

      setControls(formattedControls);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      
      // Solo log de errores una vez cada 3 segundos para evitar spam
      const now = Date.now();
      const errorKey = `todo-control-fetch-error-${errorMsg.slice(0, 20)}`;
      const lastLog = controlErrorLogCache.get(errorKey) || 0;
      if (now - lastLog > 3000) {
        controlErrorLogCache.set(errorKey, now);
        console.error('❌ [useTodoControl] Error al cargar controles:', errorMsg);
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [userProfile, todoPermissions]);

  // Crear control de TODO
  const createControl = async (todoId: string, assignedUserId?: string): Promise<TodoControl | null> => {
    try {
      setError(null);

      // Verificar permisos de control
      if (!todoPermissions.canControlOwnTodos && !todoPermissions.canControlTeamTodos && !todoPermissions.canControlAllTodos) {
        throw new Error('No tiene permisos para crear controles de TODOs');
      }

      // Obtener estado "PENDIENTE"
      const { data: pendingStatus } = await supabase
        .from('case_status_control')
        .select('id')
        .eq('name', 'PENDIENTE')
        .single();

      if (!pendingStatus) {
        throw new Error('Estado "PENDIENTE" no encontrado');
      }

      const { data, error: createError } = await supabase
        .from('todo_control')
        .insert({
          todo_id: todoId,
          user_id: assignedUserId || user?.id,
          status_id: pendingStatus.id,
          total_time_minutes: 0,
          is_timer_active: false,
          assigned_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;

      await fetchControls();
      return data;
    } catch (err) {
      console.error('Error creating todo control:', err);
      setError(err instanceof Error ? err.message : 'Error al crear control');
      return null;
    }
  };

  // Actualizar control
  const updateControl = async (controlId: string, updates: TodoControlUpdate): Promise<boolean> => {
    try {
      setError(null);

      // Obtener el control actual para verificar permisos
      const currentControl = controls.find(control => control.id === controlId);
      if (!currentControl) {
        throw new Error('Control no encontrado');
      }

      // Verificar permisos de control
      if (!userProfile?.id || !todoPermissions.canPerformActionOnTodo(
        currentControl.userId || null, 
        userProfile.id, 
        'control'
      )) {
        throw new Error('No tiene permisos para actualizar este control');
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.statusId !== undefined) updateData.status_id = updates.statusId;
      if (updates.totalTimeMinutes !== undefined) updateData.total_time_minutes = updates.totalTimeMinutes;
      if (updates.isTimerActive !== undefined) updateData.is_timer_active = updates.isTimerActive;
      if (updates.timerStartAt !== undefined) updateData.timer_start_at = updates.timerStartAt;
      if (updates.startedAt !== undefined) updateData.started_at = updates.startedAt;
      if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt;

      const { error: updateError } = await supabase
        .from('todo_control')
        .update(updateData)
        .eq('id', controlId);

      if (updateError) throw updateError;

      await fetchControls();
      return true;
    } catch (err) {
      console.error('Error updating todo control:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar control');
      return false;
    }
  };

  // Iniciar timer
  const startTimer = async (controlId: string): Promise<boolean> => {
    try {
      setError(null);

      // Obtener estado "EN CURSO"
      const { data: inProgressStatus } = await supabase
        .from('case_status_control')
        .select('id')
        .eq('name', 'EN CURSO')
        .single();

      if (!inProgressStatus) {
        throw new Error('Estado "EN CURSO" no encontrado');
      }

      const now = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('todo_control')
        .update({
          is_timer_active: true,
          timer_start_at: now,
          status_id: inProgressStatus.id,
          started_at: now,
          updated_at: now
        })
        .eq('id', controlId);

      if (updateError) throw updateError;

      // Crear entrada de tiempo automática
      await supabase
        .from('todo_time_entries')
        .insert({
          todo_control_id: controlId,
          user_id: user?.id,
          start_time: now,
          entry_type: 'automatic'
        });

      await fetchControls();
      return true;
    } catch (err) {
      console.error('Error starting timer:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar timer');
      return false;
    }
  };

  // Pausar timer
  const pauseTimer = async (controlId: string): Promise<boolean> => {
    try {
      setError(null);

      const control = controls.find(c => c.id === controlId);
      if (!control || !control.isTimerActive || !control.timerStartAt) {
        throw new Error('Timer no está activo');
      }

      const now = new Date().toISOString();
      const startTime = new Date(control.timerStartAt);
      const endTime = new Date(now);
      const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      // Actualizar control
      const { error: updateError } = await supabase
        .from('todo_control')
        .update({
          is_timer_active: false,
          timer_start_at: null,
          total_time_minutes: control.totalTimeMinutes + durationMinutes,
          updated_at: now
        })
        .eq('id', controlId);

      if (updateError) throw updateError;

      // Actualizar entrada de tiempo más reciente
      const { error: timeEntryError } = await supabase
        .from('todo_time_entries')
        .update({
          end_time: now,
          duration_minutes: durationMinutes,
          updated_at: now
        })
        .eq('todo_control_id', controlId)
        .eq('user_id', user?.id)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1);

      if (timeEntryError) throw timeEntryError;

      await fetchControls();
      return true;
    } catch (err) {
      console.error('Error pausing timer:', err);
      setError(err instanceof Error ? err.message : 'Error al pausar timer');
      return false;
    }
  };

  // Completar TODO
  const completeTodo = async (controlId: string): Promise<boolean> => {
    try {
      setError(null);

      // Si el timer está activo, pausarlo primero
      const control = controls.find(c => c.id === controlId);
      if (control?.isTimerActive) {
        await pauseTimer(controlId);
      }

      // Obtener estado "TERMINADA"
      const { data: completedStatus } = await supabase
        .from('case_status_control')
        .select('id')
        .eq('name', 'TERMINADA')
        .single();

      if (!completedStatus) {
        throw new Error('Estado "TERMINADA" no encontrado');
      }

      const now = new Date().toISOString();

      // Actualizar el control de TODO
      const { error: updateError } = await supabase
        .from('todo_control')
        .update({
          status_id: completedStatus.id,
          completed_at: now,
          is_timer_active: false,
          timer_start_at: null,
          updated_at: now
        })
        .eq('id', controlId);

      if (updateError) throw updateError;

      // CORRECCIÓN: Actualizar el campo is_completed en la tabla todos
      if (control?.todoId) {
        const { error: todoUpdateError } = await supabase
          .from('todos')
          .update({
            is_completed: true,
            updated_at: now
          })
          .eq('id', control.todoId);

        if (todoUpdateError) {
          console.error('Error updating todo is_completed status:', todoUpdateError);
          throw new Error('Error al actualizar el estado de completado del TODO');
        }
      }

      await fetchControls();
      
      // Invalidar queries relacionadas para actualizar la interfaz
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todoMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      
      return true;
    } catch (err) {
      console.error('Error completing todo:', err);
      setError(err instanceof Error ? err.message : 'Error al completar TODO');
      return false;
    }
  };

  // Reactivar TODO (descompletar)
  const reactivateTodo = async (controlId: string): Promise<boolean> => {
    try {
      setError(null);

      // Obtener estado "PENDIENTE"
      const { data: pendingStatus } = await supabase
        .from('case_status_control')
        .select('id')
        .eq('name', 'PENDIENTE')
        .single();

      if (!pendingStatus) {
        throw new Error('Estado "PENDIENTE" no encontrado');
      }

      const now = new Date().toISOString();
      const control = controls.find(c => c.id === controlId);

      // Actualizar el control de TODO
      const { error: updateError } = await supabase
        .from('todo_control')
        .update({
          status_id: pendingStatus.id,
          completed_at: null,
          updated_at: now
        })
        .eq('id', controlId);

      if (updateError) throw updateError;

      // Actualizar el campo is_completed en la tabla todos
      if (control?.todoId) {
        const { error: todoUpdateError } = await supabase
          .from('todos')
          .update({
            is_completed: false,
            updated_at: now
          })
          .eq('id', control.todoId);

        if (todoUpdateError) {
          console.error('Error updating todo is_completed status:', todoUpdateError);
          throw new Error('Error al actualizar el estado de completado del TODO');
        }
      }

      await fetchControls();
      
      // Invalidar queries relacionadas para actualizar la interfaz
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todoMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      
      return true;
    } catch (err) {
      console.error('Error reactivating todo:', err);
      setError(err instanceof Error ? err.message : 'Error al reactivar TODO');
      return false;
    }
  };

  // Agregar tiempo manual
  const addManualTime = async (data: CreateTodoManualTimeEntryData): Promise<boolean> => {
    try {
      setError(null);

      const { error: insertError } = await supabase
        .from('todo_manual_time_entries')
        .insert({
          todo_control_id: data.todoControlId,
          user_id: data.userId,
          date: data.date,
          duration_minutes: data.durationMinutes,
          description: data.description,
          created_by: user?.id
        });

      if (insertError) throw insertError;

      // Actualizar tiempo total del control
      const control = controls.find(c => c.id === data.todoControlId);
      if (control) {
        await updateControl(data.todoControlId, {
          totalTimeMinutes: control.totalTimeMinutes + data.durationMinutes
        });
      }

      await fetchControls();
      return true;
    } catch (err) {
      console.error('Error adding manual time:', err);
      setError(err instanceof Error ? err.message : 'Error al agregar tiempo manual');
      return false;
    }
  };

  // Obtener control por TODO ID
  const getControlByTodoId = (todoId: string): TodoControl | undefined => {
    return controls.find(control => control.todoId === todoId);
  };

  // Obtener controles del usuario actual
  const getMyControls = (): TodoControl[] => {
    return controls.filter(control => control.userId === user?.id);
  };

  // Obtener controles activos (con timer)
  const getActiveControls = (): TodoControl[] => {
    return controls.filter(control => control.isTimerActive);
  };

  // Obtener entradas de tiempo automático de un control
  const getTimeEntries = async (controlId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('todo_time_entries')
        .select('*')
        .eq('todo_control_id', controlId)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching time entries:', err);
      return [];
    }
  };

  // Obtener entradas de tiempo manual de un control
  const getManualTimeEntries = async (controlId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('todo_manual_time_entries')
        .select('*')
        .eq('todo_control_id', controlId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching manual time entries:', err);
      return [];
    }
  };

  // Eliminar entrada de tiempo manual
  const deleteManualTime = async (entryId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('todo_manual_time_entries')
        .delete()
        .eq('id', entryId)
        .select();
      
      if (error) {
        console.error('Error deleting manual time entry:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn('No se encontró la entrada a eliminar o no hay permisos');
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting manual time entry:', err);
      return false;
    }
  };

  // Eliminar entrada de tiempo automático
  const deleteTimeEntry = async (entryId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('todo_time_entries')
        .delete()
        .eq('id', entryId)
        .select();
      
      if (error) {
        console.error('Error deleting time entry:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn('No se encontró la entrada a eliminar o no hay permisos');
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting time entry:', err);
      return false;
    }
  };

  // Cargar controles al montar el componente (solo si tiene permisos)
  useEffect(() => {
    const hasControlPermissions = todoPermissions.canControlOwnTodos || todoPermissions.canControlTeamTodos || todoPermissions.canControlAllTodos;
    if (hasControlPermissions && !hasPermissionError) {
      fetchControls();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    todoPermissions.canControlOwnTodos, 
    todoPermissions.canControlTeamTodos, 
    todoPermissions.canControlAllTodos
  ]); // Removemos hasPermissionError para evitar bucles

  return {
    controls,
    loading,
    error,
    fetchControls,
    createControl,
    updateControl,
    startTimer,
    pauseTimer,
    completeTodo,
    reactivateTodo,
    addManualTime,
    getControlByTodoId,
    getMyControls,
    getActiveControls,
    getTimeEntries,
    getManualTimeEntries,
    deleteManualTime,
    deleteTimeEntry,
    // Estadísticas rápidas
    totalControls: controls.length,
    myControls: getMyControls(),
    activeControls: getActiveControls(),
    hasActiveTimer: getActiveControls().length > 0
  };
}

// Nuevos hooks para obtener todos los time entries (para reportes)
export const useAllTodoTimeEntries = () => {
  return useQuery({
    queryKey: ['allTodoTimeEntries'],
    queryFn: async (): Promise<TodoTimeEntry[]> => {
      const { data, error } = await supabase
        .from('todo_time_entries')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching all todo time entries:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useAllTodoManualTimeEntries = () => {
  return useQuery({
    queryKey: ['allTodoManualTimeEntries'],
    queryFn: async (): Promise<TodoManualTimeEntry[]> => {
      const { data, error } = await supabase
        .from('todo_manual_time_entries')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching all todo manual time entries:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useAllTodoControls = () => {
  return useQuery({
    queryKey: ['allTodoControls'],
    queryFn: async (): Promise<TodoControl[]> => {
      const { data, error } = await supabase
        .from('todo_control')
        .select(`
          *,
          user:user_profiles(*),
          status:case_status_control(*),
          todo:todos(
            *,
            priority:todo_priorities(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all todo controls:', error);
        throw error;
      }

      const formattedControls: TodoControl[] = (data || []).map(control => ({
        id: control.id,
        todoId: control.todo_id,
        userId: control.user_id,
        statusId: control.status_id,
        totalTimeMinutes: control.total_time_minutes,
        timerStartAt: control.timer_start_at,
        isTimerActive: control.is_timer_active,
        assignedAt: control.assigned_at,
        startedAt: control.started_at,
        completedAt: control.completed_at,
        createdAt: control.created_at,
        updatedAt: control.updated_at,
        user: control.user ? {
          id: control.user.id,
          email: control.user.email,
          fullName: control.user.full_name,
          roleId: control.user.role_id,
          isActive: control.user.is_active,
          lastLoginAt: control.user.last_login_at,
          createdAt: control.user.created_at,
          updatedAt: control.user.updated_at
        } : undefined,
        status: control.status ? {
          id: control.status.id,
          name: control.status.name,
          description: control.status.description,
          color: control.status.color,
          isActive: control.status.is_active,
          displayOrder: control.status.display_order,
          createdAt: control.status.created_at,
          updatedAt: control.status.updated_at
        } : undefined,
        todo: control.todo ? {
          id: control.todo.id,
          title: control.todo.title,
          description: control.todo.description,
          priorityId: control.todo.priority_id,
          assignedUserId: control.todo.assigned_user_id,
          estimatedMinutes: control.todo.estimated_minutes,
          dueDate: control.todo.due_date,
          isCompleted: control.todo.is_completed,
          completedAt: control.todo.completed_at,
          createdBy: control.todo.created_by_user_id,
          createdAt: control.todo.created_at,
          updatedAt: control.todo.updated_at,
          priority: control.todo.priority ? {
            id: control.todo.priority.id,
            name: control.todo.priority.name,
            description: control.todo.priority.description,
            color: control.todo.priority.color,
            level: control.todo.priority.level,
            isActive: control.todo.priority.is_active,
            displayOrder: control.todo.priority.display_order,
            createdAt: control.todo.priority.created_at,
            updatedAt: control.todo.priority.updated_at
          } : undefined
        } : undefined
      }));

      return formattedControls;
    },
  });
};
