import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { CreateTodoData } from '../types';
import { useTodoPriorities } from '../hooks/useTodoPriorities';
import { useUsers } from '../hooks/useUsers';

interface TodoFormProps {
  onSubmit: (data: CreateTodoData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<CreateTodoData>;
}

export function TodoForm({ onSubmit, onCancel, loading = false, initialData }: TodoFormProps) {
  const [formData, setFormData] = useState<CreateTodoData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priorityId: initialData?.priorityId || '',
    assignedUserId: initialData?.assignedUserId || '',
    estimatedMinutes: initialData?.estimatedMinutes || undefined,
    dueDate: initialData?.dueDate || ''
  });

  const { priorities, loading: prioritiesLoading } = useTodoPriorities();
  const { data: users = [], isLoading: usersLoading } = useUsers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      // Convertir cadenas vacías a undefined para campos opcionales
      dueDate: formData.dueDate || undefined,
      estimatedMinutes: formData.estimatedMinutes || undefined
    };

    await onSubmit(dataToSubmit);
  };

  const handleInputChange = (field: keyof CreateTodoData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Título *
        </label>
        <Input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Título del TODO"
          required
          disabled={loading}
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descripción
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Descripción detallada del TODO"
          rows={3}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                   shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                   dark:bg-gray-700 dark:text-white resize-none"
        />
      </div>

      {/* Prioridad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Prioridad *
        </label>
        <Select
          value={formData.priorityId}
          onChange={(e) => handleInputChange('priorityId', e.target.value)}
          required
          disabled={loading || prioritiesLoading}
        >
          <option value="">Seleccionar prioridad</option>
          {priorities.map((priority) => (
            <option key={priority.id} value={priority.id}>
              {priority.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Usuario asignado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Usuario asignado *
          </label>
          <Select
            value={formData.assignedUserId}
            onChange={(e) => handleInputChange('assignedUserId', e.target.value)}
            disabled={loading || usersLoading}
            required
          >
            <option value="">Seleccionar usuario</option>
            {users.filter((user: any) => user.isActive).map((user: any) => (
              <option key={user.id} value={user.id}>
                {user.fullName || user.email}
              </option>
            ))}
          </Select>
        </div>

        {/* Tiempo estimado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tiempo estimado (minutos)
          </label>
          <Input
            type="number"
            value={formData.estimatedMinutes || ''}
            onChange={(e) => handleInputChange('estimatedMinutes', 
              e.target.value ? parseInt(e.target.value) : undefined
            )}
            placeholder="60"
            min="1"
            disabled={loading}
          />
        </div>
      </div>

      {/* Fecha límite */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Fecha límite
        </label>
        <Input
          type="date"
          value={formData.dueDate}
          onChange={(e) => handleInputChange('dueDate', e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || !formData.title || !formData.priorityId}
        >
          {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear TODO')}
        </Button>
      </div>
    </form>
  );
}
