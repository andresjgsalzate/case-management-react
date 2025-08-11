/**
 * Script de debug para verificar estructura de documentos en PDF
 */

// Función para inspeccionar datos del documento antes de exportar
export const debugDocumentStructure = (document: any) => {
  console.log('🔍 [DEBUG] === ESTRUCTURA COMPLETA DEL DOCUMENTO ===');
  console.log('📄 [DEBUG] Título:', document.title);
  console.log('📅 [DEBUG] Creado por:', document.created_by);
  console.log('📅 [DEBUG] Fecha creación:', document.created_at);
  console.log('📂 [DEBUG] Categoría:', document.category);
  
  console.log('🏷️ [DEBUG] === ETIQUETAS ===');
  console.log('🏷️ [DEBUG] Tags existe:', !!document.tags);
  console.log('🏷️ [DEBUG] Tags tipo:', typeof document.tags);
  console.log('🏷️ [DEBUG] Tags contenido:', document.tags);
  console.log('🏷️ [DEBUG] Es array:', Array.isArray(document.tags));
  if (Array.isArray(document.tags)) {
    console.log('🏷️ [DEBUG] Longitud:', document.tags.length);
    document.tags.forEach((tag: any, index: number) => {
      console.log(`🏷️ [DEBUG] Tag ${index}:`, typeof tag, tag);
    });
  }
  
  console.log('📊 [DEBUG] === CAMPOS ADICIONALES ===');
  console.log('📊 [DEBUG] Dificultad:', document.difficulty_level);
  console.log('📊 [DEBUG] Tipo solución:', document.solution_type);
  console.log('📊 [DEBUG] Tiempo estimado:', document.estimated_solution_time);
  console.log('📊 [DEBUG] Referencia caso:', document.case_reference);
  console.log('📊 [DEBUG] Estado:', document.status);
  console.log('📊 [DEBUG] Prioridad:', document.priority);
  console.log('📊 [DEBUG] Complejidad:', document.complexity);
  console.log('📊 [DEBUG] Tiempo est.:', document.estimated_time);
  
  console.log('🔧 [DEBUG] === TODAS LAS PROPIEDADES ===');
  Object.keys(document).forEach(key => {
    const value = document[key];
    const type = typeof value;
    const isArray = Array.isArray(value);
    const length = isArray ? value.length : (type === 'string' ? value.length : 'N/A');
    
    console.log(`🔧 [DEBUG] ${key}:`, {
      tipo: type,
      esArray: isArray,
      longitud: length,
      valor: value
    });
  });
  
  console.log('🔍 [DEBUG] === FIN ESTRUCTURA ===');
};

// Función para usar en el navegador
if (typeof window !== 'undefined') {
  (window as any).debugDocumentStructure = debugDocumentStructure;
  console.log('🛠️ [DEBUG] Función debugDocumentStructure disponible globalmente');
  console.log('🛠️ [DEBUG] Uso: debugDocumentStructure(tuDocumento)');
}
