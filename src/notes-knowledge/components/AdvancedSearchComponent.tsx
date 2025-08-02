/**
 * =================================================================
 * COMPONENTE: BÚSQUEDA AVANZADA DE DOCUMENTACIÓN
 * =================================================================
 * Descripción: Búsqueda inteligente con sugerencias, autocompletado
 * y filtros avanzados para el módulo de documentación
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Clock, BookOpen, Hash, Zap } from 'lucide-react';
import { DocumentationService } from '../services/documentationService';
import { debounce } from 'lodash';

interface AdvancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onDocumentSelect?: (documentId: string) => void;
  onSearchExecute?: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
}

interface SearchSuggestion {
  suggestion: string;
  frequency: number;
}

interface QuickResult {
  id: string;
  title: string;
  matched_content: string;
  relevance_score: number;
  category: string;
}

export const AdvancedSearchComponent: React.FC<AdvancedSearchProps> = ({
  value,
  onChange,
  onDocumentSelect,
  onSearchExecute,
  placeholder = "Buscar por palabras, frases, números, códigos...",
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [quickResults, setQuickResults] = useState<QuickResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showQuickResults, setShowQuickResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('documentation-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Debounced functions para evitar demasiadas requests
  const debouncedGetSuggestions = debounce(async (term: string) => {
    console.log('🔍 [SEARCH_COMPONENT] Obteniendo sugerencias para:', term);
    
    if (term.length >= 2) {
      try {
        console.log('🔍 [SEARCH_COMPONENT] Llamando a getSearchSuggestions...');
        const results = await DocumentationService.getSearchSuggestions(term, 5);
        console.log('🔍 [SEARCH_COMPONENT] Sugerencias recibidas:', results);
        setSuggestions(results);
      } catch (error) {
        console.error('❌ [SEARCH_COMPONENT] Error al obtener sugerencias:', error);
        setSuggestions([]);
      }
    } else {
      console.log('🔍 [SEARCH_COMPONENT] Término muy corto para sugerencias');
      setSuggestions([]);
    }
  }, 300);

  const debouncedQuickSearch = debounce(async (term: string) => {
    console.log('⚡ [SEARCH_COMPONENT] Iniciando búsqueda rápida para:', term);
    
    if (term.length >= 2) {
      setIsLoading(true);
      try {
        console.log('⚡ [SEARCH_COMPONENT] Llamando a quickSearch...');
        const results = await DocumentationService.quickSearch(term, 8);
        console.log('⚡ [SEARCH_COMPONENT] Resultados rápidos recibidos:', {
          count: results.length,
          results
        });
        setQuickResults(results);
        setShowQuickResults(results.length > 0);
      } catch (error) {
        console.error('❌ [SEARCH_COMPONENT] Error en búsqueda rápida:', error);
        setQuickResults([]);
        setShowQuickResults(false);
      }
      setIsLoading(false);
    } else {
      console.log('⚡ [SEARCH_COMPONENT] Término muy corto para búsqueda rápida');
      setQuickResults([]);
      setShowQuickResults(false);
      setIsLoading(false);
    }
  }, 500);

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('📝 [SEARCH_COMPONENT] Input cambiado:', {
      newValue,
      length: newValue.length,
      trimmed: newValue.trim()
    });
    
    onChange(newValue);
    
    // Obtener sugerencias y resultados rápidos
    if (newValue.trim()) {
      console.log('📝 [SEARCH_COMPONENT] Activando búsquedas debounced...');
      debouncedGetSuggestions(newValue);
      debouncedQuickSearch(newValue);
      setShowSuggestions(true);
    } else {
      console.log('📝 [SEARCH_COMPONENT] Limpiando resultados (input vacío)');
      setSuggestions([]);
      setQuickResults([]);
      setShowSuggestions(false);
      setShowQuickResults(false);
    }
  };

  // Manejar selección de sugerencia
  const handleSuggestionSelect = (suggestion: string) => {
    console.log('✅ [SEARCH_COMPONENT] Sugerencia seleccionada:', suggestion);
    
    onChange(suggestion);
    setShowSuggestions(false);
    setShowQuickResults(false);
    saveRecentSearch(suggestion);
    inputRef.current?.focus();
    
    // Ejecutar búsqueda completa
    if (onSearchExecute) {
      console.log('🔍 [SEARCH_COMPONENT] Ejecutando búsqueda completa...');
      onSearchExecute(suggestion);
    }
  };

  // Manejar teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      console.log('⏎ [SEARCH_COMPONENT] Enter presionado, ejecutando búsqueda:', value.trim());
      
      setShowSuggestions(false);
      setShowQuickResults(false);
      saveRecentSearch(value.trim());
      
      // Ejecutar búsqueda completa
      if (onSearchExecute) {
        console.log('🔍 [SEARCH_COMPONENT] Ejecutando búsqueda completa desde Enter...');
        onSearchExecute(value.trim());
      }
    }
    if (e.key === 'Escape') {
      console.log('⎋ [SEARCH_COMPONENT] Escape presionado, cerrando sugerencias');
      setShowSuggestions(false);
      setShowQuickResults(false);
      inputRef.current?.blur();
    }
  };

  // Guardar búsqueda reciente
  const saveRecentSearch = (search: string) => {
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('documentation-recent-searches', JSON.stringify(updated));
  };

  // Limpiar búsqueda
  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setQuickResults([]);
    setShowSuggestions(false);
    setShowQuickResults(false);
    inputRef.current?.focus();
  };

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowQuickResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Resaltar texto coincidente
  const highlightMatch = (text: string, search: string) => {
    if (!search) return text;
    
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input principal */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value.trim()) {
              setShowSuggestions(true);
              if (quickResults.length > 0) setShowQuickResults(true);
            }
          }}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
        />
        
        {/* Botones de acción */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
          {value && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Dropdown con sugerencias y resultados */}
      {(showSuggestions || showQuickResults) && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-hidden">
          
          {/* Búsquedas recientes (cuando no hay input) */}
          {!value && recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center text-xs font-medium text-gray-500 mb-2">
                <Clock className="h-3 w-3 mr-1" />
                Búsquedas recientes
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionSelect(search)}
                    className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencias de autocompletado */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center text-xs font-medium text-gray-500 mb-2">
                <Hash className="h-3 w-3 mr-1" />
                Sugerencias
              </div>
              <div className="space-y-1">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionSelect(item.suggestion)}
                    className="flex items-center justify-between w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded"
                  >
                    <span>{highlightMatch(item.suggestion, value)}</span>
                    <span className="text-xs text-gray-400">
                      {item.frequency} docs
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resultados rápidos */}
          {showQuickResults && (
            <div className="max-h-64 overflow-y-auto">
              <div className="p-3">
                <div className="flex items-center text-xs font-medium text-gray-500 mb-2">
                  <Zap className="h-3 w-3 mr-1" />
                  Resultados rápidos
                  {isLoading && (
                    <div className="ml-2 animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full"></div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {quickResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100"
                      onClick={() => {
                        console.log('🎯 [SEARCH_COMPONENT] Resultado rápido seleccionado:', {
                          id: result.id,
                          title: result.title,
                          category: result.category
                        });
                        
                        // Cerrar sugerencias
                        setShowSuggestions(false);
                        setShowQuickResults(false);
                        
                        // Navegar al documento
                        if (onDocumentSelect) {
                          console.log('🎯 [SEARCH_COMPONENT] Llamando a onDocumentSelect...');
                          onDocumentSelect(result.id);
                        } else {
                          console.warn('⚠️ [SEARCH_COMPONENT] onDocumentSelect no está definido');
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {highlightMatch(result.title, value)}
                          </h4>
                          
                          {result.matched_content && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {highlightMatch(result.matched_content, value)}
                            </p>
                          )}
                          
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <BookOpen className="h-3 w-3 mr-1" />
                            <span>{result.category}</span>
                            <span className="ml-2 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                              {Math.round(result.relevance_score * 10) / 10}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Indicador de ayuda */}
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              💡 Puedes buscar por títulos, contenido, etiquetas, números de caso, códigos, fragmentos de texto, etc.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchComponent;
