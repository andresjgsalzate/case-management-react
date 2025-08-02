/**
 * =================================================================
 * COMPONENTE DEBUG: VERIFICADOR DE VARIABLES CSS NATIVAS
 * =================================================================
 * Descripción: Componente para verificar que las variables CSS
 * se estén aplicando correctamente en el modo oscuro
 * Versión: 1.0 (Debug)
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React from 'react';
import { useNativeTheme } from '../hooks/useNativeTheme';

export const CSSVariablesDebug: React.FC = () => {
  const { isDark, isLight, resolvedTheme } = useNativeTheme();

  return (
    <div className="fixed top-4 right-4 p-4 border rounded-lg z-50 max-w-sm"
         style={{
           background: 'hsl(var(--card))',
           borderColor: 'hsl(var(--border))',
           color: 'hsl(var(--card-foreground))',
           fontSize: '12px'
         }}>
      <h4 className="font-bold mb-2">🔍 CSS Variables Debug</h4>
      
      <div className="space-y-1">
        <div><strong>Theme:</strong> {resolvedTheme}</div>
        <div><strong>Is Dark:</strong> {isDark ? 'Yes' : 'No'}</div>
        <div><strong>Is Light:</strong> {isLight ? 'Yes' : 'No'}</div>
        <div><strong>data-theme:</strong> {document.documentElement.getAttribute('data-theme')}</div>
      </div>

      <div className="mt-3 space-y-1">
        <div style={{ background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', padding: '4px' }}>
          --background: var(--background)
        </div>
        <div style={{ background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', padding: '4px' }}>
          --card: var(--card)
        </div>
        <div style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', padding: '4px' }}>
          --muted: var(--muted)
        </div>
      </div>

      <div className="mt-3">
        <div className="yoopta-editor" style={{ 
          minHeight: '50px', 
          padding: '8px',
          border: '1px solid hsl(var(--border))',
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))'
        }}>
          <div style={{
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            outline: 'none',
            padding: '4px'
          }}>
            Test: Editor area background (non-editable)
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSSVariablesDebug;
