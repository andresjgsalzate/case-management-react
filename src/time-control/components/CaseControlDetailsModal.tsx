import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  PlusIcon, 
  CalendarIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { CaseControl } from '@/types';
import { useTimeEntries, useManualTimeEntries, useAddManualTime, useDeleteManualTime, useDeleteTimeEntry } from '@/time-control/hooks/useCaseControl';
import { formatDate, formatTimeDetailed, formatDateLocal } from '@/shared/utils/caseUtils';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';
import { useCaseControlPermissions } from '@/time-control/hooks/useCaseControlPermissions';

interface CaseControlDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseControl: CaseControl | null;
}

interface ManualTimeForm {
  description: string;
  hours: number;
  minutes: number;
  date: string;
}

export const CaseControlDetailsModal: React.FC<CaseControlDetailsModalProps> = ({
  isOpen,
  onClose,
  caseControl
}) => {
  const { showSuccess, showError } = useNotification();
  const { canDeleteTime, canAddManualTime } = useCaseControlPermissions();
  
  const timeEntriesQuery = useTimeEntries(caseControl?.id || '');
  const manualTimeEntriesQuery = useManualTimeEntries(caseControl?.id || '');
  const addManualTimeMutation = useAddManualTime();
  const deleteManualTimeMutation = useDeleteManualTime();
  const deleteTimeEntryMutation = useDeleteTimeEntry();
  
  const [showManualTimeForm, setShowManualTimeForm] = useState(false);
  const [manualTimeForm, setManualTimeForm] = useState<ManualTimeForm>({
    description: '',
    hours: 0,
    minutes: 0,
    date: getTodayDateString()
  });

  // Función helper para obtener la fecha de hoy en formato YYYY-MM-DD sin problemas de zona horaria
  function getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const timeEntries = timeEntriesQuery.data || [];
  const manualTimeEntries = manualTimeEntriesQuery.data || [];
  const loading = timeEntriesQuery.isLoading || manualTimeEntriesQuery.isLoading;

  useEffect(() => {
    // Los queries se ejecutan automáticamente cuando cambia el ID
  }, []);

  const handleAddManualTime = async () => {
    if (!caseControl) return;

    const totalMinutes = (manualTimeForm.hours * 60) + manualTimeForm.minutes;
    if (totalMinutes <= 0) {
      return; // No continuar si no hay tiempo válido
    }

    if (!manualTimeForm.description.trim()) {
      return; // No continuar si no hay descripción
    }

    try {

await addManualTimeMutation.mutateAsync({
        caseControlId: caseControl.id,
        form: {
          date: manualTimeForm.date,
          durationMinutes: totalMinutes,
          description: manualTimeForm.description
        }
      });
      
      setManualTimeForm({
        description: '',
        hours: 0,
        minutes: 0,
        date: getTodayDateString()
      });
      setShowManualTimeForm(false);
      
      // Mostrar notificación de éxito SOLO aquí
      showSuccess('Tiempo manual agregado exitosamente');
    } catch (error) {
      console.error('Error adding manual time:', error);
      showError('Error al agregar tiempo manual');
    }
  };

  const handleDeleteManualTime = async (entryId: string) => {
    try {
      await deleteManualTimeMutation.mutateAsync(entryId);
      showSuccess('Tiempo manual eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting manual time:', error);
      showError('Error al eliminar tiempo manual');
    }
  };

  const handleDeleteTimeEntry = async (entryId: string) => {
    try {
      await deleteTimeEntryMutation.mutateAsync(entryId);
      showSuccess('Entrada de tiempo eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting time entry:', error);
      showError('Error al eliminar entrada de timer');
    }
  };

  const getTotalTime = () => {
    // Usar el tiempo total calculado desde la base de datos si está disponible
    if (caseControl?.totalTimeMinutes) {
      return caseControl.totalTimeMinutes;
    }
    
    // Fallback: calcular desde las entradas individuales
    const timerTime = timeEntries.reduce((total: number, entry) => total + (entry.durationMinutes || 0), 0);
    const manualTime = manualTimeEntries.reduce((total: number, entry) => total + entry.durationMinutes, 0);
    return timerTime + manualTime;
  };

  const getTimerTime = () => {
    return timeEntries.reduce((total: number, entry) => total + (entry.durationMinutes || 0), 0);
  };

  const getManualTime = () => {
    return manualTimeEntries.reduce((total: number, entry) => total + entry.durationMinutes, 0);
  };

  if (!caseControl) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalles de Tiempo - Caso #${caseControl.case?.numeroCaso || caseControl.caseId}`}>
      <div className="space-y-6">
        {/* Resumen de tiempo total */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Tiempo Total: {formatTimeDetailed(getTotalTime())}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Tiempo de Timer:</span>
              <span className="ml-2 font-medium">
                {formatTimeDetailed(getTimerTime())}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Tiempo Manual:</span>
              <span className="ml-2 font-medium">
                {formatTimeDetailed(getManualTime())}
              </span>
            </div>
          </div>
        </div>

        {/* Agregar tiempo manual */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Tiempo Manual
            </h4>
            {canAddManualTime() && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowManualTimeForm(!showManualTimeForm)}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Agregar Tiempo
              </Button>
            )}
          </div>

          {showManualTimeForm && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <Input
                  value={manualTimeForm.description}
                  onChange={(e) => setManualTimeForm({ ...manualTimeForm, description: e.target.value })}
                  placeholder="Descripción del trabajo realizado"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Horas
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={manualTimeForm.hours}
                    onChange={(e) => setManualTimeForm({ ...manualTimeForm, hours: parseInt(e.target.value) || 0 })}
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
                    onChange={(e) => setManualTimeForm({ ...manualTimeForm, minutes: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha
                  </label>
                  <Input
                    type="date"
                    value={manualTimeForm.date}
                    onChange={(e) => setManualTimeForm({ ...manualTimeForm, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleAddManualTime}
                  disabled={loading}
                >
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

          {/* Lista de tiempo manual */}
          <div className="space-y-2">
            {manualTimeEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDateLocal(entry.date)}
                    </span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {formatTimeDetailed(entry.durationMinutes)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
                    {entry.description}
                  </p>
                </div>
                {canDeleteTime() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteManualTime(entry.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Historial de timer */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Historial de Timer
          </h4>
          <div className="space-y-2">
            {timeEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(entry.startTime)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(entry.startTime).toLocaleTimeString()} - {' '}
                    {entry.endTime ? new Date(entry.endTime).toLocaleTimeString() : 'En curso'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formatTimeDetailed(entry.durationMinutes || 0)}
                  </span>
                  {/* Solo permitir eliminar entradas que ya terminaron */}
                  {entry.endTime && canDeleteTime() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTimeEntry(entry.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
