/**
 * =================================================================
 * PROVEEDOR DE TEMAS NATIVO PARA BLOCKNOTE-EDITOR
 * =================================================================
 * Descripción: Proveedor de temas que usa next-themes para compatibilidad
 * nativa con BlockNote-Editor y mejor rendimiento
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useTheme as useNextTheme } from 'next-themes';

interface CustomThemeProviderProps {
  children: React.ReactNode;
  attribute?: 'class' | 'data-theme';
  defaultTheme?: string;
  enableSystem?: boolean;
  storageKey?: string;
  themes?: string[];
}

export function ThemeProvider({ 
  children, 
  ...props 
}: CustomThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      storageKey="case-management-theme"
      themes={['light', 'dark']}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * Hook personalizado para usar el tema en toda la aplicación
 * Compatible con el sistema anterior de Zustand
 */
export function useTheme() {
  const { theme, setTheme: nextSetTheme, systemTheme } = useNextTheme();
  
  const isDarkMode = React.useMemo(() => {
    if (theme === 'system') {
      return systemTheme === 'dark';
    }
    return theme === 'dark';
  }, [theme, systemTheme]);

  const toggleTheme = React.useCallback(() => {
    nextSetTheme(isDarkMode ? 'light' : 'dark');
  }, [isDarkMode, nextSetTheme]);

  const setTheme = React.useCallback((isDark: boolean) => {
    nextSetTheme(isDark ? 'dark' : 'light');
  }, [nextSetTheme]);

  return {
    theme,
    setTheme: nextSetTheme,
    systemTheme,
    isDarkMode,
    toggleTheme,
    // Para compatibilidad con el API anterior
    setThemeBoolean: setTheme,
  };
}

/**
 * Hook para aplicar efectos del tema (compatible con el anterior)
 */
export function useThemeEffect() {
  const { isDarkMode } = useTheme();
  
  React.useEffect(() => {
    // next-themes maneja automáticamente las clases CSS
    // pero mantenemos esta función para compatibilidad
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  return isDarkMode;
}
