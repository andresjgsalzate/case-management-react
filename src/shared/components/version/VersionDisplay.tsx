import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { getCurrentVersion } from '@/data/changelog';
import { useVersionNotification } from '@/shared/hooks/useVersionNotification';

interface VersionDisplayProps {
  onClick: () => void;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = ({ onClick }) => {
  const version = getCurrentVersion();
  const { hasNewVersion, markVersionAsSeen } = useVersionNotification();

  const handleClick = () => {
    if (hasNewVersion) {
      markVersionAsSeen();
    }
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="group relative flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm"
      title="Ver historial de versiones - Click para más detalles"
    >
      <InformationCircleIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
      <span className="font-mono font-semibold">v{version}</span>
      
      {/* Indicador de estado */}
      <div 
        className={`w-2 h-2 rounded-full transition-all duration-200 ${
          hasNewVersion 
            ? 'bg-orange-400 animate-pulse group-hover:bg-orange-500' 
            : 'bg-green-400 animate-pulse group-hover:bg-blue-400'
        }`} 
        title={hasNewVersion ? "Nueva versión disponible" : "Sistema actualizado"} 
      />
      
      {/* Badge de nueva versión */}
      {hasNewVersion && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-bounce">
          <div className="w-full h-full bg-orange-400 rounded-full animate-ping"></div>
        </div>
      )}
    </button>
  );
};
