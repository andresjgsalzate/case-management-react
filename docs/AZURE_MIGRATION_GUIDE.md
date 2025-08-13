# 🚀 Guía de Migración a Microsoft Azure - Sistema de Gestión de Casos

## 📋 Tabla de Contenidos
1. [Análisis del Estado Actual](#análisis-del-estado-actual)
2. [Arquitectura Objetivo en Azure](#arquitectura-objetivo-en-azure)
3. [Lógica de Negocio a Migrar del Frontend](#lógica-de-negocio-a-migrar-del-frontend)
4. [Plan de Migración por Fases](#plan-de-migración-por-fases)
5. [Configuración de Servicios Azure](#configuración-de-servicios-azure)
6. [Estructura del Proyecto Unificado](#estructura-del-proyecto-unificado)
7. [Deployment Unificado](#deployment-unificado)
8. [Testing y Validación](#testing-y-validación)
9. [CI/CD con Azure DevOps](#cicd-con-azure-devops)
10. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)

---

## 🔍 Análisis del Estado Actual

### **Stack Tecnológico Actual**
- **Frontend**: React + Vite + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Deploy**: Netlify
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Email**: Sistema SMTP personalizado + Supabase

### **Funcionalidades Principales Identificadas**
1. ✅ **Gestión de Casos** con clasificación automática
2. ✅ **Control de Tiempo** con timers y métricas
3. ✅ **Base de Conocimiento** con documentación avanzada
4. ✅ **Sistema de TODOs** empresarial
5. ✅ **Gestión de Usuarios** y permisos granulares
6. ✅ **Sistema de Archivo** inteligente
7. ✅ **Reportes y Analytics** con exportación
8. ✅ **Sistema de Email** personalizado
9. ✅ **Disposición de Scripts** especializados

---

## 🏗️ Arquitectura Objetivo en Azure

### **Diagrama de Arquitectura Azure - Despliegue Unificado**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Azure CDN     │────│   Azure DNS      │    │   Traffic Mgr   │
│   (CDN Global)  │    │   (DNS)          │    │   (Load Bal.)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                               │
         ▼                                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AZURE APP SERVICE                            │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │   Frontend      │    │   Backend API    │                   │
│  │   (React SPA)   │    │   (Node.js/Expr)│                   │
│  │   /public       │    │   /api           │                   │
│  └─────────────────┘    └──────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
         │                                               │
         ▼                                               ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Azure AD B2C  │────│  Azure Database  │    │   Azure Blob    │
│   (Auth)        │    │  for PostgreSQL │    │   Storage       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                               │
         ▼                                               ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   SendGrid      │    │ Application      │    │   Azure         │
│   (Email)       │    │ Insights         │    │   Key Vault     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **Servicios Azure por Función**

| **Funcionalidad** | **Servicio Azure** | **Configuración** |
|-------------------|-------------------|-------------------|
| **Hosting Unificado** | Azure App Service | Frontend + Backend en un plan |
| **Base de Datos** | Azure Database for PostgreSQL | Flexible Server con HA |
| **Autenticación** | Azure AD B2C | Custom policies + JWT |
| **Storage de Archivos** | Azure Blob Storage | Hot tier con CDN |
| **Email** | SendGrid (Azure Marketplace) | SMTP + Templates |
| **CDN** | Azure CDN | Global distribution |
| **CI/CD** | Azure DevOps | Pipelines + Repos |
| **Monitoreo** | Application Insights | APM + Logs |
| **Secrets** | Azure Key Vault | Certificados y secrets |
| **DNS** | Azure DNS | Domain management |

---

## 🔄 Lógica de Negocio a Migrar del Frontend

### **Análisis de Responsabilidades Actuales**

#### **❌ Lo que NO debería estar en el Frontend**

1. **🔐 Validaciones de Seguridad Críticas**
   ```typescript
   // ACTUAL: src/shared/hooks/useAuth.ts
   // MIGRAR → Backend API: Validación de tokens, permisos, roles
   ```

2. **💾 Operaciones de Base de Datos Complejas**
   ```typescript
   // ACTUAL: src/shared/services/customPasswordReset.ts
   // MIGRAR → Backend API: Gestión de tokens, encriptación SMTP
   ```

3. **📊 Cálculos de Métricas y Reportes**
   ```typescript
   // ACTUAL: Cálculo de complejidad de casos en frontend
   // MIGRAR → Backend API: Algoritmos de clasificación automática
   ```

4. **📧 Configuración y Envío de Emails**
   ```typescript
   // ACTUAL: src/shared/services/EmailService.ts
   // MIGRAR → Backend API: Configuración SMTP, templates, limitación
   ```

5. **🔍 Validaciones de Negocio Complejas**
   ```typescript
   // ACTUAL: src/utils/validateEmailSystemComplete.ts
   // MIGRAR → Backend API: Validaciones de integridad del sistema
   ```

#### **✅ Lo que debe permanecer en el Frontend**

1. **🎨 Validaciones de UI/UX**
   ```typescript
   // MANTENER: src/shared/lib/validations.ts
   // Validaciones de formularios y experiencia de usuario
   ```

2. **🔄 Estado de la Aplicación**
   ```typescript
   // MANTENER: Zustand stores, React Query cache
   // Gestión de estado local y caché de datos
   ```

3. **🎯 Lógica de Presentación**
   ```typescript
   // MANTENER: Formateo de datos, filtros de UI, navegación
   ```

---

## 📅 Plan de Migración por Fases

### **🎯 FASE 1: Preparación e Infraestructura (Semanas 1-2)**

#### **1.1 Setup Inicial de Azure**
- [ ] Configurar Azure CLI y suscripción
- [ ] Crear Resource Group
- [ ] Setup de Azure App Service Plan
- [ ] Configurar Azure Database for PostgreSQL
- [ ] Setup de Azure Blob Storage

#### **1.2 Migración de Base de Datos**
```bash
# 1. Exportar esquema actual de Supabase
pg_dump -h [supabase-host] -U [user] -d [database] --schema-only > schema.sql

# 2. Migrar datos
pg_dump -h [supabase-host] -U [user] -d [database] --data-only > data.sql

# 3. Importar a Azure PostgreSQL
psql -h [azure-postgres-server].postgres.database.azure.com -U [user] -d [database] < schema.sql
psql -h [azure-postgres-server].postgres.database.azure.com -U [user] -d [database] < data.sql
```

#### **1.3 Configuración de Azure AD B2C**
```json
{
  "tenant": "your-tenant.onmicrosoft.com",
  "clientId": "your-client-id",
  "authority": "https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/B2C_1_signupsignin",
  "knownAuthorities": ["your-tenant.b2clogin.com"],
  "redirectUri": "https://your-app.azurewebsites.net/auth/callback",
  "postLogoutRedirectUri": "https://your-app.azurewebsites.net/",
  "scopes": ["openid", "profile", "email"]
}
```

### **🔧 FASE 2: Desarrollo del Proyecto Unificado (Semanas 3-5)**

#### **2.1 Estructura del Proyecto Unificado**
```
case-management-azure/
├── client/                  # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   └── utils/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── server/                  # Backend Node.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── config/
│   ├── tests/
│   └── package.json
├── shared/                  # Código compartido
│   ├── types/
│   ├── constants/
│   └── validation/
├── scripts/                 # Scripts de build y deploy
│   ├── build.js
│   ├── deploy.js
│   └── setup.js
├── azure-pipelines.yml      # CI/CD Azure DevOps
├── web.config              # IIS configuration
├── package.json            # Root package.json
└── README.md
```

#### **2.2 Configuración Root del Proyecto**

**package.json (Root)**
```json
{
  "name": "case-management-azure",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run server:dev\" \"npm run client:dev\"",
    "build": "npm run client:build && npm run server:build",
    "start": "node server/dist/app.js",
    "client:dev": "cd client && npm run dev",
    "client:build": "cd client && npm run build",
    "server:dev": "cd server && npm run dev",
    "server:build": "cd server && npm run build",
    "test": "npm run client:test && npm run server:test",
    "client:test": "cd client && npm test",
    "server:test": "cd server && npm test",
    "deploy": "node scripts/deploy.js"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

**web.config (Para IIS en Azure App Service)**
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <!-- Indicates that the server.js file is a node.js site to be handled by the iisnode module -->
      <add name="iisnode" path="server/dist/app.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <!-- API routes -->
        <rule name="API">
          <match url="^api/(.*)$" />
          <action type="Rewrite" url="server/dist/app.js" />
        </rule>
        
        <!-- Static files -->
        <rule name="StaticContent">
          <match url="^(css|js|images|fonts)/.*$" />
          <action type="Rewrite" url="client/dist/{R:0}" />
        </rule>
        
        <!-- SPA fallback -->
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
          </conditions>
          <action type="Rewrite" url="client/dist/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

#### **2.3 Configuración del Backend**

**server/package.json**
```json
{
  "name": "case-management-server",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "typescript": "^5.0.0",
    "@azure/identity": "^3.2.0",
    "@azure/keyvault-secrets": "^4.7.0",
    "@azure/storage-blob": "^12.15.0",
    "@azure/msal-node": "^2.0.0",
    "pg": "^8.11.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "joi": "^17.9.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.7.0",
    "winston": "^3.9.0",
    "@sendgrid/mail": "^7.7.0",
    "applicationinsights": "^2.7.0"
  }
}
```

**server/src/app.ts**
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { setupRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { setupAzureServices } from './config/azure';
import { logger } from './utils/logger';
import appInsights from 'applicationinsights';

// Configurar Application Insights
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights.setup().start();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar Azure services
setupAzureServices();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Permitir inline scripts para React
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-app.azurewebsites.net']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));
}

// API Routes
app.use('/api', setupRoutes());

// SPA fallback - servir index.html para rutas no API
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    }
  });
}

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

export { app };
```

#### **2.4 Servicios Core del Backend**

**server/src/services/authService.ts**
```typescript
import { ConfidentialClientApplication } from '@azure/msal-node';
import { DatabaseService } from '../utils/database';
import { logger } from '../utils/logger';
import { KeyVaultService } from '../utils/keyVault';

export class AuthService {
  private msalApp: ConfidentialClientApplication;
  private db: DatabaseService;
  private keyVault: KeyVaultService;

  constructor() {
    this.keyVault = new KeyVaultService();
    this.db = new DatabaseService();
    
    this.msalApp = new ConfidentialClientApplication({
      auth: {
        clientId: process.env.AZURE_CLIENT_ID!,
        clientSecret: process.env.AZURE_CLIENT_SECRET!,
        authority: `https://${process.env.AZURE_TENANT}.b2clogin.com/${process.env.AZURE_TENANT}.onmicrosoft.com/B2C_1_signupsignin`
      }
    });
  }

  async validateToken(token: string): Promise<any> {
    try {
      // Validar token con Azure AD B2C
      const decodedToken = await this.msalApp.acquireTokenSilent({
        scopes: ['openid', 'profile'],
        account: null // Implementar lógica de cuenta
      });

      // Obtener perfil de usuario desde base de datos
      const userProfile = await this.db.query(
        'SELECT * FROM user_profiles WHERE azure_id = $1',
        [decodedToken.account?.localAccountId]
      );

      return {
        valid: true,
        user: userProfile.rows[0],
        azureAccount: decodedToken.account
      };
    } catch (error) {
      logger.error('Token validation failed:', error);
      return { valid: false };
    }
  }

  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      // 1. Crear usuario en base de datos local
      const userProfile = await this.db.query(`
        INSERT INTO user_profiles (azure_id, email, full_name, role_id, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [userData.azureId, userData.email, userData.fullName, userData.roleId, true]);

      // 2. Enviar email de bienvenida
      await this.sendWelcomeEmail(userData.email, userData.fullName);

      return {
        success: true,
        userId: userProfile.rows[0].id,
        message: 'Usuario creado exitosamente'
      };
    } catch (error) {
      logger.error('Error creating user:', error);
      throw new Error('Error al crear usuario');
    }
  }

  async validateUserPermissions(userId: string, resource: string, action: string): Promise<boolean> {
    // Migrar lógica de validación de permisos desde el frontend
    const result = await this.db.query(`
      SELECT validate_user_permission($1, $2, $3) as has_permission
    `, [userId, resource, action]);

    return result.rows[0]?.has_permission || false;
  }

  private async sendWelcomeEmail(email: string, name: string) {
    // Implementar con SendGrid
    // Se detalla en emailService.ts
  }
}
```

**server/src/services/emailService.ts**
```typescript
import sgMail from '@sendgrid/mail';
import { DatabaseService } from '../utils/database';
import { logger } from '../utils/logger';
import { KeyVaultService } from '../utils/keyVault';

export class EmailService {
  private db: DatabaseService;
  private keyVault: KeyVaultService;

  constructor() {
    this.db = new DatabaseService();
    this.keyVault = new KeyVaultService();
    this.initializeSendGrid();
  }

  private async initializeSendGrid() {
    try {
      const apiKey = await this.keyVault.getSecret('sendgrid-api-key');
      sgMail.setApiKey(apiKey);
    } catch (error) {
      logger.error('Failed to initialize SendGrid:', error);
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      // 1. Validar que el usuario existe
      const user = await this.db.query(
        'SELECT id, full_name FROM user_profiles WHERE email = $1 AND is_active = true',
        [email]
      );

      if (user.rows.length === 0) {
        logger.info(`Password reset requested for non-existent email: ${email}`);
        return;
      }

      // 2. Generar token seguro
      const resetToken = this.generateSecureToken();
      const expiresAt = new Date(Date.now() + 3600000); // 1 hora

      // 3. Guardar token en base de datos
      await this.db.query(`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) 
        DO UPDATE SET token = $2, expires_at = $3, created_at = NOW()
      `, [user.rows[0].id, resetToken, expiresAt]);

      // 4. Obtener template de email
      const template = await this.getEmailTemplate('password_reset');
      
      // 5. Renderizar template con datos
      const emailContent = this.renderTemplate(template.content, {
        userName: user.rows[0].full_name,
        resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
        expirationTime: '1 hora'
      });

      // 6. Enviar email via SendGrid
      await sgMail.send({
        to: email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL!,
          name: 'Sistema de Gestión de Casos'
        },
        subject: 'Restablecimiento de contraseña',
        html: emailContent
      });

      // 7. Log de auditoría
      await this.logEmailActivity('password_reset', email, 'sent');

      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw new Error('Error al enviar email de restablecimiento');
    }
  }

  private generateSecureToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  private async getEmailTemplate(type: string) {
    const result = await this.db.query(
      'SELECT * FROM email_templates WHERE template_type = $1 AND is_active = true',
      [type]
    );
    return result.rows[0];
  }

  private renderTemplate(template: string, variables: Record<string, string>): string {
    let rendered = template;
    Object.entries(variables).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return rendered;
  }

  private async logEmailActivity(type: string, recipient: string, status: string) {
    await this.db.query(`
      INSERT INTO email_logs (template_type, recipient_email, status, sent_at)
      VALUES ($1, $2, $3, NOW())
    `, [type, recipient, status]);
  }
}
```

**server/src/services/caseService.ts**
```typescript
import { DatabaseService } from '../utils/database';
import { BlobService } from '../utils/blobStorage';
import { logger } from '../utils/logger';

export class CaseService {
  private db: DatabaseService;
  private blobService: BlobService;

  constructor() {
    this.db = new DatabaseService();
    this.blobService = new BlobService();
  }

  async createCase(caseData: CreateCaseRequest, userId: string): Promise<Case> {
    try {
      // 1. Validar permisos
      const hasPermission = await this.validateCasePermission(userId, 'create');
      if (!hasPermission) {
        throw new Error('No tiene permisos para crear casos');
      }

      // 2. Calcular clasificación automática (migrado del frontend)
      const classification = this.calculateCaseComplexity(caseData);

      // 3. Crear caso en base de datos
      const result = await this.db.query(`
        INSERT INTO cases (
          numero_caso, descripcion, fecha, origen_id, aplicacion_id,
          classification, created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `, [
        caseData.numeroCaso,
        caseData.descripcion,
        caseData.fecha,
        caseData.origenId,
        caseData.aplicacionId,
        classification,
        userId
      ]);

      // 4. Log de auditoría
      await this.logCaseActivity(result.rows[0].id, userId, 'created');

      logger.info(`Case created: ${result.rows[0].numero_caso} by user ${userId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating case:', error);
      throw error;
    }
  }

  private calculateCaseComplexity(caseData: CreateCaseRequest): string {
    // Migrar algoritmo de clasificación desde el frontend
    let score = 0;

    // Factores de complejidad basados en el frontend actual
    if (caseData.historialCaso === 3) score += 3;
    if (caseData.conocimientoModulo === 1) score += 2;
    if (caseData.manipulacionDatos === 3) score += 3;
    if (caseData.claridadDescripcion === 1) score += 2;
    if (caseData.causaFallo === 1) score += 3;

    // Clasificación basada en puntuación
    if (score <= 5) return 'Baja Complejidad';
    if (score <= 10) return 'Media Complejidad';
    return 'Alta Complejidad';
  }

  async uploadCaseDocument(caseId: string, file: Express.Multer.File, userId: string): Promise<string> {
    try {
      // 1. Validar permisos
      const hasPermission = await this.validateCasePermission(userId, 'upload');
      if (!hasPermission) {
        throw new Error('No tiene permisos para subir archivos');
      }

      // 2. Subir archivo a Azure Blob Storage
      const blobName = `cases/${caseId}/${Date.now()}-${file.originalname}`;
      const blobUrl = await this.blobService.uploadFile(blobName, file.buffer, file.mimetype);

      // 3. Guardar referencia en base de datos
      await this.db.query(`
        INSERT INTO case_documents (case_id, filename, blob_url, uploaded_by)
        VALUES ($1, $2, $3, $4)
      `, [caseId, file.originalname, blobUrl, userId]);

      return blobUrl;
    } catch (error) {
      logger.error('Error uploading case document:', error);
      throw error;
    }
  }

  private async validateCasePermission(userId: string, action: string): Promise<boolean> {
    const result = await this.db.query(`
      SELECT validate_user_permission($1, 'cases', $2) as has_permission
    `, [userId, action]);

    return result.rows[0]?.has_permission || false;
  }

  private async logCaseActivity(caseId: string, userId: string, action: string) {
    await this.db.query(`
      INSERT INTO case_audit_log (case_id, user_id, action, created_at)
      VALUES ($1, $2, $3, NOW())
    `, [caseId, userId, action]);
  }
}
```

#### **2.5 Utilidades Azure**

**server/src/utils/keyVault.ts**
```typescript
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

export class KeyVaultService {
  private client: SecretClient;

  constructor() {
    const credential = new DefaultAzureCredential();
    const vaultName = process.env.AZURE_KEY_VAULT_NAME;
    const url = `https://${vaultName}.vault.azure.net`;
    
    this.client = new SecretClient(url, credential);
  }

  async getSecret(secretName: string): Promise<string> {
    try {
      const secret = await this.client.getSecret(secretName);
      return secret.value || '';
    } catch (error) {
      throw new Error(`Failed to retrieve secret ${secretName}: ${error}`);
    }
  }

  async setSecret(secretName: string, secretValue: string): Promise<void> {
    try {
      await this.client.setSecret(secretName, secretValue);
    } catch (error) {
      throw new Error(`Failed to set secret ${secretName}: ${error}`);
    }
  }
}
```

**server/src/utils/blobStorage.ts**
```typescript
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';

export class BlobService {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;

  constructor() {
    this.containerName = process.env.AZURE_STORAGE_CONTAINER || 'case-documents';
    
    // Usar managed identity en producción
    if (process.env.NODE_ENV === 'production') {
      const credential = new DefaultAzureCredential();
      this.blobServiceClient = new BlobServiceClient(
        `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
        credential
      );
    } else {
      // Usar connection string en desarrollo
      this.blobServiceClient = BlobServiceClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING!
      );
    }
  }

  async uploadFile(blobName: string, data: Buffer, contentType: string): Promise<string> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(data, {
        blobHTTPHeaders: {
          blobContentType: contentType
        }
      });

      return blockBlobClient.url;
    } catch (error) {
      throw new Error(`Failed to upload file ${blobName}: ${error}`);
    }
  }

  async deleteFile(blobName: string): Promise<void> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      await blockBlobClient.delete();
    } catch (error) {
      throw new Error(`Failed to delete file ${blobName}: ${error}`);
    }
  }

  async generateSasUrl(blobName: string, expiresInMinutes: number = 60): Promise<string> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Generar SAS URL para acceso temporal
      const sasUrl = await blockBlobClient.generateSasUrl({
        permissions: 'r', // solo lectura
        expiresOn: new Date(Date.now() + expiresInMinutes * 60 * 1000)
      });

      return sasUrl;
    } catch (error) {
      throw new Error(`Failed to generate SAS URL for ${blobName}: ${error}`);
    }
  }
}
```

### **🔌 FASE 3: Integración Frontend (Semanas 6-7)**

#### **3.1 Configuración MSAL en Frontend**

**client/src/lib/azure-config.ts**
```typescript
import { Configuration, PublicClientApplication } from '@azure/msal-browser';

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://${import.meta.env.VITE_AZURE_TENANT}.b2clogin.com/${import.meta.env.VITE_AZURE_TENANT}.onmicrosoft.com/B2C_1_signupsignin`,
    knownAuthorities: [`${import.meta.env.VITE_AZURE_TENANT}.b2clogin.com`],
    redirectUri: window.location.origin + '/auth/callback',
    postLogoutRedirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  }
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: ['openid', 'profile', 'email']
};
```

#### **3.2 Hook de Autenticación Azure**

**client/src/hooks/useAzureAuth.ts**
```typescript
import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { loginRequest } from '../lib/azure-config';

interface AuthState {
  user: any | null;
  loading: boolean;
  error: Error | null;
}

export const useAzureAuth = () => {
  const { instance, accounts } = useMsal();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });
  
  const queryClient = useQueryClient();

  // Query para obtener usuario actual
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: async () => {
      if (accounts.length === 0) return null;
      
      try {
        // Obtener token de Azure
        const response = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0]
        });

        // Obtener perfil completo desde nuestro backend
        const profile = await apiClient.get('/users/profile', {
          headers: {
            'Authorization': `Bearer ${response.accessToken}`
          }
        });
        
        return {
          azureAccount: accounts[0],
          profile: profile.data,
          accessToken: response.accessToken
        };
      } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
      }
    },
    enabled: accounts.length > 0,
    retry: false
  });

  useEffect(() => {
    setAuthState({
      user,
      loading: isLoading,
      error: error as Error | null
    });
  }, [user, isLoading, error]);

  // Mutation para sign in
  const signIn = useMutation({
    mutationFn: async () => {
      const response = await instance.loginPopup(loginRequest);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });

  // Mutation para sign out
  const signOut = useMutation({
    mutationFn: async () => {
      await instance.logoutPopup();
    },
    onSuccess: () => {
      queryClient.clear();
      setAuthState({ user: null, loading: false, error: null });
    }
  });

  return {
    ...authState,
    signIn,
    signOut,
    isAuthenticated: accounts.length > 0
  };
};
```

#### **3.3 Cliente API Actualizado**

**client/src/lib/api-client.ts**
```typescript
import axios from 'axios';
import { msalInstance } from './azure-config';

