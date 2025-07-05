import * as XLSX from 'xlsx';
import { Case } from '@/types';

/**
 * Exporta una lista de casos a un archivo Excel
 */
export const exportCasesToExcel = (cases: Case[], filename: string = 'casos.xlsx') => {
  // Preparar los datos para el Excel
  const excelData = cases.map(caso => ({
    'Número de Caso': caso.numeroCaso,
    'Descripción': caso.descripcion,
    'Fecha': new Date(caso.fecha).toLocaleDateString('es-ES'),
    'Origen': caso.origen?.nombre || 'No especificado',
    'Aplicación': caso.aplicacion?.nombre || 'No especificado',
    'Historial del Caso': getHistorialCasoText(caso.historialCaso),
    'Conocimiento del Módulo': getConocimientoModuloText(caso.conocimientoModulo),
    'Manipulación de Datos': getManipulacionDatosText(caso.manipulacionDatos),
    'Claridad de Descripción': getClaridadDescripcionText(caso.claridadDescripcion),
    'Causa del Fallo': getCausaFalloText(caso.causaFallo),
    'Puntuación Total': caso.puntuacion,
    'Clasificación': caso.clasificacion,
    'Fecha de Creación': new Date(caso.createdAt).toLocaleDateString('es-ES'),
  }));

  // Crear el libro de Excel
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  
  // Añadir la hoja al libro
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Casos');

  // Configurar el ancho de las columnas
  const columnWidths = [
    { wch: 15 }, // Número de Caso
    { wch: 40 }, // Descripción
    { wch: 12 }, // Fecha
    { wch: 20 }, // Origen
    { wch: 20 }, // Aplicación
    { wch: 25 }, // Historial del Caso
    { wch: 25 }, // Conocimiento del Módulo
    { wch: 25 }, // Manipulación de Datos
    { wch: 25 }, // Claridad de Descripción
    { wch: 25 }, // Causa del Fallo
    { wch: 12 }, // Puntuación Total
    { wch: 15 }, // Clasificación
    { wch: 15 }, // Fecha de Creación
  ];
  
  worksheet['!cols'] = columnWidths;

  // Descargar el archivo
  XLSX.writeFile(workbook, filename);
};

/**
 * Exporta una lista de casos a un archivo CSV
 */
export const exportCasesToCSV = (cases: Case[], filename: string = 'casos.csv') => {
  const csvData = cases.map(caso => ({
    numeroCaso: caso.numeroCaso,
    descripcion: caso.descripcion,
    fecha: caso.fecha,
    historialCaso: getHistorialCasoText(caso.historialCaso),
    conocimientoModulo: getConocimientoModuloText(caso.conocimientoModulo),
    manipulacionDatos: getManipulacionDatosText(caso.manipulacionDatos),
    claridadDescripcion: getClaridadDescripcionText(caso.claridadDescripcion),
    causaFallo: getCausaFalloText(caso.causaFallo),
    puntuacion: caso.puntuacion,
    clasificacion: caso.clasificacion,
    fechaCreacion: caso.createdAt,
  }));

  const worksheet = XLSX.utils.json_to_sheet(csvData);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Funciones helper para convertir números a texto
function getHistorialCasoText(value: number): string {
  switch (value) {
    case 1: return 'Error conocido y solucionado previamente';
    case 2: return 'Error recurrente, no solucionado';
    case 3: return 'Error desconocido, no solucionado';
    default: return 'Desconocido';
  }
}

function getConocimientoModuloText(value: number): string {
  switch (value) {
    case 1: return 'Conoce módulo y función puntual';
    case 2: return 'Conoce módulo, requiere capacitación';
    case 3: return 'Desconoce módulo, requiere capacitación';
    default: return 'Desconocido';
  }
}

function getManipulacionDatosText(value: number): string {
  switch (value) {
    case 1: return 'Mínima o no necesaria';
    case 2: return 'Intensiva, sin replicar lógica';
    case 3: return 'Extremadamente compleja, replicar lógica';
    default: return 'Desconocido';
  }
}

function getClaridadDescripcionText(value: number): string {
  switch (value) {
    case 1: return 'Descripción clara y precisa';
    case 2: return 'Descripción ambigua o poco clara';
    case 3: return 'Descripción confusa o inexacta';
    default: return 'Desconocido';
  }
}

function getCausaFalloText(value: number): string {
  switch (value) {
    case 1: return 'Error operativo, fácil solución';
    case 2: return 'Falla puntual, requiere pruebas';
    case 3: return 'Falla compleja, pruebas adicionales';
    default: return 'Desconocido';
  }
}
