import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  PlusIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useCases } from '@/hooks/useCases';
import { LoadingSpinner, ErrorMessage } from '@/components/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const { data: cases, isLoading, error, refetch } = useCases();

  // Calcular estadísticas desde los casos reales - usar useMemo para estabilizar
  const stats = React.useMemo(() => {
    if (!cases) return {
      totalCases: 0,
      lowComplexity: 0,
      mediumComplexity: 0,
      highComplexity: 0,
      thisMonth: 0,
      thisWeek: 0,
    };

    const now = new Date();
    const thisMonth = cases.filter(caso => {
      const caseDate = new Date(caso.fecha);
      return caseDate.getMonth() === now.getMonth() && 
             caseDate.getFullYear() === now.getFullYear();
    }).length;

    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = cases.filter(caso => 
      new Date(caso.fecha) >= oneWeekAgo
    ).length;

    return {
      totalCases: cases.length,
      lowComplexity: cases.filter(c => c.clasificacion === 'Baja Complejidad').length,
      mediumComplexity: cases.filter(c => c.clasificacion === 'Media Complejidad').length,
      highComplexity: cases.filter(c => c.clasificacion === 'Alta Complejidad').length,
      thisMonth,
      thisWeek,
    };
  }, [cases]);

  // Mostrar los casos más recientes - usar useMemo para estabilizar
  const recentCases = React.useMemo(() => {
    if (!cases) return [];
    return [...cases]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5);
  }, [cases]);

  // Acciones rápidas - mover fuera del render para estabilizar
  const quickActions = React.useMemo(() => [
    {
      name: 'Nuevo Caso',
      description: 'Registrar un nuevo caso en el sistema',
      href: '/cases/new',
      icon: PlusIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'Ver Casos',
      description: 'Explorar todos los casos registrados',
      href: '/cases',
      icon: DocumentTextIcon,
      color: 'bg-green-500 hover:bg-green-600',
    },
  ], []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" text="Cargando dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message="Error al cargar el dashboard" 
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Resumen general del sistema de gestión de casos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total de Casos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalCases}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Baja Complejidad
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.lowComplexity}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Media Complejidad
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.mediumComplexity}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Alta Complejidad
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.highComplexity}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.href}
                className={`block p-6 rounded-lg text-white transition-colors duration-200 ${action.color}`}
              >
                <div className="flex items-center">
                  <Icon className="h-8 w-8" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">{action.name}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Cases */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Casos Recientes
          </h2>
          <Link
            to="/cases"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver todos →
          </Link>
        </div>
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Número de Caso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Clasificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentCases.length > 0 ? (
                  recentCases.map((caso) => (
                    <tr key={caso.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {caso.numeroCaso}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {caso.descripcion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            caso.clasificacion === 'Alta Complejidad'
                              ? 'complexity-high'
                              : caso.clasificacion === 'Media Complejidad'
                              ? 'complexity-medium'
                              : 'complexity-low'
                          }`}
                        >
                          {caso.clasificacion}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(caso.fecha).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No hay casos registrados aún.{' '}
                      <Link to="/cases/new" className="text-primary-600 hover:text-primary-700">
                        Crear el primer caso
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
