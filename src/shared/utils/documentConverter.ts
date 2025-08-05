/**
 * =================================================================
 * CONVERTIDOR DE DOCUMENTOS - BLOCKNOTE A PDF
 * =================================================================
 * Descripción: Convierte documentos entre formatos BlockNote y estructura PDF
 * Versión: 2.0
 * Fecha: 5 de Agosto, 2025
 * =================================================================
 */

import { BlockNoteDocument } from '../../types/blocknotePdf';

// Convertidor mejorado de documentos
export const convertToBlockNoteDocument = (data: any): BlockNoteDocument => {
  console.log('DocumentConverter: Converting to BlockNote format', data);
  
  // Si ya es un documento válido, devolverlo
  if (data && data.content && Array.isArray(data.content)) {
    return {
      id: data.id || 'unknown',
      title: data.title || 'Documento sin título',
      content: data.content,
      created_by: data.created_by || data.created_by_profile?.fullName || data.created_by_profile?.email,
      created_at: data.created_at,
      updated_at: data.updated_at,
      category: data.category || data.solution_type,
      tags: data.tags || [],
      difficulty_level: data.difficulty_level,
      solution_type: data.solution_type,
      estimated_solution_time: data.estimated_solution_time,
      case_reference: data.case_id || data.archived_case_id,
    };
  }
  
  // Si es texto plano, crear estructura básica
  if (typeof data === 'string') {
    return {
      id: 'converted-doc',
      title: 'Documento Convertido',
      content: [
        {
          id: 'paragraph-1',
          type: 'paragraph',
          props: {},
          content: [
            {
              text: data,
              type: 'text',
              styles: {}
            }
          ],
          children: []
        }
      ],
      created_by: 'Sistema',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  
  // Si es un objeto con propiedades de documento
  return {
    id: data.id || 'unknown',
    title: data.title || 'Documento sin título',
    content: [
      {
        id: 'converted-paragraph',
        type: 'paragraph',
        props: {},
        content: [
          {
            text: JSON.stringify(data, null, 2),
            type: 'text',
            styles: { code: true }
          }
        ],
        children: []
      }
    ],
    created_by: data.created_by || 'Usuario desconocido',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    category: data.category || 'General',
    tags: data.tags || [],
    difficulty_level: data.difficulty_level || 1,
    solution_type: data.solution_type || 'document',
  };
};

export const convertFromBlockNoteDocument = (doc: BlockNoteDocument): string => {
  console.log('DocumentConverter: Converting from BlockNote format', doc);
  
  if (!doc.content) return '';
  
  return doc.content
    .map((block: any) => {
      if (block.content) {
        return block.content
          .map((content: any) => content.text || '')
          .join('');
      }
      return '';
    })
    .join('\n');
};
