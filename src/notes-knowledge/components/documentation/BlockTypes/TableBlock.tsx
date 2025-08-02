/**
 * =================================================================
 * BLOQUE: TABLA
 * =================================================================
 * Descripción: Bloque de tabla editable con filas y columnas
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { ContentBlock } from '@/types/documentation';
import { 
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

interface TableBlockProps {
  block: ContentBlock;
  isActive: boolean;
  readOnly: boolean;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
  onAddAfter: (type: ContentBlock['type']) => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({
  block,
  isActive,
  readOnly,
  onUpdate
}) => {
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const cellRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  
  const headers = block.metadata?.tableHeaders || ['Columna 1', 'Columna 2'];
  const rows = block.metadata?.tableRows || [['', '']];

  // Actualizar datos de la tabla
  const updateTableData = (newHeaders: string[], newRows: string[][]) => {
    onUpdate({
      content: `Tabla ${newHeaders.length}x${newRows.length}`,
      metadata: {
        ...block.metadata,
        tableHeaders: newHeaders,
        tableRows: newRows
      }
    });
  };

  // Actualizar encabezado
  const updateHeader = (colIndex: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[colIndex] = value;
    updateTableData(newHeaders, rows);
  };

  // Actualizar celda
  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;
    updateTableData(headers, newRows);
  };

  // Añadir columna
  const addColumn = () => {
    const newHeaders = [...headers, `Columna ${headers.length + 1}`];
    const newRows = rows.map(row => [...row, '']);
    updateTableData(newHeaders, newRows);
  };

  // Eliminar columna
  const removeColumn = (colIndex: number) => {
    if (headers.length <= 1) return; // Mantener al menos una columna
    
    const newHeaders = headers.filter((_, i) => i !== colIndex);
    const newRows = rows.map(row => row.filter((_, i) => i !== colIndex));
    updateTableData(newHeaders, newRows);
  };

  // Añadir fila
  const addRow = () => {
    const newRow = new Array(headers.length).fill('');
    const newRows = [...rows, newRow];
    updateTableData(headers, newRows);
  };

  // Eliminar fila
  const removeRow = (rowIndex: number) => {
    if (rows.length <= 1) return; // Mantener al menos una fila
    
    const newRows = rows.filter((_, i) => i !== rowIndex);
    updateTableData(headers, newRows);
  };

  // Manejar teclas especiales en celdas
  const handleCellKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>, 
    rowIndex: number, 
    colIndex: number
  ) => {
    // Tab: moverse a la siguiente celda
    if (e.key === 'Tab') {
      e.preventDefault();
      const nextCol = colIndex + 1;
      const nextRow = rowIndex;
      
      if (nextCol < headers.length) {
        setEditingCell({ row: nextRow, col: nextCol });
      } else if (nextRow + 1 < rows.length) {
        setEditingCell({ row: nextRow + 1, col: 0 });
      } else {
        // Añadir nueva fila si estamos en la última celda
        addRow();
        setEditingCell({ row: nextRow + 1, col: 0 });
      }
    }

    // Enter: moverse a la celda de abajo
    if (e.key === 'Enter') {
      e.preventDefault();
      if (rowIndex + 1 < rows.length) {
        setEditingCell({ row: rowIndex + 1, col: colIndex });
      } else {
        // Añadir nueva fila
        addRow();
        setEditingCell({ row: rowIndex + 1, col: colIndex });
      }
    }

    // Escape: salir del modo edición
    if (e.key === 'Escape') {
      setEditingCell(null);
    }

    // Arrows: navegar entre celdas
    if (e.key === 'ArrowUp' && rowIndex > 0) {
      e.preventDefault();
      setEditingCell({ row: rowIndex - 1, col: colIndex });
    }
    if (e.key === 'ArrowDown' && rowIndex < rows.length - 1) {
      e.preventDefault();
      setEditingCell({ row: rowIndex + 1, col: colIndex });
    }
    if (e.key === 'ArrowLeft' && colIndex > 0) {
      e.preventDefault();
      setEditingCell({ row: rowIndex, col: colIndex - 1 });
    }
    if (e.key === 'ArrowRight' && colIndex < headers.length - 1) {
      e.preventDefault();
      setEditingCell({ row: rowIndex, col: colIndex + 1 });
    }
  };

  // Enfocar celda cuando entre en modo edición
  useEffect(() => {
    if (editingCell) {
      const key = `${editingCell.row}-${editingCell.col}`;
      const input = cellRefs.current[key];
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
  }, [editingCell]);

  // Entrar en modo edición cuando el bloque esté activo
  useEffect(() => {
    if (isActive && !readOnly && !editingCell) {
      setEditingCell({ row: 0, col: 0 });
    }
  }, [isActive, readOnly, editingCell]);

  return (
    <div className={`block-table ${isActive ? 'active' : ''} ${readOnly ? 'readonly' : ''} overflow-x-auto`}>
      <div className="inline-block min-w-full border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <table className="min-w-full">
          {/* Encabezados */}
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {headers.map((header, colIndex) => (
                <th
                  key={colIndex}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-600 last:border-r-0 relative group"
                >
                  {readOnly ? (
                    header
                  ) : (
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => updateHeader(colIndex, e.target.value)}
                      className="w-full bg-transparent border-none outline-none font-medium"
                      placeholder={`Columna ${colIndex + 1}`}
                    />
                  )}
                  
                  {/* Controles de columna */}
                  {!readOnly && (
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center space-x-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                        <button
                          onClick={addColumn}
                          className="p-1 text-gray-500 hover:text-green-600 dark:hover:text-green-400"
                          title="Añadir columna"
                        >
                          <PlusIcon className="h-3 w-3" />
                        </button>
                        {headers.length > 1 && (
                          <button
                            onClick={() => removeColumn(colIndex)}
                            className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                            title="Eliminar columna"
                          >
                            <MinusIcon className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </th>
              ))}
              
              {/* Columna de acciones para filas */}
              {!readOnly && (
                <th className="w-10 bg-gray-50 dark:bg-gray-800"></th>
              )}
            </tr>
          </thead>

          {/* Cuerpo de la tabla */}
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="group">
                {row.map((cell, colIndex) => (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-600 last:border-r-0"
                  >
                    {editingCell?.row === rowIndex && editingCell?.col === colIndex && !readOnly ? (
                      <input
                        ref={(el) => (cellRefs.current[`${rowIndex}-${colIndex}`] = el)}
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                        onKeyDown={(e) => handleCellKeyDown(e, rowIndex, colIndex)}
                        onBlur={() => setEditingCell(null)}
                        className="w-full bg-transparent border-none outline-none"
                        placeholder="Escribe aquí..."
                      />
                    ) : (
                      <div
                        className={`${readOnly ? '' : 'cursor-text hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 py-1 -mx-2 -my-1 transition-colors'} ${
                          cell ? '' : 'text-gray-400 dark:text-gray-500'
                        }`}
                        onClick={() => !readOnly && setEditingCell({ row: rowIndex, col: colIndex })}
                      >
                        {cell || 'Escribe aquí...'}
                      </div>
                    )}
                  </td>
                ))}
                
                {/* Controles de fila */}
                {!readOnly && (
                  <td className="w-10 text-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => removeRow(rowIndex)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Eliminar fila"
                        disabled={rows.length <= 1}
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Botón para añadir fila */}
        {!readOnly && (
          <div className="border-t border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-2 text-center">
            <button
              onClick={addRow}
              className="inline-flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Añadir fila
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