const apiClient = axios.create({
  baseURL: '/api', // Usar ruta relativa ya que frontend y backend están en el mismo dominio
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(async (config) => {
  try {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      const response = await msalInstance.acquireTokenSilent({
        scopes: ['openid', 'profile', 'email'],
        account: accounts[0]
      });
      
      if (response.accessToken) {
        config.headers.Authorization = `Bearer ${response.accessToken}`;
      }
    }
  } catch (error) {
    // Usuario no autenticado o token expirado
    console.warn('Could not acquire token:', error);
  }
  
  return config;
});

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, intentar logout
      try {
        await msalInstance.logoutPopup();
        window.location.href = '/login';
      } catch (signOutError) {
        console.error('Error signing out:', signOutError);
      }
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };
```

#### **3.4 Servicios Frontend Actualizados**

**client/src/services/caseService.ts**
```typescript
import { apiClient } from '../lib/api-client';
import type { Case, CreateCaseRequest, CaseFilters } from '../types';

export class CaseService {
  // Reemplazar llamadas directas a Supabase por llamadas al backend unificado
  
  static async getCases(filters?: CaseFilters): Promise<Case[]> {
    const response = await apiClient.get('/cases', { params: filters });
    return response.data;
  }

  static async createCase(caseData: CreateCaseRequest): Promise<Case> {
    const response = await apiClient.post('/cases', caseData);
    return response.data;
  }

