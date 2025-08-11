// Script de prueba para verificar el funcionamiento de las etiquetas
// Ejecutar en la consola del navegador

console.log('🧪 Iniciando pruebas de etiquetas...');

// 1. Verificar que los documentos carguen con etiquetas
const testTagsInDocuments = () => {
  console.log('📄 Verificando documentos con etiquetas...');
  
  // Buscar elementos de etiquetas en la interfaz
  const tagElements = document.querySelectorAll('[data-testid*="tag"], .tag, .badge');
  console.log(`Encontrados ${tagElements.length} elementos de etiquetas en la página`);
  
  tagElements.forEach((el, index) => {
    console.log(`Tag ${index + 1}:`, el.textContent.trim());
  });
};

// 2. Verificar datos en localStorage o estado
const testDataInMemory = () => {
  console.log('💾 Verificando datos en memoria...');
  
  // Buscar datos de documentos en el almacenamiento local
  Object.keys(localStorage).forEach(key => {
    if (key.includes('solution') || key.includes('document')) {
      console.log(`Storage key: ${key}`, localStorage.getItem(key));
    }
  });
};

// 3. Simular creación de documento (solo estructura)
const testDocumentStructure = () => {
  console.log('🏗️ Estructura esperada para documentos con etiquetas:');
  
  const expectedStructure = {
    id: 'uuid',
    title: 'Título del documento',
    tags: ['etiqueta1', 'etiqueta2'], // Array de nombres
    case_number: 'CASO-2025-001', // Número del caso
    solution_type: 'Categoría', // Sin duplicados
    // ... otros campos
  };
  
  console.log('Estructura esperada:', expectedStructure);
};

// Ejecutar pruebas
setTimeout(() => {
  testTagsInDocuments();
  testDataInMemory();
  testDocumentStructure();
}, 2000);

console.log('✅ Script de prueba cargado. Las pruebas se ejecutarán en 2 segundos...');
