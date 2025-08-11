/**
 * =================================================================
 * PÁGINA: PRUEBA DE FUNCIONALIDADES AVANZADAS BLOCKNOTE
 * =================================================================
 * Descripción: Página para probar todas las funcionalidades avanzadas
 * Versión: 1.0
 * Fecha: 11 de Agosto, 2025
 * =================================================================
 */

import React from 'react';
import BlockNoteAdvancedExample from '../examples/BlockNoteAdvancedExample';

export const TestAdvancedBlockNotePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <BlockNoteAdvancedExample />
      </div>
    </div>
  );
};

export default TestAdvancedBlockNotePage;
