import React, { useState } from 'react';
import { 
  ArchiveBoxIcon,
  ArrowPathIcon,
  EyeIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useArchive } from '@/archive-management/hooks/useArchive';
import { useUsers } from '@/user-management/hooks/useUsers';
import { useCleanupOrphanedRecords } from '../hooks/useCleanupOrphanedRecords';
import { usePermanentDelete } from '../hooks/usePermanentDelete';
import { useArchivePermissions } from '../hooks/useArchivePermissions';
import { useAuth } from '@/shared/hooks/useAuth';
import { ArchivedCase, ArchivedTodo, ArchiveFilters } from '@/types';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { RestoreModal } from '../components/RestoreModal';
import { ArchiveDetailsModal } from '../components/ArchiveDetailsModal';
import { ConfirmationModal } from '@/shared/components/ui/ConfirmationModal';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';

export const ArchivePage: React.FC = () => {
  const { 
    archivedCases, 
    archivedTodos, 
    stats, 
    loading, 
    error,
    fetchArchivedItems,
    restoreCase,
    restoreTodo
  } = useArchive();

  const { data: users } = useUsers();
  const { showSuccess, showError } = useNotification();
  const { cleanupOrphanedRecords, isLoading: isCleaningUp } = useCleanupOrphanedRecords();
  const { 
    deleteArchivedCase, 
    deleteArchivedTodo
  } = usePermanentDelete();
  const archivePermissions = useArchivePermissions();
  const { user } = useAuth();

  // Estados para filtros
  const [filters, setFilters] = useState<ArchiveFilters>({
    type: 'all',
    showRestored: false
  });

  // Estados para modales
  const [restoreModal, setRestoreModal] = useState<{
    isOpen: boolean;
    item: { id: string; title: string; type: 'case' | 'todo' } | null;
    loading: boolean;
  }>({ isOpen: false, item: null, loading: false });

  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    item: ArchivedCase | ArchivedTodo | null;
    type: 'case' | 'todo';
  }>({ isOpen: false, item: null, type: 'case' });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    item: ArchivedCase | ArchivedTodo | null;
    type: 'case' | 'todo' | null;
  }>({ isOpen: false, item: null, type: null });

  // Función para verificar si un usuario puede restaurar un elemento específico
  const canRestoreSpecificItem = (item: ArchivedCase | ArchivedTodo): boolean => {
    if (!user) return false;
    
    // Usar el nuevo sistema de permisos
    return archivePermissions.canPerformActionOnArchivedItem(
      item.archivedBy, 
      user.id, 
      'restore'
    );
  };

  // Aplicar filtros
  const handleFilterChange = (key: keyof ArchiveFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchArchivedItems(newFilters);
  };

  // Manejar restauración
  const handleRestoreRequest = (item: ArchivedCase | ArchivedTodo, type: 'case' | 'todo') => {
    setRestoreModal({
      isOpen: true,
      item: {
        id: item.id,
        title: type === 'case' ? (item as ArchivedCase).caseNumber : (item as ArchivedTodo).title,
        type
      },
      loading: false
    });
  };

  const handleRestoreConfirm = async (data: { id: string; type: 'case' | 'todo'; reason?: string }) => {
    setRestoreModal(prev => ({ ...prev, loading: true }));
    
    try {
      let result;
      if (data.type === 'case') {
        result = await restoreCase(data);
      } else {
        result = await restoreTodo(data);
      }

      if (result.success) {
        showSuccess(`${data.type === 'case' ? 'Caso' : 'TODO'} restaurado exitosamente`);
        setRestoreModal({ isOpen: false, item: null, loading: false });
      } else {
        showError('Error al restaurar', result.error || 'Error desconocido');
      }
    } catch (error) {
      showError('Error al restaurar', error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setRestoreModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Manejar vista de detalles
  const handleViewDetails = (item: ArchivedCase | ArchivedTodo, type: 'case' | 'todo') => {
    setDetailsModal({
      isOpen: true,
      item,
      type
    });
  };

  // Manejar eliminación permanente
  const handlePermanentDeleteRequest = (item: ArchivedCase | ArchivedTodo, type: 'case' | 'todo') => {
    setDeleteModal({
      isOpen: true,
      item,
      type
    });
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!deleteModal.item || !deleteModal.type) return;
    
    try {
      let result;
      const deleteData = {
        id: deleteModal.item.id,
        type: deleteModal.type,
        reason: `Eliminación permanente solicitada por administrador`
      };

      if (deleteModal.type === 'case') {
        result = await deleteArchivedCase(deleteData);
      } else {
        result = await deleteArchivedTodo(deleteData);
      }

      if (result.success) {
        showSuccess(`${deleteModal.type === 'case' ? 'Caso' : 'TODO'} eliminado permanentemente`);
        setDeleteModal({ isOpen: false, item: null, type: null });
        // Actualizar los datos después de la eliminación
        fetchArchivedItems(filters);
      } else {
        showError('Error al eliminar', result.error || 'Error desconocido');
      }
    } catch (error) {
      showError('Error al eliminar', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  // Manejar limpieza automática
  const handleCleanupOrphanedRecords = async () => {
    try {
      const result = await cleanupOrphanedRecords();
      
      if (result.success) {
        showSuccess(`Limpieza completada. Se eliminaron ${result.deletedCount} registros huérfanos`);
        // Actualizar los datos después de la limpieza
        fetchArchivedItems(filters);
      } else {
        showError('Error en la limpieza', result.error || 'Error desconocido');
      }
    } catch (error) {
      showError('Error en la limpieza', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  // Formatear tiempo
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Combinar elementos archivados
  const combinedItems = [
    ...archivedCases.map(item => ({ ...item, itemType: 'case' as const })),
    ...archivedTodos.map(item => ({ ...item, itemType: 'todo' as const }))
  ].sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime());

  // Filtrar elementos combinados
  const filteredItems = combinedItems.filter(item => {
    if (filters.type === 'cases' && item.itemType !== 'case') return false;
    if (filters.type === 'todos' && item.itemType !== 'todo') return false;
    if (filters.showRestored !== undefined && item.isRestored !== filters.showRestored) return false;
    return true;
  });

  if (loading) {
    return (
      <PageWrapper>
        <LoadingSpinner />
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">
            Error al cargar el archivo: {error}
          </div>
          <Button onClick={() => fetchArchivedItems(filters)}>
            Reintentar
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Archivo
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestión de casos y TODOs archivados
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => fetchArchivedItems(filters)}
              variant="secondary"
              className="flex items-center space-x-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Actualizar</span>
            </Button>
            
            {archivePermissions.isAdmin && (
              <Button
                onClick={handleCleanupOrphanedRecords}
                variant="destructive"
                size="sm"
                className="flex items-center space-x-2"
                disabled={isCleaningUp}
              >
                <TrashIcon className="w-4 h-4" />
                <span>{isCleaningUp ? 'Limpiando...' : 'Limpiar Registros'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <ArchiveBoxIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalArchivedCases}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Casos archivados
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <ArchiveBoxIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalArchivedTodos}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    TODOs archivados
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <CalendarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatTime(stats.totalArchivedTimeMinutes)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tiempo total
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <ArrowPathIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.archivedThisMonth}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Archivados este mes
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo
              </label>
              <Select
                value={filters.type || 'all'}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="cases">Solo casos</option>
                <option value="todos">Solo TODOs</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Archivado por
              </label>
              <Select
                value={filters.archivedBy || ''}
                onChange={(e) => handleFilterChange('archivedBy', e.target.value || undefined)}
              >
                <option value="">Todos los usuarios</option>
                {(users || []).map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName || user.email}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Búsqueda
              </label>
              <Input
                type="text"
                placeholder="Buscar..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <Select
                value={filters.showRestored ? 'restored' : 'active'}
                onChange={(e) => handleFilterChange('showRestored', e.target.value === 'restored')}
              >
                <option value="active">Archivados</option>
                <option value="restored">Restaurados</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Lista de elementos archivados */}
        <div className="table-card table-responsive-compact">
          <div className="table-overflow-container">
            <table className="full-width-table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">
                    Tipo
                  </th>
                  <th className="table-header-cell">
                    Título
                  </th>
                  <th className="table-header-cell">
                    Tiempo
                  </th>
                  <th className="table-header-cell">
                    Archivado
                  </th>
                  <th className="table-header-cell">
                    Estado
                  </th>
                  <th className="table-header-cell">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No se encontraron elementos archivados
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={`${item.itemType}-${item.id}`} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full ${
                            item.itemType === 'case' 
                              ? 'bg-blue-100 dark:bg-blue-900' 
                              : 'bg-green-100 dark:bg-green-900'
                          }`}>
                            {item.itemType === 'case' ? (
                              <DocumentArrowDownIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <ArchiveBoxIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                            {item.itemType === 'case' ? 'Caso' : 'TODO'}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell-description" title={item.description || 'Sin descripción'}>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.itemType === 'case' ? (item as ArchivedCase).caseNumber : (item as ArchivedTodo).title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.description || 'Sin descripción'}
                        </div>
                      </td>
                      <td className="table-cell">
                        {formatTime(item.totalTimeMinutes)}
                      </td>
                      <td className="table-cell">
                        {formatDate(item.archivedAt)}
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.isRestored
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {item.isRestored ? 'Restaurado' : 'Archivado'}
                        </span>
                      </td>
                      <td className="table-cell-actions">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(item, item.itemType)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                            title="Ver detalles"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          {!item.isRestored && archivePermissions.canRestoreArchive() && canRestoreSpecificItem(item) && (
                            <button
                              onClick={() => handleRestoreRequest(item, item.itemType)}
                              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                              title="Restaurar"
                            >
                              <ArrowPathIcon className="w-4 h-4" />
                            </button>
                          )}
                          {archivePermissions.canDeleteArchive() && (
                            <button
                              onClick={() => handlePermanentDeleteRequest(item, item.itemType)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                              title="Eliminar permanentemente"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modales */}
      <RestoreModal
        isOpen={restoreModal.isOpen}
        onClose={() => setRestoreModal({ isOpen: false, item: null, loading: false })}
        onConfirm={handleRestoreConfirm}
        item={restoreModal.item || { id: '', title: '', type: 'case' }}
        loading={restoreModal.loading}
      />

      <ArchiveDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, item: null, type: 'case' })}
        item={detailsModal.item}
        type={detailsModal.type}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null, type: null })}
        onConfirm={handlePermanentDeleteConfirm}
        title="Eliminar Permanentemente"
        message={`¿Estás seguro de que quieres eliminar permanentemente ${deleteModal.type === 'case' ? 'el caso' : 'el TODO'} "${deleteModal.type === 'case' ? (deleteModal.item as ArchivedCase)?.caseNumber : (deleteModal.item as ArchivedTodo)?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar Permanentemente"
        cancelText="Cancelar"
        type="danger"
      />
    </PageWrapper>
  );
};
