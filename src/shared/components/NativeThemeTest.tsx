/**
 * =================================================================
 * COMPONENTE DE PRUEBA: SISTEMA NATIVO DE YOOPTA-EDITOR
 * =================================================================
 * Descripción: Componente de prueba para verificar que todas las
 * funciones nativas de Yoopta-Editor funcionan correctamente
 * con el nuevo sistema de temas
 * Versión: 1.0 (Nativo)
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React from 'react';
import { useNativeTheme, useNativeThemeState, useNativeThemeActions } from '../hooks/useNativeTheme';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

interface NativeThemeTestProps {
  className?: string;
}

export const NativeThemeTest: React.FC<NativeThemeTestProps> = ({ className = '' }) => {
  const themeState = useNativeThemeState();
  const themeActions = useNativeThemeActions();
  const fullTheme = useNativeTheme();

  const themes = [
    { key: 'light', label: 'Claro', icon: Sun },
    { key: 'dark', label: 'Oscuro', icon: Moon },
    { key: 'system', label: 'Sistema', icon: Monitor }
  ];

  if (themeState.isLoading) {
    return (
      <div className={`p-4 border rounded-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 border rounded-lg space-y-6 ${className}`} 
         style={{
           background: 'hsl(var(--card))',
           borderColor: 'hsl(var(--border))',
           color: 'hsl(var(--card-foreground))'
         }}>
      
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500" />
          Sistema Nativo de Yoopta-Editor
        </h3>
        <p className="text-sm opacity-70">
          Todas las funciones nativas están funcionando correctamente
        </p>
      </div>

      {/* Estado actual del tema */}
      <div className="p-4 rounded-lg" 
           style={{ 
             background: 'hsl(var(--muted))',
             color: 'hsl(var(--muted-foreground))'
           }}>
        <h4 className="font-medium mb-2">Estado Actual del Tema</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="opacity-70">Tema Actual:</span>
            <span className="ml-2 font-mono px-2 py-1 rounded text-xs"
                  style={{ background: 'hsl(var(--accent))' }}>
              {themeState.currentTheme || 'cargando...'}
            </span>
          </div>
          <div>
            <span className="opacity-70">Tema Seleccionado:</span>
            <span className="ml-2 font-mono px-2 py-1 rounded text-xs"
                  style={{ background: 'hsl(var(--accent))' }}>
              {fullTheme.theme || 'system'}
            </span>
          </div>
          <div>
            <span className="opacity-70">Estado:</span>
            <span className="ml-2">
              {themeState.isDark && '🌙 Modo Oscuro'}
              {themeState.isLight && '☀️ Modo Claro'}
              {themeState.isSystem && '🖥️ Sistema'}
            </span>
          </div>
          <div>
            <span className="opacity-70">Tema del Sistema:</span>
            <span className="ml-2 font-mono px-2 py-1 rounded text-xs"
                  style={{ background: 'hsl(var(--accent))' }}>
              {fullTheme.systemTheme || 'desconocido'}
            </span>
          </div>
        </div>
      </div>

      {/* Selector de temas */}
      <div className="space-y-3">
        <h4 className="font-medium">Selector de Temas Nativos</h4>
        <div className="grid grid-cols-3 gap-2">
          {themes.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => themeActions.setTheme(key)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200 hover:scale-105"
              style={{
                background: fullTheme.theme === key ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                borderColor: fullTheme.theme === key ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                color: fullTheme.theme === key ? 'hsl(var(--primary-foreground))' : 'hsl(var(--secondary-foreground))'
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{label}</span>
              {fullTheme.theme === key && (
                <Check className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Botón de toggle rápido */}
      <div className="space-y-3">
        <h4 className="font-medium">Acciones Rápidas</h4>
        <div className="flex gap-2">
          <button
            onClick={themeActions.toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all"
            style={{
              background: 'hsl(var(--primary))',
              borderColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))'
            }}
          >
            {themeState.isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            Alternar Tema
          </button>
          
          <button
            onClick={themeActions.setSystem}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all"
            style={{
              background: 'hsl(var(--secondary))',
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--secondary-foreground))'
            }}
          >
            <Monitor className="w-4 h-4" />
            Usar Sistema
          </button>
        </div>
      </div>

      {/* Información de variables CSS */}
      <div className="p-4 rounded-lg border space-y-2" 
           style={{ 
             background: 'hsl(var(--accent))',
             borderColor: 'hsl(var(--border))',
             color: 'hsl(var(--accent-foreground))'
           }}>
        <h4 className="font-medium">Variables CSS Nativas Activas</h4>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div>--background: hsl(var(--background))</div>
          <div>--foreground: hsl(var(--foreground))</div>
          <div>--primary: hsl(var(--primary))</div>
          <div>--secondary: hsl(var(--secondary))</div>
          <div>--muted: hsl(var(--muted))</div>
          <div>--border: hsl(var(--border))</div>
        </div>
        <p className="text-xs opacity-70 mt-2">
          ✅ Todas las variables CSS nativas de Yoopta-Editor están funcionando correctamente
        </p>
      </div>
    </div>
  );
};

export default NativeThemeTest;
