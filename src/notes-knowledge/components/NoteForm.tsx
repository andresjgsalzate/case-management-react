import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { NoteFormData } from '@/types';
import { useCases } from '@/case-management/hooks/useCases';
import { useUsers } from '@/user-management/hooks/useUsers';
import { useNotesPermissions } from '@/notes-knowledge/hooks/useNotesPermissions';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';
import { useNoteTags } from '../hooks/useNotes';

interface NoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NoteFormData) => void;
  initialData?: Partial<NoteFormData>;
  isEdit?: boolean;
  loading?: boolean;
}

export const NoteForm: React.FC<NoteFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
  loading = false
}) => {
  const { canAssignNotes, canAssociateCases } = useNotesPermissions();
  const { data: cases } = useCases();
  const { data: users } = useUsers();
  const { data: existingTags } = useNoteTags();
  const { showError } = useNotification();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    tags: [],
    caseId: '',
    assignedTo: '',
    isImportant: false,
    reminderDate: ''
  });

  const [newTag, setNewTag] = useState('');
  const [caseSearch, setCaseSearch] = useState('');
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);
  const [reminderDateOnly, setReminderDateOnly] = useState('');
  const [reminderTimeOnly, setReminderTimeOnly] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Invalidar la query de etiquetas para obtener las más recientes
      queryClient.invalidateQueries({ queryKey: ['note-tags'] });
      
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          content: initialData.content || '',
          tags: initialData.tags || [],
          caseId: initialData.caseId || '',
          assignedTo: initialData.assignedTo || '',
          isImportant: initialData.isImportant || false,
          reminderDate: initialData.reminderDate || ''
        });

        // Inicializar búsqueda de casos
        if (initialData.caseId && cases) {
          const selectedCase = cases.find(c => c.id === initialData.caseId);
          setCaseSearch(selectedCase?.numeroCaso || '');
        }

        // Separar fecha y hora del recordatorio
        if (initialData.reminderDate) {
          const reminderDateTime = new Date(initialData.reminderDate);
          setReminderDateOnly(reminderDateTime.toISOString().slice(0, 10));
          setReminderTimeOnly(reminderDateTime.toISOString().slice(11, 16));
        }
      } else {
        // Limpiar formulario para nueva nota
        setFormData({
          title: '',
          content: '',
          tags: [],
          caseId: '',
          assignedTo: '',
          isImportant: false,
          reminderDate: ''
        });
        setCaseSearch('');
        setReminderDateOnly('');
        setReminderTimeOnly('');
      }
    }
  }, [isOpen, initialData, cases, queryClient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showError('Error de validación', 'El título es requerido');
      return;
    }

    if (!formData.content.trim()) {
      showError('Error de validación', 'El contenido es requerido');
      return;
    }

    // Combinar fecha y hora para el recordatorio
    let combinedReminderDate = '';
    if (reminderDateOnly && reminderTimeOnly) {
      combinedReminderDate = new Date(`${reminderDateOnly}T${reminderTimeOnly}`).toISOString();
    } else if (reminderDateOnly) {
      combinedReminderDate = new Date(`${reminderDateOnly}T09:00`).toISOString();
    }

    const submitData = {
      ...formData,
      caseId: formData.caseId || undefined,
      assignedTo: formData.assignedTo || undefined,
      reminderDate: combinedReminderDate || undefined
    };

    onSubmit(submitData);
  };

  // Filtrar casos por búsqueda
  const filteredCases = cases?.filter(case_ => 
    case_.numeroCaso.toLowerCase().includes(caseSearch.toLowerCase()) ||
    case_.descripcion.toLowerCase().includes(caseSearch.toLowerCase())
  ) || [];

  // Manejar selección de caso
  const handleCaseSelect = (caseId: string, caseNumber: string) => {
    setFormData(prev => ({ ...prev, caseId }));
    setCaseSearch(caseNumber);
    setShowCaseDropdown(false);
  };

  // Manejar cambio en búsqueda de casos
  const handleCaseSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCaseSearch(value);
    
    // Si el valor está vacío, limpiar la selección
    if (!value) {
      setFormData(prev => ({ ...prev, caseId: '' }));
    }
    
    // Mostrar dropdown si hay texto
    setShowCaseDropdown(value.length > 0);
  };

  // Manejar cambios en fecha y hora
  const handleReminderDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReminderDateOnly(e.target.value);
  };

  const handleReminderTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReminderTimeOnly(e.target.value);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
      setShowTagSuggestions(false);
    }
  };

  const handleSelectTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setNewTag('');
    setShowTagSuggestions(false);
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewTag(value);
    setShowTagSuggestions(value.length > 0);
  };

  const handleTagInputFocus = () => {
    if (newTag.length > 0) {
      setShowTagSuggestions(true);
    }
  };

  const handleTagInputBlur = () => {
    // Delay to allow for click events
    setTimeout(() => {
      setShowTagSuggestions(false);
    }, 200);
  };

  // Filtrar etiquetas existentes para sugerencias
  const filteredTagSuggestions = existingTags?.filter(tag => 
    tag.toLowerCase().includes(newTag.toLowerCase()) &&
    !formData.tags.includes(tag)
  ).slice(0, 10) || [];

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Nota' : 'Nueva Nota'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <Input
          label="Título *"
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setFormData(prev => ({ ...prev, title: e.target.value }))
          }
          required
          placeholder="Ingresa el título de la nota..."
          className="w-full"
        />

        {/* Contenido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contenido *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            required
            rows={6}
            placeholder="Ingresa el contenido de la nota..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        {/* Etiquetas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Etiquetas
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 inline-flex items-center p-0.5 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          
          {/* Input de etiquetas con sugerencias */}
          <div className="relative">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={handleTagInputChange}
                onFocus={handleTagInputFocus}
                onBlur={handleTagInputBlur}
                onKeyPress={handleKeyPress}
                placeholder="Agregar etiqueta..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="secondary"
                size="sm"
                disabled={!newTag.trim()}
                className="flex-shrink-0"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Sugerencias de etiquetas */}
            {showTagSuggestions && filteredTagSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                <div className="py-1">
                  {filteredTagSuggestions.map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectTag(tag)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 transition-colors text-sm"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">{tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Etiquetas frecuentes */}
            {existingTags && existingTags.length > 0 && !showTagSuggestions && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Etiquetas frecuentes:</p>
                <div className="flex flex-wrap gap-1">
                  {existingTags.slice(0, 8).map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectTag(tag)}
                      disabled={formData.tags.includes(tag)}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        formData.tags.includes(tag)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Caso asociado */}
        {canAssociateCases && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Caso Asociado
            </label>
            <div className="relative">
              <input
                type="text"
                value={caseSearch}
                onChange={handleCaseSearchChange}
                onFocus={() => setShowCaseDropdown(caseSearch.length > 0)}
                onBlur={() => setTimeout(() => setShowCaseDropdown(false), 200)}
                placeholder="Buscar por número de caso o descripción..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
              
              {/* Dropdown de casos */}
              {showCaseDropdown && filteredCases.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredCases.map((case_) => (
                    <button
                      key={case_.id}
                      type="button"
                      onClick={() => handleCaseSelect(case_.id, case_.numeroCaso)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {case_.numeroCaso}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {case_.descripcion}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Caso seleccionado */}
            {formData.caseId && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">Caso seleccionado: </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {cases?.find(c => c.id === formData.caseId)?.numeroCaso}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, caseId: '' }));
                      setCaseSearch('');
                    }}
                    className="ml-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Usuario asignado */}
        {canAssignNotes && (
          <Select
            label="Asignar a"
            value={formData.assignedTo}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
              setFormData(prev => ({ ...prev, assignedTo: e.target.value }))
            }
          >
            <option value="">Sin asignar</option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName || user.email}
              </option>
            ))}
          </Select>
        )}

        {/* Fecha y hora de recordatorio */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recordatorio
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={reminderDateOnly}
                  onChange={handleReminderDateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              {/* Hora */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Hora
                </label>
                <input
                  type="time"
                  value={reminderTimeOnly}
                  onChange={handleReminderTimeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            {/* Previsualización del recordatorio */}
            {reminderDateOnly && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-medium">Recordatorio programado: </span>
                  {new Date(`${reminderDateOnly}T${reminderTimeOnly || '09:00'}`).toLocaleString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Importante */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isImportant"
            checked={formData.isImportant}
            onChange={(e) => setFormData(prev => ({ ...prev, isImportant: e.target.checked }))}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isImportant" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            Marcar como importante
          </label>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {isEdit ? 'Actualizar' : 'Crear'} Nota
          </Button>
        </div>
      </form>
    </Modal>
  );
};
