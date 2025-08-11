/**
 * =================================================================
 * SERVICIO: EXPORTACIÓN PDF MEJORADA
 * =================================================================
 * Descripción: Servicio para exportar documentos BlockNote a PDF con mejoras
 * Versión: 2.0 - Mejoras implementadas
 * Fecha: 5 de Agosto, 2025
 * =================================================================
 */

import React from 'react';
import { pdf, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { supabase } from '../lib/supabase';
import { BlockNoteDocument, PDFContentBlock, PDFExportOptions } from '../../types/blocknotePdf';
import { codeToHtml } from 'shiki';

// =================== FUNCIONES DE UTILIDAD ===================

/**
 * Valida si un string es un UUID válido
 */
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Obtiene el nombre de usuario para mostrar en lugar del UUID
 */
const getUserDisplayName = async (userId: string): Promise<string> => {
  try {
    if (!isValidUUID(userId)) {
      return userId; // Si no es UUID, usar el valor tal como está
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('⚠️ Error obteniendo perfil de usuario:', error);
      return userId; // Fallback al UUID si hay error
    }

    if (profile) {
      const displayName = profile.full_name || profile.email || userId;
      return displayName;
    }

    return userId; // Fallback al UUID si no se encuentra perfil
  } catch (error) {
    console.error('❌ Error inesperado obteniendo usuario:', error);
    return userId; // Fallback al UUID en caso de error
  }
};

/**
 * Obtiene los adjuntos de un documento desde la base de datos
 */
const getDocumentAttachments = async (documentId: string): Promise<any[]> => {
  try {
    const { data: attachments, error } = await supabase
      .from('document_attachments')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error obteniendo adjuntos:', error);
      return [];
    }
    
    return attachments || [];
  } catch (error) {
    console.error('❌ Error inesperado obteniendo adjuntos:', error);
    return [];
  }
};

/**
 * Enriquece el documento con nombres de usuario reales
 */
const enrichDocumentData = async (document: BlockNoteDocument): Promise<BlockNoteDocument> => {
  try {
    // Clonar el documento para no mutar el original
    const enrichedDocument = { ...document };

    // Enriquecer created_by si es un UUID
    if (enrichedDocument.created_by && isValidUUID(enrichedDocument.created_by)) {
      enrichedDocument.created_by = await getUserDisplayName(enrichedDocument.created_by);
    }

    // Aquí se pueden agregar más enriquecimientos si es necesario
    // Por ejemplo, updated_by, assigned_to, etc.

    return enrichedDocument;
  } catch (error) {
    console.error('❌ Error enriqueciendo documento:', error);
    return document; // Devolver documento original si hay error
  }
};

/**
 * Estructura para representar texto con colores
 */
interface ColoredTextToken {
  text: string;
  color?: string;
  backgroundColor?: string;
  fontWeight?: string;
  fontStyle?: string;
}

/**
 * Procesa código fuente con syntax highlighting usando Shiki
 */
const processCodeWithSyntaxHighlighting = async (
  code: string, 
  language: string
): Promise<ColoredTextToken[]> => {
  try {
    // Mapeo de lenguajes comunes
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'rb': 'ruby',
      'php': 'php',
      'java': 'java',
      'cs': 'csharp',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rust': 'rust',
      'swift': 'swift',
      'kotlin': 'kotlin',
      'scala': 'scala',
      'sh': 'bash',
      'bash': 'bash',
      'zsh': 'bash',
      'powershell': 'powershell',
      'sql': 'sql',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'toml': 'toml',
      'ini': 'ini',
      'dockerfile': 'dockerfile',
      'makefile': 'makefile',
      'r': 'r',
      'matlab': 'matlab',
      'lua': 'lua',
      'perl': 'perl',
      'dart': 'dart',
      'vue': 'vue',
      'svelte': 'svelte',
      'jsx': 'jsx',
      'tsx': 'tsx'
    };

    const normalizedLanguage = languageMap[language.toLowerCase()] || language.toLowerCase();

    // Generar HTML con syntax highlighting usando tema claro para PDF
    const html = await codeToHtml(code, {
      lang: normalizedLanguage,
      theme: 'github-light'
    });

    // Extraer los tokens del HTML generado
    const tokens = parseShikiHtmlToTokens(html);
    return tokens;

  } catch (error) {
    console.warn('⚠️ Error en syntax highlighting, usando texto plano:', error);
    // Fallback: retornar el código como texto plano
    return [{ text: code, color: '#1F2937' }];
  }
};

