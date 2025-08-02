/**
 * =================================================================
 * HOOK NATIVO DE YOOPTA-EDITOR PARA MANEJO DE TEMAS
 * =================================================================
 * Descripción: Hook personalizado que utiliza next-themes para
 * integración nativa con Yoopta-Editor y funcionalidad completa
 * de dark mode usando las características oficiales del editor
 * Versión: 1.0 (Nativo)
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export interface NativeThemeState {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  resolvedTheme: string | undefined;
  themes: string[];
  systemTheme: string | undefined;
  forcedTheme: string | undefined;
  isLoading: boolean;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
}

/**
 * Hook nativo para manejo de temas con Yoopta-Editor
 * Utiliza next-themes para compatibilidad total con el sistema nativo
 */
export function useNativeTheme(): NativeThemeState {
  const {
    theme,
    setTheme,
    resolvedTheme,
    themes,
    systemTheme,
    forcedTheme
  } = useNextTheme();

  const [isLoading, setIsLoading] = useState(true);

  // Función para alternar entre temas
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      // Si está en system, cambiar a light
      setTheme('light');
    }
  };

  // Estados derivados
  const isDark = resolvedTheme === 'dark';
  const isLight = resolvedTheme === 'light';
  const isSystem = theme === 'system';

  // Efecto para manejar el estado de carga
  useEffect(() => {
    if (resolvedTheme !== undefined) {
      setIsLoading(false);
    }
  }, [resolvedTheme]);

  // Efecto para aplicar el atributo data-theme al documento
  useEffect(() => {
    if (resolvedTheme && typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', resolvedTheme);
    }
  }, [resolvedTheme]);

  return {
    theme,
    setTheme,
    resolvedTheme,
    themes,
    systemTheme,
    forcedTheme,
    isLoading,
    toggleTheme,
    isDark,
    isLight,
    isSystem
  };
}

/**
 * Hook simplificado para obtener solo el estado del tema
 */
export function useNativeThemeState() {
  const { isDark, isLight, isSystem, resolvedTheme, isLoading } = useNativeTheme();
  
  return {
    isDark,
    isLight,
    isSystem,
    currentTheme: resolvedTheme,
    isLoading
  };
}

/**
 * Hook para obtener solo las acciones del tema
 */
export function useNativeThemeActions() {
  const { setTheme, toggleTheme } = useNativeTheme();
  
  return {
    setTheme,
    toggleTheme,
    setLight: () => setTheme('light'),
    setDark: () => setTheme('dark'),
    setSystem: () => setTheme('system')
  };
}
