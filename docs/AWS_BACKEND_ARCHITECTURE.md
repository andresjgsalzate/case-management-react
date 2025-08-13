# Backend AWS - Case Management System

## 🏗️ Arquitectura del Backend

### Stack Tecnológico
- **Runtime**: Node.js 18+ 
- **Language**: TypeScript
- **Framework**: Express.js
- **Container**: Docker + AWS ECS/Fargate
- **Load Balancer**: Application Load Balancer (ALB)
- **Database**: AWS RDS PostgreSQL
- **Auth**: AWS Cognito
- **Storage**: AWS S3
- **Email**: AWS SES
- **Infrastructure**: AWS CDK

## 📁 Estructura del Proyecto

```
aws-backend/
├── src/
│   ├── controllers/           # Express controllers (REST endpoints)
│   │   ├── AuthController.ts
│   │   ├── CasesController.ts
│   │   ├── TasksController.ts
│   │   ├── DocumentsController.ts
│   │   ├── NotificationsController.ts
│   │   └── ReportsController.ts
│   │
│   ├── routes/               # Express routes
│   │   ├── auth.ts
│   │   ├── cases.ts
│   │   ├── tasks.ts
│   │   ├── documents.ts
│   │   └── index.ts
│   │
│   ├── services/             # Lógica de negocio
│   │   ├── CaseService.ts
│   │   ├── UserService.ts
│   │   ├── EmailService.ts
│   │   ├── DocumentService.ts
│   │   └── PermissionService.ts
│   │
│   ├── models/               # Tipos y esquemas
│   │   ├── Case.ts
│   │   ├── User.ts
│   │   ├── Task.ts
│   │   └── Document.ts
│   │
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts          # Validación JWT
│   │   ├── cors.ts          # CORS headers
│   │   ├── validation.ts    # Validación de datos
│   │   ├── rateLimit.ts     # Rate limiting
│   │   └── errorHandler.ts  # Manejo de errores
│   │
│   ├── database/             # Configuración DB
│   │   ├── connection.ts    # Pool de conexiones PostgreSQL
│   │   ├── migrations/      # Migraciones
│   │   ├── queries/         # Queries SQL
│   │   └── repositories/    # Data access layer
│   │
│   ├── utils/               # Utilidades
│   │   ├── logger.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   │
│   ├── config/              # Configuraciones
│   │   ├── aws.ts          # Configuración AWS SDK
│   │   ├── database.ts     # Configuración DB
│   │   └── environment.ts  # Variables de entorno
│   │
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
│
├── infrastructure/          # AWS CDK
│   ├── lib/
│   │   ├── database-stack.ts    # RDS PostgreSQL
│   │   ├── ecs-stack.ts         # ECS/Fargate cluster
│   │   ├── vpc-stack.ts         # VPC y networking
│   │   ├── auth-stack.ts        # Cognito
│   │   └── storage-stack.ts     # S3 buckets
│   ├── bin/
│   └── cdk.json
│
├── docker/                  # Docker configuration
│   ├── Dockerfile
│   ├── docker-compose.yml   # Para desarrollo local
│   └── .dockerignore
│
├── tests/                   # Tests
├── scripts/                 # Scripts de deployment
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuración Inicial

### Package.json
```json
{
  "name": "case-management-aws-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "docker:build": "docker build -t case-management-api .",
    "docker:run": "docker run -p 3000:3000 case-management-api",
    "migrate": "node dist/database/migrations/run.js",
    "db:seed": "node dist/database/seeds/run.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "@aws-sdk/client-s3": "^3.x.x",
    "@aws-sdk/client-ses": "^3.x.x",
    "@aws-sdk/client-cognito-identity-provider": "^3.x.x",
    "pg": "^8.11.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.10.1",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.3.1",
    "winston": "^3.10.0",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "@types/node": "^20.x.x",
    "@types/express": "^4.x.x",
    "@types/cors": "^2.x.x",
    "@types/pg": "^8.x.x",
    "@types/jsonwebtoken": "^9.x.x",
    "@types/bcryptjs": "^2.x.x",
    "@types/compression": "^1.x.x",
    "typescript": "^5.x.x",
    "nodemon": "^3.0.1",
    "jest": "^29.6.4",
    "@types/jest": "^29.5.5",
    "ts-jest": "^29.1.1",
    "eslint": "^8.48.0",
    "@typescript-eslint/eslint-plugin": "^6.7.0",
    "aws-cdk": "^2.x.x",
    "aws-cdk-lib": "^2.x.x"
  }
}
```

## 🚀 Servicios a Migrar del Frontend

### 1. Sistema de Autenticación
**Actual (Supabase):**
```typescript
// Frontend actual
import { supabase } from './supabase';
await supabase.auth.signIn({ email, password });
```

**Nuevo (Express + Cognito):**
```typescript
// Backend controller
export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    
    try {
      const user = await this.authService.signIn(email, password);
      const token = this.authService.generateJWT(user);
      
      res.json({ user, token });
    } catch (error) {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  }
}

// Express route
app.post('/api/auth/login', authController.login);
```

### 2. Gestión de Casos
**Migrar estas funciones del frontend al backend:**
- CRUD completo de casos
- Validaciones de negocio
- Cálculo de puntuaciones
- Historial de cambios

### 3. Sistema de Permisos
**Convertir RLS policies en lógica de backend:**
- Validación de permisos por rol
- Filtrado de datos por usuario
- Control de acceso granular

### 4. Procesamiento de Archivos
**Migrar de Supabase Storage a S3:**
- Upload con pre-signed URLs
- Procesamiento de imágenes
- Gestión de metadatos

### 5. Sistema de Notificaciones
**Migrar de email básico a SES:**
- Templates de email avanzados
- Tracking de emails
- Notificaciones push (futuro)

## 🔒 Seguridad

### Express Authentication Middleware
```typescript
// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};
```

### Request Validation Middleware
```typescript
// middleware/validation.ts
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: error.details 
      });
    }
    next();
  };
};
```

## 📊 Monitoring y Logs

### CloudWatch Integration
```typescript
// utils/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', message, meta }));
  },
  error: (message: string, error?: Error) => {
    console.error(JSON.stringify({ level: 'error', message, error: error?.stack }));
  }
};
```

## 🔄 Migración de Datos

### Export Script (Supabase)
```bash
# Script para exportar datos
pg_dump --host=db.your-project.supabase.co \
        --port=5432 \
        --username=postgres \
        --dbname=postgres \
        --data-only \
        --table=cases \
        --table=users \
        --file=data_export.sql
```

### Import Script (RDS)
```bash
# Script para importar a RDS
psql --host=your-rds-endpoint \
     --port=5432 \
     --username=postgres \
     --dbname=casemanagement \
     --file=data_export.sql
```

## 🚀 Próximos Pasos

1. **Crear proyecto backend** con esta estructura
2. **Configurar infraestructura** con CDK
3. **Implementar servicios core** (auth, cases, users)
4. **Migrar lógica de negocio** del frontend
5. **Setup CI/CD pipeline**
6. **Testing exhaustivo**
7. **Migración de datos**
8. **Go-live**

¿Te gustaría que creemos alguno de estos archivos específicos o prefieres que profundicemos en algún aspecto particular?