/**
 * Parsea el HTML generado por Shiki y extrae tokens con colores
 */
const parseShikiHtmlToTokens = (html: string): ColoredTextToken[] => {
  const tokens: ColoredTextToken[] = [];
  
  try {
    // Remover el wrapper HTML y extraer solo el contenido del <pre><code>
    const codeMatch = html.match(/<code[^>]*>([\s\S]*?)<\/code>/);
    if (!codeMatch) {
      return [{ text: html, color: '#1F2937' }];
    }

    const codeContent = codeMatch[1];
    
    // Usar regex para extraer spans con estilos
    const spanRegex = /<span[^>]*style="([^"]*)"[^>]*>([\s\S]*?)<\/span>/g;
    let lastIndex = 0;
    let match;

    while ((match = spanRegex.exec(codeContent)) !== null) {
      // Agregar texto antes del span si existe
      if (match.index > lastIndex) {
        const plainText = codeContent.slice(lastIndex, match.index);
        if (plainText) {
          tokens.push({ text: cleanHtmlEntities(plainText), color: '#1F2937' });
        }
      }

      // Extraer color del estilo
      const styleAttr = match[1];
      const colorMatch = styleAttr.match(/color:\s*([^;]+)/);
      const color = colorMatch ? colorMatch[1].trim() : '#1F2937';
      
      // Agregar el texto del span
      const spanText = cleanHtmlEntities(match[2]);
      if (spanText) {
        tokens.push({ text: spanText, color });
      }

      lastIndex = spanRegex.lastIndex;
    }

    // Agregar texto restante
    if (lastIndex < codeContent.length) {
      const remainingText = codeContent.slice(lastIndex);
      if (remainingText) {
        tokens.push({ text: cleanHtmlEntities(remainingText), color: '#1F2937' });
      }
    }

    return tokens.length > 0 ? tokens : [{ text: html, color: '#1F2937' }];

  } catch (error) {
    console.warn('⚠️ Error parseando HTML de Shiki:', error);
    return [{ text: html, color: '#1F2937' }];
  }
};

/**
 * Limpia entidades HTML básicas
 */
const cleanHtmlEntities = (text: string): string => {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/<[^>]*>/g, ''); // Remover cualquier tag HTML restante
};

