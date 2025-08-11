/**
 * Script de prueba para el syntax highlighting en PDF
 */

import { processCodeWithSyntaxHighlighting } from '../shared/services/pdfExportService';

// Código de ejemplo para probar
const testCode = `
function calculateSum(a, b) {
  // Esta es una función simple de suma
  const result = a + b;
  console.log(\`El resultado es: \${result}\`);
  return result;
}

// Ejemplo de uso
const num1 = 10;
const num2 = 20;
const total = calculateSum(num1, num2);
`;

const testPythonCode = `
def fibonacci(n):
    """
    Calcula la secuencia de Fibonacci hasta n
    """
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# Ejemplo de uso
for i in range(10):
    print(f"fibonacci({i}) = {fibonacci(i)}")
`;

// Función de prueba
export const testSyntaxHighlighting = async () => {
  console.log('🧪 [TEST] Iniciando pruebas de syntax highlighting...');
  
  try {
    console.log('📝 [TEST] Probando JavaScript...');
    const jsTokens = await processCodeWithSyntaxHighlighting(testCode, 'javascript');
    console.log('✅ [TEST] JavaScript procesado:', jsTokens.length, 'tokens');
    console.log('🎨 [TEST] Primeros 3 tokens:', jsTokens.slice(0, 3));
    
    console.log('📝 [TEST] Probando Python...');
    const pyTokens = await processCodeWithSyntaxHighlighting(testPythonCode, 'python');
    console.log('✅ [TEST] Python procesado:', pyTokens.length, 'tokens');
    console.log('🎨 [TEST] Primeros 3 tokens:', pyTokens.slice(0, 3));
    
    console.log('🎉 [TEST] Todas las pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ [TEST] Error en las pruebas:', error);
  }
};

// Ejecutar si es llamado directamente
if (typeof window !== 'undefined') {
  (window as any).testSyntaxHighlighting = testSyntaxHighlighting;
  console.log('🔧 [TEST] Función testSyntaxHighlighting disponible globalmente');
}
