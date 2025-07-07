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
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'Fecha no disponible';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  // Formato DD/MM/AAAA
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Formatea minutos en formato de tiempo HH:mm
 */
export function formatTime(minutes: number | undefined | null): string {
  // Manejar casos de valores inválidos
  if (minutes === null || minutes === undefined || isNaN(minutes)) {
    return '00:00';
  }
  
  const totalMinutes = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
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

/**
 * Formatea una fecha en formato YYYY-MM-DD sin problemas de zona horaria
 */
export function formatDateLocal(dateString: string): string {
  if (!dateString) return 'Fecha no disponible';
  
  // Para fechas en formato YYYY-MM-DD, crearlas como fechas locales
  const [year, month, day] = dateString.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day); // month - 1 porque los meses empiezan en 0
  
  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  // Formato DD/MM/AAAA
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
}