// =================== ESTILOS PDF ===================

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  
  // Header del documento
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB'
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827'
  },
  
  // Cuadro de información mejorado
  infoBox: {
    backgroundColor: '#F9FAFB',
    border: '1pt solid #D1D5DB',
    borderRadius: 8,
    padding: 18, // ✅ Reducido de 20 a 18 para menos espacio interno
    marginBottom: 24 // ✅ Mantener separación externa
  },
  
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12, // ✅ Reducido de 16 a 12 para menos espacio después del título
    color: '#374151'
  },
  
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 5, // ✅ Reducido de 8 a 5 para menos espacio entre líneas
    alignItems: 'flex-start', // ✅ Mejor alineación para textos largos
    minHeight: 14 // ✅ Reducido de 16 a 14 para menos altura
  },
  
  metadataLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6B7280',
    width: 120, // ✅ Aumentado de 80 a 120 para más espacio
    marginRight: 12, // ✅ Más separación entre label y valor
    flexShrink: 0 // ✅ Evita que se comprima
  },
  
  metadataValue: {
    fontSize: 11,
    color: '#111827',
    flex: 1,
    lineHeight: 1.3 // ✅ Reducido de 1.4 a 1.3 para menos espacio de línea
  },
  
  // Contenido principal
  content: {
    flex: 1
  },
  
  // Bloques básicos
  paragraph: {
    fontSize: 12,
    lineHeight: 1.4,
    marginBottom: 8,
    color: '#000000'
  },
  
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    color: '#111827'
  },
  
  heading2: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 10,
    color: '#111827'
  },
  
  heading3: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    color: '#111827'
  },
  
  // Listas
  listItem: {
    fontSize: 12,
    lineHeight: 1.4,
    marginBottom: 4,
    marginLeft: 20,
    color: '#000000'
  },
  
  numberedListItem: {
    fontSize: 12,
    lineHeight: 1.4,
    marginBottom: 4,
    marginLeft: 20,
    color: '#000000'
  },
  
  // Checkboxes mejorados
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginLeft: 20
  },
  
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 3,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  checkboxChecked: {
    backgroundColor: '#2F80ED',
    borderColor: '#2F80ED'
  },
  
  checkmark: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  
  checkboxText: {
    fontSize: 12,
    lineHeight: 1.4,
    color: '#000000',
    flex: 1
  },
  
  // Bloques de código mejorados
  codeBlock: {
    backgroundColor: '#F1F3F4',
    border: '1pt solid #D1D5DB',
    borderRadius: 6,
    padding: 16,
    marginVertical: 12,
    fontFamily: 'Courier'
  },
  
  codeLanguage: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: 'bold'
  },
  
  codeText: {
    fontSize: 11,
    lineHeight: 1.3,
    color: '#1F2937',
    fontFamily: 'Courier'
  },
  
  // Citas
  quote: {
    borderLeftWidth: 4,
    borderLeftColor: '#E5E7EB',
    paddingLeft: 16,
    marginVertical: 12,
    fontStyle: 'italic'
  },
  
  quoteText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 1.4
  },
  
  // Divisores
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginVertical: 16
  },
  
  // Tablas
  table: {
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  
  tableHeaderRow: {
    backgroundColor: '#F9FAFB'
  },
  
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 11,
    color: '#374151'
  },
  
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#111827'
  },
  
  // Texto con estilos específicos
  boldText: {
    fontWeight: 'bold'
  },
  
  italicText: {
    fontStyle: 'italic'
  },
  
  underlineText: {
    textDecoration: 'underline'
  },
  
  strikethroughText: {
    textDecoration: 'line-through'
  },
  
  inlineCode: {
    fontFamily: 'Courier',
    backgroundColor: '#F1F3F4',
    padding: 2,
    borderRadius: 3,
    fontSize: 11
  },
  
  // Colores de texto predefinidos
  redText: {
    color: '#EF4444'
  },
  
  blueText: {
    color: '#3B82F6'
  },
  
  greenText: {
    color: '#10B981'
  },
  
  purpleText: {
    color: '#8B5CF6'
  },
  
  // Sección de adjuntos
  attachmentsSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  
  attachmentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827'
  },
  
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#F9FAFB',
    border: '1pt solid #E5E7EB',
    borderRadius: 4
  },
  
  attachmentIcon: {
    fontSize: 12,
    marginRight: 8,
    color: '#6B7280'
  },
  
  attachmentInfo: {
    flex: 1
  },
  
  attachmentName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2
  },
  
  attachmentDetails: {
    fontSize: 9,
    color: '#6B7280'
  },
  
  // Footer
  footer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center'
  },
  
  // Estilos para página de adjuntos
  attachmentPageInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  attachmentPageTitle: {
    fontSize: 14,
    fontWeight: 'bold' as any,
    color: '#374151',
    textAlign: 'center' as any,
  }
});

// =================== RENDERIZADO DE BLOQUES ===================

/**
 * Extrae texto plano del contenido de un bloque
 */
const extractTextFromContent = (content: any): string => {
  if (typeof content === 'string') {
    return content;
  }
  
  if (Array.isArray(content)) {
    return content.map(item => {
      if (typeof item === 'string') {
        return item;
      }
      if (item && typeof item === 'object' && item.text) {
        return item.text;
      }
      return '';
    }).join('');
  }
  
  if (content && typeof content === 'object' && content.text) {
    return content.text;
  }
  
  return String(content || '');
};

