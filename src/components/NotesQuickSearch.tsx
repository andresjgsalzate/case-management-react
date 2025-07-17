import React, { useState } from 'react';
import { MagnifyingGlassIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useSearchNotes } from '../hooks/useNotes';
import { useNotesPermissions } from '../hooks/useNotesPermissions';
import { LoadingSpinner } from './LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotesSearchProps {
  onNoteSelect?: (noteId: string) => void;
  placeholder?: string;
  className?: string;
}

export const NotesSearchComponent: React.FC<NotesSearchProps> = ({
  onNoteSelect,
  placeholder = "Buscar notas...",
  className = ""
}) => {
  const { canAccessNotesModule } = useNotesPermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const { data: searchResults, isLoading } = useSearchNotes(searchTerm);

  // Verificar permisos
  if (!canAccessNotesModule) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (searchTerm.length > 2) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay to allow for click events
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleNoteClick = (noteId: string) => {
    if (onNoteSelect) {
      onNoteSelect(noteId);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !searchResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleNoteClick(searchResults[selectedIndex].id);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: es 
    });
  };

  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-800 font-medium">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchTerm.length > 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {searchResults && searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((note, index) => (
                <button
                  key={note.id}
                  onClick={() => handleNoteClick(note.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index === selectedIndex ? 'bg-gray-50 dark:bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {highlightText(note.title, searchTerm)}
                        </h4>
                        {note.isImportant && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Importante
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {highlightText(note.content.substring(0, 100), searchTerm)}
                        {note.content.length > 100 && '...'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatDate(note.createdAt)}</span>
                        {note.creatorName && (
                          <span>por {note.creatorName}</span>
                        )}
                        {note.caseNumber && (
                          <span>Caso: {note.caseNumber}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              No se encontraron notas
            </div>
          )}
        </div>
      )}
    </div>
  );
};
