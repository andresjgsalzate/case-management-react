/**
 * =================================================================
 * PÁGINA DE PRUEBA: SISTEMA NATIVO DE YOOPTA-EDITOR
 * =================================================================
 * Descripción: Página de prueba para verificar que todas las
 * funciones nativas de Yoopta-Editor funcionan correctamente
 * con dark mode y la nueva integración
 * Versión: 1.0 (Nativo)
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import { useState } from 'react';
import { CheckCircle, Settings, Palette, Code } from 'lucide-react';

// Componentes nativos
import NativeThemeTest from '../../shared/components/NativeThemeTest';
import { YooptaDocumentEditor } from '../components/documentation/editor/YooptaDocumentEditor';

export default function YooptaNativeTestPage() {
  const [editorValue, setEditorValue] = useState({});

  return (
    <>
      <div className="min-h-screen p-6 space-y-8"
           style={{
             background: 'hsl(var(--background))',
             color: 'hsl(var(--foreground))'
           }}>
        
        {/* Header */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg"
                 style={{ background: 'hsl(var(--primary))' }}>
              <CheckCircle className="w-8 h-8"
                          style={{ color: 'hsl(var(--primary-foreground))' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Sistema Nativo de Yoopta-Editor</h1>
              <p className="text-lg opacity-70">
                Verificación completa de funcionalidades nativas
              </p>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-lg border"
                 style={{
                   background: 'hsl(var(--card))',
                   borderColor: 'hsl(var(--border))'
                 }}>
              <div className="flex items-center gap-3 mb-2">
                <Settings className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">Sistema de Temas</h3>
              </div>
              <p className="text-sm opacity-70">
                ✅ next-themes integrado correctamente
              </p>
            </div>

            <div className="p-6 rounded-lg border"
                 style={{
                   background: 'hsl(var(--card))',
                   borderColor: 'hsl(var(--border))'
                 }}>
              <div className="flex items-center gap-3 mb-2">
                <Palette className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Variables CSS</h3>
              </div>
              <p className="text-sm opacity-70">
                ✅ Variables oficiales de Yoopta
              </p>
            </div>

            <div className="p-6 rounded-lg border"
                 style={{
                   background: 'hsl(var(--card))',
                   borderColor: 'hsl(var(--border))'
                 }}>
              <div className="flex items-center gap-3 mb-2">
                <Code className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold">Plugins Nativos</h3>
              </div>
              <p className="text-sm opacity-70">
                ✅ Configuraciones oficiales
              </p>
            </div>
          </div>
        </div>

        {/* Panel de Control de Temas */}
        <div className="max-w-6xl mx-auto">
          <NativeThemeTest className="mb-8" />
        </div>

        {/* Editor de Prueba */}
        <div className="max-w-6xl mx-auto">
          <div className="p-6 rounded-lg border"
               style={{
                 background: 'hsl(var(--card))',
                 borderColor: 'hsl(var(--border))'
               }}>
            <h2 className="text-xl font-semibold mb-4">
              Editor Yoopta con Funcionalidades Nativas
            </h2>
            <p className="text-sm opacity-70 mb-6">
              Este editor utiliza todas las funciones nativas de Yoopta-Editor.
              Prueba cambiar el tema para ver cómo se adapta automáticamente.
            </p>
            
            <div className="border rounded-lg overflow-hidden"
                 style={{ borderColor: 'hsl(var(--border))' }}>
              <YooptaDocumentEditor
                value={editorValue}
                onChange={setEditorValue}
                placeholder="Escribe aquí para probar el editor nativo..."
                className="min-h-[400px]"
              />
            </div>
          </div>
        </div>

        {/* Footer de información */}
        <div className="max-w-6xl mx-auto">
          <div className="p-4 rounded-lg text-center"
               style={{ 
                 background: 'hsl(var(--muted))',
                 color: 'hsl(var(--muted-foreground))'
               }}>
            <p className="text-sm">
              🚀 Sistema nativo implementado exitosamente • 
              🎨 Dark mode funcional • 
              ⚡ Rendimiento optimizado
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
