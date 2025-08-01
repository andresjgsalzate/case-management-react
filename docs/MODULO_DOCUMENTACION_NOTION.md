# 📚 Módulo de Documentación tipo Notion - Especificación Técnica

## 📑 **Información del Documento**

| Campo | Valor |
|-------|-------|
| **Documento** | Especificación Técnica - Módulo Documentación |
| **Versión** | 1.0 |
| **Fecha** | 1 de Agosto, 2025 |
| **Proyecto** | Sistema de Gestión de Casos - case-management-react |
| **Estado** | Especificación - Pendiente de Implementación |

---

## 🎯 **Resumen Ejecutivo**

### **Propósito**
Implementar un módulo de documentación estructurada tipo Notion para crear, gestionar y mantener una base de conocimiento de soluciones de casos, permitiendo al equipo documentar procedimientos, soluciones y mejores prácticas de manera organizada y accesible.

### **Objetivos Estratégicos**
- **📚 Base de Conocimiento**: Centralizar soluciones y procedimientos documentados
- **⚡ Reducción de Tiempo**: Reutilizar soluciones documentadas para casos similares
- **🎓 Onboarding**: Facilitar el aprendizaje de nuevos miembros del equipo
- **📈 Mejora Continua**: Sistema de feedback para optimizar documentación

---

## 🏗️ **Arquitectura de Integración**

### **Integración con Sistema Existente**
El módulo se integra perfectamente con la arquitectura actual:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA CASE MANAGEMENT                     │
├─────────────────┬───────────────────────────┬───────────────────┤
│   MÓDULO CASOS  │    MÓDULO DOCUMENTACIÓN   │  MÓDULO NOTAS     │
│                 │                           │                   │
│  • Gestión CRUD │  • Editor tipo Notion     │  • Notas rápidas  │
│  • Clasificación│  • Templates              │  • Comentarios    │
│  • Control      │  • Versionado             │  • Búsquedas      │
│                 │  • Base Conocimiento      │                   │
└─────────────────┴───────────────────────────┴───────────────────┘
                    │                         │
                    │   SHARED COMPONENTS     │
                    │                         │
                    │  • Supabase DB          │
                    │  • Authentication       │
                    │  • RLS Policies         │
                    │  • React Query          │
                    │  • TypeScript Types     │
                    └─────────────────────────┘
```

---

## 🗄️ **Diseño de Base de Datos**

### **Nuevas Tablas**

#### **1. solution_documents**
```sql
CREATE TABLE solution_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Contenido estructurado en bloques
  case_id UUID REFERENCES cases(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_solution_time INTEGER, -- en minutos
  is_template BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_solution_documents_case_id ON solution_documents(case_id);
CREATE INDEX idx_solution_documents_created_by ON solution_documents(created_by);
CREATE INDEX idx_solution_documents_tags ON solution_documents USING GIN(tags);
CREATE INDEX idx_solution_documents_category ON solution_documents(category);
CREATE INDEX idx_solution_documents_published ON solution_documents(is_published);
```

#### **2. solution_document_versions**
```sql
CREATE TABLE solution_document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES solution_documents(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version INTEGER NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_versions_document_id ON solution_document_versions(document_id);
CREATE INDEX idx_versions_version ON solution_document_versions(document_id, version);
```

#### **3. solution_feedback**
```sql
CREATE TABLE solution_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES solution_documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  was_helpful BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevenir múltiples feedbacks del mismo usuario
  UNIQUE(document_id, user_id)
);

-- Índices
CREATE INDEX idx_feedback_document_id ON solution_feedback(document_id);
CREATE INDEX idx_feedback_rating ON solution_feedback(rating);
```

#### **4. solution_categories**
```sql
CREATE TABLE solution_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6B7280', -- Color hex para UI
  icon TEXT, -- Nombre del ícono de Heroicons
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Datos iniciales
INSERT INTO solution_categories (name, description, color, icon, created_by) VALUES
('Errores de Sistema', 'Problemas técnicos y bugs del sistema', '#EF4444', 'ExclamationTriangleIcon', (SELECT id FROM auth.users LIMIT 1)),
('Configuración', 'Procedimientos de configuración y setup', '#3B82F6', 'CogIcon', (SELECT id FROM auth.users LIMIT 1)),
('Integración', 'Problemas de integración con sistemas externos', '#8B5CF6', 'LinkIcon', (SELECT id FROM auth.users LIMIT 1)),
('Performance', 'Optimización y mejoras de rendimiento', '#10B981', 'BoltIcon', (SELECT id FROM auth.users LIMIT 1)),
('Seguridad', 'Procedimientos de seguridad y acceso', '#F59E0B', 'ShieldCheckIcon', (SELECT id FROM auth.users LIMIT 1)),
('Datos', 'Manipulación y corrección de datos', '#6366F1', 'CircleStackIcon', (SELECT id FROM auth.users LIMIT 1));
```

### **Row Level Security (RLS)**
```sql
-- Habilitar RLS
ALTER TABLE solution_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_categories ENABLE ROW LEVEL SECURITY;

-- Políticas para solution_documents
CREATE POLICY "Users can view published documents" ON solution_documents
  FOR SELECT USING (is_published = true OR created_by = auth.uid());

CREATE POLICY "Users can create documents" ON solution_documents
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own documents" ON solution_documents
  FOR UPDATE USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can manage all documents" ON solution_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'Admin'
    )
  );

