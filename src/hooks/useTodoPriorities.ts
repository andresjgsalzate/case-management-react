import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TodoPriority } from '../types';

export function useTodoPriorities() {
  const [priorities, setPriorities] = useState<TodoPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar prioridades
  const fetchPriorities = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('todo_priorities')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      const formattedPriorities: TodoPriority[] = (data || []).map(priority => ({
        id: priority.id,
        name: priority.name,
        description: priority.description,
        color: priority.color,
        level: priority.level,
        isActive: priority.is_active,
        displayOrder: priority.display_order,
        createdAt: priority.created_at,
        updatedAt: priority.updated_at
      }));

      setPriorities(formattedPriorities);
    } catch (err) {
      console.error('Error fetching todo priorities:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Obtener prioridad por ID
  const getPriorityById = (id: string): TodoPriority | undefined => {
    return priorities.find(priority => priority.id === id);
  };

  // Obtener prioridad por nivel
  const getPriorityByLevel = (level: number): TodoPriority | undefined => {
    return priorities.find(priority => priority.level === level);
  };

  // Obtener color de prioridad
  const getPriorityColor = (id: string): string => {
    const priority = getPriorityById(id);
    return priority?.color || '#6B7280';
  };

  // Obtener nombre de prioridad
  const getPriorityName = (id: string): string => {
    const priority = getPriorityById(id);
    return priority?.name || 'Sin prioridad';
  };

  // Cargar prioridades al montar el componente
  useEffect(() => {
    fetchPriorities();
  }, []);

  return {
    priorities,
    loading,
    error,
    fetchPriorities,
    getPriorityById,
    getPriorityByLevel,
    getPriorityColor,
    getPriorityName,
    // Helpers para uso rápido
    priorityOptions: priorities.map(p => ({
      value: p.id,
      label: p.name,
      color: p.color,
      level: p.level
    })),
    // Prioridades por nivel
    veryLow: getPriorityByLevel(1),
    low: getPriorityByLevel(2),
    medium: getPriorityByLevel(3),
    high: getPriorityByLevel(4),
    critical: getPriorityByLevel(5)
  };
}

// Hook específico para seleccionar prioridades en formularios
export function usePrioritySelector() {
  const { priorities, loading, getPriorityColor, getPriorityName } = useTodoPriorities();

  const formatPriorityForSelect = (priority: TodoPriority) => ({
    value: priority.id,
    label: priority.name,
    color: priority.color,
    level: priority.level,
    description: priority.description
  });

  return {
    priorities: priorities.map(formatPriorityForSelect),
    loading,
    getPriorityColor,
    getPriorityName
  };
}
