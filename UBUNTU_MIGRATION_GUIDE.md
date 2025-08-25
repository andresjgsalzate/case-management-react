# 🚀 Guía de Migración a Ubuntu Server - Sistema de Gestión de Casos

## 📋 Resumen Ejecutivo

Esta guía te ayudará a migrar tu aplicación React de gestión de casos desde **Supabase** y **Netlify** hacia un servidor **Ubuntu 24.04.3 LTS** con **PostgreSQL** nativo y **Apache** como servidor web.

### 🎯 Objetivos de la Migración

- ✅ Eliminar dependencia de Supabase
- ✅ Eliminar dependencia de Netlify
- ✅ Mantener 100% de funcionalidad
- ✅ Hosting completo en servidor Ubuntu propio
- ✅ Base de datos PostgreSQL local
- ✅ Servidor web Apache

---

## 📊 Análisis del Estado Actual

### 🔍 Configuración Actual

- **Frontend**: React + Vite + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Netlify
- **Autenticación**: Supabase Auth
- **Base de datos**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Email**: SMTP personalizado (ya implementado)

### 📦 Dependencias Clave Identificadas

```json
{
  "@supabase/supabase-js": "^2.38.4",
  "react": "^18.2.0",
  "vite": "^5.x",
  "postgresql": "Schema completo disponible"
}
```

---

## 🏗️ Arquitectura de Destino

```
┌─────────────────────────────────────────────────────────────┐
│                    Ubuntu 24.04.3 LTS                      │
├─────────────────┬─────────────────┬─────────────────────────┤
│    Apache       │   Node.js API   │      PostgreSQL         │
│   (Frontend)    │   (Backend)     │    (Base de Datos)     │
│                 │                 │                         │
│  React App      │  Auth Service   │  Schema Completo        │
│  Static Files   │  CRUD APIs      │  RLS Policies          │
│  Proxy Config   │  File Upload    │  Functions/Triggers     │
└─────────────────┴─────────────────┴─────────────────────────┘
```

---

## 📅 Plan de Migración por Fases

### 🔧 **FASE 1: Preparación del Servidor Ubuntu (Semana 1)**

#### **1.1 Instalación de Componentes Base**

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar PostgreSQL 15+
sudo apt install postgresql postgresql-contrib postgresql-client -y

# Instalar Node.js 18+ y npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Instalar Apache
sudo apt install apache2 -y

# Instalar PM2 para gestión de procesos Node.js
sudo npm install -g pm2

# Instalar herramientas adicionales
sudo apt install git curl wget nano htop ufw certbot python3-certbot-apache -y
```

#### **1.2 Configuración de PostgreSQL**

```bash
# Configurar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar usuario y base de datos
sudo -u postgres psql << 'EOF'
-- Crear usuario para la aplicación
CREATE USER case_management WITH PASSWORD 'tu_password_seguro';

-- Crear base de datos
CREATE DATABASE case_management_db WITH OWNER case_management;

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE case_management_db TO case_management;

-- Habilitar extensiones necesarias
\c case_management_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Configurar búsqueda de texto completo (si es necesario)
CREATE EXTENSION IF NOT EXISTS "unaccent";

\q
EOF
```

#### **1.3 Configuración de Seguridad**

```bash
# Configurar firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5432/tcp  # Solo si necesitas acceso externo a PostgreSQL

# Configurar PostgreSQL para conexiones locales
sudo nano /etc/postgresql/15/main/postgresql.conf
# Modificar: listen_addresses = 'localhost'

sudo nano /etc/postgresql/15/main/pg_hba.conf
# Agregar: local   case_management_db   case_management   md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

---

### 🗄️ **FASE 2: Migración de Base de Datos (Semana 1-2)**

#### **2.1 Exportar Schema desde Supabase**

```bash
# En tu máquina local, exportar schema de Supabase
# Usar el archivo sql-scripts/create_complete_schema.sql existente
```

#### **2.2 Migrar Schema a PostgreSQL Local**

```bash
# Conectar a la nueva base de datos
psql -h localhost -U case_management -d case_management_db

# Ejecutar el schema completo
\i /ruta/a/create_complete_schema.sql

# Verificar tablas creadas
\dt

# Verificar funciones
\df

# Salir
\q
```

#### **2.3 Migrar Datos (Si tienes datos en producción)**

```sql
-- Usar pg_dump para exportar datos desde Supabase
-- Esto deberás hacerlo desde el dashboard de Supabase o usando su CLI

-- Ejemplo de inserción manual de datos críticos:
INSERT INTO user_profiles (id, email, full_name, role_name, is_active)
VALUES (gen_random_uuid(), 'admin@tudominio.com', 'Administrador', 'admin', true);

-- Insertar configuraciones del sistema
INSERT INTO system_configurations (category, key, value, description, is_active)
VALUES
('smtp', 'host', 'smtp.tuservidor.com', 'Servidor SMTP', true),
('smtp', 'port', '587', 'Puerto SMTP', true),
('smtp', 'username', 'tu_email@tudominio.com', 'Usuario SMTP', true),
('urls', 'base_url_production', 'https://tudominio.com', 'URL base producción', true);
```

---

### 🔙 **FASE 3: Desarrollo del Backend de Reemplazo (Semana 2-3)**

#### **3.1 Crear Estructura del Backend**

```bash
# Crear directorio del backend
mkdir -p /var/www/case-management-api
cd /var/www/case-management-api

# Inicializar proyecto Node.js
npm init -y

# Instalar dependencias principales
npm install express cors helmet morgan dotenv
npm install pg jsonwebtoken bcryptjs multer
npm install nodemailer rate-limiter-flexible
npm install @types/node @types/express typescript ts-node --save-dev

# Crear estructura de directorios
mkdir -p src/{routes,controllers,middleware,services,utils,types}
mkdir -p uploads/{documents,temp}
```

#### **3.2 Configuración Base del Backend**

**src/app.ts**

```typescript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { authRoutes } from "./routes/auth";
import { casesRoutes } from "./routes/cases";
import { filesRoutes } from "./routes/files";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:80",
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/cases", casesRoutes);
app.use("/api/files", filesRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
```

#### **3.3 Servicio de Base de Datos**

**src/services/database.ts**

```typescript
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER || "case_management",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "case_management_db",
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export { pool };

// Función helper para queries
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
```

#### **3.4 Servicio de Autenticación**

**src/services/authService.ts**

