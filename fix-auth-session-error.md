# Fix Auth Session Missing Error

## Problema
Cuando el usuario está en la página de login, el hook `useAuth` estaba generando muchos errores `AuthSessionMissingError` en la consola porque intentaba obtener la sesión del usuario cuando no había ninguna sesión activa.

## Solución Implementada

### 1. Manejo Inteligente de Errores de Sesión
- Modificamos el hook `useAuth` para reconocer errores de sesión faltante como estados normales
- En lugar de arrojar un error, devolvemos `null` cuando no hay sesión activa
- Detectamos los siguientes tipos de error como "normales":
  - `Auth session missing`
  - `No session`
  - `session_not_found`

### 2. Configuración de Retry Mejorada
- Configuramos la lógica de retry para que no reintente cuando el error es de sesión faltante
- Esto evita ciclos infinitos de reintentos en la página de login

### 3. Filtrado de Errores en el Estado
- El estado de error solo se establece para errores reales de autenticación
- Los errores de sesión faltante no se muestran al usuario como errores

## Archivos Modificados
- `src/hooks/useAuth.ts`: Mejorado manejo de errores de sesión

## Resultado
- ✅ Ya no aparecen errores en consola cuando se está en la página de login
- ✅ La aplicación funciona normalmente cuando hay y cuando no hay sesión
- ✅ Los errores reales de autenticación siguen siendo capturados y mostrados apropiadamente

## Comportamiento Esperado
- **Página de Login**: Sin errores en consola, carga silenciosa
- **Usuario Autenticado**: Funcionamiento normal con manejo de errores apropiado
- **Errores Reales**: Siguen siendo mostrados al usuario y registrados en consola
