# 🧹 LIMPIEZA TOTAL DEL SISTEMA DE PERMISOS

## 📄 Script: `997_complete_permissions_cleanup.sql`

Este script realiza una **limpieza completa** del sistema de permisos, eliminando absolutamente todo lo relacionado con roles, permisos y políticas RLS.

---

## 🎯 **¿Qué hace exactamente?**

### 1️⃣ **Desactivar RLS en TODAS las tablas**
```sql
ALTER TABLE [tabla] DISABLE ROW LEVEL SECURITY;
```
- ✅ user_profiles, cases, todos, notes, archived_*, solution_*, etc.
- ✅ Todas las tablas quedan sin restricciones

### 2️⃣ **Eliminar TODAS las políticas RLS**
```sql
-- Usa un loop dinámico para eliminar automáticamente
-- TODAS las políticas existentes en el esquema public
```
- ✅ Elimina automáticamente todas las políticas encontradas
- ✅ No necesita conocer los nombres específicos

### 3️⃣ **Limpiar tablas de roles y permisos**
```sql
DELETE FROM user_role_permissions WHERE TRUE;
DELETE FROM role_permissions WHERE TRUE;
DELETE FROM permissions WHERE TRUE;
DELETE FROM roles WHERE TRUE;
```
- ✅ Vacía completamente las tablas de permisos
- ✅ Opcionalmente puede eliminar las tablas también

### 4️⃣ **Simplificar user_profiles**
```sql
-- Solo mantiene: admin, user
UPDATE user_profiles SET role_name = 'admin' WHERE role_name IN ('admin', 'supervisor');
UPDATE user_profiles SET role_name = 'user' WHERE role_name NOT IN ('admin');
```
- ✅ Elimina columnas complejas (role_id, department_id, etc.)
- ✅ Solo mantiene `role_name` como texto simple
- ✅ Activa todos los usuarios

### 5️⃣ **Otorgar permisos COMPLETOS**
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
```
- ✅ Todos los usuarios autenticados pueden hacer TODO
- ✅ Sin restricciones de ningún tipo

### 6️⃣ **Eliminar funciones complejas**
- ✅ has_permission(), check_user_permission(), etc.
- ✅ Todas las funciones de validación de roles
- ✅ Vistas complejas de permisos

### 7️⃣ **Crear funciones básicas sin restricciones**
- ✅ get_dashboard_metrics() - Ve TODOS los casos
- ✅ get_todo_metrics() - Ve TODOS los TODOs
- ✅ Sin validaciones de permisos

---

## 🚀 **Resultado Final:**

### ✅ **Sistema Completamente Abierto:**
- **Sin políticas RLS** → Todos ven todo
- **Sin restricciones** → Todos pueden hacer todo
- **Sin validaciones** → Sin errores de permisos
- **Sistema limpio** → Listo para reconstruir

### 📊 **Estado del Sistema:**
```
🔓 ACCESO TOTAL PARA TODOS
├── 👀 Ver: TODO
├── ✏️ Editar: TODO  
├── 🗑️ Eliminar: TODO
└── ➕ Crear: TODO
```

---

## 🛠️ **Cómo Ejecutar:**

### **Paso 1**: Backup (IMPORTANTE)
```bash
# Hacer backup completo antes de ejecutar
pg_dump [tu_database] > backup_antes_limpieza.sql
```

### **Paso 2**: Ejecutar el script
```sql
-- En Supabase SQL Editor o psql
\i 997_complete_permissions_cleanup.sql
```

### **Paso 3**: Verificar resultado
```sql
-- Debe mostrar 0 políticas
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';

-- Debe mostrar RLS disabled en todas las tablas
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

---

## 🎯 **Próximos Pasos Después de la Limpieza:**

### **Fase 1: Planificación del Nuevo Sistema**
1. **Definir roles nuevos** (ej: admin, supervisor, analyst, viewer)
2. **Definir permisos por módulo** (cases, todos, notes, etc.)
3. **Crear matriz de permisos** (qué rol puede hacer qué)

### **Fase 2: Implementación Modular**
1. **Módulo Casos** → Crear RLS + permisos
2. **Módulo TODOs** → Crear RLS + permisos  
3. **Módulo Notas** → Crear RLS + permisos
4. **etc.**

### **Fase 3: Sistema Nuevo Modular**
```sql
-- Ejemplo de estructura nueva:
CREATE TABLE user_roles (...)
CREATE TABLE module_permissions (...)
CREATE POLICY cases_policy ON cases ...
```

---

## ⚠️ **Importante:**

### **Durante la Limpieza:**
- ✅ La aplicación seguirá funcionando
- ✅ Todos podrán ver/hacer todo
- ✅ Sin errores de permisos
- ✅ Ideal para testing y desarrollo

### **Después de la Limpieza:**
- 🔄 **Reiniciar aplicación** para limpiar cache
- 🧪 **Probar funcionalidades** básicas  
- ✅ **Verificar que todo funciona** sin restricciones
- 📋 **Planificar nuevo sistema** de roles

---

## 🎉 **¡Sistema Listo para Reconstruir!**

Una vez ejecutado este script, tendrás un sistema completamente limpio y abierto, perfecto para:
- ✅ **Desarrollar sin restricciones**
- ✅ **Probar todas las funcionalidades**  
- ✅ **Construir nuevo sistema modular desde cero**
- ✅ **Implementar roles específicos por módulo**

¡Es el "reset" perfecto para empezar fresh! 🚀
