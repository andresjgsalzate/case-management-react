import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface RLSErrorProps {
  onRetry?: () => void;
}

export const RLSError: React.FC<RLSErrorProps> = ({ onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Error de Base de Datos
          </h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Se ha detectado un problema de recursión infinita en las políticas de seguridad de la base de datos.
          </p>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-4">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Acción requerida:
            </h3>
            <ol className="text-sm text-yellow-700 dark:text-yellow-300 list-decimal list-inside space-y-1">
              <li>Ve al panel de Supabase → SQL Editor</li>
              <li>Ejecuta la migración: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">007_fix_rls_recursion.sql</code></li>
              <li>Vuelve a cargar esta página</li>
            </ol>
          </div>
        </div>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};