-- Políticas similares para otras tablas...
```

---

## 📝 **Tipos TypeScript**

### **Interfaces Principales**
```typescript
// Bloque de contenido tipo Notion
export interface ContentBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'code' | 'list' | 'image' | 'divider' | 'callout' | 'table';
  content: string;
  metadata?: {
    level?: number; // Para headings (1-6)
    language?: string; // Para code blocks
    listType?: 'ordered' | 'unordered'; // Para listas
    calloutType?: 'info' | 'warning' | 'error' | 'success';
    imageUrl?: string; // Para imágenes
    imageAlt?: string;
    tableHeaders?: string[];
    tableRows?: string[][];
  };
  children?: ContentBlock[];
}

export interface SolutionDocument {
  id: string;
  title: string;
  content: ContentBlock[];
  caseId?: string;
  createdBy: string;
  updatedBy?: string;
  tags: string[];
  category?: string;
  difficultyLevel: number;
  estimatedSolutionTime?: number;
  isTemplate: boolean;
  isPublished: boolean;
  version: number;
  viewCount: number;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  // Relaciones pobladas
  case?: Case;
  createdByUser?: User;
  updatedByUser?: User;
  feedback?: SolutionFeedback[];
  avgRating?: number;
  categoryInfo?: SolutionCategory;
}

export interface SolutionDocumentVersion {
  id: string;
  documentId: string;
  content: ContentBlock[];
  version: number;
  createdBy: string;
  changeSummary?: string;
  createdAt: string;
  createdByUser?: User;
}

export interface SolutionFeedback {
  id: string;
  documentId: string;
  userId: string;
  rating?: number;
  comment?: string;
  wasHelpful: boolean;
  createdAt: string;
  user?: User;
}

export interface SolutionCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  documentCount?: number;
}

// Formularios
export interface SolutionDocumentFormData {
  title: string;
  content: ContentBlock[];
  caseId?: string;
  tags: string[];
  category?: string;
  difficultyLevel: number;
  estimatedSolutionTime?: number;
  isTemplate: boolean;
  isPublished: boolean;
}

export interface SolutionFeedbackFormData {
  rating?: number;
  comment?: string;
  wasHelpful: boolean;
}

// Filtros y búsqueda
export interface SolutionDocumentFilters {
  search?: string;
  category?: string;
  tags?: string[];
  difficultyLevel?: number[];
  isTemplate?: boolean;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  minRating?: number;
}

