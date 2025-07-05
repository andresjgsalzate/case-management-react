import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-gray-300 dark:text-gray-600">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            Página no encontrada
          </h2>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Lo sentimos, la página que estás buscando no existe.
          </p>
        </div>

        <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-center">
          <Link
            to="/"
            className="btn-primary flex items-center justify-center"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Ir al Dashboard
          </Link>
          <Link
            to="/cases"
            className="btn-secondary flex items-center justify-center"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Ver Casos
          </Link>
        </div>
      </div>
    </div>
  );
};
