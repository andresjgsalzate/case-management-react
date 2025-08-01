import { VersionInfo, VersionChange } from '@/data/changelog';

/**
 * Utilidades para el manejo automático de versiones siguiendo Semantic Versioning (SemVer)
 * Formato: MAJOR.MINOR.PATCH
 * 
 * MAJOR: Cambios incompatibles que rompen la API (breaking changes)
 * MINOR: Nuevas funcionalidades compatibles hacia atrás
 * PATCH: Correcciones de errores compatibles hacia atrás
 */

export type VersionType = 'major' | 'minor' | 'patch';

export interface VersionParts {
  major: number;
  minor: number;
  patch: number;
}

/**
 * Parsea una versión string a sus componentes
 */
export const parseVersion = (version: string): VersionParts => {
  const [major, minor, patch] = version.split('.').map(Number);
  return { major: major || 0, minor: minor || 0, patch: patch || 0 };
};

/**
 * Convierte componentes de versión a string
 */
export const stringifyVersion = (parts: VersionParts): string => {
  return `${parts.major}.${parts.minor}.${parts.patch}`;
};

/**
 * Incrementa una versión según el tipo especificado
 */
export const incrementVersion = (currentVersion: string, type: VersionType): string => {
  const parts = parseVersion(currentVersion);
  
  switch (type) {
    case 'major':
      return stringifyVersion({ major: parts.major + 1, minor: 0, patch: 0 });
    case 'minor':
      return stringifyVersion({ major: parts.major, minor: parts.minor + 1, patch: 0 });
    case 'patch':
      return stringifyVersion({ major: parts.major, minor: parts.minor, patch: parts.patch + 1 });
    default:
      throw new Error(`Tipo de versión inválido: ${type}`);
  }
};

/**
 * Determina el tipo de versión automáticamente basado en los cambios
 */
export const getVersionTypeFromChanges = (changes: VersionChange[]): VersionType => {
  // Si hay cambios breaking, es una versión MAJOR
  if (changes.some(change => change.type === 'breaking')) {
    return 'major';
  }
  
  // Si hay nuevas funcionalidades, es una versión MINOR
  if (changes.some(change => change.type === 'feature')) {
    return 'minor';
  }
  
  // Solo correcciones y mejoras = versión PATCH
  return 'patch';
};

/**
 * Compara dos versiones y retorna si la primera es mayor, menor o igual
 */
export const compareVersions = (version1: string, version2: string): -1 | 0 | 1 => {
  const v1 = parseVersion(version1);
  const v2 = parseVersion(version2);
  
  if (v1.major !== v2.major) return v1.major > v2.major ? 1 : -1;
  if (v1.minor !== v2.minor) return v1.minor > v2.minor ? 1 : -1;
  if (v1.patch !== v2.patch) return v1.patch > v2.patch ? 1 : -1;
  
  return 0;
};

/**
 * Verifica si una versión es válida según SemVer
 */
export const isValidVersion = (version: string): boolean => {
  const semverRegex = /^\d+\.\d+\.\d+$/;
  return semverRegex.test(version);
};

/**
 * Genera una nueva entrada de changelog
 */
export const createVersionEntry = (
  currentVersion: string,
  changes: VersionChange[],
  date: string = new Date().toISOString().split('T')[0]
): VersionInfo => {
  const versionType = getVersionTypeFromChanges(changes);
  const newVersion = incrementVersion(currentVersion, versionType);
  
  return {
    version: newVersion,
    date,
    changes
  };
};

/**
 * Formatea la fecha para mostrar en el changelog
 */
export const formatChangelogDate = (date: string): string => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Obtiene un resumen de estadísticas de versiones
 */
export const getVersionStats = (changelog: VersionInfo[]) => {
  const totalVersions = changelog.length;
  const totalChanges = changelog.reduce((acc, version) => acc + version.changes.length, 0);
  
  const changesByType = changelog.reduce((acc, version) => {
    version.changes.forEach(change => {
      acc[change.type] = (acc[change.type] || 0) + 1;
    });
    return acc;
  }, {} as Record<VersionChange['type'], number>);
  
  const versionsByType = changelog.reduce((acc, version) => {
    const versionType = getVersionTypeFromChanges(version.changes);
    acc[versionType] = (acc[versionType] || 0) + 1;
    return acc;
  }, {} as Record<VersionType, number>);
  
  return {
    totalVersions,
    totalChanges,
    changesByType,
    versionsByType,
    averageChangesPerVersion: Math.round((totalChanges / totalVersions) * 100) / 100
  };
};