export interface SolutionDocumentStats {
  totalDocuments: number;
  publishedDocuments: number;
  templatesCount: number;
  avgRating: number;
  totalViews: number;
  myDocuments: number;
  categoriesCount: number;
}
```

---

## 🎨 **Componentes de UI**

### **Estructura de Archivos**
```
src/components/documentation/
├── editor/
│   ├── DocumentationEditor.tsx      # Editor principal
│   ├── BlockEditor.tsx             # Editor de bloques individuales
│   ├── BlockRenderer.tsx           # Renderizado de bloques
│   ├── BlockToolbar.tsx            # Barra de herramientas
│   └── BlockTypes/
│       ├── HeadingBlock.tsx
│       ├── ParagraphBlock.tsx
│       ├── CodeBlock.tsx
│       ├── ListBlock.tsx
│       ├── CalloutBlock.tsx
│       ├── ImageBlock.tsx
│       ├── DividerBlock.tsx
│       └── TableBlock.tsx
├── viewer/
│   ├── DocumentationViewer.tsx     # Vista de lectura
│   ├── DocumentCard.tsx            # Tarjeta de documento
│   └── DocumentList.tsx            # Lista de documentos
├── search/
│   ├── DocumentationSearch.tsx     # Búsqueda principal
│   ├── SearchFilters.tsx           # Filtros de búsqueda
│   └── SearchResults.tsx           # Resultados de búsqueda
├── templates/
│   ├── TemplateSelector.tsx        # Selector de templates
│   ├── TemplateCard.tsx           # Tarjeta de template
│   └── TemplateForm.tsx           # Formulario de template
├── feedback/
│   ├── DocumentationFeedback.tsx   # Sistema de rating
│   ├── FeedbackForm.tsx           # Formulario de feedback
│   └── FeedbackList.tsx           # Lista de comentarios
├── categories/
│   ├── CategorySelector.tsx        # Selector de categorías
│   ├── CategoryBadge.tsx          # Badge de categoría
│   └── CategoryManager.tsx        # Gestión de categorías
└── modals/
    ├── DocumentModal.tsx          # Modal de documento
    ├── VersionHistoryModal.tsx    # Historial de versiones
    └── DeleteConfirmModal.tsx     # Confirmación de eliminación
