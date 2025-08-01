import { DisposicionScripts, DisposicionMensual } from '@/types';
// Utilidad para formatear fechas tipo 'YYYY-MM-DD' a 'DD/MM/YYYY' sin problemas de zona horaria
function formatFechaString(fecha: string): string {
  if (!fecha) return '';
  const [year, month, day] = fecha.split('-');
  if (!year || !month || !day) return fecha;
  return `${day}/${month}/${year}`;
}

// Función simple para descargar CSV
const downloadCSV = (data: string, filename: string) => {
  // Agregar BOM UTF-8 al inicio para compatibilidad con Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + data], { type: 'text/csv;charset=utf-8;' });
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

// Función para convertir array de datos a CSV
const arrayToCSV = (data: (string | number)[][]): string => {
  return data.map(row => 
    row.map(cell => {
      const cellStr = String(cell || '');
      // Escapar comillas y encerrar en comillas si contiene comas o saltos de línea
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');
};

// Función para exportar disposiciones por mes
export const exportDisposicionScriptsPorMes = async (
  year: number,
  disposicionMensual: DisposicionMensual
) => {
  try {
    // Crear encabezados simplificados
    const headers = [
      'Número de Caso',
      'Aplicación', 
      'Cantidad de Veces'
    ];

    // Preparar datos simplificados usando el resumen ya agrupado
    const data = disposicionMensual.disposiciones.map(d => [
      d.numeroCaso,
      d.aplicacionNombre,
      d.cantidad
    ]);

    // Crear estructura del archivo con información del período
    const resumenData = [
      ['REPORTE DE DISPOSICIONES - RESUMEN MENSUAL'],
      [''],
      ['Período', `${disposicionMensual.monthName} ${year}`],
      ['Total de Disposiciones', disposicionMensual.totalDisposiciones],
      ['Casos Únicos', disposicionMensual.disposiciones.length],
      ['Fecha de Generación', new Date().toLocaleDateString('es-ES')],
      [''],
      headers,
      ...data
    ];

    const csvContent = arrayToCSV(resumenData);
    const fileName = `Resumen_Disposiciones_${disposicionMensual.monthName}_${year}.csv`;
    
    downloadCSV(csvContent, fileName);
    return true;
  } catch (error) {
    console.error('Error al exportar disposiciones:', error);
    throw new Error('Error al generar el archivo de exportación');
  }
};

// Función para exportar todas las disposiciones
export const exportAllDisposicionScripts = async (disposiciones: DisposicionScripts[]) => {
  try {
    const headers = [
      'Fecha',
      'Caso',
      'Descripción del Caso',
      'Nombre del Script',
      'Número de Revisión SVN',
      'Aplicación',
      'Observaciones',
      'Usuario',
      'Fecha de Creación'
    ];

    const data = disposiciones.map(d => [
      formatFechaString(d.fecha),
      d.case ? ('numeroCaso' in d.case ? d.case.numeroCaso : d.case.numero_caso) : d.caseNumber || 'N/A',
      d.case?.descripcion || 'N/A',
      d.nombreScript,
      d.numeroRevisionSvn || '',
      d.aplicacion?.nombre || 'N/A',
      d.observaciones || '',
      d.user?.fullName || d.user?.email || 'N/A',
      formatFechaString(d.createdAt)
    ]);

    const csvData = [headers, ...data];
    const csvContent = arrayToCSV(csvData);
    const fileName = `Todas_las_Disposiciones_Scripts_${new Date().toISOString().split('T')[0]}.csv`;
    
    downloadCSV(csvContent, fileName);
    return true;
  } catch (error) {
    console.error('Error al exportar todas las disposiciones:', error);
    throw new Error('Error al generar el archivo de exportación');
  }
};