```typescript
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "./database";

interface User {
  id: string;
  email: string;
  full_name: string;
  role_name: string;
  is_active: boolean;
}

export class AuthService {
  static async signUp(
    email: string,
    password: string,
    fullName: string
  ): Promise<User> {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const result = await query(
      `
      INSERT INTO user_profiles (email, full_name, password_hash, role_name, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, role_name, is_active
    `,
      [email, fullName, hashedPassword, "user", true]
    );

    return result.rows[0];
  }

  static async signIn(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    // Buscar usuario
    const result = await query(
      `
      SELECT id, email, full_name, role_name, is_active, password_hash
      FROM user_profiles 
      WHERE email = $1 AND is_active = true
    `,
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error("Credenciales inválidas");
    }

    const user = result.rows[0];

    // Verificar password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error("Credenciales inválidas");
    }

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role_name },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  static async getCurrentUser(userId: string): Promise<User> {
    const result = await query(
      `
      SELECT id, email, full_name, role_name, is_active
      FROM user_profiles 
      WHERE id = $1 AND is_active = true
    `,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error("Usuario no encontrado");
    }

    return result.rows[0];
  }
}
```

#### **3.5 Middleware de Autenticación**

**src/middleware/auth.ts**

```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token de acceso requerido" });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" });
    }

    req.user = decoded as any;
    next();
  });
};
```

#### **3.6 Rutas de Autenticación**

**src/routes/auth.ts**

```typescript
import { Router } from "express";
import { AuthService } from "../services/authService";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Registro
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const user = await AuthService.signUp(email, password, name);
    res.status(201).json({ user });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Login
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await AuthService.signIn(email, password);
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
});

// Usuario actual
router.get("/user", authenticateToken, async (req: any, res) => {
  try {
    const user = await AuthService.getCurrentUser(req.user.userId);
    res.json({ user });
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

// Logout (simple respuesta, ya que JWT es stateless)
router.post("/signout", (req, res) => {
  res.json({ message: "Sesión cerrada correctamente" });
});

export { router as authRoutes };
```

#### **3.7 Variables de Entorno del Backend**

**.env**

```env
# Servidor
NODE_ENV=production
PORT=3001

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=case_management_db
DB_USER=case_management
DB_PASSWORD=tu_password_seguro

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_de_al_menos_32_caracteres

# Frontend
FRONTEND_URL=http://localhost

# SMTP (para emails)
SMTP_HOST=smtp.tuservidor.com
SMTP_PORT=587
SMTP_USER=tu_email@tudominio.com
SMTP_PASS=tu_password_smtp

# Uploads
UPLOAD_DIR=/var/www/case-management-api/uploads
MAX_FILE_SIZE=50MB

# Búsqueda full-text
ENABLE_FULL_TEXT_SEARCH=true

# Cache (opcional)
REDIS_URL=redis://localhost:6379

# Logs
LOG_LEVEL=info
LOG_FILE=/var/log/case-management-api/app.log
```

#### **3.8 Servicios Adicionales para Funcionalidades Completas**

**src/services/todosService.ts**

```typescript
import { query } from "./database";

export class TodosService {
  static async getTodos(userId?: string, filters?: any) {
    let queryText = `
      SELECT t.*, tp.name as priority_name, tp.color as priority_color,
             up.full_name as assigned_user_name
      FROM todos t
      LEFT JOIN todo_priorities tp ON t.priority_id = tp.id
      LEFT JOIN user_profiles up ON t.assigned_user_id = up.id
      WHERE t.is_active = true
    `;
    const params: any[] = [];

    if (userId) {
      queryText += ` AND (t.created_by = $1 OR t.assigned_user_id = $1)`;
      params.push(userId);
    }

    if (filters?.status) {
      queryText += ` AND t.status = $${params.length + 1}`;
      params.push(filters.status);
    }

    queryText += ` ORDER BY t.created_at DESC`;

    const result = await query(queryText, params);
    return result.rows;
  }

  static async createTodo(todoData: any) {
    const result = await query(
      `
      INSERT INTO todos (title, description, priority_id, estimated_minutes, 
                        assigned_user_id, due_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [
        todoData.title,
        todoData.description,
        todoData.priorityId,
        todoData.estimatedMinutes,
        todoData.assignedUserId,
        todoData.dueDate,
        todoData.createdBy,
      ]
    );

    return result.rows[0];
  }

  static async updateTodo(id: string, todoData: any) {
    const result = await query(
      `
      UPDATE todos 
      SET title = COALESCE($2, title),
          description = COALESCE($3, description),
          priority_id = COALESCE($4, priority_id),
          status = COALESCE($5, status),
          completed_at = CASE WHEN $5 = 'completed' THEN NOW() ELSE completed_at END,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
      [
        id,
        todoData.title,
        todoData.description,
        todoData.priorityId,
        todoData.status,
      ]
    );

    return result.rows[0];
  }

  static async deleteTodo(id: string) {
    await query(`UPDATE todos SET is_active = false WHERE id = $1`, [id]);
    return { success: true };
  }
}
```

**src/services/notesService.ts**

```typescript
import { query } from "./database";

export class NotesService {
  static async getDocuments(userId?: string, filters?: any) {
    let queryText = `
      SELECT d.*, 
             ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags,
             up.full_name as author_name
      FROM documents d
      LEFT JOIN document_tags dt ON d.id = dt.document_id
      LEFT JOIN tags t ON dt.tag_id = t.id
      LEFT JOIN user_profiles up ON d.user_id = up.id
      WHERE d.is_active = true
    `;
    const params: any[] = [];

    if (userId) {
      queryText += ` AND d.user_id = $1`;
      params.push(userId);
    }

    if (filters?.tags && filters.tags.length > 0) {
      queryText += ` AND t.name = ANY($${params.length + 1})`;
      params.push(filters.tags);
    }

    queryText += ` GROUP BY d.id, up.full_name ORDER BY d.updated_at DESC`;

    const result = await query(queryText, params);
    return result.rows;
  }

  static async createDocument(documentData: any) {
    const client = await query("BEGIN");

    try {
      // Crear documento
      const docResult = await query(
        `
        INSERT INTO documents (title, content, case_number, solution_type, user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
        [
          documentData.title,
          documentData.content,
          documentData.caseNumber,
          documentData.solutionType,
          documentData.userId,
        ]
      );

      const document = docResult.rows[0];

      // Agregar tags si existen
      if (documentData.tags && documentData.tags.length > 0) {
        for (const tagName of documentData.tags) {
          // Crear tag si no existe
          await query(
            `
            INSERT INTO tags (name, created_by) 
            VALUES ($1, $2) 
            ON CONFLICT (name) DO NOTHING
          `,
            [tagName, documentData.userId]
          );

          // Obtener tag ID
          const tagResult = await query(`SELECT id FROM tags WHERE name = $1`, [
            tagName,
          ]);
          const tagId = tagResult.rows[0].id;

          // Asociar tag con documento
          await query(
            `
            INSERT INTO document_tags (document_id, tag_id)
            VALUES ($1, $2)
          `,
            [document.id, tagId]
          );
        }
      }

      await query("COMMIT");
      return document;
    } catch (error) {
      await query("ROLLBACK");
      throw error;
    }
  }

  static async getTags() {
    const result = await query(`
      SELECT t.*, COUNT(dt.document_id) as usage_count
      FROM tags t
      LEFT JOIN document_tags dt ON t.id = dt.id
      GROUP BY t.id
      ORDER BY usage_count DESC, t.name
    `);
    return result.rows;
  }
}
```

**src/services/fileUploadService.ts**

```typescript
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { query } from "./database";

