import React from 'react';
import { CalendarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button';
import { DisposicionMensual } from '@/types';

interface DisposicionScriptsMensualCardProps {
  disposicionMensual: DisposicionMensual;
  onExport: (year: number, month: number) => void;
  canExport: boolean;
}

export const DisposicionScriptsMensualCard: React.FC<DisposicionScriptsMensualCardProps> = ({
  disposicionMensual,
  onExport,
  canExport
}) => {
  const { year, month, monthName, disposiciones, totalDisposiciones } = disposicionMensual;

  const handleExport = () => {
    onExport(year, month);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {monthName} {year}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {totalDisposiciones} disposiciones
              </p>
            </div>
          </div>
          
          {canExport && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              className="flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Exportar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Content - Tabla */}
      {disposiciones.length > 0 ? (
        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Caso
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Aplicación
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cantidad
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {disposiciones.map((disposicion, index) => (
                <tr 
                  key={`${disposicion.caseId || disposicion.numeroCaso}-${disposicion.aplicacionId}-${index}`}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-25 dark:bg-gray-750'
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      #{disposicion.numeroCaso}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={disposicion.aplicacionNombre}>
                      {disposicion.aplicacionNombre}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                      {disposicion.cantidad} {disposicion.cantidad === 1 ? 'vez' : 'veces'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            Sin disposiciones
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No hay disposiciones registradas para este mes.
          </p>
        </div>
      )}

      {/* Footer con resumen */}
      {disposiciones.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Casos únicos: <span className="font-medium">{disposiciones.length}</span>
            </span>
            <span className="text-gray-900 dark:text-white font-medium">
              Total: <span className="text-blue-600 dark:text-blue-400 font-semibold">{totalDisposiciones}</span> disposiciones
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
