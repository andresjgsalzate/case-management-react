import React from 'react';
import { 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { Button } from './Button';
import { DisposicionScripts } from '@/types';
import { formatDate } from '@/utils/caseUtils';

interface DisposicionScriptsTableProps {
  disposiciones: DisposicionScripts[];
  onEdit: (disposicion: DisposicionScripts) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
  canEditSpecific?: (disposicion: DisposicionScripts) => boolean;
  canDeleteSpecific?: (disposicion: DisposicionScripts) => boolean;
  isLoading?: boolean;
}

export const DisposicionScriptsTable: React.FC<DisposicionScriptsTableProps> = ({
  disposiciones,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  canEditSpecific,
  canDeleteSpecific,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (disposiciones.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          No hay disposiciones
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No se encontraron disposiciones con los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Fecha
              </th>
              <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Caso
              </th>
              <th className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Script
              </th>
              <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Aplicación
              </th>
              <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Revisión SVN
              </th>
              <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Usuario
              </th>
              {(canEdit || canDelete) && (
                <th className="w-20 px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {disposiciones.map((disposicion) => {
              const canEditThis = canEditSpecific ? canEditSpecific(disposicion) : canEdit;
              const canDeleteThis = canDeleteSpecific ? canDeleteSpecific(disposicion) : canDelete;
              
              return (
                <tr key={disposicion.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {/* Fecha - ancho fijo pequeño */}
                  <td className="w-24 px-4 py-4 text-sm text-gray-900 dark:text-gray-300">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                      <span className="text-xs">{formatDate(disposicion.fecha)}</span>
                    </div>
                  </td>
                  
                  {/* Caso - ancho fijo mediano */}
                  <td className="w-32 px-4 py-4 text-sm">
                    <div className="font-medium text-gray-900 dark:text-white text-xs leading-tight">
                      #{disposicion.case ? ('numeroCaso' in disposicion.case ? disposicion.case.numeroCaso : disposicion.case.numero_caso) : disposicion.caseNumber || 'N/A'}
                    </div>
                    {disposicion.case?.descripcion && (
                      <div className="text-gray-500 dark:text-gray-400 text-xs leading-tight mt-1 overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        maxHeight: '2.5rem'
                      }}>
                        {disposicion.case.descripcion}
                      </div>
                    )}
                  </td>
                  
                  {/* Script - ancho más grande con wrap */}
                  <td className="w-48 px-4 py-4 text-sm">
                    <div className="font-medium text-gray-900 dark:text-white text-xs leading-tight break-words">
                      {disposicion.nombreScript}
                    </div>
                    {disposicion.observaciones && (
                      <div className="text-gray-500 dark:text-gray-400 text-xs leading-tight mt-1 break-words overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        maxHeight: '2.5rem'
                      }}>
                        {disposicion.observaciones}
                      </div>
                    )}
                  </td>
                  
                  {/* Aplicación - ancho pequeño */}
                  <td className="w-24 px-4 py-4 text-sm text-gray-900 dark:text-gray-300">
                    <div className="flex items-center">
                      <ComputerDesktopIcon className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                      <span className="text-xs truncate">{disposicion.aplicacion?.nombre || 'N/A'}</span>
                    </div>
                  </td>
                  
                  {/* Revisión SVN - ancho muy pequeño */}
                  <td className="w-20 px-4 py-4 text-sm text-gray-900 dark:text-gray-300">
                    {disposicion.numeroRevisionSvn ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {disposicion.numeroRevisionSvn}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  
                  {/* Usuario - ancho mediano */}
                  <td className="w-32 px-4 py-4 text-sm text-gray-900 dark:text-gray-300">
                    <span className="text-xs truncate block">{disposicion.user?.fullName || 'N/A'}</span>
                  </td>
                  
                  {/* Acciones - ancho muy pequeño */}
                  {(canEdit || canDelete) && (
                    <td className="w-20 px-4 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1">
                        {canEditThis && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(disposicion)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200 p-1"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        )}
                        {canDeleteThis && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(disposicion.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-1"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span>Total de disposiciones: {disposiciones.length}</span>
        </div>
      </div>
    </div>
  );
};

export default DisposicionScriptsTable;
