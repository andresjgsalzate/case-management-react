import React from 'react';
import { ExclamationTriangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export const ConfigurationRequired: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-yellow-400">
            <ExclamationTriangleIcon />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Configuración Requerida
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Es necesario configurar las variables de entorno de Supabase
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Cog6ToothIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Pasos para configurar Supabase
                </h3>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                  1. Crear proyecto en Supabase
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Ve a{' '}
                  <a 
                    href="https://app.supabase.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    app.supabase.com
                  </a>{' '}
                  y crea un nuevo proyecto
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">
                  2. Obtener credenciales
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  En tu proyecto, ve a <strong>Settings → API</strong> y copia:
                </p>
                <ul className="mt-2 text-sm text-green-700 dark:text-green-300 list-disc list-inside">
                  <li>Project URL</li>
                  <li>anon public key</li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md">
                <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2">
                  3. Configurar variables de entorno
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                  Edita el archivo <code className="bg-purple-100 dark:bg-purple-800 px-1 rounded">.env</code>:
                </p>
                <pre className="text-xs bg-purple-100 dark:bg-purple-800 p-2 rounded overflow-x-auto">
{`VITE_SUPABASE_URL=https://zckfwedteqvjytembgpu.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_aqui`}
                </pre>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-md">
                <h4 className="font-medium text-orange-900 dark:text-orange-200 mb-2">
                  4. Aplicar migración SQL
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  En Supabase, ve a <strong>SQL Editor</strong> y ejecuta el contenido del archivo:
                </p>
                <code className="text-xs bg-orange-100 dark:bg-orange-800 px-1 rounded">
                  supabase/migrations/001_initial.sql
                </code>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reintentar conexión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
