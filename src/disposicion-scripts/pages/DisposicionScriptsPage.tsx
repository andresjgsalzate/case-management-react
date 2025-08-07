import React, { useState } from 'react';
import { 
  PlusIcon, 
  DocumentTextIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  TableCellsIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { ConfirmationModal } from '@/shared/components/ui/ConfirmationModal';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { DisposicionScriptsForm } from '@/disposicion-scripts/components/DisposicionScriptsForm';
import { DisposicionScriptsMensualCard } from '@/disposicion-scripts/components/DisposicionScriptsMensualCard';
import DisposicionScriptsTable from '@/disposicion-scripts/components/DisposicionScriptsTable';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';
import { useUserProfile } from '@/user-management/hooks/useUserProfile';
import { 
  useDisposicionesScripts,
  useDisposicionesMensuales,
  useCreateDisposicionScript,
  useUpdateDisposicionScript,
  useDeleteDisposicionScript
} from '@/disposicion-scripts/hooks/useDisposicionScripts';
import { useDisposicionScriptsPermissions } from '@/disposicion-scripts/hooks/useDisposicionScriptsPermissions';
import { useDisposicionScriptsYears } from '@/disposicion-scripts/hooks/useDisposicionScriptsYears';
import { useAplicaciones } from '@/case-management/hooks/useOrigenesAplicaciones';
import { DisposicionScriptsFormData, DisposicionScripts, DisposicionFilters } from '@/types';
import { exportDisposicionScriptsPorMes, exportAllDisposicionScripts } from '@/shared/utils/disposicionScriptsExportUtils';

export const DisposicionScriptsPage: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const { data: userProfile } = useUserProfile();
  const permissions = useDisposicionScriptsPermissions();
  const { data: aplicaciones = [] } = useAplicaciones();
  const { data: availableYears = [] } = useDisposicionScriptsYears();

  // Estados para filtros
  const [filters, setFilters] = useState<DisposicionFilters>({
    year: new Date().getFullYear()
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para vista
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Estados para formulario
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDisposicion, setSelectedDisposicion] = useState<DisposicionScripts | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    disposicion: DisposicionScripts | null;
  }>({
    isOpen: false,
    disposicion: null
  });

  // Queries
  const disposicionesPorMesQuery = useDisposicionesMensuales(filters.year);
  const disposicionesQuery = useDisposicionesScripts(filters);

  // Mutations
  const createDisposicion = useCreateDisposicionScript();
  const updateDisposicion = useUpdateDisposicionScript();
  const deleteDisposicion = useDeleteDisposicionScript();

  // Verificar permisos
  if (!permissions.hasAnyPermission) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            Acceso denegado
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No tienes permisos para acceder al módulo de Disposiciones de Scripts.
          </p>
        </div>
      </PageWrapper>
    );
  }

  // Handlers
  const handleCreateDisposicion = () => {
    setSelectedDisposicion(null);
    setIsEdit(false);
    setIsFormOpen(true);
  };

  const handleEditDisposicion = (disposicion: DisposicionScripts) => {
    // Verificar permisos antes de permitir la edición
    if (!permissions.canEditSpecificDisposicion(disposicion.userId, userProfile?.id || '')) {
      showError('No tienes permisos para editar esta disposición');
      return;
    }
    
    setSelectedDisposicion(disposicion);
    setIsEdit(true);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: DisposicionScriptsFormData) => {
    try {
      if (isEdit && selectedDisposicion) {
        await updateDisposicion.mutateAsync({ 
          id: selectedDisposicion.id, 
          data 
        });
        showSuccess('Disposición actualizada exitosamente');
      } else {
        await createDisposicion.mutateAsync(data);
        showSuccess('Disposición creada exitosamente');
      }
      setIsFormOpen(false);
      setSelectedDisposicion(null);
    } catch (error) {
      showError('Error al guardar disposición');
    }
  };

  const handleDeleteDisposicion = (id: string) => {
    // Buscar la disposición para verificar permisos
    const disposicion = disposicionesQuery.data?.find(d => d.id === id);
    if (!disposicion) {
      showError('Disposición no encontrada');
      return;
    }
    
    // Verificar permisos antes de permitir la eliminación
    if (!permissions.canDeleteSpecificDisposicion(disposicion.userId, userProfile?.id || '')) {
      showError('No tienes permisos para eliminar esta disposición');
      return;
    }

    setDeleteModal({
      isOpen: true,
      disposicion: disposicion
    });
  };

  const confirmDeleteDisposicion = async () => {
    if (deleteModal.disposicion) {
      try {
        await deleteDisposicion.mutateAsync(deleteModal.disposicion.id);
        showSuccess('Disposición eliminada exitosamente');
        setDeleteModal({ isOpen: false, disposicion: null });
      } catch (error) {
        showError('Error al eliminar disposición');
      }
    }
  };

  const cancelDeleteDisposicion = () => {
    setDeleteModal({ isOpen: false, disposicion: null });
  };

  // Funciones wrapper para permisos específicos
  const canEditSpecific = (disposicion: DisposicionScripts) => {
    return permissions.canEditSpecificDisposicion(disposicion.userId, userProfile?.id || '');
  };

  const canDeleteSpecific = (disposicion: DisposicionScripts) => {
    return permissions.canDeleteSpecificDisposicion(disposicion.userId, userProfile?.id || '');
  };

  const handleExportMonth = async (year: number, month: number) => {
    try {
      // Encontrar los datos del mes
      const monthData = disposicionesPorMesQuery.data?.find(
        m => m.year === year && m.month === month
      );

      if (!monthData) {
        showError('No se encontraron datos para el mes seleccionado');
        return;
      }

      await exportDisposicionScriptsPorMes(year, monthData);
      showSuccess('Reporte exportado exitosamente');
    } catch (error) {
      showError('Error al exportar reporte');
    }
  };

  const handleExportAll = async () => {
    try {
      if (!disposicionesQuery.data || disposicionesQuery.data.length === 0) {
        showError('No hay disposiciones para exportar');
        return;
      }

      await exportAllDisposicionScripts(disposicionesQuery.data);
      showSuccess('Todas las disposiciones exportadas exitosamente');
    } catch (error) {
      showError('Error al exportar disposiciones');
    }
  };

  const filteredMonthData = disposicionesPorMesQuery.data?.filter(monthData => {
    if (searchTerm) {
      return monthData.disposiciones.some(d => 
        d.numeroCaso.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.aplicacionNombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  }) || [];

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Disposiciones de Scripts
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestión de solicitudes de disposición para scripts en aplicaciones
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Botones de vista */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <Button
              variant={viewMode === 'cards' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="flex items-center"
            >
              <Squares2X2Icon className="h-4 w-4 mr-1" />
              Tarjetas
            </Button>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="flex items-center"
            >
              <TableCellsIcon className="h-4 w-4 mr-1" />
              Tabla
            </Button>
          </div>
          
          {permissions.canExportDisposiciones && (
            <Button
              variant="secondary"
              onClick={handleExportAll}
              className="flex items-center"
              disabled={!disposicionesQuery.data?.length}
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Exportar Todo
            </Button>
          )}
          
          {permissions.canCreateDisposiciones && (
            <Button
              onClick={handleCreateDisposicion}
              className="flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nueva Disposición
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Filtros
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Año
            </label>
            <Select
              value={filters.year?.toString() || ''}
              onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) || undefined })}
            >
              <option value="">Todos los años</option>
              {availableYears.map(year => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Aplicación
            </label>
            <Select
              value={filters.aplicacionId || ''}
              onChange={(e) => setFilters({ ...filters, aplicacionId: e.target.value || undefined })}
            >
              <option value="">Todas las aplicaciones</option>
              {aplicaciones.filter(app => app.activo).map(app => (
                <option key={app.id} value={app.id}>
                  {app.nombre}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <Input
              type="text"
              placeholder="Buscar por caso o aplicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      {disposicionesPorMesQuery.isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : disposicionesPorMesQuery.error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">
            Error al cargar disposiciones: {disposicionesPorMesQuery.error.message}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        // Vista de tarjetas
        filteredMonthData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMonthData.map((monthData) => (
              <DisposicionScriptsMensualCard
                key={`${monthData.year}-${monthData.month}`}
                disposicionMensual={monthData}
                onExport={handleExportMonth}
                canExport={permissions.canExportDisposiciones}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              {searchTerm || filters.aplicacionId ? 'No se encontraron resultados' : 'No hay disposiciones'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || filters.aplicacionId 
                ? 'Intenta ajustar los filtros de búsqueda.'
                : 'Comienza creando una nueva disposición de scripts.'
              }
            </p>
            {permissions.canCreateDisposiciones && !searchTerm && !filters.aplicacionId && (
              <div className="mt-6">
                <Button onClick={handleCreateDisposicion} className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Crear Primera Disposición
                </Button>
              </div>
            )}
          </div>
        )
      ) : (
        // Vista de tabla
        <DisposicionScriptsTable
          disposiciones={disposicionesQuery.data || []}
          onEdit={handleEditDisposicion}
          onDelete={handleDeleteDisposicion}
          canEdit={permissions.canUpdateDisposiciones}
          canDelete={permissions.canDeleteDisposiciones}
          canEditSpecific={canEditSpecific}
          canDeleteSpecific={canDeleteSpecific}
          isLoading={disposicionesQuery.isLoading}
        />
      )}

      {/* Formulario Modal */}
      <DisposicionScriptsForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedDisposicion(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedDisposicion ? {
          fecha: selectedDisposicion.fecha,
          caseId: selectedDisposicion.caseId,
          caseNumber: selectedDisposicion.caseNumber,
          nombreScript: selectedDisposicion.nombreScript,
          numeroRevisionSvn: selectedDisposicion.numeroRevisionSvn,
          aplicacionId: selectedDisposicion.aplicacionId,
          observaciones: selectedDisposicion.observaciones,
        } : undefined}
        isEdit={isEdit}
        loading={createDisposicion.isPending || updateDisposicion.isPending}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Confirmar eliminación"
        message={`¿Está seguro de que desea eliminar la disposición "${deleteModal.disposicion?.nombreScript}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteDisposicion}
        onClose={cancelDeleteDisposicion}
        type="danger"
      />
    </PageWrapper>
  );
};
