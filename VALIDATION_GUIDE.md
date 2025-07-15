# GUÍA DE VALIDACIÓN DE POLÍTICAS RLS
## Script: validate_rls_policies.sql

### 📋 INSTRUCCIONES DE EJECUCIÓN

Este documento te guía paso a paso para validar que las políticas RLS estén funcionando correctamente.

---

## 🔧 PREPARACIÓN

1. **Conectarse a Supabase SQL Editor** con privilegios de administrador
2. **Tener a mano los IDs de usuarios** con diferentes roles (analista, supervisor, admin)
3. **Ejecutar las consultas sección por sección**, no todo el archivo de una vez

---

## 📝 SECCIONES A EJECUTAR

### **Sección 1: Verificar Estado de Políticas**
```sql
-- Ejecutar estas 2 consultas para verificar que solo existan políticas dinámicas
```
**Resultado esperado:** 
- Solo políticas que contengan "dynamic" en el nombre + service_role bypass
- Todas las tablas críticas deben tener `rowsecurity = true`

### **Sección 2: Verificar Funciones Helper**
```sql
-- Ejecutar para confirmar que las funciones existen
```
**Resultado esperado:** 
- 4 funciones: `has_permission`, `get_user_role`, `is_case_accessible`, `is_todo_accessible`

### **Sección 3: Validar Datos de Configuración**
```sql
-- Ejecutar para ver permisos y usuarios usando la estructura real
```
**Resultado esperado:** 
- Permisos configurados para roles usando las tablas: roles, permissions, role_permissions
- Usuarios con roles asignados correctamente a través de user_profiles.role_id

---

## 🧪 PRUEBAS POR ROL

### **Método para cambiar contexto de usuario:**
```sql
-- Antes de cada grupo de pruebas, ejecutar:
SET LOCAL "request.jwt.claims" = '{"sub": "ID_DEL_USUARIO", "role": "authenticated"}';
```

### **🔍 PRUEBA 1: Usuario ANALISTA**

1. **Cambiar contexto a analista:**
```sql
SET LOCAL "request.jwt.claims" = '{"sub": "ID_ANALISTA_REAL", "role": "authenticated"}';
```

2. **Ejecutar consultas de la sección 4.1**

**Resultados esperados:**
- ✅ Solo ve casos donde `user_id = su_id`
- ✅ Solo ve TODOs donde `assigned_user_id = su_id` OR `created_by_user_id = su_id`
- ✅ Solo ve archivos donde aparece en `original_data` como creador/asignado
- ❌ NO ve casos/TODOs de otros usuarios

### **🔍 PRUEBA 2: Usuario SUPERVISOR**

1. **Cambiar contexto a supervisor:**
```sql
SET LOCAL "request.jwt.claims" = '{"sub": "ID_SUPERVISOR_REAL", "role": "authenticated"}';
```

2. **Ejecutar consultas de la sección 4.2**

**Resultados esperados:**
- ✅ Ve TODOS los casos y TODOs
- ✅ Ve TODOS los archivos
- ✅ Puede acceder a funciones de asignación

### **🔍 PRUEBA 3: Usuario ADMIN**

1. **Cambiar contexto a admin:**
```sql
SET LOCAL "request.jwt.claims" = '{"sub": "ID_ADMIN_REAL", "role": "authenticated"}';
```

2. **Ejecutar consultas de la sección 4.3**

**Resultados esperados:**
- ✅ Acceso completo a todo
- ✅ Puede ver/modificar configuración de permisos

---

## 🎯 VALIDACIONES CRÍTICAS

### **Restricciones de Analista:**
```sql
-- Esta consulta DEBE devolver 0 para analistas
SELECT COUNT(*) as cases_from_others
FROM cases
WHERE user_id != auth.uid();
```

### **Funciones Helper:**
```sql
-- Ejecutar como cada tipo de usuario
SELECT 
    has_permission(auth.uid(), 'cases.read.own') as can_read_own_cases,
    has_permission(auth.uid(), 'cases.read.all') as can_read_all_cases,
    has_permission(auth.uid(), 'admin.access') as is_admin;
```

---

## 📊 REGISTRO DE RESULTADOS

### **Completa esta tabla durante las pruebas:**

| Consulta | Usuario Analista | Usuario Supervisor | Usuario Admin | ¿Esperado? |
|----------|------------------|-------------------|---------------|------------|
| Total casos visibles | | | | |
| Total TODOs visibles | | | | |
| Total archivos visibles | | | | |
| Casos de otros usuarios | 0 | N/A | N/A | ✅ |
| can_read_own_cases | true | N/A | true | ✅ |
| can_read_all_cases | false | true | true | ✅ |
| is_admin | false | false | true | ✅ |

---

## 🚨 PROBLEMAS COMUNES

### **Si aparecen errores:**

1. **"función no existe"** → Las migraciones 023/024 no se ejecutaron correctamente
2. **"política no permite operación"** → Problema en las políticas dinámicas
3. **"usuario ve datos de otros"** → RLS no está funcionando correctamente
4. **"acceso denegado total"** → Problema en permisos de la tabla `user_permissions`

### **Si un analista ve casos de otros:**
```sql
-- Verificar que la política esté activa:
SELECT * FROM pg_policies WHERE tablename = 'cases' AND policyname LIKE '%dynamic%';
```

### **Si las funciones helper fallan:**
```sql
-- Verificar que existan:
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('has_permission', 'get_user_role');
```

---

## ✅ CHECKLIST FINAL

- [ ] Solo existen políticas dinámicas (no legacy)
- [ ] Funciones helper funcionan correctamente
- [ ] Analistas solo ven sus propios elementos
- [ ] Supervisores ven todo
- [ ] Admins tienen acceso completo
- [ ] Archivos respetan ownership original
- [ ] No hay errores de permisos inesperados

---

## 📞 REPORTE DE RESULTADOS

**Una vez completadas las pruebas, proporciona:**

1. **Capturas/logs** de las consultas que fallaron
2. **Tabla de resultados** completada
3. **Cualquier comportamiento inesperado**
4. **Errores específicos** con mensajes completos

Esto me permitirá identificar y corregir cualquier problema en las políticas RLS.