```

### **Componente Principal - DocumentationEditor**
```tsx
import React, { useState, useCallback } from 'react';
import { PlusIcon, SaveIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '../Button';
import { Input } from '../Input';
import { Select } from '../Select';
import { BlockEditor } from './editor/BlockEditor';
import { CategorySelector } from './categories/CategorySelector';
import { useCreateSolutionDocument, useUpdateSolutionDocument } from '@/hooks/useSolutionDocuments';
import { useNotification } from '../NotificationSystem';
import { ContentBlock, SolutionDocumentFormData, SolutionDocument } from '@/types';

interface DocumentationEditorProps {
  document?: SolutionDocument;
  caseId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export const DocumentationEditor: React.FC<DocumentationEditorProps> = ({
  document,
  caseId,
  onSave,
  onCancel
}) => {
  const { showSuccess, showError } = useNotification();
  const createDocument = useCreateSolutionDocument();
  const updateDocument = useUpdateSolutionDocument();

  // Estado del formulario
  const [formData, setFormData] = useState<SolutionDocumentFormData>({
    title: document?.title || '',
    content: document?.content || [
      {
        id: crypto.randomUUID(),
        type: 'heading',
        content: 'Título del Documento',
        metadata: { level: 1 }
      }
    ],
    caseId: caseId || document?.caseId,
    tags: document?.tags || [],
    category: document?.category,
    difficultyLevel: document?.difficultyLevel || 1,
    estimatedSolutionTime: document?.estimatedSolutionTime,
    isTemplate: document?.isTemplate || false,
    isPublished: document?.isPublished || false
  });

  const [isPreview, setIsPreview] = useState(false);

  // Handlers
  const handleContentChange = useCallback((content: ContentBlock[]) => {
    setFormData(prev => ({ ...prev, content }));
  }, []);

  const handleSave = async () => {
    try {
      if (document) {
        await updateDocument.mutateAsync({
          id: document.id,
          ...formData
        });
        showSuccess('Documento actualizado exitosamente');
      } else {
        await createDocument.mutateAsync(formData);
        showSuccess('Documento creado exitosamente');
      }
      onSave?.();
    } catch (error) {
      showError('Error al guardar documento', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {document ? 'Editar Documento' : 'Nuevo Documento'}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPreview(!isPreview)}
              icon={EyeIcon}
            >
              {isPreview ? 'Editar' : 'Vista Previa'}
            </Button>
            <Button
              onClick={handleSave}
              loading={createDocument.isPending || updateDocument.isPending}
              icon={SaveIcon}
            >
              Guardar
            </Button>
          </div>
        </div>

        {/* Formulario de metadatos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Título del documento..."
            required
          />
          
          <CategorySelector
            value={formData.category}
            onChange={(category) => setFormData(prev => ({ ...prev, category }))}
          />
          
          <Select
            label="Nivel de Dificultad"
            value={formData.difficultyLevel}
            onChange={(value) => setFormData(prev => ({ ...prev, difficultyLevel: Number(value) }))}
            options={[
              { value: 1, label: '⭐ Muy Fácil' },
              { value: 2, label: '⭐⭐ Fácil' },
              { value: 3, label: '⭐⭐⭐ Medio' },
              { value: 4, label: '⭐⭐⭐⭐ Difícil' },
              { value: 5, label: '⭐⭐⭐⭐⭐ Muy Difícil' }
            ]}
          />
          
          <Input
            label="Tiempo Estimado (minutos)"
            type="number"
            value={formData.estimatedSolutionTime || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              estimatedSolutionTime: e.target.value ? Number(e.target.value) : undefined 
            }))}
            placeholder="Ej: 30"
          />
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-4 mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isTemplate}
              onChange={(e) => setFormData(prev => ({ ...prev, isTemplate: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Es un template</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Publicar</span>
          </label>
        </div>
      </div>

      {/* Editor de contenido */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <BlockEditor
          content={formData.content}
          onChange={handleContentChange}
          isPreview={isPreview}
        />
      </div>
    </div>
  );
};
```

---

## 🔌 **Hooks y Servicios**

### **Hook Principal - useSolutionDocuments**
```typescript
// src/hooks/useSolutionDocuments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SolutionDocument, SolutionDocumentFormData, SolutionDocumentFilters } from '@/types';

const QUERY_KEYS = {
  documents: 'solution-documents',
  document: 'solution-document',
  categories: 'solution-categories',
  feedback: 'solution-feedback',
  stats: 'solution-stats'
};

// Obtener documentos con filtros
export const useSolutionDocuments = (filters?: SolutionDocumentFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.documents, filters],
    queryFn: async () => {
      let query = supabase
        .from('solution_documents')
        .select(`
          *,
          case:cases(id, numeroCaso, descripcion),
          createdByUser:user_profiles!created_by(id, fullName, email),
          categoryInfo:solution_categories!category(id, name, color, icon),
          feedback:solution_feedback(rating, wasHelpful)
        `)
        .order('updated_at', { ascending: false });

      // Aplicar filtros
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters?.isTemplate !== undefined) {
        query = query.eq('is_template', filters.isTemplate);
      }
      
      if (filters?.difficultyLevel && filters.difficultyLevel.length > 0) {
        query = query.in('difficulty_level', filters.difficultyLevel);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Calcular rating promedio para cada documento
      return data?.map(doc => ({
        ...doc,
        avgRating: doc.feedback?.length > 0 
          ? doc.feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / doc.feedback.length
          : null
      })) || [];
    }
  });
};

// Obtener documento por ID
export const useSolutionDocument = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.document, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solution_documents')
        .select(`
          *,
          case:cases(id, numeroCaso, descripcion),
          createdByUser:user_profiles!created_by(id, fullName, email),
          updatedByUser:user_profiles!updated_by(id, fullName, email),
          categoryInfo:solution_categories!category(id, name, color, icon),
          feedback:solution_feedback(
            id, rating, comment, wasHelpful, createdAt,
            user:user_profiles(id, fullName, email)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Calcular estadísticas
      const avgRating = data.feedback?.length > 0 
        ? data.feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / data.feedback.length
        : null;
      
      return { ...data, avgRating };
    },
    enabled: !!id
  });
};

// Crear documento
export const useCreateSolutionDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: SolutionDocumentFormData) => {
      const { data: result, error } = await supabase
        .from('solution_documents')
        .insert([{
          ...data,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.documents] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.stats] });
    }
  });
};

// Actualizar documento
export const useUpdateSolutionDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<SolutionDocumentFormData>) => {
      // Incrementar versión y guardar historial si el contenido cambió
      const currentDoc = await supabase
        .from('solution_documents')
        .select('content, version')
        .eq('id', id)
        .single();
      
      let newVersion = currentDoc.data?.version || 1;
      
      if (data.content && JSON.stringify(data.content) !== JSON.stringify(currentDoc.data?.content)) {
        newVersion++;
        
        // Guardar versión anterior
        await supabase
          .from('solution_document_versions')
          .insert([{
            document_id: id,
            content: currentDoc.data?.content,
            version: currentDoc.data?.version,
            created_by: (await supabase.auth.getUser()).data.user?.id
          }]);
      }
      
      const { data: result, error } = await supabase
        .from('solution_documents')
        .update({
          ...data,
          version: newVersion,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.documents] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.document, variables.id] });
    }
  });
};

// Estadísticas
export const useSolutionDocumentStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.stats],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_solution_document_stats');
      if (error) throw error;
      return data;
    }
  });
};
```

---

## 🔍 **Funciones de Base de Datos**

### **Función para Estadísticas**
```sql
CREATE OR REPLACE FUNCTION get_solution_document_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  user_id uuid;
BEGIN
  user_id := auth.uid();
  
  SELECT jsonb_build_object(
    'totalDocuments', (SELECT COUNT(*) FROM solution_documents WHERE is_published = true),
    'publishedDocuments', (SELECT COUNT(*) FROM solution_documents WHERE is_published = true),
    'templatesCount', (SELECT COUNT(*) FROM solution_documents WHERE is_template = true AND is_published = true),
    'avgRating', (
      SELECT COALESCE(AVG(rating), 0)
      FROM solution_feedback sf
      JOIN solution_documents sd ON sf.document_id = sd.id
      WHERE sd.is_published = true AND sf.rating IS NOT NULL
    ),
    'totalViews', (SELECT COALESCE(SUM(view_count), 0) FROM solution_documents WHERE is_published = true),
    'myDocuments', (SELECT COUNT(*) FROM solution_documents WHERE created_by = user_id),
    'categoriesCount', (SELECT COUNT(*) FROM solution_categories WHERE is_active = true)
  ) INTO result;
  
  RETURN result;
END;
$$;
```

### **Función para Búsqueda Full-Text**
```sql
CREATE OR REPLACE FUNCTION search_solution_documents(
  search_term text,
  category_filter text DEFAULT NULL,
  difficulty_filter integer[] DEFAULT NULL,
  limit_count integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  title text,
  content jsonb,
  category text,
  difficulty_level integer,
  tags text[],
  avg_rating numeric,
  view_count integer,
  created_at timestamptz,
  relevance_score real
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sd.id,
    sd.title,
    sd.content,
    sd.category,
    sd.difficulty_level,
    sd.tags,
    COALESCE(AVG(sf.rating), 0) as avg_rating,
    sd.view_count,
    sd.created_at,
    -- Calcular relevancia basada en título, contenido y tags
    (
      CASE WHEN sd.title ILIKE '%' || search_term || '%' THEN 3.0 ELSE 0.0 END +
      CASE WHEN array_to_string(sd.tags, ' ') ILIKE '%' || search_term || '%' THEN 2.0 ELSE 0.0 END +
      CASE WHEN sd.content::text ILIKE '%' || search_term || '%' THEN 1.0 ELSE 0.0 END
    )::real as relevance_score
  FROM solution_documents sd
  LEFT JOIN solution_feedback sf ON sd.id = sf.document_id
  WHERE 
    sd.is_published = true
    AND (
      sd.title ILIKE '%' || search_term || '%' OR
      sd.content::text ILIKE '%' || search_term || '%' OR
      array_to_string(sd.tags, ' ') ILIKE '%' || search_term || '%'
    )
    AND (category_filter IS NULL OR sd.category = category_filter)
    AND (difficulty_filter IS NULL OR sd.difficulty_level = ANY(difficulty_filter))
  GROUP BY sd.id, sd.title, sd.content, sd.category, sd.difficulty_level, sd.tags, sd.view_count, sd.created_at
  HAVING (
    CASE WHEN sd.title ILIKE '%' || search_term || '%' THEN 3.0 ELSE 0.0 END +
    CASE WHEN array_to_string(sd.tags, ' ') ILIKE '%' || search_term || '%' THEN 2.0 ELSE 0.0 END +
    CASE WHEN sd.content::text ILIKE '%' || search_term || '%' THEN 1.0 ELSE 0.0 END
  ) > 0
  ORDER BY relevance_score DESC, sd.view_count DESC, sd.created_at DESC
  LIMIT limit_count;
END;
$$;
```

---

## 🎯 **Integración con Módulos Existentes**

### **1. Integración con Gestión de Casos**
```tsx
// En CaseForm.tsx - Agregar botón para crear documentación
const CaseFormWithDocumentation = () => {
  const [showDocumentationModal, setShowDocumentationModal] = useState(false);
  
  return (
    <div className="case-form">
      {/* Formulario existente */}
      
      {/* Nueva sección de documentación */}
      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Documentación Relacionada</h3>
        
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setShowDocumentationModal(true)}
            icon={DocumentTextIcon}
          >
            Crear Documentación
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => {/* Buscar documentos relacionados */}}
            icon={MagnifyingGlassIcon}
          >
            Buscar Soluciones
          </Button>
        </div>
      </div>
      
      {/* Modal de documentación */}
      {showDocumentationModal && (
        <DocumentationModal
          caseId={caseData?.id}
          onClose={() => setShowDocumentationModal(false)}
        />
      )}
    </div>
  );
};
```

### **2. Integración con Control de Casos**
```tsx
// En CaseControlDetailsModal.tsx - Mostrar documentos relacionados
const CaseControlWithDocumentation = ({ caseId }: { caseId: string }) => {
  const { data: relatedDocs } = useSolutionDocuments({ 
    filters: { caseId } 
  });
  
  return (
    <div className="case-control-details">
      {/* Contenido existente */}
      
      {/* Sección de documentación */}
      {relatedDocs && relatedDocs.length > 0 && (
        <div className="mt-6 border-t pt-6">
          <h4 className="font-medium mb-3">Documentación Relacionada</h4>
          <div className="space-y-2">
            {relatedDocs.map(doc => (
              <DocumentCard key={doc.id} document={doc} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

### **3. Nueva Página Principal**
```tsx
// src/pages/DocumentationPage.tsx
import React, { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PageWrapper } from '@/components/PageWrapper';
import { Button } from '@/components/Button';
import { DocumentationSearch } from '@/components/documentation/search/DocumentationSearch';
import { DocumentList } from '@/components/documentation/viewer/DocumentList';
import { DocumentationEditor } from '@/components/documentation/editor/DocumentationEditor';
import { SolutionDocumentStats } from '@/components/documentation/SolutionDocumentStats';
import { useSolutionDocuments, useSolutionDocumentStats } from '@/hooks/useSolutionDocuments';

export const DocumentationPage: React.FC = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});
  
  const { data: documents, isLoading } = useSolutionDocuments(searchFilters);
  const { data: stats } = useSolutionDocumentStats();

  if (showEditor) {
    return (
      <DocumentationEditor
        onSave={() => setShowEditor(false)}
        onCancel={() => setShowEditor(false)}
      />
    );
  }

  return (
    <PageWrapper
      title="Base de Conocimiento"
      subtitle="Documentación y soluciones de casos"
    >
      {/* Estadísticas */}
      {stats && <SolutionDocumentStats stats={stats} />}
      
      {/* Header con acciones */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Documentos</h2>
        <Button
          onClick={() => setShowEditor(true)}
          icon={PlusIcon}
        >
          Nuevo Documento
        </Button>
      </div>
      
      {/* Búsqueda y filtros */}
      <DocumentationSearch
        onFiltersChange={setSearchFilters}
        className="mb-6"
      />
      
      {/* Lista de documentos */}
      <DocumentList
        documents={documents}
        isLoading={isLoading}
      />
    </PageWrapper>
  );
};
```

### **4. Actualización de Navegación**
```tsx
// En Layout.tsx - Agregar nueva ruta
const navigationItems = [
  // ... elementos existentes
  {
    name: 'Base de Conocimiento',
    href: '/documentation',
    icon: BookOpenIcon,
    permission: 'documentation:read'
  }
];
```

---

## 📊 **Métricas en Dashboard**

### **Widget de Documentación**
```tsx
// src/components/documentation/DocumentationDashboardWidget.tsx
import React from 'react';
import { BookOpenIcon, StarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useSolutionDocumentStats } from '@/hooks/useSolutionDocuments';

