import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Case } from '@/types';
import { useCases } from '@/case-management/hooks/useCases';
import { useCaseStatuses, useStartCaseControl, useCaseControls } from '@/time-control/hooks/useCaseControl';
import { formatDate } from '@/shared/utils/caseUtils';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';

interface CaseAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign?: () => void;
}

export const CaseAssignmentModal: React.FC<CaseAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssign
}) => {
  const { showSuccess, showError } = useNotification();
  const casesQuery = useCases();
  const statusesQuery = useCaseStatuses();
  const caseControlsQuery = useCaseControls();
  const startCaseControlMutation = useStartCaseControl();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState('');
  
  const cases = casesQuery.data || [];
  const statuses = statusesQuery.data || [];
  const caseControls = caseControlsQuery.data || [];
  const loading = casesQuery.isLoading || statusesQuery.isLoading || caseControlsQuery.isLoading;

  // Obtener IDs de casos que ya están en control activo
  const assignedCaseIds = new Set(caseControls.map(control => control.caseId));

  // Filtrar casos disponibles (no asignados a control activo)
  const availableCases = cases.filter(caseItem => {
    // Excluir casos que ya están en control
    if (assignedCaseIds.has(caseItem.id)) {
      return false;
    }
    
    const matchesSearch = searchTerm === '' || 
      caseItem.numeroCaso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.aplicacion?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Obtener el estado "PENDIENTE" por defecto
  useEffect(() => {
    if (statuses.length > 0 && !selectedStatusId) {
      const pendingStatus = statuses.find(status => status.name === 'PENDIENTE');
      if (pendingStatus) {
        setSelectedStatusId(pendingStatus.id);
      }
    }
  }, [statuses, selectedStatusId]);

  const handleAssignCase = async () => {
    if (!selectedCase) {
      return; // No continuar si no hay caso seleccionado
    }

    if (!selectedStatusId) {
      return; // No continuar si no hay estado seleccionado
    }

    try {
      await startCaseControlMutation.mutateAsync({
        caseId: selectedCase.id,
        statusId: selectedStatusId
      });
      
      setSelectedCase(null);
      setSearchTerm('');
      onAssign?.();
      onClose();
      
      // Mostrar notificación de éxito SOLO aquí para evitar duplicados
      showSuccess('Caso asignado al control exitosamente');
    } catch (error) {
      console.error('Error assigning case:', error);
      showError('Error al asignar caso al control');
    }
  };

  const resetForm = () => {
    setSelectedCase(null);
    setSearchTerm('');
    setSelectedStatusId('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Asignar Caso al Control"
      size="lg"
    >
      <div className="space-y-6">
        {/* Búsqueda de casos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Buscar Caso
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número, descripción o aplicación..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de casos disponibles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Casos Disponibles
          </label>
          <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Cargando casos...
              </div>
            ) : availableCases.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No se encontraron casos disponibles
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {availableCases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    onClick={() => setSelectedCase(caseItem)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCase?.id === caseItem.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700'
                        : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            #{caseItem.numeroCaso}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(caseItem.fecha)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          {caseItem.descripcion}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>App: {caseItem.aplicacion?.nombre || 'N/A'}</span>
                          <span>Complejidad: {caseItem.clasificacion}</span>
                        </div>
                      </div>
                      {selectedCase?.id === caseItem.id && (
                        <div className="ml-2">
                          <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Estado inicial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado Inicial
          </label>
          <Select
            value={selectedStatusId}
            onChange={(e) => setSelectedStatusId(e.target.value)}
          >
            <option value="">Seleccionar estado...</option>
            {statuses.map(status => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Información del caso seleccionado */}
        {selectedCase && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Caso Seleccionado
            </h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Número:</span> #{selectedCase.numeroCaso}
              </div>
              <div>
                <span className="font-medium">Descripción:</span> {selectedCase.descripcion}
              </div>
              <div>
                <span className="font-medium">Aplicación:</span> {selectedCase.aplicacion?.nombre || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Complejidad:</span> {selectedCase.clasificacion}
              </div>
              <div>
                <span className="font-medium">Fecha:</span> {formatDate(selectedCase.fecha)}
              </div>
            </div>
          </div>
        )}

        {/* Advertencia */}
        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <ExclamationCircleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            Al asignar un caso al control, se comenzará a registrar el tiempo dedicado al mismo.
            Asegúrese de seleccionar el caso correcto.
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={startCaseControlMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleAssignCase}
            disabled={!selectedCase || !selectedStatusId || startCaseControlMutation.isPending}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            {startCaseControlMutation.isPending ? 'Asignando...' : 'Asignar Caso'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
