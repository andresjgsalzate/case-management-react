/**
 * =================================================================
 * COMPONENTE: VALIDADOR DE CASOS
 * =================================================================
 * Descripción: Componente para buscar y validar referencias a casos
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Check, X, AlertCircle } from 'lucide-react';
import { useDocumentation } from '../../hooks/useDocumentation';
import type { CaseReferenceType } from '../../types';

interface CaseValidatorProps {
  selectedCaseId?: string;
  selectedArchivedCaseId?: string;
  caseReferenceType: CaseReferenceType;
  onCaseChange: (referenceType: CaseReferenceType, caseId?: string, archivedCaseId?: string) => void;
  className?: string;
}

export const CaseValidator: React.FC<CaseValidatorProps> = ({
  selectedCaseId,
  selectedArchivedCaseId,
  caseReferenceType,
  onCaseChange,
  className = '',
}) => {
  const { validateCase, searchCases } = useDocumentation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  
  // Estados para autocompletado
  const [suggestions, setSuggestions] = useState<Array<{
    id: string;
    numero_caso: string;
    descripcion: string;
    classification?: string;
    type: 'active' | 'archived';
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Función para buscar sugerencias con debounce
  const searchSuggestions = useCallback(async (term: string) => {
    if (!term.trim() || term.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchCases(term, 'both', 8);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Error searching cases:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  }, [searchCases]);

  // Debounce para la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchSuggestions(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchSuggestions]);

  // Función para seleccionar una sugerencia
  const selectSuggestion = useCallback((suggestion: typeof suggestions[0]) => {
    setSearchTerm(suggestion.numero_caso);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    // Auto-validar el caso seleccionado
    setValidationResult({
      is_valid: true,
      case_exists: true,
      case_type: suggestion.type,
      case_data: {
        id: suggestion.id,
        numero_caso: suggestion.numero_caso,
        descripcion: suggestion.descripcion,
        classification: suggestion.classification,
      },
    });

    // Llamar al callback con el caso seleccionado
    if (suggestion.type === 'active') {
      onCaseChange('active', suggestion.id, undefined);
    } else {
      onCaseChange('archived', undefined, suggestion.id);
    }
  }, [onCaseChange]);

  // Manejar navegación con teclado
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearchCase();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectSuggestion(suggestions[selectedIndex]);
        } else {
          handleSearchCase();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, selectSuggestion]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchCase = useCallback(async () => {
    if (!searchTerm.trim()) return;

    setIsValidating(true);
    setValidationResult(null);
    setShowSuggestions(false);

    try {
      // Intentar buscar en casos activos primero
      const activeResult = await validateCase(searchTerm.trim(), 'active');
      
      if (activeResult.is_valid) {
        setValidationResult(activeResult);
        // Enviar el ID del caso, no el número de caso
        onCaseChange('active', activeResult.case_data?.id, undefined);
      } else {
        // Si no se encuentra en activos, buscar en archivados
        const archivedResult = await validateCase(searchTerm.trim(), 'archived');
        
        if (archivedResult.is_valid) {
          setValidationResult(archivedResult);
          // Enviar el ID del caso archivado, no el número de caso
          onCaseChange('archived', undefined, archivedResult.case_data?.id);
        } else {
          setValidationResult({
            is_valid: false,
            case_exists: false,
            case_type: null,
            error_message: 'No se encontró el caso en casos activos ni archivados',
          });
        }
      }
    } catch (error) {
      setValidationResult({
        is_valid: false,
        case_exists: false,
        case_type: null,
        error_message: 'Error al buscar el caso',
      });
    } finally {
      setIsValidating(false);
    }
  }, [searchTerm, validateCase, onCaseChange]);

  const handleClearCase = () => {
    setSearchTerm('');
    setValidationResult(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onCaseChange('active', undefined, undefined);
  };

  useEffect(() => {
    if (selectedCaseId) {
      setSearchTerm(selectedCaseId);
    } else if (selectedArchivedCaseId) {
      setSearchTerm(selectedArchivedCaseId);
    }
  }, [selectedCaseId, selectedArchivedCaseId]);

  const StatusIcon = () => {
    if (isValidating) {
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
    }
    
    if (validationResult?.is_valid) {
      return <Check className="h-4 w-4 text-green-600" />;
    }
    
    if (validationResult && !validationResult.is_valid) {
      return <X className="h-4 w-4 text-red-600" />;
    }
    
    return <Search className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className={className}>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Caso Relacionado (opcional)
          </label>
          
          <div className="flex gap-2">
            <div className="flex-1 relative" ref={dropdownRef}>
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="Número de caso (ej: C001, C002)"
                className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                autoComplete="off"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <StatusIcon />
                )}
              </div>

              {/* Dropdown de sugerencias */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.id}
                      className={`px-3 py-2 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                        index === selectedIndex
                          ? 'bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {suggestion.numero_caso}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {suggestion.descripcion}
                          </div>
                          {suggestion.classification && (
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              {suggestion.classification}
                            </div>
                          )}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          suggestion.type === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}>
                          {suggestion.type === 'active' ? 'Activo' : 'Archivado'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={handleSearchCase}
              disabled={!searchTerm.trim() || isValidating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buscar
            </button>
            
            {(selectedCaseId || selectedArchivedCaseId) && (
              <button
                onClick={handleClearCase}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Resultado de validación */}
        {validationResult && (
          <div className={`p-3 rounded-md border ${
            validationResult.is_valid
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
          }`}>
            <div className="flex items-start gap-2">
              {validationResult.is_valid ? (
                <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                {validationResult.is_valid ? (
                  <div>
                    <p className="font-medium">
                      Caso encontrado en {validationResult.case_type === 'active' ? 'casos activos' : 'casos archivados'}
                    </p>
                    {validationResult.case_data && (
                      <div className="mt-1 text-sm">
                        <p><strong>Número:</strong> {validationResult.case_data.numero_caso || validationResult.case_data.case_number}</p>
                        <p><strong>Descripción:</strong> {validationResult.case_data.descripcion}</p>
                        {validationResult.case_data.classification && (
                          <p><strong>Clasificación:</strong> {validationResult.case_data.classification}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p>{validationResult.error_message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tipo de referencia (solo se muestra si hay un caso válido) */}
        {validationResult?.is_valid && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Referencia
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="active"
                  checked={caseReferenceType === 'active'}
                  onChange={(e) => onCaseChange(e.target.value as CaseReferenceType, selectedCaseId, selectedArchivedCaseId)}
                  className="mr-2"
                />
                Solo caso activo
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="archived"
                  checked={caseReferenceType === 'archived'}
                  onChange={(e) => onCaseChange(e.target.value as CaseReferenceType, selectedCaseId, selectedArchivedCaseId)}
                  className="mr-2"
                />
                Solo caso archivado
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="both"
                  checked={caseReferenceType === 'both'}
                  onChange={(e) => onCaseChange(e.target.value as CaseReferenceType, selectedCaseId, selectedArchivedCaseId)}
                  className="mr-2"
                />
                Ambos
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
