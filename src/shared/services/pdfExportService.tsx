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
    console.log('🔍 Obteniendo nombre para usuario:', userId);
    
    if (!isValidUUID(userId)) {
      console.log('📝 No es UUID, usando valor directo:', userId);
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
      console.log('✅ Usuario encontrado:', displayName);
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
    console.log('📎 Obteniendo adjuntos para documento:', documentId);
    
    const { data: attachments, error } = await supabase
      .from('document_attachments')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error obteniendo adjuntos:', error);
      return [];
    }
    
    console.log(`✅ Encontrados ${attachments?.length || 0} adjuntos`);
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
    padding: 16,
    marginBottom: 20
  },
  
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#374151'
  },
  
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center'
  },
  
  metadataLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6B7280',
    width: 80,
    marginRight: 8
  },
  
  metadataValue: {
    fontSize: 11,
    color: '#111827',
    flex: 1
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
  }
});

// =================== RENDERIZADO DE BLOQUES ===================

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
      const language = block.props?.language || '';
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
 * Renderiza la sección de adjuntos del documento
 */
const renderAttachmentsSection = (attachments: any[]): React.ReactElement | null => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const getFileIcon = (fileType: string, mimeType: string): string => {
    if (fileType === 'image' || mimeType?.startsWith('image/')) return '[IMG]';
    if (fileType === 'document' || mimeType?.includes('pdf')) return '[DOC]';
    if (fileType === 'spreadsheet' || mimeType?.includes('sheet')) return '[XLS]';
    if (mimeType?.startsWith('video/')) return '[VID]';
    if (mimeType?.startsWith('audio/')) return '[AUD]';
    return '[FILE]';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View style={styles.attachmentsSection}>
      <Text style={styles.attachmentsTitle}>Adjuntos del Documento</Text>
      {attachments.map((attachment, index) => (
        <View key={index} style={styles.attachmentItem}>
          <Text style={styles.attachmentIcon}>
            {getFileIcon(attachment.file_type, attachment.mime_type)}
          </Text>
          <View style={styles.attachmentInfo}>
            <Text style={styles.attachmentName}>
              {attachment.file_name}
            </Text>
            <Text style={styles.attachmentDetails}>
              Tipo: {attachment.file_type || 'Desconocido'} • 
              Tamaño: {formatFileSize(attachment.file_size || 0)} • 
              Subido: {new Date(attachment.created_at).toLocaleDateString('es-ES')}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

// =================== COMPONENTE PDF ===================

interface PDFDocumentProps {
  document: BlockNoteDocument;
  attachments?: any[];
  options?: PDFExportOptions;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ document, attachments = [] }) => {
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

  return (
    <Document>
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
          
          {document.tags && document.tags.length > 0 && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Etiquetas:</Text>
              <Text style={styles.metadataValue}>{document.tags.join(', ')}</Text>
            </View>
          )}
          
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

        {/* Sección de adjuntos */}
        {attachments.length > 0 && renderAttachmentsSection(attachments)}

        {/* Footer */}
        <Text style={styles.footer}>
          Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
        </Text>
      </Page>
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
    console.log('🚀 Iniciando exportación PDF...');
    
    // Enriquecer documento con nombres de usuario
    const enrichedDocument = await enrichDocumentData(document);
    console.log('✅ Documento enriquecido:', enrichedDocument);
    
    // Obtener adjuntos del documento
    const attachments = document.id ? await getDocumentAttachments(document.id) : [];
    console.log(`📎 Adjuntos encontrados: ${attachments.length}`);
    
    // Generar PDF
    const blob = await pdf(<PDFDocument document={enrichedDocument} attachments={attachments} options={options} />).toBlob();
    
    // Determinar nombre del archivo
    const filename = options.fileName || 
                    (enrichedDocument.title ? `${enrichedDocument.title}.pdf` : 'documento.pdf');
    
    // Descargar
    saveAs(blob, filename);
    console.log('✅ PDF descargado exitosamente:', filename);
    
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
    console.log('🔄 Generando PDF fallback...');
    
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
    console.log('✅ PDF fallback generado exitosamente');
    
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
    const enrichedDocument = await enrichDocumentData(document);
    
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
