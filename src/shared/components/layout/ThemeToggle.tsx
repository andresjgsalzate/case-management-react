/**
 * =================================================================
 * THEME TOGGLE - COMPONENTE NATIVO DE CAMBIO DE TEMA
 * =================================================================
 * Descripción: Toggle de tema usando el sistema nativo de next-themes
 * Compatible con BlockNote-Editor y funcionalidades nativas
 * Versión: 2.0 (Nativo)
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useNativeTheme } from '@/shared/hooks/useNativeTheme';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { isDark, toggleTheme, isLoading } = useNativeTheme();

  // Mostrar loading state si está cargando
  if (isLoading) {
    return (
      <button
        disabled
        className={`p-2 rounded-lg transition-colors duration-200 opacity-50 ${className}`}
        aria-label="Cargando tema..."
      >
        <div className="h-5 w-5 animate-pulse bg-gray-400 rounded"></div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      style={{
        backgroundColor: 'hsl(var(--background) / 0.8)',
        color: 'hsl(var(--foreground))'
      }}
    >
      {isDark ? (
        <SunIcon className="h-5 w-5 text-yellow-500 transition-transform duration-200 hover:scale-110" />
      ) : (
        <MoonIcon className="h-5 w-5 transition-transform duration-200 hover:scale-110" 
                  style={{ color: 'hsl(var(--foreground))' }} />
      )}
    </button>
  );
};