  static async updateCase(id: string, updates: Partial<Case>): Promise<Case> {
    const response = await apiClient.put(`/cases/${id}`, updates);
    return response.data;
  }

  static async deleteCase(id: string): Promise<void> {
    await apiClient.delete(`/cases/${id}`);
  }

  static async getCaseMetrics(): Promise<any> {
    const response = await apiClient.get('/cases/metrics');
    return response.data;
  }

  static async uploadDocument(caseId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/cases/${caseId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.url;
  }

  // La clasificación ahora se hace en el backend automáticamente
  // Remover calculateComplexity() del frontend
}
```

### **📦 FASE 4: Deployment Unificado (Semana 8)**

#### **4.1 Script de Build Unificado**

**scripts/build.js**
```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Building Case Management Application...');

try {
  // 1. Limpiar directorios de build anteriores
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }
  fs.mkdirSync('dist');

  // 2. Build del frontend
  console.log('⚛️  Building frontend...');
  execSync('cd client && npm run build', { stdio: 'inherit' });
  
  // 3. Build del backend
  console.log('🔧 Building backend...');
  execSync('cd server && npm run build', { stdio: 'inherit' });
  
  // 4. Copiar archivos al directorio dist
  console.log('📂 Copying build artifacts...');
  
  // Copiar frontend build
  execSync('cp -r client/dist dist/client', { stdio: 'inherit' });
  
