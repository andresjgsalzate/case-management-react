/**
 * =================================================================
 * ÍNDICE DE COMPONENTES DEL EDITOR DE DOCUMENTACIÓN
 * =================================================================
 * Descripción: Exporta todos los componentes de edición BlockNote
 * Fecha: 4 de Agosto, 2025
 * =================================================================
 */

// Editor principal - completo con todas las funcionalidades
export { EnhancedDocumentationEditor } from './EnhancedDocumentationEditor';

// Editor principal BlockNote
export { BlockNoteDocumentEditor, createEmptyBlockNoteContent, convertFromLegacyToBlockNote } from './BlockNoteDocumentEditor';

// Editor intermedio - DocumentationEditor original (si lo necesitas)
export { DocumentationEditor } from './DocumentationEditor';