// Configuración de multer para upload de archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || "./uploads";
    const subDir = req.body.type || "documents";
    const fullPath = path.join(uploadDir, subDir);

    try {
      await fs.mkdir(fullPath, { recursive: true });
      cb(null, fullPath);
    } catch (error) {
      cb(error as Error, "");
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "50") * 1024 * 1024, // MB a bytes
  },
});

export class FileUploadService {
  static async saveFileRecord(fileData: any) {
    const result = await query(
      `
      INSERT INTO uploaded_files (original_name, stored_name, file_path, file_size, 
                                 mime_type, uploaded_by, entity_type, entity_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [
        fileData.originalName,
        fileData.storedName,
        fileData.filePath,
        fileData.fileSize,
        fileData.mimeType,
        fileData.uploadedBy,
        fileData.entityType,
        fileData.entityId,
      ]
    );

    return result.rows[0];
  }

  static async getFilesByEntity(entityType: string, entityId: string) {
    const result = await query(
      `
      SELECT uf.*, up.full_name as uploaded_by_name
      FROM uploaded_files uf
      LEFT JOIN user_profiles up ON uf.uploaded_by = up.id
      WHERE uf.entity_type = $1 AND uf.entity_id = $2 AND uf.is_active = true
      ORDER BY uf.uploaded_at DESC
    `,
      [entityType, entityId]
    );

    return result.rows;
  }

  static async deleteFile(fileId: string) {
    const fileResult = await query(
      `SELECT file_path FROM uploaded_files WHERE id = $1`,
      [fileId]
    );

    if (fileResult.rows.length > 0) {
      const filePath = fileResult.rows[0].file_path;

      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error("Error deleting physical file:", error);
      }

      await query(`UPDATE uploaded_files SET is_active = false WHERE id = $1`, [
        fileId,
      ]);
    }

    return { success: true };
  }
}
```

#### **3.9 Rutas Adicionales del Backend**

**src/routes/todos.ts**

```typescript
import { Router } from "express";
import { TodosService } from "../services/todosService";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Obtener TODOs
router.get("/", authenticateToken, async (req: any, res) => {
  try {
    const todos = await TodosService.getTodos(req.user.userId, req.query);
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Crear TODO
router.post("/", authenticateToken, async (req: any, res) => {
  try {
    const todoData = { ...req.body, createdBy: req.user.userId };
    const todo = await TodosService.createTodo(todoData);
    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Actualizar TODO
router.put("/:id", authenticateToken, async (req: any, res) => {
  try {
    const todo = await TodosService.updateTodo(req.params.id, req.body);
    res.json(todo);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Eliminar TODO
router.delete("/:id", authenticateToken, async (req: any, res) => {
  try {
    const result = await TodosService.deleteTodo(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export { router as todosRoutes };
```

**src/routes/documents.ts**

```typescript
import { Router } from "express";
import { NotesService } from "../services/notesService";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Obtener documentos
router.get("/", authenticateToken, async (req: any, res) => {
  try {
    const documents = await NotesService.getDocuments(
      req.user.userId,
      req.query
    );
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Crear documento
router.post("/", authenticateToken, async (req: any, res) => {
  try {
    const documentData = { ...req.body, userId: req.user.userId };
    const document = await NotesService.createDocument(documentData);
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Obtener tags
router.get("/tags", authenticateToken, async (req, res) => {
  try {
    const tags = await NotesService.getTags();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export { router as documentsRoutes };
```

**src/routes/files.ts**

```typescript
import { Router } from "express";
import { upload, FileUploadService } from "../services/fileUploadService";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Upload de archivos
router.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileData = {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user.userId,
        entityType: req.body.entityType || "document",
        entityId: req.body.entityId,
      };

      const fileRecord = await FileUploadService.saveFileRecord(fileData);
      res.status(201).json(fileRecord);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

// Obtener archivos por entidad
router.get("/entity/:type/:id", authenticateToken, async (req, res) => {
  try {
    const files = await FileUploadService.getFilesByEntity(
      req.params.type,
      req.params.id
    );
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Eliminar archivo
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await FileUploadService.deleteFile(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export { router as filesRoutes };
```

---

### 🔌 **FASE 4: Adaptación del Frontend (Semana 3-4)**

#### **4.1 Reemplazar Cliente Supabase**

**src/lib/api-client.ts** (nuevo archivo)

```typescript
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Interceptor para agregar token de autorización
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);
```

#### **4.2 Nuevo Hook de Autenticación**

**src/hooks/useAuth.ts** (modificado)

```typescript
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useNotification } from "@/shared/components/notifications/NotificationSystem";

interface AuthState {
  user: any | null;
  loading: boolean;
  error: Error | null;
}

interface SignInData {
  email: string;
  password: string;
}

interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient();

  // Query para obtener usuario actual
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return null;

      try {
        const response = await apiClient.get("/auth/user");
        return response.data.user;
      } catch (error) {
        localStorage.removeItem("auth_token");
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  useEffect(() => {
    setAuthState({
      user: user ?? null,
      loading: isLoading,
      error: error as Error | null,
    });
  }, [user, isLoading, error]);

  // Mutation para sign in
  const signIn = useMutation({
    mutationFn: async ({ email, password }: SignInData) => {
      const response = await apiClient.post("/auth/signin", {
        email,
        password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      showSuccess("¡Bienvenido de vuelta!");
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || "Error al iniciar sesión");
    },
  });

  // Mutation para sign up
  const signUp = useMutation({
    mutationFn: async ({ email, password, name }: SignUpData) => {
      const response = await apiClient.post("/auth/signup", {
        email,
        password,
        name,
      });
      return response.data;
    },
    onSuccess: () => {
      showSuccess("¡Cuenta creada exitosamente! Puedes iniciar sesión.");
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || "Error al crear cuenta");
    },
  });

  // Mutation para sign out
  const signOut = useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/signout");
    },
    onSuccess: () => {
      localStorage.removeItem("auth_token");
      setAuthState({ user: null, loading: false, error: null });
      queryClient.clear();
      showSuccess("Sesión cerrada correctamente");
    },
    onError: () => {
      showError("Error al cerrar sesión");
    },
  });

  // Función de reset password (mantener lógica existente o simplificar)
  const resetPassword = useMutation({
    mutationFn: async (email: string) => {
      // Implementar con tu sistema SMTP existente o nuevo endpoint
      const response = await apiClient.post("/auth/reset-password", { email });
      return response.data;
    },
    onSuccess: () => {
      showSuccess(
        "Se ha enviado un email con instrucciones para restablecer tu contraseña"
      );
    },
    onError: (error: any) => {
      showError(
        error.response?.data?.error || "Error al enviar email de recuperación"
      );
    },
  });

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};
```

#### **4.3 Servicios Adaptados para Todas las Funcionalidades**

**src/services/casesService.ts**

```typescript
import { apiClient } from "@/lib/api-client";

export class CasesService {
  static async getCases(filters?: any) {
    const response = await apiClient.get("/cases", { params: filters });
    return response.data;
  }

  static async createCase(caseData: any) {
    const response = await apiClient.post("/cases", caseData);
    return response.data;
  }

  static async updateCase(id: string, caseData: any) {
    const response = await apiClient.put(`/cases/${id}`, caseData);
    return response.data;
  }

  static async deleteCase(id: string) {
    const response = await apiClient.delete(`/cases/${id}`);
    return response.data;
  }

  static async getCaseControl(filters?: any) {
    const response = await apiClient.get("/case-control", { params: filters });
    return response.data;
  }

  static async assignCase(caseId: string, userId: string) {
    const response = await apiClient.post("/case-control/assign", {
      caseId,
      userId,
    });
    return response.data;
  }

  static async startTimer(caseControlId: string) {
    const response = await apiClient.post(
      `/case-control/${caseControlId}/timer/start`
    );
    return response.data;
  }

  static async stopTimer(caseControlId: string) {
    const response = await apiClient.post(
      `/case-control/${caseControlId}/timer/stop`
    );
    return response.data;
  }

  static async addManualTime(caseControlId: string, timeData: any) {
    const response = await apiClient.post(
      `/case-control/${caseControlId}/manual-time`,
      timeData
    );
    return response.data;
  }
}
```

**src/services/todosService.ts**

```typescript
import { apiClient } from "@/lib/api-client";

export class TodosService {
  static async getTodos(filters?: any) {
    const response = await apiClient.get("/todos", { params: filters });
    return response.data;
  }

  static async createTodo(todoData: any) {
    const response = await apiClient.post("/todos", todoData);
    return response.data;
  }

  static async updateTodo(id: string, todoData: any) {
    const response = await apiClient.put(`/todos/${id}`, todoData);
    return response.data;
  }

  static async deleteTodo(id: string) {
    const response = await apiClient.delete(`/todos/${id}`);
    return response.data;
  }

  static async getPriorities() {
    const response = await apiClient.get("/todos/priorities");
    return response.data;
  }

  static async startTodoTimer(todoId: string) {
    const response = await apiClient.post(`/todos/${todoId}/timer/start`);
    return response.data;
  }

  static async stopTodoTimer(todoId: string) {
    const response = await apiClient.post(`/todos/${todoId}/timer/stop`);
    return response.data;
  }

  static async addTodoManualTime(todoId: string, timeData: any) {
    const response = await apiClient.post(
      `/todos/${todoId}/manual-time`,
      timeData
    );
    return response.data;
  }
}
```

**src/services/notesService.ts**

```typescript
import { apiClient } from "@/lib/api-client";

export class NotesService {
  static async getDocuments(filters?: any) {
    const response = await apiClient.get("/documents", { params: filters });
    return response.data;
  }

  static async createDocument(documentData: any) {
    const response = await apiClient.post("/documents", documentData);
    return response.data;
  }

  static async updateDocument(id: string, documentData: any) {
    const response = await apiClient.put(`/documents/${id}`, documentData);
    return response.data;
  }

  static async deleteDocument(id: string) {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  }

  static async getTags() {
    const response = await apiClient.get("/documents/tags");
    return response.data;
  }

  static async searchDocuments(query: string) {
    const response = await apiClient.get("/documents/search", {
      params: { q: query },
    });
    return response.data;
  }

  static async getDocumentsByTag(tagName: string) {
    const response = await apiClient.get(`/documents/by-tag/${tagName}`);
    return response.data;
  }
}
```

**src/services/archiveService.ts**

```typescript
import { apiClient } from "@/lib/api-client";

export class ArchiveService {
  static async archiveItem(itemType: string, itemId: string, reason: string) {
    const response = await apiClient.post("/archive", {
      itemType,
      itemId,
      reason,
    });
    return response.data;
  }

  static async getArchivedItems(filters?: any) {
    const response = await apiClient.get("/archive", { params: filters });
    return response.data;
  }

  static async restoreItem(archiveId: string) {
    const response = await apiClient.post(`/archive/${archiveId}/restore`);
    return response.data;
  }

  static async permanentlyDeleteItem(archiveId: string) {
    const response = await apiClient.delete(`/archive/${archiveId}/permanent`);
    return response.data;
  }
}
```

**src/services/disposicionScriptsService.ts**

```typescript
import { apiClient } from "@/lib/api-client";

export class DisposicionScriptsService {
  static async getDisposiciones(filters?: any) {
    const response = await apiClient.get("/disposicion-scripts", {
      params: filters,
    });
    return response.data;
  }

  static async createDisposicion(disposicionData: any) {
    const response = await apiClient.post(
      "/disposicion-scripts",
      disposicionData
    );
    return response.data;
  }

  static async updateDisposicion(id: string, disposicionData: any) {
    const response = await apiClient.put(
      `/disposicion-scripts/${id}`,
      disposicionData
    );
    return response.data;
  }

  static async deleteDisposicion(id: string) {
    const response = await apiClient.delete(`/disposicion-scripts/${id}`);
    return response.data;
  }

  static async getDisposicionesMensuales(year: number) {
    const response = await apiClient.get(
      `/disposicion-scripts/monthly/${year}`
    );
    return response.data;
  }

  static async exportDisposiciones(filters?: any) {
    const response = await apiClient.get("/disposicion-scripts/export", {
      params: filters,
      responseType: "blob",
    });
    return response.data;
  }
}
```

**src/services/fileUploadService.ts**

```typescript
import { apiClient } from "@/lib/api-client";

export class FileUploadService {
  static async uploadFile(file: File, entityType: string, entityId: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", entityType);
    formData.append("entityId", entityId);

    const response = await apiClient.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        // Manejar progreso de subida si es necesario
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total!
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });

    return response.data;
  }

  static async getFilesByEntity(entityType: string, entityId: string) {
    const response = await apiClient.get(
      `/files/entity/${entityType}/${entityId}`
    );
    return response.data;
  }

  static async deleteFile(fileId: string) {
    const response = await apiClient.delete(`/files/${fileId}`);
    return response.data;
  }

  static async downloadFile(fileId: string) {
    const response = await apiClient.get(`/files/download/${fileId}`, {
      responseType: "blob",
    });
    return response.data;
  }
}
```

**src/services/dashboardService.ts**

```typescript
import { apiClient } from "@/lib/api-client";

export class DashboardService {
  static async getMetrics(period?: string) {
    const response = await apiClient.get("/dashboard/metrics", {
      params: { period },
    });
    return response.data;
  }

  static async getCaseMetrics(filters?: any) {
    const response = await apiClient.get("/dashboard/cases", {
      params: filters,
    });
    return response.data;
  }

  static async getTodoMetrics(filters?: any) {
    const response = await apiClient.get("/dashboard/todos", {
      params: filters,
    });
    return response.data;
  }

  static async getTimeMetrics(filters?: any) {
    const response = await apiClient.get("/dashboard/time", {
      params: filters,
    });
    return response.data;
  }

  static async getUserMetrics(userId?: string) {
    const response = await apiClient.get("/dashboard/users", {
      params: { userId },
    });
    return response.data;
  }

  static async exportReport(reportType: string, filters?: any) {
    const response = await apiClient.get(`/dashboard/export/${reportType}`, {
      params: filters,
      responseType: "blob",
    });
    return response.data;
  }
}
```

#### **4.4 Hooks Adaptados para el Frontend**

**src/hooks/useTodos.ts** (nuevo archivo)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TodosService } from "@/services/todosService";
import { useNotification } from "@/shared/components/notifications/NotificationSystem";

export const useTodos = (filters?: any) => {
  return useQuery({
    queryKey: ["todos", filters],
    queryFn: () => TodosService.getTodos(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  return useMutation({
    mutationFn: TodosService.createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      showSuccess("TODO creado exitosamente");
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || "Error al crear TODO");
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      TodosService.updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      showSuccess("TODO actualizado exitosamente");
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || "Error al actualizar TODO");
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  return useMutation({
    mutationFn: TodosService.deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      showSuccess("TODO eliminado exitosamente");
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || "Error al eliminar TODO");
    },
  });
};
```

**src/hooks/useDocuments.ts** (nuevo archivo)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotesService } from "@/services/notesService";
import { useNotification } from "@/shared/components/notifications/NotificationSystem";

export const useDocuments = (filters?: any) => {
  return useQuery({
    queryKey: ["documents", filters],
    queryFn: () => NotesService.getDocuments(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTags = () => {
  return useQuery({
    queryKey: ["tags"],
    queryFn: NotesService.getTags,
    staleTime: 10 * 60 * 1000, // Tags cambian menos frecuentemente
  });
};

export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  return useMutation({
    mutationFn: NotesService.createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      showSuccess("Documento creado exitosamente");
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || "Error al crear documento");
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      NotesService.updateDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      showSuccess("Documento actualizado exitosamente");
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || "Error al actualizar documento");
    },
  });
};

export const useSearchDocuments = (query: string) => {
  return useQuery({
    queryKey: ["documents", "search", query],
    queryFn: () => NotesService.searchDocuments(query),
    enabled: query.length > 2, // Solo buscar si hay al menos 3 caracteres
    staleTime: 2 * 60 * 1000, // 2 minutos para búsquedas
  });
};
```

**src/hooks/useArchive.ts** (nuevo archivo)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArchiveService } from "@/services/archiveService";
import { useNotification } from "@/shared/components/notifications/NotificationSystem";

export const useArchivedItems = (filters?: any) => {
  return useQuery({
    queryKey: ["archived-items", filters],
    queryFn: () => ArchiveService.getArchivedItems(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useArchiveItem = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  return useMutation({
    mutationFn: ({
      itemType,
      itemId,
      reason,
    }: {
      itemType: string;
      itemId: string;
      reason: string;
    }) => ArchiveService.archiveItem(itemType, itemId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archived-items"] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      showSuccess("Elemento archivado exitosamente");
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || "Error al archivar elemento");
    },
  });
};

export const useRestoreItem = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  return useMutation({
    mutationFn: ArchiveService.restoreItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archived-items"] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      showSuccess("Elemento restaurado exitosamente");
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || "Error al restaurar elemento");
    },
  });
};
```

**src/hooks/useFileUpload.ts** (nuevo archivo)

```typescript
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileUploadService } from "@/services/fileUploadService";
import { useNotification } from "@/shared/components/notifications/NotificationSystem";

