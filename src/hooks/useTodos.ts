import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
  TodoItem, 
  CreateTodoData, 
  UpdateTodoData, 
  TodoFilters
} from '../types';
import { useAuth } from './useAuth';
import { usePermissions } from './useUserProfile';

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { userProfile } = usePermissions();

  // Cargar TODOs con filtros
  const fetchTodos = useCallback(async (filters?: TodoFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('todos')
        .select(`
          *,
          priority:todo_priorities(*),
          assigned_user:user_profiles!todos_assigned_user_id_fkey(*),
          created_by_user:user_profiles!todos_created_by_user_id_fkey(*),
          control:todo_control(
            *,
            status:case_status_control(*),
            user:user_profiles(*)
          )
        `)
        .order('created_at', { ascending: false });

      // Las políticas RLS de la base de datos ya manejan los filtros de permisos
      // Los analistas solo verán TODOs que les pertenecen según las políticas RLS
      // No necesitamos filtrar aquí porque la base de datos ya lo hace

      // Aplicar filtros adicionales
      if (filters) {
        if (filters.priorityId) {
          query = query.eq('priority_id', filters.priorityId);
        }
        if (filters.assignedUserId) {
          query = query.eq('assigned_user_id', filters.assignedUserId);
        }
        if (filters.createdBy) {
          query = query.eq('created_by', filters.createdBy);
        }
        if (filters.dueDateFrom) {
          query = query.gte('due_date', filters.dueDateFrom);
        }
        if (filters.dueDateTo) {
          query = query.lte('due_date', filters.dueDateTo);
        }
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedTodos: TodoItem[] = (data || []).map(todo => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        priorityId: todo.priority_id,
        assignedUserId: todo.assigned_user_id,
        estimatedMinutes: todo.estimated_minutes,
        dueDate: todo.due_date,
        isCompleted: todo.is_completed,
        completedAt: todo.completed_at,
        createdBy: todo.created_by_user_id,
        createdAt: todo.created_at,
        updatedAt: todo.updated_at,
        priority: todo.priority ? {
          id: todo.priority.id,
          name: todo.priority.name,
          description: todo.priority.description,
          color: todo.priority.color,
          level: todo.priority.level,
          isActive: todo.priority.is_active,
          displayOrder: todo.priority.display_order,
          createdAt: todo.priority.created_at,
          updatedAt: todo.priority.updated_at
        } : undefined,
        assignedUser: todo.assigned_user ? {
          id: todo.assigned_user.id,
          email: todo.assigned_user.email,
          fullName: todo.assigned_user.full_name,
          roleId: todo.assigned_user.role_id,
          isActive: todo.assigned_user.is_active,
          lastLoginAt: todo.assigned_user.last_login_at,
          createdAt: todo.assigned_user.created_at,
          updatedAt: todo.assigned_user.updated_at
        } : undefined,
        createdByUser: todo.created_by_user ? {
          id: todo.created_by_user.id,
          email: todo.created_by_user.email,
          fullName: todo.created_by_user.full_name,
          roleId: todo.created_by_user.role_id,
          isActive: todo.created_by_user.is_active,
          lastLoginAt: todo.created_by_user.last_login_at,
          createdAt: todo.created_by_user.created_at,
          updatedAt: todo.created_by_user.updated_at
        } : undefined,
        control: todo.control ? {
          id: todo.control.id,
          todoId: todo.control.todo_id,
          userId: todo.control.user_id,
          statusId: todo.control.status_id,
          totalTimeMinutes: todo.control.total_time_minutes,
          timerStartAt: todo.control.timer_start_at,
          isTimerActive: todo.control.is_timer_active,
          assignedAt: todo.control.assigned_at,
          startedAt: todo.control.started_at,
          completedAt: todo.control.completed_at,
          createdAt: todo.control.created_at,
          updatedAt: todo.control.updated_at,
          status: todo.control.status ? {
            id: todo.control.status.id,
            name: todo.control.status.name,
            description: todo.control.status.description,
            color: todo.control.status.color,
            isActive: todo.control.status.is_active,
            displayOrder: todo.control.status.display_order,
            createdAt: todo.control.status.created_at,
            updatedAt: todo.control.status.updated_at
          } : undefined,
          user: todo.control.user ? {
            id: todo.control.user.id,
            email: todo.control.user.email,
            fullName: todo.control.user.full_name,
            roleId: todo.control.user.role_id,
            isActive: todo.control.user.is_active,
            lastLoginAt: todo.control.user.last_login_at,
            createdAt: todo.control.user.created_at,
            updatedAt: todo.control.user.updated_at
          } : undefined
        } : undefined
      }));

      setTodos(formattedTodos);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  // Crear nuevo TODO
  const createTodo = async (todoData: CreateTodoData): Promise<TodoItem | null> => {
    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('todos')
        .insert({
          title: todoData.title,
          description: todoData.description,
          priority_id: todoData.priorityId,
          assigned_user_id: todoData.assignedUserId,
          estimated_minutes: todoData.estimatedMinutes,
          due_date: todoData.dueDate || null,
          created_by_user_id: user?.id
        })
        .select()
        .single();

      if (createError) throw createError;

      await fetchTodos(); // Recargar la lista
      return data;
    } catch (err) {
      console.error('Error creating todo:', err);
      setError(err instanceof Error ? err.message : 'Error al crear TODO');
      return null;
    }
  };

  // Actualizar TODO
  const updateTodo = async (todoData: UpdateTodoData): Promise<boolean> => {
    try {
      setError(null);

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (todoData.title !== undefined) updateData.title = todoData.title;
      if (todoData.description !== undefined) updateData.description = todoData.description;
      if (todoData.priorityId !== undefined) updateData.priority_id = todoData.priorityId;
      if (todoData.assignedUserId !== undefined) updateData.assigned_user_id = todoData.assignedUserId;
      if (todoData.estimatedMinutes !== undefined) updateData.estimated_minutes = todoData.estimatedMinutes;
      if (todoData.dueDate !== undefined) updateData.due_date = todoData.dueDate || null;

      const { error: updateError } = await supabase
        .from('todos')
        .update(updateData)
        .eq('id', todoData.id);

      if (updateError) throw updateError;

      await fetchTodos(); // Recargar la lista
      return true;
    } catch (err) {
      console.error('Error updating todo:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar TODO');
      return false;
    }
  };

  // Eliminar TODO
  const deleteTodo = async (todoId: string): Promise<boolean> => {
    try {
      setError(null);
const { data, error: deleteError } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId)
        .select(); // Agregamos select para ver qué se eliminó

if (deleteError) {
        console.error('❌ Error en la eliminación:', deleteError);
        throw deleteError;
      }

      // Verificar si realmente se eliminó algo
      if (!data || data.length === 0) {
        console.warn('⚠️ No se eliminó ningún registro. Posible problema de permisos RLS.');
        throw new Error('No se pudo eliminar el TODO. Verifique sus permisos.');
      }

await fetchTodos(); // Recargar la lista
      return true;
    } catch (err) {
      console.error('💥 Error deleting todo:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar TODO');
      return false;
    }
  };

  // Obtener TODO por ID
  const getTodoById = (id: string): TodoItem | undefined => {
    return todos.find(todo => todo.id === id);
  };

  // Filtros útiles
  const getMyTodos = (): TodoItem[] => {
    return todos.filter(todo => todo.assignedUserId === user?.id || todo.createdBy === user?.id);
  };

  const getTodosByPriority = (priorityId: string): TodoItem[] => {
    return todos.filter(todo => todo.priorityId === priorityId);
  };

  const getOverdueTodos = (): TodoItem[] => {
    const today = new Date().toISOString().split('T')[0];
    return todos.filter(todo => 
      todo.dueDate && 
      todo.dueDate < today && 
      !todo.isCompleted // Usar is_completed en lugar del status del control
    );
  };

  const getTodosWithoutControl = (): TodoItem[] => {
    return todos.filter(todo => !todo.control);
  };

  // Cargar TODOs al montar el componente
  useEffect(() => {
    if (userProfile) {
      fetchTodos();
    }
  }, [fetchTodos, userProfile]);

  return {
    todos,
    loading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    getTodoById,
    getMyTodos,
    getTodosByPriority,
    getOverdueTodos,
    getTodosWithoutControl,
    // Estadísticas rápidas
    totalTodos: todos.length,
    myTodos: getMyTodos(),
    overdueTodos: getOverdueTodos(),
    todosWithoutControl: getTodosWithoutControl()
  };
}