export const DocumentationDashboardWidget: React.FC = () => {
  const { data: stats, isLoading } = useSolutionDocumentStats();

  if (isLoading || !stats) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Base de Conocimiento
        </h3>
        <BookOpenIcon className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalDocuments}
          </div>
          <div className="text-sm text-gray-500">Documentos</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.avgRating?.toFixed(1) || '0.0'}
          </div>
          <div className="text-sm text-gray-500">Rating Promedio</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.templatesCount}
          </div>
          <div className="text-sm text-gray-500">Templates</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.totalViews}
          </div>
          <div className="text-sm text-gray-500">Visualizaciones</div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🚀 **Plan de Implementación**

### **Fase 1: Fundación (2-3 semanas)**
- ✅ Diseño y creación de tablas de base de datos
- ✅ Configuración de RLS y permisos
- ✅ Tipos TypeScript básicos
- ✅ Hook base `useSolutionDocuments`
- ✅ Componente básico de editor

### **Fase 2: Editor y Viewer (2-3 semanas)**
- ✅ Sistema completo de bloques de contenido
- ✅ Editor tipo Notion con toolbar
- ✅ Viewer optimizado para lectura
- ✅ Sistema de categorías
- ✅ Funcionalidad de templates

### **Fase 3: Búsqueda y Feedback (2-3 semanas)**
- ✅ Motor de búsqueda full-text
- ✅ Sistema de filtros avanzados
- ✅ Sistema de rating y feedback
- ✅ Versionado de documentos
- ✅ Integración con casos existentes

