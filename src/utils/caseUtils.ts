import { CaseComplexity } from '@/types';

/**
 * Clasifica un caso según su puntuación total
 */
export function clasificarCaso(puntuacion: number): CaseComplexity {
  if (puntuacion >= 12) return 'Alta Complejidad';
  if (puntuacion >= 6) return 'Media Complejidad';
  return 'Baja Complejidad';
}

/**
 * Calcula la puntuación total de un caso
 */
export function calcularPuntuacion(
  historialCaso: number,
  conocimientoModulo: number,
  manipulacionDatos: number,
  claridadDescripcion: number,
  causaFallo: number
): number {
  return historialCaso + conocimientoModulo + manipulacionDatos + claridadDescripcion + causaFallo;
}

/**
 * Obtiene el color de la clasificación para Tailwind
 */
export function getComplexityColor(clasificacion: CaseComplexity): string {
  switch (clasificacion) {
    case 'Baja Complejidad':
      return 'complexity-low';
    case 'Media Complejidad':
      return 'complexity-medium';
    case 'Alta Complejidad':
      return 'complexity-high';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Formatea una fecha para mostrar
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Genera un ID único para casos
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Valida si un número de caso es único
 */
export function isUniqueCase(numeroCaso: string, cases: any[], currentCaseId?: string): boolean {
  return !cases.some(caso => 
    caso.numeroCaso === numeroCaso && caso.id !== currentCaseId
  );
}