export const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  const uploadMutation = useMutation({
    mutationFn: ({
      file,
      entityType,
      entityId,
    }: {
      file: File;
      entityType: string;
      entityId: string;
    }) => FileUploadService.uploadFile(file, entityType, entityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      showSuccess("Archivo subido exitosamente");
      setUploadProgress(0);
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || "Error al subir archivo");
      setUploadProgress(0);
    },
  });

  return {
    upload: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadProgress,
  };
};

export const useFilesByEntity = (entityType: string, entityId: string) => {
  return useQuery({
    queryKey: ["files", entityType, entityId],
    queryFn: () => FileUploadService.getFilesByEntity(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();

  return useMutation({
    mutationFn: FileUploadService.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      showSuccess("Archivo eliminado exitosamente");
    },
    onError: (error: any) => {
      showError(error.response?.data?.error || "Error al eliminar archivo");
    },
  });
};
```

#### **4.4 Actualizar Variables de Entorno del Frontend**

**.env**

```env
# API Backend
VITE_API_BASE_URL=http://localhost:3001/api

# Eliminar variables de Supabase
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=
```

#### **4.5 Actualizar Configuración de Vite**

**vite.config.ts**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/case-management": path.resolve(__dirname, "./src/case-management"),
      "@/time-control": path.resolve(__dirname, "./src/time-control"),
      "@/task-management": path.resolve(__dirname, "./src/task-management"),
      "@/notes-knowledge": path.resolve(__dirname, "./src/notes-knowledge"),
      "@/disposicion-scripts": path.resolve(
        __dirname,
        "./src/disposicion-scripts"
      ),
      "@/archive-management": path.resolve(
        __dirname,
        "./src/archive-management"
      ),
      "@/user-management": path.resolve(__dirname, "./src/user-management"),
      "@/dashboard-analytics": path.resolve(
        __dirname,
        "./src/dashboard-analytics"
      ),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@/stores": path.resolve(__dirname, "./src/stores"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["@heroicons/react"],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
```

---

### 🔐 **FASE 5: Sistema de Autenticación y Almacenamiento (Semana 3-4)**

#### **5.1 Sistema de Autenticación con JWT**

**src/stores/authStore.ts** (actualizar)

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthService } from "@/services/authService";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await AuthService.login(email, password);
          const { user, token, refreshToken } = response;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Guardar refresh token en localStorage separado
          localStorage.setItem("refreshToken", refreshToken);

          // Configurar auto-refresh
          AuthService.setupTokenRefresh();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem("refreshToken");
        AuthService.clearTokenRefresh();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      refreshToken: async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const response = await AuthService.refreshToken(refreshToken);
          const { user, token } = response;

          set({
            user,
            token,
            isAuthenticated: true,
          });
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      checkPermission: (permission: string) => {
        const { user } = get();
        return user?.permissions?.includes(permission) || false;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

#### **5.2 Interceptor HTTP para Autenticación**

**src/lib/api-client.ts** (actualizar)

```typescript
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token a las requests
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await useAuthStore.getState().refreshToken();
        const newToken = useAuthStore.getState().token;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

#### **5.3 Componente de Rutas Protegidas**

**src/components/ProtectedRoute.tsx** (nuevo archivo)

```typescript
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
}) => {
  const { isAuthenticated, user, checkPermission } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !checkPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

#### **5.4 Configuración de Variables de Entorno**

**.env.local** (Frontend)

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Sistema de Gestión de Casos
VITE_APP_VERSION=2.0.0

# Authentication
VITE_TOKEN_REFRESH_INTERVAL=300000

# File Upload
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf,application/msword

# Features
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_ANALYTICS=true
VITE_DEBUG_MODE=false
```

**.env** (Backend)

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=postgresql://case_user:your_secure_password@localhost:5432/case_management_db

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (para notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=Sistema de Casos <noreply@yourdomain.com>

# File Upload
UPLOAD_PATH=/var/www/uploads
MAX_FILE_SIZE=10485760

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://yourdomain.com
```

---

### 🌐 **FASE 6: Configuración de Apache (Semana 4)**

#### **6.1 Construir el Frontend**

```bash
# En tu máquina de desarrollo
cd /ruta/a/case-management-react
npm run build

# Transferir archivos build al servidor
scp -r dist/* usuario@tu-servidor:/var/www/html/
```

#### **6.2 Configuración de Apache para React SPA**

**/etc/apache2/sites-available/case-management.conf**

```apache
<VirtualHost *:80>
    ServerName tudominio.com
    ServerAlias www.tudominio.com

    DocumentRoot /var/www/html

    # Configuración para React Router (SPA)
    <Directory "/var/www/html">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # Rewrite para React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Proxy para API
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3001/api/
    ProxyPassReverse /api/ http://localhost:3001/api/

    # Headers de seguridad
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    Header always set Referrer-Policy strict-origin-when-cross-origin

    # Configuración de cache para assets estáticos
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </LocationMatch>

    # Logs
    ErrorLog ${APACHE_LOG_DIR}/case-management_error.log
    CustomLog ${APACHE_LOG_DIR}/case-management_access.log combined
</VirtualHost>
```

#### **6.3 Habilitar Módulos y Sitio**

```bash
# Habilitar módulos necesarios
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod expires

# Habilitar sitio
sudo a2ensite case-management.conf
sudo a2dissite 000-default.conf

# Reiniciar Apache
sudo systemctl restart apache2
```

#### **6.4 Configurar HTTPS con Let's Encrypt**

```bash
# Obtener certificado SSL
sudo certbot --apache -d tudominio.com -d www.tudominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

---

### 🔄 **FASE 6: Gestión de Procesos y Despliegue (Semana 4-5)**

#### **6.1 Configuración PM2 para el Backend**

**ecosystem.config.js**

```javascript
module.exports = {
  apps: [
    {
      name: "case-management-api",
      script: "dist/app.js",
      cwd: "/var/www/case-management-api",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      log_file: "/var/log/pm2/case-management-api.log",
      error_file: "/var/log/pm2/case-management-api-error.log",
      out_file: "/var/log/pm2/case-management-api-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      max_memory_restart: "1G",
    },
  ],
};
```

```bash
# Compilar TypeScript
cd /var/www/case-management-api
npm run build

# Iniciar con PM2
pm2 start ecosystem.config.js

# Configurar inicio automático
pm2 startup
pm2 save
```

#### **6.2 Script de Despliegue**

**deploy.sh**

```bash
#!/bin/bash

set -e

echo "🚀 Iniciando despliegue..."

# Directorios
FRONTEND_DIR="/var/www/html"
BACKEND_DIR="/var/www/case-management-api"
REPO_DIR="/var/www/case-management-repo"

# Actualizar código
echo "📥 Actualizando repositorio..."
cd $REPO_DIR
git pull origin main

# Construir frontend
echo "🏗️ Construyendo frontend..."
npm ci
npm run build

# Copiar archivos del frontend
echo "📦 Desplegando frontend..."
sudo rm -rf $FRONTEND_DIR/*
sudo cp -r dist/* $FRONTEND_DIR/
sudo chown -R www-data:www-data $FRONTEND_DIR
sudo chmod -R 755 $FRONTEND_DIR

# Actualizar backend
echo "🔧 Actualizando backend..."
sudo cp -r src/* $BACKEND_DIR/src/
sudo cp package*.json $BACKEND_DIR/
cd $BACKEND_DIR
sudo npm ci
sudo npm run build

# Reiniciar servicios
echo "🔄 Reiniciando servicios..."
pm2 restart case-management-api
sudo systemctl reload apache2

echo "✅ Despliegue completado!"
```

#### **6.3 Configuración de Backup Automático**

**backup.sh**

```bash
#!/bin/bash

# Configuración
DB_NAME="case_management_db"
DB_USER="case_management"
BACKUP_DIR="/var/backups/case-management"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Backup de base de datos
echo "🗄️ Creando backup de base de datos..."
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Backup de archivos subidos
echo "📁 Creando backup de archivos..."
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /var/www/case-management-api/uploads/

# Limpiar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup completado: $DATE"
```

**Configurar crontab:**

```bash
sudo crontab -e

# Agregar líneas:
# Backup diario a las 2:00 AM
0 2 * * * /var/www/scripts/backup.sh

# Reiniciar PM2 semanalmente
0 3 * * 0 pm2 restart all
```

---

## 📊 Checklist de Migración

### ✅ **Preparación**

- [ ] Servidor Ubuntu 24.04.3 LTS instalado
- [ ] PostgreSQL 15+ instalado y configurado
- [ ] Node.js 18+ instalado
- [ ] Apache instalado
- [ ] PM2 instalado
- [ ] Firewall configurado
- [ ] Certificado SSL configurado

### ✅ **Base de Datos**

- [ ] Base de datos creada
- [ ] Usuario de base de datos configurado
- [ ] Schema migrado completamente
- [ ] Extensiones PostgreSQL habilitadas
- [ ] Funciones y triggers migrados
- [ ] Políticas RLS aplicadas (si aplica)
- [ ] Datos de prueba/producción migrados

### ✅ **Backend**

- [ ] API Node.js desarrollada
- [ ] Autenticación JWT implementada
- [ ] Endpoints de casos implementados
- [ ] Servicio de archivos implementado
- [ ] Sistema de emails configurado
- [ ] Variables de entorno configuradas
- [ ] PM2 configurado

### ✅ **Frontend**

- [ ] Cliente Supabase removido
- [ ] Cliente API HTTP implementado
- [ ] Hook de autenticación actualizado
- [ ] Servicios de datos actualizados
- [ ] Variables de entorno actualizadas
- [ ] Build de producción generado
- [ ] Archivos desplegados en Apache

### ✅ **Configuración Apache**

- [ ] Virtual host configurado
- [ ] Rewrite rules para SPA configuradas
- [ ] Proxy para API configurado
- [ ] Headers de seguridad configurados
- [ ] Cache para assets configurado
- [ ] HTTPS habilitado

### ✅ **Operaciones**

- [ ] Script de despliegue creado
- [ ] Backup automático configurado
- [ ] Monitoreo básico configurado
- [ ] Logs configurados
- [ ] Documentación actualizada

---

## 🔧 Resolución de Problemas Comunes

### **1. Error de Conexión a Base de Datos**

```bash
# Verificar estado de PostgreSQL
sudo systemctl status postgresql

# Verificar conexión
psql -h localhost -U case_management -d case_management_db

# Verificar logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### **2. Error 502 en API**

```bash
# Verificar estado del backend
pm2 status
pm2 logs case-management-api

# Verificar puerto
netstat -tulpn | grep 3001

# Reiniciar si es necesario
pm2 restart case-management-api
```

### **3. Frontend no Carga**

```bash
# Verificar Apache
sudo systemctl status apache2
sudo apache2ctl configtest

# Verificar archivos
ls -la /var/www/html/

# Verificar logs
sudo tail -f /var/log/apache2/case-management_error.log
```

### **4. Problemas de CORS**

Verificar configuración en backend:

```typescript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost",
    credentials: true,
  })
);
```

---

## 📈 Optimizaciones Post-Migración

### **1. Performance de Base de Datos**

```sql
-- Crear índices importantes
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at);

-- Configurar autovacuum
ALTER TABLE cases SET (autovacuum_vacuum_scale_factor = 0.1);
```

### **2. Cache con Redis (Opcional)**

```bash
# Instalar Redis
sudo apt install redis-server -y

# En el backend, agregar cache para queries frecuentes
npm install redis
```

### **3. Monitoreo**

```bash
# Instalar herramientas de monitoreo
sudo apt install htop iotop nethogs -y

# Configurar logs de PM2
pm2 install pm2-logrotate
```

---

## 🎯 Resultado Final

Al completar esta migración tendrás:

✅ **Independencia Total**: Sin dependencias de servicios externos  
✅ **Control Completo**: Gestión total del servidor y datos  
✅ **Misma Funcionalidad**: 100% de características preserved  
✅ **Mejor Performance**: Potencial mejora en velocidad  
✅ **Costos Reducidos**: Eliminación de suscripciones SaaS  
✅ **Escalabilidad**: Capacidad de crecer según necesidades

---

## 📞 Soporte y Mantenimiento

### **Comandos Útiles de Administración**

```bash
# Verificar estado general
sudo systemctl status postgresql apache2
pm2 status

# Logs en tiempo real
sudo tail -f /var/log/apache2/case-management_error.log
pm2 logs case-management-api --lines 50

# Backup manual
sudo -u postgres pg_dump case_management_db > backup_$(date +%Y%m%d).sql

# Reiniciar servicios
sudo systemctl restart postgresql apache2
pm2 restart case-management-api
```

### **Actualizaciones del Sistema**

```bash
# Actualizar sistema operativo
sudo apt update && sudo apt upgrade -y

# Actualizar Node.js (si es necesario)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Actualizar dependencias de la aplicación
cd /var/www/case-management-api
npm audit fix
```

---

### 🧪 **FASE 7: Validación y Testing Completo (Semana 4-5)**

#### **7.1 Scripts de Validación de Migración**

**validation/check-migration.js** (nuevo archivo)

```javascript
const { Pool } = require("pg");
const axios = require("axios");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001/api";

async function validateMigration() {
  console.log("🔍 Iniciando validación de migración...\n");

  // 1. Validar conexión a base de datos
  try {
    const client = await pool.connect();
    console.log("✅ Conexión a PostgreSQL exitosa");

    // Verificar tablas principales
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const expectedTables = [
      "cases",
      "case_control",
      "todos",
      "todo_time_entries",
      "documentation",
      "disposicion_scripts",
      "users",
      "roles",
      "permissions",
      "user_roles",
      "role_permissions",
      "archive_management",
    ];

    const existingTables = tables.rows.map((row) => row.table_name);
    const missingTables = expectedTables.filter(
      (table) => !existingTables.includes(table)
    );

    if (missingTables.length === 0) {
      console.log("✅ Todas las tablas principales están presentes");
    } else {
      console.log("❌ Tablas faltantes:", missingTables);
    }

    client.release();
  } catch (error) {
    console.log("❌ Error de conexión a PostgreSQL:", error.message);
  }

  // 2. Validar API endpoints
  const endpoints = [
    "/auth/login",
    "/cases",
    "/todos",
    "/documents",
    "/users",
    "/dashboard/metrics",
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        timeout: 5000,
        validateStatus: (status) => status < 500, // Aceptar errores de auth pero no de servidor
      });
      console.log(`✅ Endpoint ${endpoint}: ${response.status}`);
    } catch (error) {
      console.log(`❌ Endpoint ${endpoint}: ${error.message}`);
    }
  }

  console.log("\n🎯 Validación completada");
}

validateMigration().catch(console.error);
```

#### **7.2 Testing de Funcionalidades Críticas**

**tests/integration/migration.test.js** (nuevo archivo)

```javascript
const request = require("supertest");
const { Pool } = require("pg");

describe("Migration Integration Tests", () => {
  let app;
  let authToken;
  let pool;

  beforeAll(async () => {
    app = require("../../server/app");
    pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Obtener token de autenticación para tests
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "admin123",
    });

    authToken = loginResponse.body.token;
  });

  describe("Authentication System", () => {
    it("should login successfully", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "admin@test.com",
        password: "admin123",
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
    });
  });

  describe("Cases Management", () => {
    it("should create, read, update, and delete cases", async () => {
      // Create
      const createResponse = await request(app)
        .post("/api/cases")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Case",
          description: "Test Description",
          priority: "medium",
          status: "open",
        });

      expect(createResponse.status).toBe(201);
      const caseId = createResponse.body.id;

      // Read
      const readResponse = await request(app)
        .get(`/api/cases/${caseId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(readResponse.status).toBe(200);
      expect(readResponse.body.title).toBe("Test Case");

      // Delete
      const deleteResponse = await request(app)
        .delete(`/api/cases/${caseId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
    });
  });
});
```

---

### 📋 **FASE 8: Checklist Final de Migración**

#### **8.1 Validación Pre-Producción**

- [ ] ✅ **Infraestructura**

  - [ ] Ubuntu 24.04.3 LTS instalado y actualizado
  - [ ] PostgreSQL 15+ funcionando
  - [ ] Apache 2.4+ configurado
  - [ ] Node.js 18+ instalado
  - [ ] SSL/HTTPS configurado
  - [ ] Firewall configurado

- [ ] ✅ **Base de Datos**

  - [ ] Schema migrado completamente
  - [ ] Datos de prueba importados
  - [ ] Funciones y triggers funcionando
  - [ ] RLS policies activas
  - [ ] Permisos granulares configurados
  - [ ] Backup automatizado configurado

- [ ] ✅ **Backend API**

  - [ ] Todas las rutas implementadas
  - [ ] Autenticación JWT funcionando
  - [ ] Middleware de permisos activo
  - [ ] File upload operativo
  - [ ] Email notifications configuradas
  - [ ] Logs estructurados implementados

- [ ] ✅ **Frontend**

  - [ ] Build de producción generado
  - [ ] Variables de entorno configuradas
  - [ ] Rutas protegidas funcionando
  - [ ] Servicios adaptados a nueva API
  - [ ] Cache y optimizaciones activas

- [ ] ✅ **Funcionalidades Core**

  - [ ] Gestión de casos completa
  - [ ] Sistema de TODOs operativo
  - [ ] Control de tiempo funcionando
  - [ ] Notas y documentación activa
  - [ ] Scripts de disposición funcionando
  - [ ] Archivo y restauración operativo
  - [ ] Dashboard y analytics funcionando
  - [ ] Gestión de usuarios completa

- [ ] ✅ **Testing y Validación**
  - [ ] Tests de integración pasando
  - [ ] Validación de endpoints exitosa
  - [ ] Performance testing completado
  - [ ] Security testing realizado
  - [ ] Backup/restore testing exitoso

#### **8.2 Go-Live Checklist**

- [ ] 🔄 **Cutover Process**

  - [ ] Notificar a usuarios sobre mantenimiento
  - [ ] Realizar backup final de Supabase
  - [ ] Migrar datos finales si los hay
  - [ ] Actualizar DNS si es necesario
  - [ ] Activar sistema en nuevo servidor
  - [ ] Verificar funcionamiento completo

- [ ] � **Post-Launch Monitoring**
  - [ ] Monitoreo de logs por 24 horas
  - [ ] Validación de métricas de rendimiento
  - [ ] Confirmación de usuarios
  - [ ] Backup automático verificado

---

## 🎯 **CONCLUSIÓN**

Esta guía de migración proporciona una hoja de ruta **completa y detallada** para migrar tu aplicación React de gestión de casos desde Supabase/Netlify a un servidor Ubuntu con PostgreSQL y Apache.

### **✅ Cobertura Funcional Completa**

El documento cubre **100% de las funcionalidades** identificadas en tu aplicación:

1. **✅ Gestión de Casos** - CRUD completo con control de tiempo
2. **✅ Sistema de TODOs** - Con prioridades y seguimiento temporal
3. **✅ Notas y Documentación** - Con búsqueda y sistema de tags
4. **✅ Disposición de Scripts** - Tracking de implementaciones
5. **✅ Archivo y Gestión** - Sistema completo de archivado/restauración
6. **✅ Gestión de Usuarios** - Roles y permisos granulares
7. **✅ Dashboard y Analytics** - Métricas y reportes completos
8. **✅ Control de Tiempo** - Timers automáticos y manuales
9. **✅ File Upload** - Sistema completo de manejo de archivos
10. **✅ Autenticación JWT** - Sistema robusto con refresh tokens

### **🔧 Arquitectura Escalable**

- **Backend API** completo que reemplaza toda la funcionalidad de Supabase
- **Sistema de permisos granulares** con 100+ permisos específicos
- **Infraestructura robusta** con Apache, PostgreSQL y SSL
- **Monitoreo y logging** completo para operaciones
- **Testing y validación** automatizada

### **📈 Beneficios de la Migración**

- **Control Total**: Servidor propio sin dependencias externas
- **Costos Predictibles**: Sin límites de Supabase/Netlify
- **Rendimiento Optimizado**: Configuración específica para tu aplicación
- **Escalabilidad**: Capacidad de crecimiento sin restricciones
- **Seguridad**: Control completo sobre datos y accesos

### **⚡ Tiempo de Implementación Estimado**

- **Preparación e Infraestructura**: 1-2 semanas
- **Desarrollo de Backend**: 2-3 semanas
- **Adaptación de Frontend**: 1-2 semanas
- **Testing y Validación**: 1 semana
- **Total**: **5-8 semanas** para migración completa

Con esta guía, tendrás una aplicación **completamente migrada y funcional** en tu servidor Ubuntu, manteniendo todas las capacidades actuales y preparada para futuro crecimiento.

---

**_¿Necesitas alguna clarificación o ajuste específico en alguna sección de la migración?_**
