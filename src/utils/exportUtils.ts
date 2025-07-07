import * as XLSX from 'xlsx';
import { Case } from '@/types';

type NotificationFn = (message: string) => void;

/**
 * Exporta una lista de casos a un archivo Excel
 */
export const exportCasesToExcel = (
  cases: Case[], 
  filename: string = 'casos.xlsx',
  onSuccess?: NotificationFn
) => {
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

  // Escribir el archivo
  XLSX.writeFile(workbook, filename);
  
  // Mostrar notificación de éxito
  if (onSuccess) {
    onSuccess('Casos exportados a Excel');
  }
};

/**
 * Exporta una lista de casos a un archivo CSV
 */
export const exportCasesToCSV = (
  cases: Case[], 
  filename: string = 'casos.csv',
  onSuccess?: NotificationFn
) => {
  const csvData = cases.map(caso => ({
    numeroCaso: caso.numeroCaso,
    descripcion: caso.descripcion,
    fecha: new Date(caso.fecha).toLocaleDateString('es-ES'),
    origen: caso.origen?.nombre || 'No especificado',
    aplicacion: caso.aplicacion?.nombre || 'No especificado',
    historialCaso: getHistorialCasoText(caso.historialCaso),
    conocimientoModulo: getConocimientoModuloText(caso.conocimientoModulo),
    manipulacionDatos: getManipulacionDatosText(caso.manipulacionDatos),
    claridadDescripcion: getClaridadDescripcionText(caso.claridadDescripcion),
    causaFallo: getCausaFalloText(caso.causaFallo),
    puntuacion: caso.puntuacion,
    clasificacion: caso.clasificacion,
    fechaCreacion: new Date(caso.createdAt).toLocaleDateString('es-ES'),
  }));

  // Convertir a CSV
  const header = Object.keys(csvData[0] || {}).join(',');
  const rows = csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','));
  const csv = [header, ...rows].join('\\n');

  // Crear y descargar el archivo
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  if (onSuccess) {
    onSuccess('Casos exportados a CSV');
  }
};

/**
 * Genera un reporte de control de casos en Excel
 */