### **Fase 4: Optimización y Pulido (1-2 semanas)**
- ✅ Métricas en dashboard
- ✅ Optimizaciones de performance
- ✅ Testing y refinamiento
- ✅ Documentación de usuario

---

## 🔐 **Permisos y Seguridad**

### **Nuevos Permisos**
```sql
-- Insertar nuevos permisos para documentación
INSERT INTO permissions (name, description, resource, action) VALUES
('documentation:read', 'Ver documentación publicada', 'documentation', 'read'),
('documentation:create', 'Crear nueva documentación', 'documentation', 'create'),
('documentation:update', 'Editar documentación propia', 'documentation', 'update'),
('documentation:delete', 'Eliminar documentación propia', 'documentation', 'delete'),
('documentation:manage', 'Gestionar toda la documentación', 'documentation', 'manage'),
('documentation:feedback', 'Dar feedback en documentos', 'documentation', 'feedback'),
('documentation:categories', 'Gestionar categorías', 'documentation', 'categories');

-- Asignar permisos básicos a roles existentes
-- Usuarios normales pueden leer y crear
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name IN ('User', 'Analyst') 
AND p.name IN ('documentation:read', 'documentation:create', 'documentation:feedback');

-- Coordinadores pueden gestionar su documentación
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Coordinator'
AND p.name IN ('documentation:read', 'documentation:create', 'documentation:update', 'documentation:delete', 'documentation:feedback');

-- Administradores tienen acceso completo
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Admin'
AND p.resource = 'documentation';
```

