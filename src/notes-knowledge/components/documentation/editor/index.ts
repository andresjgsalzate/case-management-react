/**
 * =================================================================
 * ÍNDICE DE COMPONENTES DEL EDITOR DE DOCUMENTACIÓN
 * =================================================================
 * Descripción: Exporta todos los componentes de edición BlockNote
 * Fecha: 11 de Agosto, 2025
 * =================================================================
 */

// Editor principal - completo con todas las funcionalidades
export { EnhancedDocumentationEditor } from './EnhancedDocumentationEditor';

// Editor principal BlockNote
export { BlockNoteDocumentEditor, createEmptyBlockNoteContent, convertFromLegacyToBlockNote } from './BlockNoteDocumentEditor';

// Provider de estilos globales
export { BlockNoteStylesProvider } from './BlockNoteStylesProvider';

// Editor intermedio - DocumentationEditor original (si lo necesitas)
export { DocumentationEditor } from './DocumentationEditor';
