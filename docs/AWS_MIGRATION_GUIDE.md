# 🚀 Guía de Migración a AWS - Sistema de Gestión de Casos

## 📋 Tabla de Contenidos
1. [Análisis del Estado Actual](#análisis-del-estado-actual)
2. [Arquitectura Objetivo en AWS](#arquitectura-objetivo-en-aws)
3. [Lógica de Negocio a Migrar del Frontend](#lógica-de-negocio-a-migrar-del-frontend)
4. [Plan de Migración por Fases](#plan-de-migración-por-fases)
5. [Configuración de Servicios AWS](#configuración-de-servicios-aws)
6. [Estructura del Backend](#estructura-del-backend)
7. [Modificaciones del Frontend](#modificaciones-del-frontend)
8. [Testing y Validación](#testing-y-validación)
9. [Deployment y CI/CD](#deployment-y-cicd)
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

## 🏗️ Arquitectura Objetivo en AWS

### **Diagrama de Arquitectura AWS**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │────│   S3 (Static)    │    │   Route 53      │
│   (CDN)         │    │   (Frontend)     │    │   (DNS)         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                               │
         ▼                                               ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Gateway   │────│   Cognito        │    │   ALB           │
│   (REST/WS)     │    │   (Auth)         │    │   (Load Bal.)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                               │
         ▼                                               ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Lambda/ECS    │────│   RDS PostgreSQL │    │   S3 (Files)    │
│   (Backend API) │    │   (Database)     │    │   (Storage)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                               │
         ▼                                               ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   SES           │    │   CloudWatch     │    │   ECR           │
│   (Email)       │    │   (Monitoring)   │    │   (Images)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **Servicios AWS por Función**

| **Funcionalidad** | **Servicio AWS** | **Configuración** |
|-------------------|------------------|-------------------|
| **Frontend Hosting** | S3 + CloudFront + Route 53 | Static website hosting |
| **Backend API** | ECS Fargate + ALB | Node.js/Express containers |
| **Base de Datos** | RDS PostgreSQL | Multi-AZ, automated backups |
| **Autenticación** | Amazon Cognito | User pools + Identity pools |
| **Storage de Archivos** | S3 | Buckets con versionado |
| **Email** | Amazon SES | SMTP + Templates |
| **API Management** | API Gateway | REST + WebSocket APIs |
| **CI/CD** | CodePipeline + CodeBuild | Automated deployment |
| **Monitoreo** | CloudWatch | Logs + Metrics + Alarms |
| **DNS** | Route 53 | Domain management |

---

## 🔄 Lógica de Negocio a Migrar del Frontend

### **Análisis de Responsabilidades Actuales**

#### **❌ Lo que NO debería estar en el Frontend**

1. **🔐 Validaciones de Seguridad Críticas**
   ```typescript
   // ACTUAL: src/shared/hooks/useAuth.ts
   // MIGRAR → Backend: Validación de tokens, permisos, roles
   ```

2. **💾 Operaciones de Base de Datos Complejas**
   ```typescript
   // ACTUAL: src/shared/services/customPasswordReset.ts
   // MIGRAR → Backend: Gestión de tokens, encriptación SMTP
   ```

3. **📊 Cálculos de Métricas y Reportes**
   ```typescript
   // ACTUAL: Cálculo de complejidad de casos en frontend
   // MIGRAR → Backend: Algoritmos de clasificación automática
   ```

4. **📧 Configuración y Envío de Emails**
   ```typescript
   // ACTUAL: src/shared/services/EmailService.ts
   // MIGRAR → Backend: Configuración SMTP, templates, limitación
   ```

5. **🔍 Validaciones de Negocio Complejas**
   ```typescript
   // ACTUAL: src/utils/validateEmailSystemComplete.ts
   // MIGRAR → Backend: Validaciones de integridad del sistema
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

### **Servicios Específicos a Migrar**

#### **1. Sistema de Autenticación (Prioridad: ALTA)**
```typescript
// ACTUAL: src/shared/hooks/useAuth.ts
// MIGRAR A: AWS Cognito + Backend API

// Funciones a migrar:
- signIn, signUp, signOut
- Password reset flow
- User profile management
- Role-based access control
```

#### **2. Sistema de Email (Prioridad: ALTA)**
```typescript
// ACTUAL: src/shared/services/EmailService.ts + customPasswordReset.ts
// MIGRAR A: AWS SES + Lambda

// Funciones a migrar:
- SMTP configuration management
- Email template rendering
- Rate limiting and validation
- Password reset token generation
```

#### **3. Validaciones de Negocio (Prioridad: MEDIA)**
```typescript
// ACTUAL: src/utils/validateEmailSystemComplete.ts
// MIGRAR A: Backend Health Check API

// Funciones a migrar:
- System configuration validation
- Database integrity checks
- Service health monitoring
```

#### **4. Clasificación de Casos (Prioridad: MEDIA)**
```typescript
// ACTUAL: Frontend case complexity calculation
// MIGRAR A: Backend Business Logic Service

// Funciones a migrar:
- Automatic case classification algorithm
- Complexity scoring system
- Historical analysis and trends
```

#### **5. Gestión de Archivos (Prioridad: BAJA)**
```typescript
// ACTUAL: Supabase Storage integration
// MIGRAR A: AWS S3 + CloudFront

// Funciones a migrar:
- File upload/download logic
- Access control and presigned URLs
- File processing and optimization
```

---

## 📅 Plan de Migración por Fases

### **🎯 FASE 1: Preparación e Infraestructura (Semanas 1-2)**

#### **1.1 Setup Inicial de AWS**
- [ ] Configurar AWS CLI y perfiles
- [ ] Crear VPC y subnets
- [ ] Setup de seguridad (IAM roles, policies)
- [ ] Configurar RDS PostgreSQL
- [ ] Setup básico de S3 buckets

#### **1.2 Migración de Base de Datos**
```bash
# 1. Exportar esquema actual de Supabase
pg_dump -h [supabase-host] -U [user] -d [database] --schema-only > schema.sql

# 2. Migrar datos
pg_dump -h [supabase-host] -U [user] -d [database] --data-only > data.sql

# 3. Importar a RDS
psql -h [rds-endpoint] -U [user] -d [database] < schema.sql
psql -h [rds-endpoint] -U [user] -d [database] < data.sql
```

#### **1.3 Configuración de Cognito**
```typescript
// cognito-config.ts
export const cognitoConfig = {
  UserPoolId: 'us-east-1_XXXXXXXXX',
  ClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXX',
  region: 'us-east-1',
  oauth: {
    domain: 'your-domain.auth.us-east-1.amazoncognito.com',
    scope: ['email', 'openid', 'profile'],
    redirectSignIn: 'https://your-app.com/auth/callback',
    redirectSignOut: 'https://your-app.com/',
    responseType: 'code'
  }
};
```

### **🔧 FASE 2: Backend API Development (Semanas 3-5)**

#### **2.1 Estructura del Proyecto Backend**
```
case-management-backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── authController.ts
│   │   ├── casesController.ts
│   │   ├── usersController.ts
│   │   ├── emailController.ts
│   │   └── reportsController.ts
│   ├── services/            # Business logic
│   │   ├── authService.ts
│   │   ├── caseService.ts
│   │   ├── emailService.ts
│   │   ├── userService.ts
│   │   └── validationService.ts
│   ├── models/              # Database models
│   │   ├── Case.ts
│   │   ├── User.ts
│   │   ├── TimeEntry.ts
│   │   └── Document.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimit.ts
│   ├── routes/              # API routes
│   │   ├── auth.ts
│   │   ├── cases.ts
│   │   ├── users.ts
│   │   ├── todos.ts
│   │   └── reports.ts
│   ├── utils/               # Utilities
│   │   ├── database.ts
│   │   ├── s3Client.ts
│   │   ├── sesClient.ts
│   │   └── logger.ts
│   ├── config/              # Configuration
│   │   ├── database.ts
│   │   ├── aws.ts
│   │   └── environment.ts
│   └── app.ts               # Express app setup
├── tests/                   # Test files
├── scripts/                 # Deployment scripts
├── Dockerfile
├── docker-compose.yml
└── package.json
```

#### **2.2 Configuración Base del Backend**

**package.json**
```json
{
  "name": "case-management-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "jest",
    "lint": "eslint src/",
    "docker:build": "docker build -t case-management-api .",
    "docker:run": "docker-compose up"
  },
  "dependencies": {
    "express": "^4.18.2",
    "typescript": "^5.0.0",
    "aws-sdk": "^2.1400.0",
    "@aws-sdk/client-cognito-identity-provider": "^3.350.0",
    "@aws-sdk/client-s3": "^3.350.0",
    "@aws-sdk/client-ses": "^3.350.0",
    "pg": "^8.11.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "joi": "^17.9.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.7.0",
    "winston": "^3.9.0",
    "nodemailer": "^6.9.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.0.0",
    "@types/pg": "^8.10.0",
    "nodemon": "^2.0.22",
    "jest": "^29.5.0",
    "supertest": "^6.3.0"
  }
}
```

**Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

#### **2.3 Servicios Core del Backend**

**src/services/authService.ts**
```typescript
import { CognitoIdentityProviderClient, AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { DatabaseService } from '../utils/database';
import { logger } from '../utils/logger';

export class AuthService {
  private cognitoClient: CognitoIdentityProviderClient;
  private db: DatabaseService;

  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
    this.db = new DatabaseService();
  }

  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      // 1. Crear usuario en Cognito
      const cognitoUser = await this.cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: userData.email,
        UserAttributes: [
          { Name: 'email', Value: userData.email },
          { Name: 'name', Value: userData.fullName }
        ],
        TemporaryPassword: this.generateTemporaryPassword(),
        MessageAction: 'SUPPRESS' // Enviaremos email personalizado
      }));

      // 2. Crear perfil en base de datos
      const userProfile = await this.db.query(`
        INSERT INTO user_profiles (id, email, full_name, role_id, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [cognitoUser.User?.Username, userData.email, userData.fullName, userData.roleId, false]);

      // 3. Enviar email de bienvenida
      await this.sendWelcomeEmail(userData.email, userData.fullName);

      return {
        success: true,
        userId: cognitoUser.User?.Username,
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

  private generateTemporaryPassword(): string {
    // Generar contraseña temporal segura
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}
```

**src/services/emailService.ts**
```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { DatabaseService } from '../utils/database';
import { logger } from '../utils/logger';

export class EmailService {
  private sesClient: SESClient;
  private db: DatabaseService;

  constructor() {
    this.sesClient = new SESClient({ region: process.env.AWS_REGION });
    this.db = new DatabaseService();
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      // 1. Validar que el usuario existe
      const user = await this.db.query(
        'SELECT id, full_name FROM user_profiles WHERE email = $1 AND is_active = true',
        [email]
      );

      if (user.rows.length === 0) {
        // No revelar si el email existe o no por seguridad
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

      // 6. Enviar email via SES
      await this.sesClient.send(new SendEmailCommand({
        Source: process.env.SES_FROM_EMAIL,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: 'Restablecimiento de contraseña - Sistema de Gestión de Casos' },
          Body: { Html: { Data: emailContent } }
        }
      }));

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

**src/services/caseService.ts**
```typescript
import { DatabaseService } from '../utils/database';
import { logger } from '../utils/logger';

export class CaseService {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
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

### **🔌 FASE 3: Integración Frontend (Semanas 6-7)**

#### **3.1 Configuración AWS SDK en Frontend**

**src/lib/aws-config.ts**
```typescript
import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    region: process.env.VITE_AWS_REGION,
    userPoolId: process.env.VITE_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.VITE_COGNITO_CLIENT_ID,
    oauth: {
      domain: process.env.VITE_COGNITO_DOMAIN,
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: `${window.location.origin}/auth/callback`,
      redirectSignOut: `${window.location.origin}/`,
      responseType: 'code'
    }
  },
  API: {
    endpoints: [
      {
        name: 'case-management-api',
        endpoint: process.env.VITE_API_ENDPOINT,
        region: process.env.VITE_AWS_REGION
      }
    ]
  },
  Storage: {
    AWSS3: {
      bucket: process.env.VITE_S3_BUCKET,
      region: process.env.VITE_AWS_REGION
    }
  }
};

Amplify.configure(awsConfig);
```

#### **3.2 Nuevo Hook de Autenticación**

**src/hooks/useAwsAuth.ts**
```typescript
import { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

interface AuthState {
  user: any | null;
  loading: boolean;
  error: Error | null;
}

export const useAwsAuth = () => {
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
      try {
        const cognitoUser = await Auth.currentAuthenticatedUser();
        
        // Obtener perfil completo desde nuestro backend
        const profile = await apiClient.get(`/users/profile/${cognitoUser.username}`);
        
        return {
          ...cognitoUser,
          profile: profile.data
        };
      } catch (error) {
        return null;
      }
    },
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
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return await Auth.signIn(email, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });

  // Mutation para sign up
  const signUp = useMutation({
    mutationFn: async ({ email, password, name }: { email: string; password: string; name: string }) => {
      return await Auth.signUp({
        username: email,
        password,
        attributes: { name }
      });
    }
  });

  // Mutation para sign out
  const signOut = useMutation({
    mutationFn: async () => {
      await Auth.signOut();
    },
    onSuccess: () => {
      queryClient.clear();
      setAuthState({ user: null, loading: false, error: null });
    }
  });

  return {
    ...authState,
    signIn,
    signUp,
    signOut
  };
};
```

#### **3.3 Cliente API Actualizado**

**src/lib/api-client.ts**
```typescript
import axios from 'axios';
import { Auth } from 'aws-amplify';

const apiClient = axios.create({
  baseURL: process.env.VITE_API_ENDPOINT,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(async (config) => {
  try {
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // Usuario no autenticado
  }
  
  return config;
});

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, intentar renovar o logout
      try {
        await Auth.signOut();
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

**src/services/caseService.ts**
```typescript
import { apiClient } from '../lib/api-client';
import type { Case, CreateCaseRequest, CaseFilters } from '../types';

export class CaseService {
  // Reemplazar llamadas directas a Supabase por llamadas al backend
  
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

  // La clasificación ahora se hace en el backend automáticamente
  // Remover calculateComplexity() del frontend
}
```

### **📦 FASE 4: Deployment y CI/CD (Semana 8)**

#### **4.1 Configuración de ECS Fargate**

**ecs-task-definition.json**
```json
{
  "family": "case-management-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "case-management-api",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/case-management-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "AWS_REGION", "value": "us-east-1" }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:case-management/database"
        },
        {
          "name": "COGNITO_USER_POOL_ID",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:case-management/cognito"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/case-management-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### **4.2 CodePipeline Configuration**

**buildspec.yml**
```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
  
  build:
    commands:
      - echo Build started on `date`
      - echo Building the Docker image...
      - docker build -t $IMAGE_REPO_NAME:$IMAGE_TAG .
      - docker tag $IMAGE_REPO_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
  
  post_build:
    commands:
      - echo Build completed on `date`
      - echo Pushing the Docker image...
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
      - echo Writing image definitions file...
      - printf '[{"name":"case-management-api","imageUri":"%s"}]' $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG > imagedefinitions.json

artifacts:
  files:
    - imagedefinitions.json
```

#### **4.3 Frontend Deployment S3 + CloudFront**

**deploy-frontend.yml (GitHub Actions)**
```yaml
name: Deploy Frontend to S3

on:
  push:
    branches: [main]
    paths: ['src/**', 'public/**', 'index.html', 'vite.config.ts']

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        VITE_API_ENDPOINT: ${{ secrets.API_ENDPOINT }}
        VITE_COGNITO_USER_POOL_ID: ${{ secrets.COGNITO_USER_POOL_ID }}
        VITE_COGNITO_CLIENT_ID: ${{ secrets.COGNITO_CLIENT_ID }}
        VITE_AWS_REGION: ${{ secrets.AWS_REGION }}
        VITE_S3_BUCKET: ${{ secrets.S3_BUCKET }}
    
    - name: Deploy to S3
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ secrets.AWS_REGION }}
    
    - name: Sync files to S3
      run: |
        aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
        aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

---

## 🧪 Testing y Validación

### **5.1 Tests de Backend**

**tests/auth.test.ts**
```typescript
import request from 'supertest';
import { app } from '../src/app';

describe('Auth Endpoints', () => {
  describe('POST /auth/register', () => {
    it('should create user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        fullName: 'Test User'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Usuario creado exitosamente'
      });
    });

    it('should validate email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        fullName: 'Test User'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toContain('email');
    });
  });
});
```

### **5.2 Tests de Integración**

**tests/integration/case-flow.test.ts**
```typescript
import request from 'supertest';
import { app } from '../../src/app';
import { setupTestDatabase, teardownTestDatabase } from '../helpers/database';

describe('Case Management Flow', () => {
  let authToken: string;

  beforeAll(async () => {
    await setupTestDatabase();
    // Crear usuario de prueba y obtener token
    const authResponse = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'TestPass123!' });
    
    authToken = authResponse.body.token;
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('should complete full case lifecycle', async () => {
    // 1. Crear caso
    const caseData = {
      numeroCaso: 'TEST-001',
      descripcion: 'Caso de prueba',
      fecha: '2024-01-01',
      historialCaso: 2,
      conocimientoModulo: 2,
      manipulacionDatos: 1,
      claridadDescripcion: 3,
      causaFallo: 2
    };

    const createResponse = await request(app)
      .post('/cases')
      .set('Authorization', `Bearer ${authToken}`)
      .send(caseData)
      .expect(201);

    const caseId = createResponse.body.id;
    expect(createResponse.body.classification).toBe('Baja Complejidad');

    // 2. Actualizar caso
    const updateResponse = await request(app)
      .put(`/cases/${caseId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ descripcion: 'Descripción actualizada' })
      .expect(200);

    expect(updateResponse.body.descripcion).toBe('Descripción actualizada');

    // 3. Obtener métricas
    const metricsResponse = await request(app)
      .get('/cases/metrics')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(metricsResponse.body).toHaveProperty('totalCases');
  });
});
```

---

## 📊 Monitoreo y Mantenimiento

### **6.1 CloudWatch Dashboard**

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ECS", "CPUUtilization", "ServiceName", "case-management-api"],
          ["AWS/ECS", "MemoryUtilization", "ServiceName", "case-management-api"]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "ECS Resource Utilization"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ApiGateway", "Count", "ApiName", "case-management-api"],
          ["AWS/ApiGateway", "Latency", "ApiName", "case-management-api"],
          ["AWS/ApiGateway", "4XXError", "ApiName", "case-management-api"],
          ["AWS/ApiGateway", "5XXError", "ApiName", "case-management-api"]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "us-east-1",
        "title": "API Gateway Metrics"
      }
    }
  ]
}
```

### **6.2 Alertas de CloudWatch**

```yaml
# cloudformation-alerts.yml
AWSTemplateFormatVersion: '2010-09-09'

Resources:
  HighErrorRateAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: CaseManagement-HighErrorRate
      AlarmDescription: Alert when API error rate is high
      MetricName: 5XXError
      Namespace: AWS/ApiGateway
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 2
      Threshold: 10
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - !Ref SNSTopicArn

  DatabaseConnectionAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: CaseManagement-DatabaseConnections
      AlarmDescription: Alert when RDS connection count is high
      MetricName: DatabaseConnections
      Namespace: AWS/RDS
      Statistic: Average
      Period: 300
      EvaluationPeriods: 3
      Threshold: 80
      ComparisonOperator: GreaterThanThreshold
```

---

## 📋 Checklist de Migración

### **✅ Pre-Migration**
- [ ] Backup completo de base de datos Supabase
- [ ] Documentar todas las configuraciones actuales
- [ ] Identificar y mapear todas las dependencias
- [ ] Configurar entornos AWS (dev, staging, prod)
- [ ] Setup de monitoreo y alertas

### **✅ Backend Migration**
- [ ] Migrar base de datos a RDS PostgreSQL
- [ ] Implementar servicios de autenticación con Cognito
- [ ] Migrar sistema de email a SES
- [ ] Implementar validaciones de negocio
- [ ] Configurar sistema de archivos con S3
- [ ] Implementar logging y monitoreo
- [ ] Tests unitarios e integración
- [ ] Deployment de backend a ECS

### **✅ Frontend Migration**
- [ ] Configurar AWS Amplify en frontend
- [ ] Reemplazar hooks de Supabase por AWS
- [ ] Actualizar servicios para usar nueva API
- [ ] Migrar gestión de archivos a S3
- [ ] Tests de integración frontend-backend
- [ ] Deployment a S3 + CloudFront

### **✅ Post-Migration**
- [ ] Tests de carga y performance
- [ ] Validación de seguridad
- [ ] Configuración de backups automatizados
- [ ] Documentación de nueva arquitectura
- [ ] Training para el equipo
- [ ] Plan de rollback si es necesario

---

## 💰 Estimación de Costos AWS

### **Costos Mensuales Estimados (tráfico medio)**

| **Servicio** | **Configuración** | **Costo Mensual (USD)** |
|--------------|-------------------|-------------------------|
| **ECS Fargate** | 2 vCPU, 4GB RAM, 24/7 | $35-50 |
| **RDS PostgreSQL** | db.t3.medium, Multi-AZ | $65-85 |
| **Application Load Balancer** | Standard | $20-25 |
| **S3** | 100GB storage + transfers | $10-15 |
| **CloudFront** | 1TB transfer | $85-100 |
| **Cognito** | 1000 MAU | $5-10 |
| **SES** | 10k emails/month | $1-5 |
| **API Gateway** | 1M requests | $3-5 |
| **CloudWatch** | Logs + Metrics | $10-20 |
| **Route 53** | Hosted zone + queries | $5-10 |

**Total Estimado: $240-330 USD/mes**

### **Comparación con Supabase**
- **Supabase Pro**: ~$25/mes + uso adicional
- **AWS**: ~$285/mes promedio
- **Diferencia**: +$260/mes aprox.

**Justificación del costo adicional:**
- ✅ Mayor control y personalización
- ✅ Mejor escalabilidad empresarial
- ✅ Separación clara frontend/backend
- ✅ Compliance y seguridad avanzada
- ✅ Integración nativa con ecosistema AWS

---

## 🎯 Beneficios de la Migración

### **✅ Beneficios Técnicos**
1. **Separación de Responsabilidades**: Frontend solo UI, Backend toda la lógica
2. **Escalabilidad**: Auto-scaling en ECS, RDS optimizado
3. **Seguridad**: Cognito + IAM roles granulares
4. **Mantenibilidad**: Código más organizado y testeable
5. **Performance**: CDN CloudFront + optimizaciones backend

### **✅ Beneficios de Negocio**
1. **Compliance**: Mejor control de datos y auditoría
2. **Confiabilidad**: SLA garantizado de AWS
3. **Flexibilidad**: APIs reutilizables para móvil/integraciones
4. **Monitoreo**: Dashboards y alertas profesionales
5. **Backup/Recovery**: Estrategias robustas automatizadas

### **✅ Beneficios de Desarrollo**
1. **Testing**: Backend testeable independientemente
2. **CI/CD**: Pipelines profesionales
3. **Desarrollo Paralelo**: Frontend y Backend independientes
4. **Debugging**: Logs centralizados y estructurados
5. **Documentación**: APIs autodocumentadas

---

## 🚀 Conclusión

Esta migración transformará el sistema actual en una arquitectura empresarial robusta, separando claramente las responsabilidades entre frontend y backend, mejorando la seguridad, escalabilidad y mantenibilidad del sistema.

La inversión en tiempo (8 semanas) y costos adicionales (~$260/mes) se justifica por los beneficios técnicos y de negocio obtenidos, posicionando el sistema para crecimiento futuro y requisitos empresariales más exigentes.

**Próximos pasos recomendados:**
1. Aprobar el plan y presupuesto
2. Configurar entornos AWS
3. Comenzar Fase 1 (Preparación)
4. Ejecutar migración por fases
5. Monitorear y optimizar post-migración

---

*Esta guía representa un plan completo de migración que puede ajustarse según las necesidades específicas y restricciones del proyecto.*