const renderBlock = (block: PDFContentBlock, index: number, numberedListCounter?: { value: number }): React.ReactElement => {
  switch (block.type) {
    case 'paragraph':
      return (
        <Text key={index} style={styles.paragraph}>
          {renderInlineContent(block.content)}
        </Text>
      );
      
    case 'heading':
      const headingLevel = block.props?.level || 1;
      const headingStyle = headingLevel === 1 ? styles.heading1 : 
                          headingLevel === 2 ? styles.heading2 : styles.heading3;
      return (
        <Text key={index} style={headingStyle}>
          {renderInlineContent(block.content)}
        </Text>
      );
      
    case 'bulletListItem':
      return (
        <Text key={index} style={styles.listItem}>
          • {renderInlineContent(block.content)}
        </Text>
      );
      
    case 'numberedListItem':
      // Usar el contador específico de listas numeradas
      const itemNumber = numberedListCounter ? numberedListCounter.value++ : 1;
      return (
        <Text key={index} style={styles.numberedListItem}>
          {itemNumber}. {renderInlineContent(block.content)}
        </Text>
      );
      
    case 'checkListItem':
      const isChecked = block.props?.checked || false;
      return (
        <View key={index} style={styles.checklistItem}>
          <View style={isChecked ? [styles.checkbox, styles.checkboxChecked] : styles.checkbox}>
            {isChecked && <Text style={styles.checkmark}>✔</Text>}
          </View>
          <Text style={styles.checkboxText}>
            {renderInlineContent(block.content)}
          </Text>
        </View>
      );
      
    case 'codeBlock':
      const language = (block.props as any)?.language || '';
      const blockAny = block as any;
      
      // Verificar si el bloque tiene tokens de syntax highlighting
      if (blockAny.syntaxTokens && blockAny.isProcessed) {
        return (
          <View key={index} style={styles.codeBlock}>
            {language && (
              <Text style={styles.codeLanguage}>
                {language.toUpperCase()}
              </Text>
            )}
            <Text style={styles.codeText}>
              {blockAny.syntaxTokens.map((token: ColoredTextToken, tokenIndex: number) => (
                <Text 
                  key={tokenIndex}
                  style={[
                    styles.codeText,
                    { color: token.color || '#1F2937' }
                  ]}
                >
                  {token.text}
                </Text>
              ))}
            </Text>
          </View>
        );
      }
      
      // Fallback: renderizado normal sin syntax highlighting
      return (
        <View key={index} style={styles.codeBlock}>
          {language && (
            <Text style={styles.codeLanguage}>
              {language.toUpperCase()}
            </Text>
          )}
          <Text style={styles.codeText}>
            {renderInlineContent(block.content)}
          </Text>
        </View>
      );
      
    case 'quote':
      return (
        <View key={index} style={styles.quote}>
          <Text style={styles.quoteText}>
            {renderInlineContent(block.content)}
          </Text>
        </View>
      );
      
    case 'divider':
      return <View key={index} style={styles.divider} />;
      
    case 'table':
      return renderTable(block, index);
      
    case 'image':
      return renderImage(block, index);
      
    default:
      return (
        <Text key={index} style={styles.paragraph}>
          {renderInlineContent((block as any).content)}
        </Text>
      );
  }
};

// =================== FUNCIONES AUXILIARES ===================

/**
 * Obtiene el icono correspondiente para un tipo de archivo
 */
const getAttachmentIcon = (fileType?: string, mimeType?: string): string => {
  const type = fileType?.toLowerCase() || '';
  const mime = mimeType?.toLowerCase() || '';
  
  // Documentos de texto
  if (type === 'document' || mime.includes('word') || mime.includes('doc')) {
    return '[DOC]';
  }
  
  // PDFs
  if (type === 'pdf' || mime.includes('pdf')) {
    return '[PDF]';
  }
  
  // Hojas de cálculo
  if (type === 'spreadsheet' || mime.includes('sheet') || mime.includes('excel')) {
    return '[XLS]';
  }
  
  // Presentaciones
  if (type === 'presentation' || mime.includes('presentation') || mime.includes('powerpoint')) {
    return '[PPT]';
  }
  
  // Archivos de texto
  if (type === 'text' || mime.includes('text')) {
    return '[TXT]';
  }
  
  // Archivos comprimidos
  if (type === 'archive' || mime.includes('zip') || mime.includes('rar')) {
    return '[ZIP]';
  }
  
  // Por defecto
  return '[FILE]';
};

/**
 * Formatea el tamaño de archivo de forma legible
 */
const formatAttachmentFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const renderInlineContent = (content: any): React.ReactNode => {
  if (typeof content === 'string') {
    return content || null;
  }
  
  if (Array.isArray(content)) {
    const renderedItems = content.map((item, index) => {
      if (typeof item === 'string') {
        return item || null;
      }
      
      if (item.type === 'text') {
        const text = item.text || '';
        if (!text.trim()) return null;
        
        // Aplicar estilos según las propiedades del texto
        const textStyles: any = { 
          fontSize: 12, 
          color: '#000000', // Color negro por defecto
          lineHeight: 1.4 // Reducir espacio entre líneas
        };
        
        if (item.styles) {
          if (item.styles.bold) textStyles.fontWeight = 'bold';
          if (item.styles.italic) textStyles.fontStyle = 'italic';
          if (item.styles.underline) textStyles.textDecoration = 'underline';
          if (item.styles.strikethrough) textStyles.textDecoration = 'line-through';
          if (item.styles.code) {
            textStyles.fontFamily = 'Courier';
            textStyles.backgroundColor = '#F1F3F4';
            textStyles.padding = 2;
            textStyles.borderRadius = 3;
            textStyles.fontSize = 11;
          }
          
          // Manejo de colores - aplicar solo si no es 'default'
          if (item.styles.textColor && item.styles.textColor !== 'default') {
            textStyles.color = item.styles.textColor;
          }
          if (item.styles.backgroundColor && item.styles.backgroundColor !== 'default') {
            textStyles.backgroundColor = item.styles.backgroundColor;
          }
        }
        
        // Renderizar como componente Text con estilos
        return <Text key={index} style={textStyles}>{text}</Text>;
      }
      
      if (item.text) {
        const text = item.text || '';
        if (!text.trim()) return null;
        return <Text key={index} style={{ fontSize: 12, color: '#000000', lineHeight: 1.4 }}>{text}</Text>;
      }
      
      return null;
    }).filter(item => item !== null && item !== '');
    
    // Si solo hay un elemento y es texto simple, devolverlo directamente
    if (renderedItems.length === 1 && typeof renderedItems[0] === 'string') {
      return renderedItems[0];
    }
    
    return renderedItems;
  }
  
  if (content && typeof content === 'object') {
    if (content.text) {
      const text = content.text || '';
      if (!text.trim()) return null;
      return text;
    }
    if (content.content) {
      return renderInlineContent(content.content);
    }
  }
  
  return null;
};

