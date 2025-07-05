import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';

export const FloatingActionButton: React.FC = () => {
  const location = useLocation();
  
  // Don't show on new case page or edit pages
  if (location.pathname.includes('/cases/new') || location.pathname.includes('/cases/edit')) {
    return null;
  }

  return (
    <Link
      to="/cases/new"
      className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 z-50"
      aria-label="Crear nuevo caso"
    >
      <PlusIcon className="h-6 w-6" />
    </Link>
  );
};