export const exportCaseControlReport = (
  caseControls: any[],
  timeEntries: any[],
  manualTimeEntries: any[],
  filename: string = 'reporte-control-casos.xlsx',
  onSuccess?: NotificationFn
) => {
  console.log('📊 Generando reporte de control de casos...');

  // Crear un mapa para agrupar por caso y día
  const reportData: { [key: string]: any } = {};

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

  // Procesar time entries
  timeEntries.forEach(entry => {
    const caseControl = caseControls.find(cc => cc.id === entry.case_control_id);
    if (!caseControl) return;

    const date = entry.start_time ? new Date(entry.start_time).toISOString().split('T')[0] : 'Sin fecha';
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

  // Calcular tiempo total y convertir a formato Excel
  const excelData = Object.values(reportData).map((entry: any) => {
    entry.tiempoTotal = entry.tiempoTimer + entry.tiempoManual;
    
    return {
      'Número de Caso': entry.numeroCaso,
      'Descripción del Caso': entry.descripcionCaso,
      'Fecha': entry.fecha,
      'Tiempo Timer (Horas)': Math.floor(entry.tiempoTimer / 60) + (entry.tiempoTimer % 60) / 60,
      'Tiempo Manual (Horas)': Math.floor(entry.tiempoManual / 60) + (entry.tiempoManual % 60) / 60,
      'Tiempo Total (Horas)': Math.floor(entry.tiempoTotal / 60) + (entry.tiempoTotal % 60) / 60,
      'Tiempo Timer (Minutos)': entry.tiempoTimer,
      'Tiempo Manual (Minutos)': entry.tiempoManual,
      'Tiempo Total (Minutos)': entry.tiempoTotal,
      'Estado': entry.estado,
      'Usuario Asignado': entry.usuarioAsignado,
      'Aplicación': entry.aplicacion,
      'Fecha de Asignación': entry.fechaAsignacion
    };
  });

  // Ordenar por número de caso y fecha
  excelData.sort((a, b) => {
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
  if (onSuccess) {
    onSuccess('Reporte generado exitosamente');
  }
};

/**
 * Genera un reporte de control de TODOs en Excel
 */
export const exportTodoControlReport = (
  todoControls: any[],
  timeEntries: any[],
  manualTimeEntries: any[],
  filename: string = 'reporte-control-todos.xlsx',
  onSuccess?: NotificationFn
) => {
  console.log('📊 Generando reporte de control de TODOs...');

  // Crear un mapa para agrupar por TODO y día
  const reportData: { [key: string]: any } = {};

  // Función helper para crear entradas del reporte
  function createReportEntry(todoControl: any, date: string) {
    // Extraer datos de manera más robusta
    const todoData = todoControl.todo || {};
    const userData = todoControl.user || {};
    const statusData = todoControl.status || {};
    const priorityData = todoData.priority || {};
    
    // Intentar obtener el título del TODO de diferentes maneras
    const tituloTodo = todoData.title || 
                      todoControl.todo_title || 
                      todoControl.todoId || 
                      'N/A';
    
    // Intentar obtener la descripción de diferentes maneras
    const descripcionTodo = todoData.description || 
                           todoControl.todo_description || 
                           'Sin descripción';
    
    // Intentar obtener el nombre del usuario de diferentes maneras
    const usuarioAsignado = userData.fullName || 
                           userData.full_name || 
                           userData.name || 
                           todoControl.assigned_user_name || 
                           todoControl.user_name ||
                           'N/A';
    
    // Intentar obtener el estado de diferentes maneras
    const estado = statusData.name || 
                   todoControl.status_name || 
                   'N/A';
    
    // Intentar obtener la prioridad de diferentes maneras
    const prioridad = priorityData.name || 
                     todoControl.priority_name || 
                     'N/A';

    // Obtener nivel de prioridad
    const nivelPrioridad = priorityData.level || 
                          todoControl.priority_level || 
                          0;
    
    // Obtener tiempo estimado
    const tiempoEstimado = todoData.estimatedMinutes || 
                          todoControl.estimated_minutes || 
                          0;

    // Obtener fecha de vencimiento
    const fechaVencimiento = todoData.dueDate || 
                            todoControl.due_date || 
                            'N/A';

    // Obtener etiquetas
    const etiquetas = (todoData.tags || todoControl.tags || []).join(', ') || 'Sin etiquetas';
    
    return {
      tituloTodo,
      descripcionTodo,
      fecha: date,
      tiempoTimer: 0,
      tiempoManual: 0,
      tiempoTotal: 0,
      tiempoEstimado,
      estado,
      prioridad,
      nivelPrioridad,
      usuarioAsignado,
      fechaVencimiento: fechaVencimiento !== 'N/A' ? new Date(fechaVencimiento).toLocaleDateString('es-ES') : 'N/A',
      fechaAsignacion: todoControl.assigned_at ? new Date(todoControl.assigned_at).toLocaleDateString('es-ES') : 'N/A',
      fechaInicio: todoControl.started_at ? new Date(todoControl.started_at).toLocaleDateString('es-ES') : 'N/A',
      fechaComplecion: todoControl.completed_at ? new Date(todoControl.completed_at).toLocaleDateString('es-ES') : 'N/A',
      etiquetas
    };
  }

  // Procesar time entries
  timeEntries.forEach(entry => {
    const todoControl = todoControls.find(tc => tc.id === entry.todoControlId || tc.id === entry.todo_control_id);
    if (!todoControl) return;

    const date = entry.startTime || entry.start_time ? 
                 new Date(entry.startTime || entry.start_time).toISOString().split('T')[0] : 
                 'Sin fecha';
    const key = `${todoControl.todo?.title || todoControl.todoId || 'N/A'}-${date}`;

    if (!reportData[key]) {
      reportData[key] = createReportEntry(todoControl, date);
    }

    reportData[key].tiempoTimer += entry.durationMinutes || entry.duration_minutes || 0;
  });

  // Procesar manual time entries
  manualTimeEntries.forEach(entry => {
    const todoControl = todoControls.find(tc => tc.id === entry.todoControlId || tc.id === entry.todo_control_id);
    if (!todoControl) return;

    const date = entry.date;
    const key = `${todoControl.todo?.title || todoControl.todoId || 'N/A'}-${date}`;

    if (!reportData[key]) {
      reportData[key] = createReportEntry(todoControl, date);
    }

    reportData[key].tiempoManual += entry.durationMinutes || entry.duration_minutes || 0;
  });

  // Si no hay datos de tiempo, crear entradas para todos los todo controls
  if (Object.keys(reportData).length === 0 && todoControls.length > 0) {
    console.log('ℹ️ No hay datos de tiempo, creando entradas para todo controls existentes');
    todoControls.forEach(todoControl => {
      const today = new Date().toISOString().split('T')[0];
      const key = `${todoControl.todo?.title || 'NO-DATA'}-${today}`;
      reportData[key] = createReportEntry(todoControl, today);
    });
  }

  // Calcular tiempo total y convertir a formato Excel
  const excelData = Object.values(reportData).map((entry: any) => {
    entry.tiempoTotal = entry.tiempoTimer + entry.tiempoManual;
    
    // Calcular eficiencia (tiempo real vs estimado)
    const eficiencia = entry.tiempoEstimado > 0 ? 
                      ((entry.tiempoEstimado / entry.tiempoTotal) * 100).toFixed(1) + '%' : 
                      'N/A';

    // Determinar estado de cumplimiento
    const estadoCumplimiento = entry.tiempoTotal === 0 ? 'Sin tiempo registrado' :
                              entry.tiempoEstimado === 0 ? 'Sin estimación' :
                              entry.tiempoTotal <= entry.tiempoEstimado ? 'Dentro del tiempo' :
                              'Excedido';
    
    return {
      'Título TODO': entry.tituloTodo,
      'Descripción': entry.descripcionTodo,
      'Fecha': entry.fecha,
      'Tiempo Timer (Horas)': Math.floor(entry.tiempoTimer / 60) + (entry.tiempoTimer % 60) / 60,
      'Tiempo Manual (Horas)': Math.floor(entry.tiempoManual / 60) + (entry.tiempoManual % 60) / 60,
      'Tiempo Total (Horas)': Math.floor(entry.tiempoTotal / 60) + (entry.tiempoTotal % 60) / 60,
      'Tiempo Estimado (Horas)': Math.floor(entry.tiempoEstimado / 60) + (entry.tiempoEstimado % 60) / 60,
      'Tiempo Timer (Minutos)': entry.tiempoTimer,
      'Tiempo Manual (Minutos)': entry.tiempoManual,
      'Tiempo Total (Minutos)': entry.tiempoTotal,
      'Tiempo Estimado (Minutos)': entry.tiempoEstimado,
      'Eficiencia': eficiencia,
      'Estado de Cumplimiento': estadoCumplimiento,
      'Estado': entry.estado,
      'Prioridad': entry.prioridad,
      'Nivel de Prioridad': entry.nivelPrioridad,
      'Usuario Asignado': entry.usuarioAsignado,
      'Fecha de Vencimiento': entry.fechaVencimiento,
      'Fecha de Asignación': entry.fechaAsignacion,
      'Fecha de Inicio': entry.fechaInicio,
      'Fecha de Completación': entry.fechaComplecion,
      'Etiquetas': entry.etiquetas
    };
  });

  // Ordenar por prioridad (nivel), luego por título del TODO y fecha
  excelData.sort((a, b) => {
    const priorityCompare = b['Nivel de Prioridad'] - a['Nivel de Prioridad']; // Mayor prioridad primero
    if (priorityCompare !== 0) return priorityCompare;
    
    const titleCompare = a['Título TODO'].localeCompare(b['Título TODO']);
    if (titleCompare !== 0) return titleCompare;
    
    return new Date(a['Fecha']).getTime() - new Date(b['Fecha']).getTime();
  });

  console.log('✅ Reporte de TODOs generado exitosamente con', excelData.length, 'filas');

  // Crear el libro de Excel
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  
  // Añadir la hoja al libro
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Control TODOs');

  // Configurar el ancho de las columnas
  const columnWidths = [
    { wch: 25 }, // Título TODO
    { wch: 40 }, // Descripción
    { wch: 12 }, // Fecha
    { wch: 18 }, // Tiempo Timer (Horas)
    { wch: 18 }, // Tiempo Manual (Horas)
    { wch: 18 }, // Tiempo Total (Horas)
    { wch: 18 }, // Tiempo Estimado (Horas)
    { wch: 18 }, // Tiempo Timer (Minutos)
    { wch: 18 }, // Tiempo Manual (Minutos)
    { wch: 18 }, // Tiempo Total (Minutos)
    { wch: 20 }, // Tiempo Estimado (Minutos)
    { wch: 12 }, // Eficiencia
    { wch: 20 }, // Estado de Cumplimiento
    { wch: 15 }, // Estado
    { wch: 15 }, // Prioridad
    { wch: 12 }, // Nivel de Prioridad
    { wch: 20 }, // Usuario Asignado
    { wch: 18 }, // Fecha de Vencimiento
    { wch: 18 }, // Fecha de Asignación
    { wch: 18 }, // Fecha de Inicio
    { wch: 18 }, // Fecha de Completación
    { wch: 30 }, // Etiquetas
  ];
  
  worksheet['!cols'] = columnWidths;

  // Escribir el archivo
  XLSX.writeFile(workbook, filename);
  
  // Mostrar notificación de éxito
  if (onSuccess) {
    onSuccess('Reporte de TODOs generado exitosamente');
  }
};

/**
 * Funciones auxiliares para formatear los valores de los casos
 */
function getHistorialCasoText(value: number): string {
  const options = ['Nuevo caso', 'Caso recurrente conocido', 'Caso recurrente - nueva manifestación'];
  return options[value] || 'N/A';
}

function getConocimientoModuloText(value: number): string {
  const options = ['Sin conocimiento', 'Conocimiento básico', 'Conocimiento avanzado'];
  return options[value] || 'N/A';
}

function getManipulacionDatosText(value: number): string {
  const options = ['Sin manipulación', 'Manipulación básica', 'Manipulación compleja'];
  return options[value] || 'N/A';
}

function getClaridadDescripcionText(value: number): string {
  const options = ['Muy confusa', 'Poco clara', 'Clara', 'Muy clara'];
  return options[value] || 'N/A';
}

function getCausaFalloText(value: number): string {
  const options = ['Error de usuario', 'Error del sistema', 'Funcionalidad faltante', 'Error de datos', 'Error de configuración'];
  return options[value] || 'N/A';
}