---

## 📈 **Métricas y KPIs**

### **Métricas de Adopción**
- **Documentos Creados**: Número total de documentos en la base
- **Documentos Publicados**: Documentos disponibles para el equipo
- **Templates Activos**: Plantillas utilizables
- **Usuarios Activos**: Usuarios que crean/consultan documentación

### **Métricas de Calidad**
- **Rating Promedio**: Calificación de utilidad de documentos
- **Feedback Positivo**: Porcentaje de "fue útil"
- **Documentos Actualizados**: Frecuencia de mantenimiento
- **Versionado**: Historial de mejoras

### **Métricas de Impacto**
- **Tiempo de Resolución**: Reducción en tiempo de casos
- **Reutilización**: Documentos consultados por caso
- **Casos Documentados**: Porcentaje de casos con documentación
- **Knowledge Gap**: Casos sin documentación disponible

---

## 🎯 **Beneficios Esperados**

### **Para el Equipo**
- ✅ **-40% Tiempo de Resolución**: Soluciones documentadas y accesibles
- ✅ **+60% Eficiencia en Onboarding**: Nuevos miembros con acceso a conocimiento
- ✅ **+50% Reutilización de Soluciones**: Menos reinvención de soluciones
- ✅ **+30% Calidad de Documentación**: Estructura y templates consistentes

### **Para el Sistema**
- ✅ **Base de Conocimiento Centralizada**: Todo el conocimiento en un lugar
- ✅ **Mejora Continua**: Feedback para optimizar documentación
- ✅ **Escalabilidad**: Crecimiento organizado del conocimiento
- ✅ **Integración Perfecta**: Sin cambios disruptivos al flujo actual

---

## 📝 **Conclusión**

El módulo de documentación tipo Notion se integra perfectamente con la arquitectura existente del sistema de gestión de casos, proporcionando:

1. **🏗️ Arquitectura Consistente**: Utiliza la misma base tecnológica
2. **🔐 Seguridad Cohesiva**: Aprovecha el sistema de permisos existente
3. **🎨 UX Uniforme**: Mantiene la misma experiencia visual
4. **📈 Valor Agregado Alto**: Mejora significativa en eficiencia del equipo
5. **🚀 Implementación Gradual**: Plan de fases manejables

La implementación de este módulo representará una **evolución natural** del sistema actual, transformándolo en una plataforma integral de gestión de conocimiento que **reducirá significativamente** los tiempos de resolución y **mejorará la calidad** del soporte proporcionado.

---

**Documento generado el 1 de Agosto, 2025**  
**Versión 1.0 - Especificación Técnica Completa**
