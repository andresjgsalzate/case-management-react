import React, { useState } from 'react';
import { 
  ClockIcon, 
  PlusIcon,
  DocumentChartBarIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TimerControl } from '@/components/TimerControl';
import { useCaseControls, useCaseStatuses, useStartTimer, useStopTimer, usePauseTimer, useUpdateCaseStatus, useAllTimeEntries, useAllManualTimeEntries } from '@/hooks/useCaseControl';
import { useCaseControlPermissions } from '@/hooks/useCaseControlPermissions';
import { CaseControlDetailsModal } from '@/components/CaseControlDetailsModal';
import { CaseAssignmentModal } from '@/components/CaseAssignmentModal';
import { CaseControl } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { PageWrapper } from '@/components/PageWrapper';
import { es } from 'date-fns/locale';
import { exportCaseControlReport } from '@/utils/exportUtils';
import { useNotification } from '@/components/NotificationSystem';

const CaseControlPage: React.FC = () => {
  const { showSuccess } = useNotification();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCaseControl, setSelectedCaseControl] = useState<CaseControl | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Hooks
  const { 
    canStartTimer,
    canUpdateStatus,
    canAssignCases
  } = useCaseControlPermissions();

  const { data: caseControls = [], isLoading: loadingControls } = useCaseControls();
  const { data: statuses = [] } = useCaseStatuses();
  const { data: allTimeEntries = [], isLoading: loadingTimeEntries } = useAllTimeEntries();
  const { data: allManualTimeEntries = [], isLoading: loadingManualEntries } = useAllManualTimeEntries();
  const startTimerMutation = useStartTimer();
  const stopTimerMutation = useStopTimer();
  const pauseTimerMutation = usePauseTimer();
  const updateStatusMutation = useUpdateCaseStatus();

  // Filtros
  const filteredControls = caseControls.filter(control => {
    // Filtro por estado
    if (selectedStatus && control.statusId !== selectedStatus) return false;
    
    // Filtro por búsqueda de número de caso
    if (searchTerm && control.case?.numeroCaso) {
      const searchLower = searchTerm.toLowerCase();
      const caseNumber = control.case.numeroCaso.toLowerCase();
      const caseDescription = control.case.descripcion?.toLowerCase() || '';
      
      if (!caseNumber.includes(searchLower) && !caseDescription.includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });

  // Funciones de utilidad
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (statusName: string): string => {
    // Buscar el estado en los datos cargados para obtener su color dinámico
    const status = statuses.find(s => s.name === statusName);
    if (status && status.color) {
      // Convertir el color hex a clases de Tailwind usando style inline
      return `text-white text-xs`;
    }
    
    // Fallback a colores por defecto si no se encuentra el estado
    switch (statusName) {
      case 'PENDIENTE': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'EN CURSO': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'ESCALADA': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
      case 'TERMINADA': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusStyle = (statusName: string): React.CSSProperties => {
    const status = statuses.find(s => s.name === statusName);
    if (status && status.color) {
      return {
        backgroundColor: status.color,
        color: 'white'
      };
    }
    return {};
  };

  const handleStartTimer = async (control: CaseControl) => {
    await startTimerMutation.mutateAsync(control.id);
    showSuccess('Timer iniciado');
  };

  const handlePauseTimer = async (control: CaseControl) => {
    await pauseTimerMutation.mutateAsync(control.id);
    showSuccess('Timer pausado');
  };

  const handleStopTimer = async (control: CaseControl) => {
    await stopTimerMutation.mutateAsync(control.id);
    showSuccess('Timer detenido y tiempo registrado');
  };

  const handleStatusChange = async (controlId: string, statusId: string) => {
    await updateStatusMutation.mutateAsync({ id: controlId, statusId });
    showSuccess('Estado actualizado exitosamente');
  };

  const handleGenerateReport = async () => {
    if (loadingTimeEntries || loadingManualEntries) {
      return; // Los hooks ya muestran el estado de carga
    }

    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `reporte-control-casos-${timestamp}.xlsx`;
      
      exportCaseControlReport(
        caseControls,
        allTimeEntries,
        allManualTimeEntries,
        filename,
        showSuccess
      );
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  if (loadingControls) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Control de Casos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona el tiempo y estado de los casos asignados
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Botón de reportes */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={handleGenerateReport}
            disabled={loadingTimeEntries || loadingManualEntries}
          >
            <DocumentChartBarIcon className="h-4 w-4 mr-2" />
            Reportes
          </Button>
          
          {canAssignCases() && (
            <Button
              variant="primary"
              size="sm"
              className="flex items-center"
              onClick={() => setShowAssignModal(true)}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Asignar Caso
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros:</span>
          </div>
          
          {/* Búsqueda por número de caso */}
          <div className="search-container">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número o descripción..."
              className="pl-10 w-64"
            />
          </div>
          
          {/* Filtro por estado */}
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-48"
          >
            <option value="">Todos los estados</option>
            {statuses.map(status => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </Select>

          {(selectedStatus || searchTerm) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedStatus('');
                setSearchTerm('');
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Indicador de resultados */}
      {(searchTerm || selectedStatus) && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredControls.length === 0 ? (
            'No se encontraron casos'
          ) : (
            `Mostrando ${filteredControls.length} de ${caseControls.length} casos`
          )}
          {searchTerm && (
            <span className="ml-2">
              • Búsqueda: "<span className="font-medium">{searchTerm}</span>"
            </span>
          )}
        </div>
      )}

      {/* Lista de controles */}
      <div className="grid gap-4">
        {filteredControls.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || selectedStatus ? 'No se encontraron casos' : 'No hay casos en control'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm && selectedStatus ? (
                `No hay casos que coincidan con "${searchTerm}" en el estado seleccionado`
              ) : searchTerm ? (
                `No hay casos que coincidan con "${searchTerm}"`
              ) : selectedStatus ? (
                'No hay casos con el estado seleccionado'
              ) : (
                'Comienza asignando casos para hacer seguimiento'
              )}
            </p>
            {canAssignCases() && !searchTerm && !selectedStatus && (
              <Button
                variant="primary"
                onClick={() => setShowAssignModal(true)}
              >
                Asignar Primer Caso
              </Button>
            )}
          </div>
        ) : (
          filteredControls.map(control => (
            <div 
              key={control.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {control.case?.numeroCaso || 'Caso sin número'}
                    </h3>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(control.status?.name || '')}`}
                      style={getStatusStyle(control.status?.name || '')}
                    >
                      {control.status?.name}
                    </span>
                    {control.isTimerActive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200 animate-pulse">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                        En curso
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {control.case?.descripcion || 'Sin descripción'}
                  </p>

                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>Total: {formatTime(control.totalTimeMinutes)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      <span>Asignado a: {control.user?.fullName || 'Usuario desconocido'}</span>
                    </div>
                    
                    <div>
                      Asignado: {formatDistanceToNow(new Date(control.assignedAt), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </div>

                    {control.isTimerActive && control.timerStartAt && (
                      <div className="text-blue-600 dark:text-blue-400 font-medium">
                        Iniciado: {formatDistanceToNow(new Date(control.timerStartAt), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Selector de estado */}
                  {canUpdateStatus() && (
                    <Select
                      value={control.statusId}
                      onChange={(e) => handleStatusChange(control.id, e.target.value)}
                      className="w-32"
                    >
                      {statuses.map(status => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </Select>
                  )}

                  {/* Control de timer mejorado */}
                  {canStartTimer() && (
                    <TimerControl
                      isActive={control.isTimerActive}
                      startTime={control.timerStartAt || null}
                      onStart={() => handleStartTimer(control)}
                      onPause={() => handlePauseTimer(control)}
                      onStop={() => handleStopTimer(control)}
                      isLoading={startTimerMutation.isPending || stopTimerMutation.isPending || pauseTimerMutation.isPending}
                      disabled={false}
                    />
                  )}

                  {/* Botón ver detalles */}                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCaseControl(control);
                        setShowTimeModal(true);
                      }}
                    >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de detalles de tiempo */}
      <CaseControlDetailsModal
        isOpen={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        caseControl={selectedCaseControl}
      />

      {/* Modal de asignación */}
      <CaseAssignmentModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={() => {
          // Refrescar la lista de controles de casos
          // Los queries se refrescarán automáticamente
        }}
      />
    </PageWrapper>
  );
};

export default CaseControlPage;
