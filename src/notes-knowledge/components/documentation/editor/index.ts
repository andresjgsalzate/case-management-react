/**
 * =================================================================
 * ÍNDICE DE COMPONENTES DEL EDITOR DE DOCUMENTACIÓN
 * =================================================================
 * Descripción: Exporta todos los componentes de edición disponibles
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

// Editor principal - completo con todas las funcionalidades
export { EnhancedDocumentationEditor } from './EnhancedDocumentationEditor';

// Editor básico original de Yoopta
export { YooptaDocumentEditor, createEmptyYooptaContent } from './YooptaDocumentEditor';

// Editor intermedio - DocumentationEditor original (si lo necesitas)
export { DocumentationEditor } from './DocumentationEditor';

// Tipos necesarios para los editores
export type { YooptaContentValue } from '@yoopta/editor';
