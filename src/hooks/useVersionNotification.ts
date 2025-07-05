import { useState, useEffect } from 'react';
import { getCurrentVersion } from '@/data/changelog';

/**
 * Hook para manejar notificaciones de nuevas versiones
 * Compara la versión actual con la última vista por el usuario
 */
export const useVersionNotification = () => {
  const [hasNewVersion, setHasNewVersion] = useState(false);
  const [lastSeenVersion, setLastSeenVersion] = useState<string | null>(null);

  useEffect(() => {
    const currentVersion = getCurrentVersion();
    const stored = localStorage.getItem('lastSeenVersion');
    
    setLastSeenVersion(stored);
    
    // Si hay una versión almacenada y es diferente a la actual, hay una nueva versión
    if (stored && stored !== currentVersion) {
      setHasNewVersion(true);
    }
  }, []);

  const markVersionAsSeen = () => {
    const currentVersion = getCurrentVersion();
    localStorage.setItem('lastSeenVersion', currentVersion);
    setHasNewVersion(false);
    setLastSeenVersion(currentVersion);
  };

  const clearVersionHistory = () => {
    localStorage.removeItem('lastSeenVersion');
    setHasNewVersion(false);
    setLastSeenVersion(null);
  };

  return {
    hasNewVersion,
    lastSeenVersion,
    currentVersion: getCurrentVersion(),
    markVersionAsSeen,
    clearVersionHistory
  };
};
