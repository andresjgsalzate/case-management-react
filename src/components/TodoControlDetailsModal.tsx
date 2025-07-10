import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  PlusIcon, 
  CalendarIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { ConfirmationModal } from './ConfirmationModal';
import { TodoControl } from '../types';
import { useTodoControl } from '../hooks/useTodoControl';
import { formatDate, formatTimeDetailed, formatDateLocal } from '../utils/caseUtils';
import { useNotification } from './NotificationSystem';

interface TodoControlDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  todoControl: TodoControl | null;
}

interface ManualTimeForm {
  description: string;
  hours: number;
  minutes: number;
  date: string;
}

export const TodoControlDetailsModal: React.FC<TodoControlDetailsModalProps> = ({
  isOpen,
  onClose,
  todoControl
}) => {
  const { showSuccess, showError } = useNotification();
  const { 
    getTimeEntries, 
    getManualTimeEntries, 
    addManualTime, 
    deleteManualTime, 
    deleteTimeEntry 
  } = useTodoControl();
  
  const [showManualTimeForm, setShowManualTimeForm] = useState(false);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [manualTimeEntries, setManualTimeEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [manualTimeForm, setManualTimeForm] = useState<ManualTimeForm>({
    description: '',
    hours: 0,
    minutes: 0,
    date: getTodayDateString()
  });

  // Función helper para obtener la fecha de hoy en formato YYYY-MM-DD
  function getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && todoControl?.id) {
      loadTimeData();
    }
  }, [isOpen, todoControl?.id]);

  const loadTimeData = async () => {
    if (!todoControl?.id) return;

    setLoading(true);
    try {
      const [timeData, manualData] = await Promise.all([
        getTimeEntries(todoControl.id),
        getManualTimeEntries(todoControl.id)
      ]);
      
      setTimeEntries(timeData || []);
      setManualTimeEntries(manualData || []);
    } catch (error) {
      console.error('Error loading time data:', error);
      showError('Error al cargar datos de tiempo');
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualTime = async () => {
    if (!todoControl) return;

    const totalMinutes = (manualTimeForm.hours * 60) + manualTimeForm.minutes;
    if (totalMinutes <= 0) {
      showError('Debe especificar un tiempo válido');
      return;
    }

    if (!manualTimeForm.description.trim()) {
      showError('Debe proporcionar una descripción');
      return;
    }

    try {
      const success = await addManualTime({
        todoControlId: todoControl.id,
        userId: todoControl.userId,
        date: manualTimeForm.date,
        durationMinutes: totalMinutes,
        description: manualTimeForm.description
      });

      if (success) {
        showSuccess('Tiempo manual agregado');
        setManualTimeForm({
          description: '',
          hours: 0,
          minutes: 0,
          date: getTodayDateString()
        });
        setShowManualTimeForm(false);
        await loadTimeData(); // Recargar datos
      } else {
        showError('Error al agregar tiempo manual');
      }
    } catch (error) {
      showError('Error al agregar tiempo manual');
    }
  };

  const handleDeleteManualTime = async (entryId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Entrada de Tiempo Manual',
      message: '¿Está seguro de que desea eliminar esta entrada de tiempo manual? Esta acción no se puede deshacer.',
      onConfirm: () => confirmDeleteManualTime(entryId)
    });
  };

  const confirmDeleteManualTime = async (entryId: string) => {
    try {
      const success = await deleteManualTime(entryId);
      if (success) {
        showSuccess('Entrada de tiempo manual eliminada');
        await loadTimeData();
      } else {
        showError('Error al eliminar la entrada de tiempo manual');
      }
    } catch (error) {
      console.error('Error al eliminar entrada manual:', error);
      showError('Error al eliminar la entrada de tiempo manual');
    }
  };

  const handleDeleteTimeEntry = async (entryId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Eliminar Entrada de Tiempo Automático',
      message: '¿Está seguro de que desea eliminar esta entrada de tiempo automático? Esta acción no se puede deshacer.',
      onConfirm: () => confirmDeleteTimeEntry(entryId)
    });
  };

  const confirmDeleteTimeEntry = async (entryId: string) => {
    try {
      const success = await deleteTimeEntry(entryId);
      if (success) {
        showSuccess('Entrada de tiempo automático eliminada');
        await loadTimeData();
      } else {
        showError('Error al eliminar la entrada de tiempo automático');
      }
    } catch (error) {
      console.error('Error al eliminar entrada automática:', error);
      showError('Error al eliminar la entrada de tiempo automático');
    }
  };

  // Calcular tiempo total
  const totalAutoMinutes = timeEntries.reduce((sum, entry) => {
    const duration = entry.duration_minutes || 0;
    return sum + duration;
  }, 0);
  const totalManualMinutes = manualTimeEntries.reduce((sum, entry) => {
    const duration = entry.duration_minutes || 0;
    return sum + duration;
  }, 0);
  const totalMinutes = totalAutoMinutes + totalManualMinutes;

  if (!todoControl) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalles de Tiempo - ${todoControl.todo?.title || 'TODO'}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Resumen de tiempo */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatTimeDetailed(totalMinutes)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tiempo Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatTimeDetailed(totalAutoMinutes)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Automático</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatTimeDetailed(totalManualMinutes)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Manual</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatTimeDetailed(todoControl.todo?.estimatedMinutes || 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Estimado</div>
            </div>
          </div>
        </div>

        {/* Botón para agregar tiempo manual */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Historial de Tiempo
          </h3>
          <Button
            onClick={() => setShowManualTimeForm(!showManualTimeForm)}
            variant="outline"
            size="sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Agregar Tiempo Manual
          </Button>
        </div>

        {/* Formulario de tiempo manual */}
        {showManualTimeForm && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Agregar Tiempo Manual
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha
                </label>
                <Input
                  type="date"
                  value={manualTimeForm.date}
                  onChange={(e) => setManualTimeForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Horas
                </label>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={manualTimeForm.hours}
                  onChange={(e) => setManualTimeForm(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minutos
                </label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={manualTimeForm.minutes}
                  onChange={(e) => setManualTimeForm(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <Input
                type="text"
                placeholder="Descripción del trabajo realizado..."
                value={manualTimeForm.description}
                onChange={(e) => setManualTimeForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddManualTime}>
                Agregar
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowManualTimeForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de entradas de tiempo */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Cargando...</p>
            </div>
          ) : (
            <>
              {/* Entradas automáticas */}
              {timeEntries.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Tiempo Automático ({timeEntries.length} entradas)
                  </h4>
                  <div className="space-y-2">
                    {timeEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <ClockIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {formatTimeDetailed(entry.duration_minutes)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(entry.start_time)} - {formatDate(entry.end_time)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteTimeEntry(entry.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Entradas manuales */}
              {manualTimeEntries.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Tiempo Manual ({manualTimeEntries.length} entradas)
                  </h4>
                  <div className="space-y-2">
                    {manualTimeEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <CalendarIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {formatTimeDetailed(entry.duration_minutes)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDateLocal(entry.date)} - {entry.description}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteManualTime(entry.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {timeEntries.length === 0 && manualTimeEntries.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <ClockIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay entradas de tiempo registradas</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Modal de Confirmación */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </Modal>
  );
};
