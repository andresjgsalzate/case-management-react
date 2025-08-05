// Convertidor temporal de documentos
export interface BlockNoteDocument {
  content: any[];
  version: string;
}

export const convertToBlockNoteDocument = (data: any): BlockNoteDocument => {
  // Implementación temporal - convierte cualquier data a formato BlockNote básico
  console.log('DocumentConverter: Converting to BlockNote format', data);
  
  return {
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: typeof data === 'string' ? data : JSON.stringify(data)
          }
        ]
      }
    ],
    version: "1.0.0"
  };
};

export const convertFromBlockNoteDocument = (doc: BlockNoteDocument): string => {
  // Implementación temporal - extrae texto del documento BlockNote
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