  // Copiar backend build
  execSync('cp -r server/dist dist/server', { stdio: 'inherit' });
  execSync('cp server/package.json dist/package.json', { stdio: 'inherit' });
  
  // Copiar configuración de Azure
  execSync('cp web.config dist/', { stdio: 'inherit' });
  
  // 5. Instalar dependencias de producción
  console.log('📦 Installing production dependencies...');
  execSync('cd dist && npm ci --production', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Build artifacts are in the dist/ directory');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
```

#### **4.2 Azure DevOps Pipeline**

**azure-pipelines.yml**
```yaml
trigger:
  branches:
    include:
    - main
  paths:
    include:
    - client/*
    - server/*
    - scripts/*
    - package.json
    - web.config

variables:
  azureSubscription: 'case-management-connection'
  webAppName: 'case-management-app'
  resourceGroupName: 'case-management-rg'
  buildConfiguration: 'production'

stages:
- stage: Build
  displayName: 'Build Application'
  jobs:
  - job: Build
    displayName: 'Build Job'
    pool:
      vmImage: 'ubuntu-latest'
    
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
      displayName: 'Install Node.js'

    - script: |
        npm ci
      displayName: 'Install root dependencies'

    - script: |
        cd client && npm ci
      displayName: 'Install client dependencies'

    - script: |
        cd server && npm ci
      displayName: 'Install server dependencies'

    - script: |
        npm run test
      displayName: 'Run tests'
      continueOnError: true

    - script: |
        node scripts/build.js
      displayName: 'Build application'
      env:
        NODE_ENV: production

    - task: ArchiveFiles@2
      inputs:
        rootFolderOrFile: 'dist'
        includeRootFolder: false
        archiveType: 'zip'
        archiveFile: '$(Build.ArtifactStagingDirectory)/case-management-$(Build.BuildId).zip'
        replaceExistingArchive: true
      displayName: 'Archive build artifacts'

    - task: PublishBuildArtifacts@1
      inputs:
        PathtoPublish: '$(Build.ArtifactStagingDirectory)'
        ArtifactName: 'case-management-build'
        publishLocation: 'Container'
      displayName: 'Publish artifacts'

- stage: Deploy
  displayName: 'Deploy to Azure'
  dependsOn: Build
  condition: succeeded()
  jobs:
  - deployment: Deploy
    displayName: 'Deploy Job'
    environment: 'production'
    pool:
      vmImage: 'ubuntu-latest'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            inputs:
              azureSubscription: '$(azureSubscription)'
              appType: 'webApp'
              appName: '$(webAppName)'
              resourceGroupName: '$(resourceGroupName)'
              package: '$(Pipeline.Workspace)/case-management-build/case-management-$(Build.BuildId).zip'
              deploymentMethod: 'auto'
              appSettings: |
                -NODE_ENV production
                -WEBSITE_NODE_DEFAULT_VERSION 18.17.0
                -SCM_DO_BUILD_DURING_DEPLOYMENT false
            displayName: 'Deploy to Azure App Service'

          - task: AzureCLI@2
            inputs:
              azureSubscription: '$(azureSubscription)'
              scriptType: 'bash'
              scriptLocation: 'inlineScript'
              inlineScript: |
                echo "Deployment completed successfully"
                echo "Application URL: https://$(webAppName).azurewebsites.net"
            displayName: 'Post-deployment verification'
```

#### **4.3 Configuración de Variables de Entorno**

**Azure App Service Application Settings**
```json
{
  "NODE_ENV": "production",
  "PORT": "8080",
  "AZURE_CLIENT_ID": "@Microsoft.KeyVault(SecretUri=https://case-vault.vault.azure.net/secrets/azure-client-id/)",
  "AZURE_CLIENT_SECRET": "@Microsoft.KeyVault(SecretUri=https://case-vault.vault.azure.net/secrets/azure-client-secret/)",
  "AZURE_TENANT": "your-tenant",
  "AZURE_KEY_VAULT_NAME": "case-vault",
  "DATABASE_URL": "@Microsoft.KeyVault(SecretUri=https://case-vault.vault.azure.net/secrets/database-url/)",
  "AZURE_STORAGE_ACCOUNT": "casemanagementstorage",
  "AZURE_STORAGE_CONTAINER": "case-documents",
  "SENDGRID_API_KEY": "@Microsoft.KeyVault(SecretUri=https://case-vault.vault.azure.net/secrets/sendgrid-api-key/)",
  "SENDGRID_FROM_EMAIL": "noreply@your-domain.com",
  "FRONTEND_URL": "https://case-management-app.azurewebsites.net",
  "APPLICATIONINSIGHTS_CONNECTION_STRING": "@Microsoft.KeyVault(SecretUri=https://case-vault.vault.azure.net/secrets/appinsights-connection/)"
}
```

**client/.env.production**
```env
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT=your-tenant
VITE_API_BASE_URL=/api
```

---

## 🧪 Testing y Validación

### **5.1 Tests de Integración Completa**

**tests/integration/unified-app.test.ts**
```typescript
import request from 'supertest';
import { app } from '../../server/src/app';

describe('Unified Application Integration', () => {
  it('should serve frontend from root path', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.headers['content-type']).toMatch(/html/);
  });

  it('should serve API endpoints', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
  });

  it('should handle SPA routing', async () => {
    const response = await request(app)
      .get('/dashboard')
      .expect(200);

    expect(response.headers['content-type']).toMatch(/html/);
  });

  it('should not serve frontend for API routes', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .expect(404);

    expect(response.headers['content-type']).toMatch(/json/);
  });
});
```

### **5.2 Tests E2E con Playwright**

**tests/e2e/auth-flow.spec.ts**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should complete login flow', async ({ page }) => {
    // 1. Navegar a la aplicación
    await page.goto('/');
    
    // 2. Verificar redirección a login
    await expect(page).toHaveURL(/.*login/);
    
    // 3. Hacer click en login
    await page.click('[data-testid="login-button"]');
    
    // 4. Esperar redirección a Azure AD B2C
    await expect(page).toHaveURL(/.*b2clogin.com.*/);
    