const renderTable = (block: PDFContentBlock, index: number): React.ReactElement => {
  if (!block.content || !Array.isArray(block.content)) {
    return <View key={index} />;
  }
  
  return (
    <View key={index} style={styles.table}>
      {block.content.map((row: any, rowIndex: number) => (
        <View 
          key={rowIndex} 
          style={rowIndex === 0 ? [styles.tableRow, styles.tableHeaderRow] : styles.tableRow}
        >
          {row.content && row.content.map((cell: any, cellIndex: number) => (
            <Text 
              key={cellIndex} 
              style={rowIndex === 0 ? [styles.tableCell, styles.tableHeaderCell] : styles.tableCell}
            >
              {renderInlineContent(cell)}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};

const renderImage = (block: PDFContentBlock, index: number): React.ReactElement => {
  if (block.type !== 'image') {
    return <View key={index} />;
  }
  
  const src = (block.props as any)?.url || '';
  const alt = (block.props as any)?.alt || '';
  const caption = (block.props as any)?.caption || '';
  
  if (!src) {
    return <View key={index} />;
  }
  
  // Verificar si es una imagen de Supabase Storage o externa
  const isSupabaseImage = src.includes('supabase.co') || src.includes('supabase');
  const isExternalImage = src.startsWith('http') && !isSupabaseImage && !src.includes('localhost');
  
  return (
    <View key={index} style={{ marginVertical: 12, alignItems: 'center' }}>
      {isExternalImage ? (
        // Para imágenes externas, mostrar un placeholder debido a problemas de CORS
        <View style={{
          width: 300,
          height: 200,
          backgroundColor: '#F1F3F4',
          border: '1pt dashed #D1D5DB',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <Text style={{ 
            fontSize: 10, 
            color: '#6B7280', 
            textAlign: 'center',
            marginBottom: 8
          }}>
            Imagen Externa
          </Text>
          <Text style={{ 
            fontSize: 8, 
            color: '#9CA3AF', 
            textAlign: 'center'
          }}>
            {src.length > 60 ? `${src.substring(0, 60)}...` : src}
          </Text>
        </View>
      ) : (
        // Para imágenes de Supabase o locales, intentar renderizar
        <Image 
          src={src} 
          style={{ 
            maxWidth: 500, 
            maxHeight: 300,
            objectFit: 'contain'
          }} 
        />
      )}
      {(alt || caption) && (
        <Text style={{ 
          fontSize: 10, 
          color: '#6B7280', 
          marginTop: 4,
          textAlign: 'center'
        }}>
          {caption || alt}
        </Text>
      )}
    </View>
  );
};

/**
 * Renderiza la sección de adjuntos del documento (solo documentos, no imágenes)
 */
// =================== COMPONENTE PDF ===================

// =================== PREPROCESAMIENTO DE BLOQUES ===================

/**
 * Preprocesa el documento completo aplicando syntax highlighting a bloques de código
 */
const preprocessDocumentWithSyntaxHighlighting = async (
  document: BlockNoteDocument
): Promise<BlockNoteDocument> => {
  try {
    console.log('🎨 [PDF] Iniciando preprocesamiento con syntax highlighting...');
    
    if (!document.content || !Array.isArray(document.content)) {
      console.warn('⚠️ [PDF] Documento sin contenido válido');
      return document;
    }

    // Procesar todos los bloques de código
    const processedContent = await Promise.all(
      document.content.map(async (block: any) => {
        if (block.type === 'codeBlock') {
          const language = block.props?.language || '';
          const codeContent = extractTextFromContent(block.content);
          
          if (codeContent.trim()) {
            try {
              const syntaxTokens = await processCodeWithSyntaxHighlighting(codeContent, language);
              
              // Agregar tokens al bloque
              return {
                ...block,
                syntaxTokens,
                isProcessed: true
              };
            } catch (error) {
              console.warn('⚠️ [PDF] Error procesando bloque de código:', error);
              return block; // Retornar bloque original en caso de error
            }
          }
        }
        
        return block; // Retornar bloques no-código sin modificar
      })
    );

    console.log('✅ [PDF] Preprocesamiento completado');
    
    return {
      ...document,
      content: processedContent as PDFContentBlock[]
    };
    
  } catch (error) {
    console.error('❌ [PDF] Error en preprocesamiento:', error);
    return document; // Retornar documento original en caso de error
  }
};

// =================== COMPONENTE PDF ===================

interface PDFDocumentProps {
  document: BlockNoteDocument;
  attachments?: any[];
  options?: PDFExportOptions;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ document, attachments = [] }) => {
  // Debug: Verificar estructura del documento
  console.log('📋 [PDF Debug] Estructura del documento:', {
    title: document.title,
    hasTags: !!document.tags,
    tagsLength: Array.isArray(document.tags) ? document.tags.length : 'No es array',
    tagsContent: document.tags,
    tagsType: typeof document.tags,
    category: document.category,
    difficulty_level: (document as any).difficulty_level,
    solution_type: (document as any).solution_type,
    estimated_solution_time: (document as any).estimated_solution_time,
    case_reference: (document as any).case_reference,
    allKeys: Object.keys(document || {})
  });

  const formatComplexity = (complexity: number): string => {
    const stars = '*'.repeat(complexity);
    return `${stars} (${complexity}/5)`;
  };

  const formatEstimatedTime = (time: number): string => {
    if (time < 60) {
      return `${time} minutos`;
    }
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours} horas`;
  };

  /**
   * Función auxiliar para obtener valor de un campo que puede estar en diferentes formatos
   */
  const getFieldValue = (fieldName: string): string | null => {
    const value = (document as any)[fieldName];
    if (!value) return null;
    
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'object' && value.name) return value.name;
    if (typeof value === 'object' && value.label) return value.label;
    
    return String(value);
  };

  // Filtrar adjuntos para obtener solo documentos (no imágenes)
  const documentAttachments = attachments.filter(attachment => {
    const mimeType = attachment.mime_type || '';
    const fileType = attachment.file_type || '';
    
    // Excluir imágenes y archivos embebidos
    return !mimeType.startsWith('image/') && 
           fileType !== 'image' && 
           !attachment.is_embedded;
  });

  return (
    <Document>
      {/* Página principal con contenido */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {document.title || 'Documento Sin Título'}
          </Text>
        </View>

        {/* Cuadro de información mejorado */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Información del Documento</Text>
          
          {document.created_by && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Creado por:</Text>
              <Text style={styles.metadataValue}>{document.created_by}</Text>
            </View>
          )}
          
          {document.category && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Categoría:</Text>
              <Text style={styles.metadataValue}>{document.category}</Text>
            </View>
          )}

          {/* Número de caso relacionado */}
          {(() => {
            const caseNumber = (document as any).caseNumber || 
                             (document as any).case_number || 
                             (document as any).numero_caso ||
                             (document as any).case_reference;
            
            // Fallback: Extraer del título si empieza con código de caso
            let finalCaseNumber = caseNumber;
            if (!finalCaseNumber && document.title) {
              const titleMatch = document.title.match(/^([A-Z]{2}\d+)/);
              if (titleMatch) {
                finalCaseNumber = titleMatch[1];
              }
            }
            
            if (finalCaseNumber) {
              return (
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Caso Relacionado:</Text>
                  <Text style={styles.metadataValue}>{finalCaseNumber}</Text>
                </View>
              );
            }
            
            return null;
          })()}

          {getFieldValue('estimated_solution_time') && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Tiempo Estimado:</Text>
              <Text style={styles.metadataValue}>
                {formatEstimatedTime(Number(getFieldValue('estimated_solution_time')))} 
              </Text>
            </View>
          )}

          {getFieldValue('status') && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Estado:</Text>
              <Text style={styles.metadataValue}>{getFieldValue('status')}</Text>
            </View>
          )}

          {getFieldValue('priority') && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Prioridad:</Text>
              <Text style={styles.metadataValue}>{getFieldValue('priority')}</Text>
            </View>
          )}
          
          {(document as any).complexity && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Complejidad:</Text>
              <Text style={styles.metadataValue}>{formatComplexity((document as any).complexity)}</Text>
            </View>
          )}
          
          {(document as any).estimated_time && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Tiempo est.:</Text>
              <Text style={styles.metadataValue}>{formatEstimatedTime((document as any).estimated_time)}</Text>
            </View>
          )}
          
          {/* Renderizado de etiquetas mejorado */}
          {(() => {
            const tags = document.tags;
            let tagsToDisplay: string[] = [];
            
            if (tags) {
              if (Array.isArray(tags)) {
                tagsToDisplay = tags.map(tag => {
                  if (typeof tag === 'string') return tag;
                  if (typeof tag === 'object' && tag !== null) {
                    return (tag as any).name || (tag as any).label || (tag as any).text || '';
                  }
                  return String(tag);
                }).filter(Boolean);
              } else if (typeof tags === 'string') {
                // Si es string, puede ser JSON o separado por comas
                try {
                  const parsed = JSON.parse(tags);
                  if (Array.isArray(parsed)) {
                    tagsToDisplay = parsed.map(t => String(t)).filter(Boolean);
                  } else {
                    tagsToDisplay = [String(tags)];
                  }
                } catch {
                  // Si no es JSON, asumir que es separado por comas
                  tagsToDisplay = String(tags).split(',').map((t: string) => t.trim()).filter(Boolean);
                }
              }
            }
            
            console.log('🏷️ [PDF Debug] Etiquetas procesadas:', tagsToDisplay);
            
            return tagsToDisplay.length > 0 ? (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Etiquetas:</Text>
                <Text style={styles.metadataValue}>
                  {tagsToDisplay.join(', ')}
                </Text>
              </View>
            ) : null;
          })()}

          {document.created_at && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Fecha:</Text>
              <Text style={styles.metadataValue}>
                {new Date(document.created_at).toLocaleDateString('es-ES')}
              </Text>
            </View>
          )}
        </View>

        {/* Contenido */}
        <View style={styles.content}>
          {document.content && Array.isArray(document.content) && (() => {
            // Crear un contador para listas numeradas
            const numberedListCounter = { value: 1 };
            let isInNumberedList = false;
            
            return document.content.map((block: PDFContentBlock, index: number) => {
              // Resetear contador si salimos de una lista numerada
              if (block.type !== 'numberedListItem' && isInNumberedList) {
                numberedListCounter.value = 1;
                isInNumberedList = false;
              }
              
              // Marcar si entramos en una lista numerada
              if (block.type === 'numberedListItem') {
                isInNumberedList = true;
              }
              
              return renderBlock(block, index, numberedListCounter);
            });
          })()}
        </View>

        {/* Footer de la página principal */}
        <Text style={styles.footer}>
          Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
        </Text>
      </Page>

      {/* Página separada para adjuntos (solo si hay documentos adjuntos) */}
      {documentAttachments.length > 0 && (
        <Page size="A4" style={styles.page}>
          {/* Header de la página de adjuntos */}
          <View style={styles.header}>
            <Text style={styles.title}>Adjuntos del Documento</Text>
          </View>

          {/* Información del documento original */}
          <View style={styles.attachmentPageInfo}>
            <Text style={styles.attachmentPageTitle}>
              Documento: {document.title || 'Sin título'}
            </Text>
          </View>

          {/* Lista de adjuntos */}
          <View style={styles.attachmentsSection}>
            {documentAttachments.map((attachment, index) => (
              <View key={index} style={styles.attachmentItem}>
                <Text style={styles.attachmentIcon}>
                  {getAttachmentIcon(attachment.file_type, attachment.mime_type)}
                </Text>
                <View style={styles.attachmentInfo}>
                  <Text style={styles.attachmentName}>
                    {attachment.file_name}
                  </Text>
                  <Text style={styles.attachmentDetails}>
                    Tipo: {attachment.file_type || 'Documento'}  •  
                    Tamaño: {formatAttachmentFileSize(attachment.file_size || 0)}  •  
                    Subido: {new Date(attachment.created_at).toLocaleDateString('es-ES')}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Footer de la página de adjuntos */}
          <Text style={styles.footer}>
            Página de adjuntos - Generado el {new Date().toLocaleDateString('es-ES')}
          </Text>
        </Page>
      )}
    </Document>
  );
};

// =================== FUNCIONES PRINCIPALES ===================

/**
 * Función principal para descargar PDF
 */
export const downloadPDF = async (
  document: BlockNoteDocument, 
  options: PDFExportOptions = {}
): Promise<void> => {
  try {
    console.log('📄 [PDF] Iniciando generación PDF con syntax highlighting...');
    
    // Preprocesar documento con syntax highlighting
    const preprocessedDocument = await preprocessDocumentWithSyntaxHighlighting(document);
    
    // Enriquecer documento con nombres de usuario
    const enrichedDocument = await enrichDocumentData(preprocessedDocument);
    
    // Obtener adjuntos del documento
    const attachments = document.id ? await getDocumentAttachments(document.id) : [];
    
    console.log('🔄 [PDF] Generando blob PDF...');
    
    // Generar PDF
    const blob = await pdf(<PDFDocument document={enrichedDocument} attachments={attachments} options={options} />).toBlob();
    
    // Determinar nombre del archivo
    const filename = options.fileName || 
                    (enrichedDocument.title ? `${enrichedDocument.title}.pdf` : 'documento.pdf');
    
    console.log('✅ [PDF] PDF generado correctamente:', filename);
    
    // Descargar
    saveAs(blob, filename);
    
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    throw new Error(`Error al generar PDF: ${error}`);
  }
};

/**
 * Función fallback para documentos simples
 */
export const createFallbackPDF = async (
  title: string = 'Documento',
  content: string = 'Sin contenido disponible'
): Promise<void> => {
  try {
    const fallbackDocument: BlockNoteDocument = {
      id: 'fallback-doc',
      title,
      content: [
        {
          id: 'fallback-1',
          type: 'paragraph',
          content: [{ text: content, type: 'text', styles: {} }],
          props: {},
          children: []
        }
      ],
      created_at: new Date().toISOString(),
      created_by: 'Sistema'
    };
    
    await downloadPDF(fallbackDocument, { fileName: `${title}.pdf` });
    
  } catch (error) {
    console.error('❌ Error generando PDF fallback:', error);
    throw new Error(`Error al generar PDF fallback: ${error}`);
  }
};

/**
 * Función para obtener vista previa (opcional - para futuras implementaciones)
 */
export const getPDFPreview = async (
  document: BlockNoteDocument, 
  options: PDFExportOptions = {}
): Promise<string> => {
  try {
    console.log('👁️ [PDF Preview] Generando vista previa con syntax highlighting...');
    
    // Preprocesar documento con syntax highlighting
    const preprocessedDocument = await preprocessDocumentWithSyntaxHighlighting(document);
    
    const enrichedDocument = await enrichDocumentData(preprocessedDocument);
    
    // Obtener adjuntos del documento
    const attachments = document.id ? await getDocumentAttachments(document.id) : [];
    
    const blob = await pdf(<PDFDocument document={enrichedDocument} attachments={attachments} options={options} />).toBlob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('❌ Error generando vista previa PDF:', error);
    throw new Error(`Error al generar vista previa: ${error}`);
  }
};

// Exportación por defecto
export default {
  downloadPDF,
  createFallbackPDF,
  getPDFPreview
};

// Exportaciones adicionales para debugging y testing
export {
  processCodeWithSyntaxHighlighting,
  preprocessDocumentWithSyntaxHighlighting
};
