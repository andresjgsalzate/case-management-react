import React from 'react';
import { Modal } from './Modal';
import { changelog, VersionChange } from '@/data/changelog';
import { getVersionStats } from '@/utils/versionUtils';
import { 
  SparklesIcon, 
  ArrowUpIcon, 
  BugAntIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getChangeIcon = (type: VersionChange['type']) => {
  const iconClass = "h-4 w-4 mr-2 flex-shrink-0";
  
  switch (type) {
    case 'feature':
      return <SparklesIcon className={`${iconClass} text-green-500`} />;
    case 'improvement':
      return <ArrowUpIcon className={`${iconClass} text-blue-500`} />;
    case 'bugfix':
      return <BugAntIcon className={`${iconClass} text-orange-500`} />;
    case 'breaking':
      return <ExclamationTriangleIcon className={`${iconClass} text-red-500`} />;
    default:
      return <SparklesIcon className={`${iconClass} text-gray-500`} />;
  }
};

const getChangeTypeLabel = (type: VersionChange['type']): string => {
  switch (type) {
    case 'feature':
      return 'Nueva funcionalidad';
    case 'improvement':
      return 'Mejora';
    case 'bugfix':
      return 'Corrección de errores';
    case 'breaking':
      return 'Cambio importante';
    default:
      return 'Cambio';
  }
};

const getChangeTypeColor = (type: VersionChange['type']): string => {
  switch (type) {
    case 'feature':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'improvement':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'bugfix':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'breaking':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const VersionModal: React.FC<VersionModalProps> = ({ isOpen, onClose }) => {
  const [filterType, setFilterType] = React.useState<VersionChange['type'] | 'all'>('all');
  const [showStats, setShowStats] = React.useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getVersionType = (version: string): { type: 'major' | 'minor' | 'patch', color: string } => {
    const [major, minor, patch] = version.split('.').map(Number);
    
    // Determinar el tipo de versión basado en cambios significativos
    if (major > 1 || (major === 1 && minor === 0 && patch === 0)) {
      return { type: 'major', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
    } else if (minor > 0) {
      return { type: 'minor', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
    } else {
      return { type: 'patch', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    }
  };

  // Filtrar versiones según el tipo seleccionado
  const filteredChangelog = React.useMemo(() => {
    if (filterType === 'all') return changelog;
    
    return changelog.map(version => ({
      ...version,
      changes: version.changes.filter(change => change.type === filterType)
    })).filter(version => version.changes.length > 0);
  }, [filterType]);

  // Calcular estadísticas
  const stats = React.useMemo(() => {
    return getVersionStats(changelog);
  }, []);

  const filterOptions = [
    { value: 'all' as const, label: 'Todos los cambios', count: stats.totalChanges },
    { value: 'feature' as const, label: 'Nuevas funcionalidades', count: stats.changesByType.feature || 0 },
    { value: 'improvement' as const, label: 'Mejoras', count: stats.changesByType.improvement || 0 },
    { value: 'bugfix' as const, label: 'Correcciones', count: stats.changesByType.bugfix || 0 },
    { value: 'breaking' as const, label: 'Cambios importantes', count: stats.changesByType.breaking || 0 },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Historial de Versiones"
      size="2xl"
    >
      <div className="space-y-8">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Aquí puedes ver todas las mejoras, correcciones y nuevas funcionalidades añadidas en cada versión.
        </div>

        {/* Filtros */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Filtrar por tipo de cambio:</h4>
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
            >
              <ChartBarIcon className="h-4 w-4 mr-1" />
              {showStats ? 'Ocultar' : 'Ver'} estadísticas
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterType(option.value)}
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  filterType === option.value
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ring-2 ring-blue-500'
                    : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
                <span className="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                  {option.count}
                </span>
              </button>
            ))}
          </div>
          
          {/* Estadísticas expandibles */}
          {showStats && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900 dark:text-white">Resumen general:</h5>
                  <div className="space-y-2 text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Total de versiones:</span>
                      <span className="font-medium">{stats.totalVersions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de cambios:</span>
                      <span className="font-medium">{stats.totalChanges}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Promedio por versión:</span>
                      <span className="font-medium">{stats.averageChangesPerVersion}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900 dark:text-white">Por tipo de versión:</h5>
                  <div className="space-y-2 text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>MAJOR:</span>
                      <span className="font-medium">{stats.versionsByType.major || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MINOR:</span>
                      <span className="font-medium">{stats.versionsByType.minor || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PATCH:</span>
                      <span className="font-medium">{stats.versionsByType.patch || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 -mr-4">
          {filteredChangelog.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No se encontraron cambios del tipo seleccionado.
            </div>
          ) : (
            filteredChangelog.map((version, index) => {
              const versionInfo = getVersionType(version.version);
              const isLatest = index === 0 && filterType === 'all';

              return (
                <div
                  key={version.version}
                  className={`relative border rounded-lg p-6 ${
                    isLatest 
                      ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Header de la versión */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        v{version.version}
                        {isLatest && (
                          <span className="ml-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Actual
                          </span>
                        )}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${versionInfo.color}`}>
                        {versionInfo.type.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {formatDate(version.date)}
                    </span>
                  </div>

                  {/* Lista de cambios */}
                  <div className="space-y-3">
                    {version.changes.map((change, changeIndex) => (
                      <div
                        key={changeIndex}
                        className="flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        {getChangeIcon(change.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${getChangeTypeColor(change.type)}`}>
                              {getChangeTypeLabel(change.type)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {change.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer con información adicional */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-100 dark:bg-red-900 rounded mr-2"></div>
                <span>MAJOR: Cambios importantes</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900 rounded mr-2"></div>
                <span>MINOR: Nuevas funcionalidades</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-100 dark:bg-green-900 rounded mr-2"></div>
                <span>PATCH: Correcciones</span>
              </div>
            </div>
            <div className="font-medium">
              {filterType === 'all' ? `${changelog.length} versiones` : `${filteredChangelog.length} versiones con ${getChangeTypeLabel(filterType as VersionChange['type']).toLowerCase()}`}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
