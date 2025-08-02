import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCase } from '@/case-management/hooks/useCases';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { formatDateLocal } from '@/shared/utils/caseUtils';

export default function ViewCasePage() {
  const { id } = useParams<{ id: string }>();
  const { data: caso, isLoading, error } = useCase(id!);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !caso) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          Error al cargar el caso o el caso no existe.
        </p>
        <Link to="/cases" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
          Volver a la lista de casos
        </Link>
      </div>
    );
  }

  // Función para obtener el badge de complejidad
  const getComplexityBadge = (clasificacion: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    if (clasificacion === 'Baja Complejidad') {
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>
          {clasificacion}
        </span>
      );
    } else if (clasificacion === 'Media Complejidad') {
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`}>
          {clasificacion}
        </span>
      );
    } else {
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`}>
          {clasificacion}
        </span>
      );
    }
  };

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/cases"
              className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Volver a casos
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Detalle del Caso
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Caso #{caso.numeroCaso}
              </p>
            </div>
          </div>
          <Link
            to={`/cases/edit/${caso.id}`}
            className="btn-primary"
          >
            Editar Caso
          </Link>
        </div>

        {/* Case Details */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Información del Caso
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Número de Caso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Caso
                </label>
                <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                  {caso.numeroCaso}
                </div>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha
                </label>
                <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                  {formatDateLocal(caso.fecha)}
                </div>
              </div>

              {/* Origen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Origen
                </label>
                <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                  {caso.origen?.nombre || 'N/A'}
                </div>
              </div>

              {/* Aplicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Aplicación
                </label>
                <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                  {caso.aplicacion?.nombre || 'N/A'}
                </div>
              </div>

              {/* Complejidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Complejidad
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                  {getComplexityBadge(caso.clasificacion)}
                </div>
              </div>

              {/* Puntuación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Puntuación
                </label>
                <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
                  {caso.puntuacion}/15
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-4 rounded-md whitespace-pre-wrap min-h-32">
                {caso.descripcion}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
