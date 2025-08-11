/**
 * Script de prueba para verificar el funcionamiento de tags en documentos
 */

// Simular datos de prueba
const testDocumentWithTags = {
  title: "Documento de Prueba - Tags",
  content: [
    {
      id: "test-1",
      type: "paragraph",
      props: {
        textColor: "default",
        textAlignment: "left",
        backgroundColor: "default"
      },
      content: [
        {
          text: "Este es un documento de prueba para verificar que los tags se guardan correctamente.",
          type: "text",
          styles: {}
        }
      ],
      children: []
    }
  ],
  category: "TEST",
  difficultyLevel: 2,
  isTemplate: false,
  isPublished: false,
  tags: [] // Se llenará con IDs de tags existentes
};

// Función para probar el flujo completo
async function testTagsFlow() {
  console.log('🧪 [TEST] Iniciando prueba de flujo de tags');
  
  try {
    // 1. Verificar que existen tags en la base de datos
    console.log('📋 [TEST] Verificando tags existentes...');
    
    // 2. Crear documento con tags
    console.log('📝 [TEST] Creando documento con tags...');
    
    // 3. Verificar que los tags se guardaron correctamente
    console.log('🔍 [TEST] Verificando tags guardados...');
    
    // 4. Actualizar documento con diferentes tags
    console.log('🔄 [TEST] Actualizando tags del documento...');
    
    // 5. Verificar actualización
    console.log('✅ [TEST] Verificando actualización de tags...');
    
  } catch (error) {
    console.error('❌ [TEST] Error en prueba:', error);
  }
}

// Función para debuggear el estado actual
async function debugCurrentState() {
  console.log('🐛 [DEBUG] Verificando estado actual del sistema');
  
  // Verificar documento específico
  const documentId = "1f128b3b-4017-48b3-a705-47da5025305a";
  console.log(`🔍 [DEBUG] Verificando documento: ${documentId}`);
  
  // Aquí puedes agregar llamadas específicas para debuggear
}

console.log('📋 Script de prueba de tags cargado. Usa:');
console.log('- testTagsFlow() para prueba completa');
console.log('- debugCurrentState() para debug del estado actual');

export { testDocumentWithTags, testTagsFlow, debugCurrentState };
