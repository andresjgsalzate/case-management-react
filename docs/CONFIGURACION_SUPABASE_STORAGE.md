# 🔧 GUÍA DE CONFIGURACIÓN SUPABASE STORAGE

## 📋 **Configuración Requerida**

### **1. Crear Bucket en Supabase Dashboard**

1. **Acceder al Dashboard de Supabase:**
   - Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecciona tu proyecto

2. **Crear Bucket de Storage:**
   - Ve a `Storage` → `Buckets`
   - Haz clic en `Create Bucket`
   - **Nombre:** `document-attachments`
   - **Configuración:**
     - ✅ Public bucket
     - ✅ File size limit: 50 MB
     - ✅ Allowed MIME types: `image/*`, `application/*`, `text/*`

### **2. Configurar Políticas RLS (Row Level Security)**

```sql
-- Política para permitir lectura pública de archivos
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'document-attachments');

-- Política para permitir subida de archivos a usuarios autenticados
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'document-attachments' AND auth.role() = 'authenticated'
);

-- Política para permitir eliminación solo del propietario
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (
  bucket_id = 'document-attachments' AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### **3. Verificar Tabla document_attachments**

La tabla `document_attachments` ya existe en tu esquema con la estructura correcta:

```sql
CREATE TABLE public.document_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  document_id uuid,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  file_type character varying CHECK (file_type::text = ANY (ARRAY['image'::character varying, 'document'::character varying, 'spreadsheet'::character varying, 'other'::character varying]::text[])),
  is_embedded boolean DEFAULT false,
  uploaded_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  -- Foreign Keys
  CONSTRAINT document_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id),
  CONSTRAINT document_attachments_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.solution_documents(id)
);
```

## 🔍 **Diagnóstico de Problemas**

### **Error Común: "Bucket no encontrado"**
- **Causa:** El bucket `document-attachments` no existe
- **Solución:** Crear manualmente en Supabase Dashboard o ejecutar:

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('document-attachments', 'document-attachments', true);
```

### **Error: "Políticas RLS"**
- **Causa:** Políticas de seguridad muy restrictivas
- **Solución:** Aplicar las políticas SQL mencionadas arriba

### **Error: "CORS"**
- **Causa:** Configuración CORS de Supabase
- **Solución:** En Dashboard → Settings → API → CORS Origins, agregar `http://localhost:5173`

## 🧪 **Prueba de Funcionalidad**

### **Test en Consola del Navegador:**

```javascript
// Verificar que Supabase esté configurado
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

// Test de subida (ejecutar en consola del navegador)
async function testUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Archivo seleccionado:', file.name);
      
      // Importar StorageService (ajustar path según sea necesario)
      const { StorageService } = await import('./src/shared/services/StorageService');
      
      const result = await StorageService.uploadFile(file, 'test-document-id', { isEmbedded: true });
      console.log('Resultado:', result);
    }
  };
  
  input.click();
}

// Ejecutar test
testUpload();
```

## 📱 **Resultado Esperado**

Después de la configuración correcta:

1. **✅ Al usar "/" en BlockNote y seleccionar imagen:**
   - Se abre el selector de archivos del navegador
   - La imagen se sube a Supabase Storage
   - Se guarda referencia en `document_attachments`
   - La imagen aparece correctamente en el editor

2. **✅ En PDFs exportados:**
   - Las imágenes se renderizan desde URLs públicas de Supabase
   - No hay errores CORS
   - Las imágenes persisten entre sesiones

## 🔧 **Comando para Verificar Estado:**

```bash
# En el terminal del proyecto
npm run dev

# En consola del navegador
localStorage.setItem('debug', 'true');
```

Esto habilitará logs detallados del StorageService para diagnosticar problemas.
