/**
 * =================================================================
 * PÁGINA DE PRUEBA - EDITOR VISUAL YOOPTA
 * =================================================================
 * Descripción: Página para probar el editor visual en el navegador
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React from 'react';
import { YooptaEditorDemo } from '../components/documentation/editor/YooptaEditorDemo';

export const YooptaTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <YooptaEditorDemo />
    </div>
  );
};
