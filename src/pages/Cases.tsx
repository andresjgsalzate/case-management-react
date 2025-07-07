import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';
import { useCases, useDeleteCase } from '@/hooks/useCases';
import { Case } from '@/types';
import { useOrigenes, useAplicaciones } from '@/hooks/useOrigenesAplicaciones';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { exportCasesToExcel, exportCasesToCSV } from '@/utils/exportUtils';
import { formatDateLocal } from '@/utils/caseUtils';
import { PageWrapper } from '@/components/PageWrapper';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { useNotification } from '@/components/NotificationSystem';

export const CasesPage: React.FC = () => {
  const { data: cases, isLoading, error, refetch } = useCases();
  const { data: origenes } = useOrigenes();
  const { data: aplicaciones } = useAplicaciones();
  const deleteCase = useDeleteCase();
  const { showSuccess, showError } = useNotification();

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigen, setSelectedOrigen] = useState('');
  const [selectedAplicacion, setSelectedAplicacion] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('');

  // Estado para modal de confirmación
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    caseId: string;
    caseNumber: string;
  }>({
    isOpen: false,
    caseId: '',
    caseNumber: ''
  });

  // Debug: log the current state
  React.useEffect(() => {
    console.log('📊 Cases Page State:', {
      cases: cases?.length || 0,
      isLoading,
      error: error?.message,
      origenes: origenes?.length || 0,
      aplicaciones: aplicaciones?.length || 0
    });
  }, [cases, isLoading, error, origenes, aplicaciones]);

  // Filtrar casos
  const filteredCases = React.useMemo(() => {
    if (!cases) return [];

    return cases.filter(caso => {
      const matchesSearch = 
        (caso.numeroCaso || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (caso.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesOrigen = !selectedOrigen || caso.origenId === selectedOrigen;
      const matchesAplicacion = !selectedAplicacion || caso.aplicacionId === selectedAplicacion;
      const matchesComplexity = !selectedComplexity || caso.clasificacion === selectedComplexity;

      return matchesSearch && matchesOrigen && matchesAplicacion && matchesComplexity;
    });
  }, [cases, searchTerm, selectedOrigen, selectedAplicacion, selectedComplexity]);

  const handleDelete = (id: string, numeroCaso: string) => {
    setDeleteModal({
      isOpen: true,
      caseId: id,
      caseNumber: numeroCaso
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteCase.mutateAsync(deleteModal.caseId);
      showSuccess('Caso eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar caso:', error);
      showError('Error al eliminar caso', error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setDeleteModal({ isOpen: false, caseId: '', caseNumber: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, caseId: '', caseNumber: '' });
  };

  const handleExportExcel = () => {
    if (filteredCases.length === 0) {
      return; // No hacer nada si no hay casos
    }
    exportCasesToExcel(filteredCases as Case[], 'casos.xlsx', showSuccess);
  };

  const handleExportCSV = () => {
    if (filteredCases.length === 0) {
      return; // No hacer nada si no hay casos
    }
    exportCasesToCSV(filteredCases as Case[], 'casos.csv', showSuccess);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" text="Cargando casos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Error al cargar los casos
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error.message || 'Error desconocido'}
        </p>
        <button
          onClick={() => refetch()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestión de Casos
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={handleExportCSV}
            className="btn-secondary"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="btn-secondary"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            Excel
          </button>
          <Link to="/cases/new" className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            Nuevo Caso
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
                placeholder="Buscar por número o descripción..."
              />
            </div>
          </div>

          {/* Filtro Origen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Origen
            </label>
            <select
              value={selectedOrigen}
              onChange={(e) => setSelectedOrigen(e.target.value)}
              className="form-input"
            >
              <option value="">Todos los orígenes</option>
              {origenes?.map(origen => (
                <option key={origen.id} value={origen.id}>
                  {origen.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Aplicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Aplicación
            </label>
            <select
              value={selectedAplicacion}
              onChange={(e) => setSelectedAplicacion(e.target.value)}
              className="form-input"
            >
              <option value="">Todas las aplicaciones</option>
              {aplicaciones?.map(aplicacion => (
                <option key={aplicacion.id} value={aplicacion.id}>
                  {aplicacion.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Complejidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Complejidad
            </label>
            <select
              value={selectedComplexity}
              onChange={(e) => setSelectedComplexity(e.target.value)}
              className="form-input"
            >
              <option value="">Todas las complejidades</option>
              <option value="Baja Complejidad">Baja Complejidad</option>
              <option value="Media Complejidad">Media Complejidad</option>
              <option value="Alta Complejidad">Alta Complejidad</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold text-blue-600">{filteredCases.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total casos</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-green-600">
            {filteredCases.filter(c => c.clasificacion === 'Baja Complejidad').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Baja complejidad</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredCases.filter(c => c.clasificacion === 'Media Complejidad').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Media complejidad</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-red-600">
            {filteredCases.filter(c => c.clasificacion === 'Alta Complejidad').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Alta complejidad</div>
        </div>
      </div>

      {/* Tabla de casos */}
      <div className="table-card">
        <div className="table-overflow-container">
          <table className="full-width-table">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Número de Caso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Origen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Aplicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Complejidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Puntuación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron casos
                  </td>
                </tr>
              ) : (
                filteredCases.map((caso) => (
                  <tr key={caso.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {caso.numeroCaso}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {caso.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {caso.origen?.nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {caso.aplicacion?.nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        caso.clasificacion === 'Baja Complejidad'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : caso.clasificacion === 'Media Complejidad'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {caso.clasificacion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {caso.puntuacion}/15
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDateLocal(caso.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/cases/edit/${caso.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(caso.id, caso.numeroCaso)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmación */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que quieres eliminar el caso ${deleteModal.caseNumber}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onClose={cancelDelete}
        type="danger"
      />
    </PageWrapper>
  );
};