    // 5. Completar login (en entorno de test)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // 6. Verificar redirección de vuelta a la app
    await expect(page).toHaveURL(/.*dashboard/);
    
    // 7. Verificar elementos del dashboard
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
```

---

## 📊 Monitoreo y Mantenimiento

### **6.1 Application Insights Dashboard**

**Configuración de Custom Metrics**
```typescript
// server/src/utils/telemetry.ts
import * as appInsights from 'applicationinsights';

export class TelemetryService {
  static trackCaseCreated(caseId: string, complexity: string, userId: string) {
    appInsights.defaultClient.trackEvent({
      name: 'CaseCreated',
      properties: {
        caseId,
        complexity,
        userId
      }
    });
  }

  static trackEmailSent(type: string, recipient: string, success: boolean) {
    appInsights.defaultClient.trackEvent({
      name: 'EmailSent',
      properties: {
        type,
        recipient: recipient.replace(/(.{3}).*(@.*)/, '$1***$2'), // Anonimizar
        success: success.toString()
      }
    });
  }

  static trackApiCall(endpoint: string, method: string, duration: number, statusCode: number) {
    appInsights.defaultClient.trackDependency({
      target: endpoint,
      name: `${method} ${endpoint}`,
      data: endpoint,
      duration: duration,
      resultCode: statusCode,
      success: statusCode < 400,
      dependencyTypeName: 'HTTP'
    });
  }
}
```

### **6.2 Alertas de Azure Monitor**

**ARM Template para Alertas**
```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "appServiceName": {
      "type": "string",
      "defaultValue": "case-management-app"
    }
  },
  "resources": [
    {
      "type": "Microsoft.Insights/metricAlerts",
      "apiVersion": "2018-03-01",
      "name": "HighResponseTime",
      "properties": {
        "description": "Alert when response time is high",
        "severity": 2,
        "enabled": true,
        "scopes": [
          "[resourceId('Microsoft.Web/sites', parameters('appServiceName'))]"
        ],
        "evaluationFrequency": "PT1M",
        "windowSize": "PT5M",
        "criteria": {
          "odata.type": "Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria",
          "allOf": [
            {
              "name": "ResponseTime",
              "metricName": "AverageResponseTime",
              "operator": "GreaterThan",
              "threshold": 5000,
              "timeAggregation": "Average"
            }
          ]
        },
        "actions": [
          {
            "actionGroupId": "[resourceId('Microsoft.Insights/actionGroups', 'case-management-alerts')]"
          }
        ]
      }
    },
    {
      "type": "Microsoft.Insights/metricAlerts",
      "apiVersion": "2018-03-01",
      "name": "HighErrorRate",
      "properties": {
        "description": "Alert when error rate is high",
        "severity": 1,
        "enabled": true,
        "scopes": [
          "[resourceId('Microsoft.Web/sites', parameters('appServiceName'))]"
        ],
        "evaluationFrequency": "PT1M",
        "windowSize": "PT5M",
        "criteria": {
          "odata.type": "Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria",
          "allOf": [
            {
              "name": "ErrorRate",
              "metricName": "Http5xx",
              "operator": "GreaterThan",
              "threshold": 10,
              "timeAggregation": "Total"
            }
          ]
        }
      }
    }
  ]
}
```

---

## 💰 Estimación de Costos Azure

### **Costos Mensuales Estimados (tráfico medio)**

| **Servicio** | **Configuración** | **Costo Mensual (USD)** |
|--------------|-------------------|-------------------------|
| **App Service Plan** | Standard S1 (1 core, 1.75GB) | $75-85 |
| **Azure Database for PostgreSQL** | General Purpose, 2 vCores | $85-110 |
| **Azure Blob Storage** | Hot tier, 100GB + transactions | $15-25 |
| **Azure CDN** | Standard Microsoft, 1TB | $80-95 |
| **Azure AD B2C** | 50k MAU (first 50k free) | $0-10 |
| **SendGrid** | 25k emails/month | $20-30 |
| **Application Insights** | 5GB data ingestion | $15-25 |
| **Azure Key Vault** | 1000 operations | $3-5 |
| **Azure DNS** | Hosted zone + queries | $5-10 |

**Total Estimado: $298-400 USD/mes**

### **Comparación con Supabase**
- **Supabase Pro**: ~$25/mes + uso adicional
- **Azure**: ~$350/mes promedio
- **Diferencia**: +$325/mes aprox.

**Justificación del costo adicional:**
- ✅ **Despliegue Unificado**: Menor complejidad operacional
- ✅ **Enterprise Grade**: SLA del 99.9%+ garantizado
- ✅ **Integración Nativa**: Ecosistema Microsoft completo
- ✅ **Compliance**: SOC, ISO, GDPR out-of-the-box
- ✅ **Escalabilidad Automática**: Sin intervención manual

---

## 🎯 Beneficios de la Migración Unificada

### **✅ Beneficios del Despliegue Unificado**
1. **Simplicidad Operacional**: Un solo punto de deploy y monitoreo
2. **Menor Latencia**: Sin llamadas entre dominios diferentes
3. **Costos Reducidos**: Un solo App Service en lugar de múltiples servicios
4. **CORS Simplificado**: Sin problemas de cross-origin
5. **SSL/Certificados**: Un solo certificado para toda la app

### **✅ Beneficios Técnicos**
1. **Separación de Responsabilidades**: Frontend solo UI, Backend toda la lógica
2. **Escalabilidad**: Auto-scaling en App Service
3. **Seguridad**: Azure AD B2C + Key Vault
4. **Mantenibilidad**: Código más organizado y testeable
5. **Performance**: CDN Azure + optimizaciones backend

### **✅ Beneficios de Negocio**
1. **Compliance**: Azure compliance out-of-the-box
2. **Confiabilidad**: SLA garantizado de Microsoft
3. **Soporte Empresarial**: Soporte técnico 24/7 disponible
4. **Integración Office 365**: Si ya usan Microsoft ecosystem
5. **Backup/Recovery**: Estrategias robustas automatizadas

---

## 📋 Checklist de Migración Unificada

### **✅ Pre-Migration**
- [ ] Backup completo de base de datos Supabase
- [ ] Documentar configuraciones actuales
- [ ] Crear Resource Group en Azure
- [ ] Configurar Azure Database for PostgreSQL
- [ ] Setup de Azure Blob Storage

### **✅ Unified Development**
- [ ] Crear estructura de proyecto unificado
- [ ] Configurar build scripts
- [ ] Migrar servicios backend
- [ ] Actualizar frontend para usar APIs locales
- [ ] Configurar Azure AD B2C
- [ ] Tests de integración completa

### **✅ Deployment**
- [ ] Configurar Azure App Service
- [ ] Setup de Azure DevOps pipelines
- [ ] Configurar variables de entorno en Key Vault
- [ ] Deploy de aplicación unificada
- [ ] Configurar monitoreo y alertas
- [ ] Tests de smoke en producción

### **✅ Post-Migration**
- [ ] Tests de carga y performance
- [ ] Validación de seguridad
- [ ] Configuración de backups automatizados
- [ ] Documentación actualizada
- [ ] Training para el equipo

---

## 🚀 Conclusión

Esta migración a Azure con **despliegue unificado** ofrece las ventajas de separar frontend y backend sin la complejidad operacional de múltiples servicios. La estrategia de mantener ambos en un Azure App Service simplifica el deployment, reduce costos comparado con arquitecturas más complejas, y mantiene todos los beneficios de la separación de responsabilidades.

**Próximos pasos recomendados:**
1. Aprobar el plan y presupuesto (~$350/mes)
2. Configurar suscripción de Azure
3. Comenzar Fase 1 (Preparación)
4. Ejecutar migración por fases
5. Monitorear y optimizar post-migración

La inversión en tiempo (8 semanas) y costos adicionales (~$325/mes) se justifica por la robustez empresarial, simplicidad operacional y los beneficios técnicos obtenidos, posicionando el sistema para crecimiento futuro dentro del ecosistema Microsoft.

---

*Esta guía representa un plan completo de migración a Azure que puede ajustarse según las necesidades específicas y restricciones del proyecto.*
