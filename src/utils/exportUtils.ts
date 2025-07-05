import * as XLSX from 'xlsx';
import { Case } from '@/types';
import toast from 'react-hot-toast';

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
  
  // Mostrar notificación de éxito
  toast.success('Casos exportados a Excel');
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
    
    // Mostrar notificación de éxito
    toast.success('Casos exportados a CSV');
  }
};

/**
 * Exporta un reporte de control de casos con acumulado por día
 */
export const exportCaseControlReport = (
  caseControls: any[],
  timeEntries: any[],
  manualTimeEntries: any[],
  filename: string = 'reporte-control-casos.xlsx'
) => {
  console.log('� Generando reporte de control de casos...');

  // Crear un mapa para agrupar por caso y día
  const reportData: { [key: string]: any } = {};

  // Procesar time entries (timer)
  timeEntries.forEach(entry => {
    const caseControl = caseControls.find(cc => cc.id === entry.case_control_id);
    if (!caseControl) return;

    const date = new Date(entry.start_time).toISOString().split('T')[0];
    const key = `${caseControl.case?.numeroCaso || 'N/A'}-${date}`;

    if (!reportData[key]) {
      reportData[key] = createReportEntry(caseControl, date);
    }

    reportData[key].tiempoTimer += entry.duration_minutes || 0;
  });

  // Procesar manual time entries
  manualTimeEntries.forEach(entry => {
    const caseControl = caseControls.find(cc => cc.id === entry.case_control_id);
    if (!caseControl) return;

    const date = entry.date;
    const key = `${caseControl.case?.numeroCaso || 'N/A'}-${date}`;

    if (!reportData[key]) {
      reportData[key] = createReportEntry(caseControl, date);
    }

    reportData[key].tiempoManual += entry.duration_minutes || 0;
  });

  // Si no hay datos de tiempo, crear entradas para todos los case controls
  if (Object.keys(reportData).length === 0 && caseControls.length > 0) {
    console.log('ℹ️ No hay datos de tiempo, creando entradas para case controls existentes');
    caseControls.forEach(caseControl => {
      const today = new Date().toISOString().split('T')[0];
      const key = `${caseControl.case?.numeroCaso || 'NO-DATA'}-${today}`;
      reportData[key] = createReportEntry(caseControl, today);
    });
  }

  // Función helper para crear entradas del reporte
  function createReportEntry(caseControl: any, date: string) {
    // Extraer datos de manera más robusta
    const caseData = caseControl.case || {};
    const userData = caseControl.user || {};
    const statusData = caseControl.status || {};
    
    // Intentar obtener el número de caso de diferentes maneras
    const numeroCaso = caseData.numeroCaso || 
                      caseControl.case_number || 
                      caseControl.caseId || 
                      'N/A';
    
    // Intentar obtener la descripción de diferentes maneras
    const descripcionCaso = caseData.descripcion || 
                           caseData.description || 
                           caseControl.case_description || 
                           'Sin descripción';
    
    // Intentar obtener el nombre del usuario de diferentes maneras
    const usuarioAsignado = userData.full_name || 
                           userData.name || 
                           caseControl.assigned_user_name || 
                           caseControl.user_name ||
                           'N/A';
    
    // Intentar obtener el estado de diferentes maneras
    const estado = statusData.name || 
                   caseControl.status_name || 
                   'N/A';
    
    // Intentar obtener la aplicación de diferentes maneras
    const aplicacion = caseData.aplicacion?.nombre || 
                      caseData.application?.name || 
                      caseControl.application_name || 
                      'N/A';
    
    return {
      numeroCaso,
      descripcionCaso,
      fecha: date,
      tiempoTimer: 0,
      tiempoManual: 0,
      tiempoTotal: 0,
      estado,
      usuarioAsignado,
      aplicacion,
      fechaAsignacion: caseControl.assigned_at ? new Date(caseControl.assigned_at).toLocaleDateString('es-ES') : 'N/A'
    };
  }

  console.log('📊 Datos del reporte procesados:', Object.keys(reportData).length, 'entradas');

  // Si aún no hay datos, crear un ejemplo básico
  if (Object.keys(reportData).length === 0) {
    console.log('⚠️ Creando datos de ejemplo - no se encontraron datos');
    const today = new Date().toISOString().split('T')[0];
    reportData[`EJEMPLO-${today}`] = {
      numeroCaso: 'EJEMPLO',
      descripcionCaso: 'No hay datos de control de casos disponibles',
      fecha: today,
      tiempoTimer: 0,
      tiempoManual: 0,
      tiempoTotal: 0,
      estado: 'N/A',
      usuarioAsignado: 'Sistema',
      aplicacion: 'N/A',
      fechaAsignacion: new Date().toLocaleDateString('es-ES')
    };
  }

  // Calcular tiempo total y convertir a formato legible
  const excelData = Object.values(reportData).map(item => {
    const tiempoTotal = item.tiempoTimer + item.tiempoManual;
    
    // Formatear fecha sin problemas de zona horaria
    const formatFechaLocal = (fechaString: string) => {
      const [year, month, day] = fechaString.split('-').map(Number);
      const fecha = new Date(year, month - 1, day);
      return fecha.toLocaleDateString('es-ES');
    };
    
    return {
      'Número de Caso': item.numeroCaso,
      'Descripción del Caso': item.descripcionCaso,
      'Fecha': formatFechaLocal(item.fecha),
      'Tiempo Timer (Horas)': formatMinutesToHours(item.tiempoTimer),
      'Tiempo Manual (Horas)': formatMinutesToHours(item.tiempoManual),
      'Tiempo Total (Horas)': formatMinutesToHours(tiempoTotal),
      'Tiempo Timer (Minutos)': item.tiempoTimer,
      'Tiempo Manual (Minutos)': item.tiempoManual,
      'Tiempo Total (Minutos)': tiempoTotal,
      'Estado': item.estado,
      'Usuario Asignado': item.usuarioAsignado,
      'Aplicación': item.aplicacion,
      'Fecha de Asignación': item.fechaAsignacion
    };
  }).sort((a, b) => {
    // Ordenar por número de caso y luego por fecha
    const caseCompare = a['Número de Caso'].localeCompare(b['Número de Caso']);
    if (caseCompare !== 0) return caseCompare;
    return new Date(a['Fecha']).getTime() - new Date(b['Fecha']).getTime();
  });

  console.log('✅ Reporte generado exitosamente con', excelData.length, 'filas');

  // Crear el libro de Excel
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  
  // Añadir la hoja al libro
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Control Casos');

  // Configurar el ancho de las columnas
  const columnWidths = [
    { wch: 15 }, // Número de Caso
    { wch: 40 }, // Descripción del Caso
    { wch: 12 }, // Fecha
    { wch: 18 }, // Tiempo Timer (Horas)
    { wch: 18 }, // Tiempo Manual (Horas)
    { wch: 18 }, // Tiempo Total (Horas)
    { wch: 18 }, // Tiempo Timer (Minutos)
    { wch: 18 }, // Tiempo Manual (Minutos)
    { wch: 18 }, // Tiempo Total (Minutos)
    { wch: 15 }, // Estado
    { wch: 20 }, // Usuario Asignado
    { wch: 20 }, // Aplicación
    { wch: 18 }, // Fecha de Asignación
  ];
  
  worksheet['!cols'] = columnWidths;

  // Escribir el archivo
  XLSX.writeFile(workbook, filename);
  
  // Mostrar notificación de éxito
  toast.success('Reporte generado exitosamente');
};

/**
 * Convierte minutos a formato de horas legible
 */
function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
}

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
