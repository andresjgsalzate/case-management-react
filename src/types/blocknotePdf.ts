/**
 * =================================================================
 * TIPOS TYPESCRIPT - EXPORTACIÓN PDF BLOCKNOTE
 * =================================================================
 * Descripción: Tipos específicos para la exportación PDF de documentos BlockNote
 * Versión: 1.0
 * Fecha: 5 de Agosto, 2025
 * =================================================================
 */

// Tipos base para contenido de texto con estilos
export interface TextContent {
  text: string;
  type: 'text';
  styles: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
  };
}

// Tipos para diferentes tipos de bloques
export interface BlockBase {
  id: string;
  content: TextContent[];
  children: BlockBase[];
}

export interface ParagraphBlock extends BlockBase {
  type: 'paragraph';
  props: Record<string, any>;
}

export interface HeadingBlock extends BlockBase {
  type: 'heading';
  props: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
}

export interface CodeBlock extends BlockBase {
  type: 'codeBlock';
  props: {
    language?: string;
  };
}

export interface ListItemBlock extends BlockBase {
  type: 'bulletListItem' | 'numberedListItem';
  props: Record<string, any>;
}

export interface CheckListItemBlock extends BlockBase {
  type: 'checkListItem';
  props: {
    checked: boolean;
  };
}

export interface QuoteBlock extends BlockBase {
  type: 'quote';
  props: Record<string, any>;
}

export interface DividerBlock extends BlockBase {
  type: 'divider';
  props: Record<string, any>;
}

export interface ImageBlock extends BlockBase {
  type: 'image';
  props: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
}

export interface TableBlock extends BlockBase {
  type: 'table';
  props: {
    rows?: number;
    columns?: number;
  };
}

// Unión de todos los tipos de bloques
export type PDFContentBlock = 
  | ParagraphBlock 
  | HeadingBlock 
  | CodeBlock 
  | ListItemBlock 
  | CheckListItemBlock 
  | QuoteBlock 
  | DividerBlock 
  | ImageBlock 
  | TableBlock;

// Estructura principal del documento BlockNote para PDF
export interface BlockNoteDocument {
  id: string;
  title: string;
  content: PDFContentBlock[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  category?: string;
  tags?: string[];
  difficulty_level?: number;
  solution_type?: string;
  estimated_solution_time?: number;
  case_reference?: string;
}

// Metadatos para el PDF
export interface PDFMetadata {
  title: string;
  author?: string;
  subject?: string;
  creator: string;
  producer: string;
  creationDate?: Date;
  modificationDate?: Date;
}

// Opciones de configuración para la exportación PDF
export interface PDFExportOptions {
  fileName?: string;
  includeMetadata?: boolean;
  includeHeader?: boolean;
  includeFooter?: boolean;
  pageFormat?: 'A4' | 'Letter' | 'A3';
  margin?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}
