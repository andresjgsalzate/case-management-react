/**
 * =================================================================
 * PÁGINA DE PRUEBA PARA MODOS BLOCKNOTE
 * =================================================================
 * Descripción: Prueba exhaustiva de los modos edit/view de BlockNote
 * Versión: 1.0
 * Fecha: 11 de Agosto, 2025
 * =================================================================
 */

import { useState } from 'react';
import { BlockNoteDocumentEditor, createEmptyBlockNoteContent } from './BlockNoteDocumentEditor';
import { PartialBlock } from '@blocknote/core';
import { Button, Paper, Stack, Text, Group, Badge, Divider } from '@mantine/core';

const TestBlockNoteModes = () => {
  // ===== ESTADO INICIAL =====
  const [content, setContent] = useState<PartialBlock[]>([
    {
      type: "heading",
      props: { level: 1 },
      content: "🧪 Prueba de Modos BlockNote"
    },
    {
      type: "paragraph",
      content: "Esta es una prueba completa para verificar el funcionamiento de los modos de edición y vista."
    },
    {
      type: "codeBlock",
      props: { language: "typescript" },
      content: `// Ejemplo de código TypeScript
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

const createUser = (userData: Partial<User>): User => {
  return {
    id: generateId(),
    ...userData,
    createdAt: new Date()
  } as User;
};

// Función con syntax highlighting
const processData = async (data: any[]) => {
  const results = [];
  
  for (const item of data) {
    try {
      const processed = await processItem(item);
      results.push(processed);
    } catch (error) {
      console.error('Error processing item:', error);
    }
  }
  
  return results;
};`
    },
    {
      type: "paragraph",
      content: "Arriba debería verse un bloque de código con:"
    },
    {
      type: "bulletListItem",
      content: "✅ Syntax highlighting de TypeScript"
    },
    {
      type: "bulletListItem", 
      content: "✅ Selector de lenguaje visible en modo EDICIÓN"
    },
    {
      type: "bulletListItem",
      content: "✅ Indicador de lenguaje en modo VISTA"
    },
    {
      type: "bulletListItem",
      content: "✅ Sin controles de edición en modo VISTA"
    },
    {
      type: "codeBlock",
      props: { language: "python" },
      content: `# Ejemplo de código Python
def fibonacci_sequence(n):
    """
    Genera los primeros n números de la secuencia de Fibonacci
    """
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    sequence = [0, 1]
    for i in range(2, n):
        next_fib = sequence[i-1] + sequence[i-2]
        sequence.append(next_fib)
    
    return sequence

# Prueba de la función
if __name__ == "__main__":
    print("Primeros 10 números de Fibonacci:")
    result = fibonacci_sequence(10)
    print(result)`
    },
    {
      type: "codeBlock",
      props: { language: "sql" },
      content: `-- Ejemplo de código SQL
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(o.id) as total_orders,
    SUM(o.total_amount) as total_spent,
    AVG(o.total_amount) as avg_order_value
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
    AND u.status = 'active'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 5
ORDER BY total_spent DESC
LIMIT 100;`
    }
  ]);

  const [isReadOnly, setIsReadOnly] = useState(false);

  // ===== HANDLERS =====
  const handleContentChange = (newContent: PartialBlock[]) => {
    setContent(newContent);
    console.log('📝 Contenido actualizado:', newContent);
  };

  const toggleMode = () => {
    setIsReadOnly(!isReadOnly);
  };

  const resetContent = () => {
    setContent(createEmptyBlockNoteContent());
  };

  // ===== RENDER =====
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Stack gap="lg">
        {/* ===== HEADER ===== */}
        <Paper p="md" withBorder>
          <Group justify="space-between" align="center">
            <div>
              <Text size="xl" fw={700}>🧪 Prueba de Modos BlockNote</Text>
              <Text size="sm" c="dimmed">
                Verifica el funcionamiento del syntax highlighting y controles en ambos modos
              </Text>
            </div>
            <Group>
              <Badge 
                color={isReadOnly ? "blue" : "green"} 
                size="lg"
                variant="light"
              >
                {isReadOnly ? "📖 MODO VISTA" : "✏️ MODO EDICIÓN"}
              </Badge>
              <Button onClick={toggleMode} variant="filled">
                Cambiar a {isReadOnly ? "Edición" : "Vista"}
              </Button>
              <Button onClick={resetContent} variant="outline" color="gray">
                Reset
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* ===== CHECKLIST ===== */}
        <Paper p="md" withBorder>
          <Text fw={600} mb="sm">✅ Checklist de Verificación:</Text>
          <Stack gap="xs">
            <Text size="sm">• En modo EDICIÓN: El selector de lenguaje debe ser visible y funcional</Text>
            <Text size="sm">• En modo VISTA: No debe haber controles de edición visibles</Text>
            <Text size="sm">• En ambos modos: El syntax highlighting debe funcionar correctamente</Text>
            <Text size="sm">• En modo VISTA: Debe mostrar un indicador del lenguaje seleccionado</Text>
            <Text size="sm">• Los dropdowns deben ser visibles cuando se despliegan</Text>
          </Stack>
        </Paper>

        <Divider />

        {/* ===== EDITOR ===== */}
        <Paper p="md" withBorder style={{ minHeight: '600px' }}>
          <Text fw={600} mb="md">
            {isReadOnly ? "📖 Vista de Solo Lectura" : "✏️ Editor Interactivo"}
          </Text>
          
          <BlockNoteDocumentEditor
            value={content}
            onChange={handleContentChange}
            readOnly={isReadOnly}
            documentId="test-document"
            className="test-editor"
          />
        </Paper>

        {/* ===== DEBUG INFO ===== */}
        <Paper p="md" withBorder style={{ backgroundColor: '#f8fafc' }}>
          <Text fw={600} mb="sm">🔍 Información de Debug:</Text>
          <Text size="sm" style={{ fontFamily: 'monospace' }}>
            Modo: {isReadOnly ? 'ReadOnly' : 'Editable'} | 
            Bloques: {content.length} | 
            Última actualización: {new Date().toLocaleTimeString()}
          </Text>
        </Paper>
      </Stack>
    </div>
  );
};

export default TestBlockNoteModes;
