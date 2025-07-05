import React, { useState } from 'react';
import { TableCellsIcon, CircleStackIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useCases } from '@/hooks/useCases';
import { useOrigenes, useAplicaciones } from '@/hooks/useOrigenesAplicaciones';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { supabase } from '@/lib/supabase';
import { PageWrapper } from '@/components/PageWrapper';

export const DataTestPage: React.FC = () => {
  const { data: cases, isLoading: casesLoading, refetch: refetchCases } = useCases();
  const { data: origenes, isLoading: origenesLoading, refetch: refetchOrigenes } = useOrigenes();
  const { data: aplicaciones, isLoading: aplicacionesLoading, refetch: refetchAplicaciones } = useAplicaciones();
  
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  const checkConnection = async () => {
    try {
      const { error } = await supabase.from('cases').select('count').limit(1);
      setConnectionStatus(!error);
    } catch (error) {
      setConnectionStatus(false);
    }
  };

  React.useEffect(() => {
    checkConnection();
  }, []);

  const refreshAllData = () => {
    refetchCases();
    refetchOrigenes();
    refetchAplicaciones();
    checkConnection();
  };

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <div className="h-5 w-5 bg-yellow-500 rounded-full animate-pulse" />;
    return status ? 
      <div className="h-5 w-5 bg-green-500 rounded-full" /> : 
      <div className="h-5 w-5 bg-red-500 rounded-full" />;
  };

  return (
    <PageWrapper>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CircleStackIcon className="h-8 w-8" />
            Datos de Base de Datos
          </h1>
          <button
            onClick={refreshAllData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Actualizar Datos
          </button>
        </div>

        {/* Estado de Conexión */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <StatusIcon status={connectionStatus} />
            Estado de Conexión
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {connectionStatus === null && "Verificando conexión..."}
            {connectionStatus === true && "✅ Conectado correctamente a Supabase"}
            {connectionStatus === false && "❌ Error de conexión a Supabase"}
          </p>
        </div>

        {/* Tabla de Orígenes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TableCellsIcon className="h-6 w-6" />
              Orígenes ({origenes?.length || 0})
            </h2>
            {origenesLoading && <LoadingSpinner size="sm" />}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Creado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {!origenes || origenes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {origenesLoading ? "Cargando..." : "No hay orígenes registrados"}
                    </td>
                  </tr>
                ) : (
                  origenes.map((origen) => (
                    <tr key={origen.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                        {origen.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {origen.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {origen.descripcion || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(origen.createdAt).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla de Aplicaciones */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TableCellsIcon className="h-6 w-6" />
              Aplicaciones ({aplicaciones?.length || 0})
            </h2>
            {aplicacionesLoading && <LoadingSpinner size="sm" />}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Creado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {!aplicaciones || aplicaciones.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {aplicacionesLoading ? "Cargando..." : "No hay aplicaciones registradas"}
                    </td>
                  </tr>
                ) : (
                  aplicaciones.map((aplicacion) => (
                    <tr key={aplicacion.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                        {aplicacion.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {aplicacion.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {aplicacion.descripcion || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(aplicacion.createdAt).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla de Casos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TableCellsIcon className="h-6 w-6" />
              Casos ({cases?.length || 0})
            </h2>
            {casesLoading && <LoadingSpinner size="sm" />}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Origen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aplicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Complejidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Puntuación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {!cases || cases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {casesLoading ? "Cargando..." : "No hay casos registrados"}
                    </td>
                  </tr>
                ) : (
                  cases.map((caso) => (
                    <tr key={caso.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                        {caso.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {caso.numeroCaso}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {caso.descripcion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {caso.origen?.nombre || `ID: ${caso.origenId}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {caso.aplicacion?.nombre || `ID: ${caso.aplicacionId}`}
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
                        {new Date(caso.fecha).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            📊 Resumen de Datos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Total Orígenes:</span>
              <p className="text-xl font-bold text-blue-600">{origenes?.length || 0}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Total Aplicaciones:</span>
              <p className="text-xl font-bold text-green-600">{aplicaciones?.length || 0}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Total Casos:</span>
              <p className="text-xl font-bold text-purple-600">{cases?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
