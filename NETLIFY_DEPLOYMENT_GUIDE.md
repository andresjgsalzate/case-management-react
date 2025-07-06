# 🚀 Guía de Despliegue en Netlify - Case Management v2.1.0

## 📋 Requisitos Previos

1. **Cuenta de Netlify**: [Regístrate aquí](https://app.netlify.com/signup)
2. **Proyecto Supabase**: Configurado y funcionando
3. **Repositorio Git**: Código subido a GitHub/GitLab/Bitbucket

## 🔧 Configuración Paso a Paso

### **Paso 1: Crear Nuevo Sitio en Netlify**

1. Ve a [Netlify Dashboard](https://app.netlify.com/)
2. Haz clic en **"New site from Git"**
3. Conecta tu repositorio Git
4. Selecciona el repositorio del proyecto

### **Paso 2: Configuración de Build**

```toml
# Build settings que se configuran automáticamente con netlify.toml
Build command: npm run build
Publish directory: dist
```

### **Paso 3: Variables de Entorno**

En **Site settings > Environment variables**, añade:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
NODE_ENV=production
CI=false
```

### **Paso 4: Configuración de Dominio**

1. **Dominio temporal**: Netlify asigna automáticamente (ej: `amazing-app-123.netlify.app`)
2. **Dominio personalizado**: En Site settings > Domain management
3. **HTTPS**: Se configura automáticamente

## 🔒 Variables de Entorno Necesarias

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase | `eyJhbGciOiJIUzI1NiIs...` |
| `NODE_ENV` | Entorno de producción | `production` |
| `CI` | Evitar errores de build | `false` |

## 📁 Estructura de Archivos Importantes

```
/
├── netlify.toml          # Configuración de Netlify
├── dist/                 # Archivos de build (generados)
├── src/
├── package.json
└── .env.netlify.example  # Variables de entorno de ejemplo
```

## 🔄 Despliegue Automático

Una vez configurado, cada push a la rama principal activa:

1. ✅ **Build automático** con `npm run build`
2. ✅ **Deploy automático** de la carpeta `dist`
3. ✅ **Invalidación de caché**
4. ✅ **Notificaciones** de estado

## 🌐 URLs de Redirect

El archivo `netlify.toml` incluye:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Esto permite que las rutas de React funcionen correctamente (SPA routing).

## 🔍 Verificación Post-Despliegue

### ✅ Checklist de Funcionamiento:

- [ ] **Página carga** sin errores de configuración
- [ ] **Autenticación** funciona con Supabase
- [ ] **Dashboard** muestra datos correctamente  
- [ ] **Rutas protegidas** funcionan (login required)
- [ ] **Permisos** se aplican según rol de usuario
- [ ] **Modo oscuro** persiste entre sesiones
- [ ] **Responsive** funciona en móviles

### 🛠️ Resolución de Problemas Comunes:

#### Error: "Configuration Required"
```bash
# Causa: Variables de entorno no configuradas
# Solución: Verificar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
```

#### Error: Build Failed
```bash
# Causa: Dependencias o errores de TypeScript
# Solución: Ejecutar npm run build localmente primero
```

#### Error: 404 en Rutas
```bash
# Causa: Redirects no configurados
# Solución: Verificar que netlify.toml esté en la raíz
```

## 📊 Información de la Versión

- **Versión**: 2.1.0
- **Fecha**: 2025-07-05
- **Tecnologías**: React 18, TypeScript, Vite, Tailwind CSS, Supabase
- **Compatibilidad**: Node.js 18+

## 🔗 URLs Importantes

- **Documentación Netlify**: https://docs.netlify.com/
- **Supabase Docs**: https://supabase.com/docs
- **React Router**: https://reactrouter.com/

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. Verifica la [documentación de Netlify](https://docs.netlify.com/)
2. Revisa los logs de build en el dashboard de Netlify
3. Asegúrate de que el proyecto compile localmente con `npm run build`

---

**🎉 ¡Listo para producción en Netlify!**
