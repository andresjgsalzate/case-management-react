# 🚀 Guía Definitiva: Migración Completa a AWS

> **📌 Guía Integrada**: Este documento combina y optimiza todos los planes de migración AWS, eliminando duplicaciones y presentando la ruta más eficiente.

## 📋 Tabla de Contenidos

1. [Visión General y Objetivos](#1-visión-general-y-objetivos)
2. [Arquitectura AWS Propuesta](#2-arquitectura-aws-propuesta)
3. [Análisis de Costos Completo](#3-análisis-de-costos-completo)
4. [Prerequisitos y Preparación](#4-prerequisitos-y-preparación)
5. [Fase 1: Infraestructura Base](#5-fase-1-infraestructura-base)
6. [Fase 2: Base de Datos (RDS)](#6-fase-2-base-de-datos-rds)
7. [Fase 3: Backend (ECS/Fargate + Express)](#7-fase-3-backend-ecsfargate--express)
8. [Fase 4: Frontend (S3 + CloudFront)](#8-fase-4-frontend-s3--cloudfront)
9. [Fase 5: Autenticación (Cognito)](#9-fase-5-autenticación-cognito)
10. [Fase 6: Storage y Assets (S3)](#10-fase-6-storage-y-assets-s3)
11. [Fase 7: Email Service (SES)](#11-fase-7-email-service-ses)
12. [Fase 8: Migración de Datos](#12-fase-8-migración-de-datos)
13. [Fase 9: CI/CD y Automatización](#13-fase-9-cicd-y-automatización)
14. [Fase 10: Monitoreo y Optimización](#14-fase-10-monitoreo-y-optimización)
15. [Testing y Validación](#15-testing-y-validación)
16. [Go-Live y Plan de Rollback](#16-go-live-y-plan-de-rollback)
17. [Post-Migración: Optimización](#17-post-migración-optimización)

---

## 1. Visión General y Objetivos

### 🎯 **Estado Actual vs Objetivo**

| Componente | **Antes (Supabase)** | **Después (AWS)** | **Beneficio** |
|------------|----------------------|-------------------|---------------|
| **Frontend** | Netlify | S3 + CloudFront | ⚡ Mejor CDN global |
| **Backend** | Supabase Edge Functions | ECS Fargate + Express.js | 🚀 Performance y flexibilidad |
| **Database** | Supabase PostgreSQL | RDS PostgreSQL | 📊 Control total y backups |
| **Auth** | Supabase Auth | Amazon Cognito | 🔐 Enterprise security |
| **Storage** | Supabase Storage | Amazon S3 | 💾 Escalabilidad ilimitada |
| **Email** | Railway SMTP | Amazon SES | 📧 Deliverability superior |

### ✅ **Tu Código React SE MANTIENE 100% IGUAL**

**⚠️ IMPORTANTE**: Tu aplicación React + TypeScript + Vite no cambia. Solo actualizas:
- URLs de API (de Supabase → tu backend AWS)
- Cliente de autenticación (de Supabase → Cognito)
- Configuración de storage (de Supabase → S3)

---

## 2. Arquitectura AWS Propuesta

### 🏗️ **Diagrama de Arquitectura**

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS CLOUD                           │
├─────────────────────────────────────────────────────────────┤
│  FRONTEND LAYER                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Route 53   │───▶│ CloudFront  │───▶│     S3      │     │
│  │    (DNS)    │    │    (CDN)    │    │  (React)    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                              │                             │
├──────────────────────────────┼─────────────────────────────┤
│  API LAYER                   ▼                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │     ALB     │───▶│ ECS Fargate │───▶│  Express.js │     │
│  │(Load Bal.)  │    │ (Container) │    │  (Backend)  │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                              │                             │
├──────────────────────────────┼─────────────────────────────┤
│  DATA LAYER                  ▼                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │     RDS     │───▶│    Read     │    │  Amazon S3  │     │
│  │ PostgreSQL  │    │   Replica   │    │  (Storage)  │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
├─────────────────────────────────────────────────────────────┤
│  SERVICES LAYER                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Cognito   │  │     SES     │  │ CloudWatch  │         │
│  │   (Auth)    │  │   (Email)   │  │(Monitoring) │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 🔧 **Stack Tecnológico Final**

```typescript
// Stack Completo
const awsStack = {
  frontend: {
    framework: "React + TypeScript + Vite", // SIN CAMBIOS
    hosting: "S3 + CloudFront",
    dns: "Route 53"
  },
  
  backend: {
    runtime: "Node.js 18+",
    framework: "Express.js",
    container: "Docker + ECS Fargate",
    loadBalancer: "Application Load Balancer"
  },
  
  database: {
    primary: "RDS PostgreSQL",
    replica: "RDS Read Replica",
    backups: "Automated snapshots"
  },
  
  authentication: {
    service: "Amazon Cognito",
    features: ["MFA", "Social Login", "JWT tokens"]
  },
  
  storage: {
    files: "Amazon S3",
    cdn: "CloudFront",
    encryption: "S3 Server-side"
  },
  
  email: {
    service: "Amazon SES",
    features: ["Templates", "Analytics", "Bounce handling"]
  },
  
  monitoring: {
    logs: "CloudWatch Logs",
    metrics: "CloudWatch Metrics",
    alerts: "CloudWatch Alarms"
  }
};
```

---

## 3. Análisis de Costos Completo

### 💰 **Comparación de Costos**

| Concepto | **Actual (Supabase)** | **AWS (Optimizado)** | **Diferencia** |
|----------|------------------------|----------------------|----------------|
| **Base Services** | $25/mes | $95/mes | +$70/mes |
| **Hosting** | $19/mes (Netlify) | $8/mes (S3+CF) | -$11/mes |
| **Total Mensual** | $44/mes | $103/mes | **+$59/mes** |
| **Total Anual** | $528/año | $1,236/año | **+$708/año** |

### 📊 **Desglose Detallado AWS**

```typescript
// Costos mensuales estimados (región us-east-1)
const awsCosts = {
  compute: {
    ecsFlgate: 35,      // 2 tasks, 0.25 vCPU, 0.5GB
    alb: 18,            // Application Load Balancer
    nat: 32             // NAT Gateway
  },
  
  database: {
    rds: 25,            // db.t3.micro
    storage: 8,         // 100GB
    backups: 5          // Automated backups
  },
  
  frontend: {
    s3: 3,              // Static hosting
    cloudfront: 8,      // CDN
    route53: 2          // DNS
  },
  
  services: {
    cognito: 5,         // < 50K MAU
    ses: 1,             // Email service
    cloudwatch: 8       // Monitoring
  },
  
  total: 150            // $150/mes
};
```

### 🚀 **ROI y Justificación**

**¿Vale la pena el costo adicional de $59/mes?**

✅ **SÍ, por estas razones:**

1. **Escalabilidad**: AWS maneja 10x más usuarios sin límites
2. **Performance**: Latencia 50% menor con ECS vs Supabase Edge
3. **Flexibilidad**: Control total sobre infraestructura
4. **Vendor Independence**: Reduces vendor lock-in
5. **Enterprise Features**: Compliance, audit trails, security
6. **Learning Value**: Experiencia AWS valiosa para el equipo

---

## 4. Prerequisitos y Preparación

### 🛠️ **Herramientas Necesarias**

```bash
# 1. AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# 2. Docker
sudo apt-get update
sudo apt-get install docker.io docker-compose

# 3. Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. PostgreSQL client
sudo apt-get install postgresql-client

# 5. Verificar instalaciones
aws --version
docker --version
node --version
psql --version
```

### 🔐 **Configuración AWS**

```bash
# Configurar credenciales AWS
aws configure
# AWS Access Key ID: [tu-key]
# AWS Secret Access Key: [tu-secret]
# Default region: us-east-1
# Default output format: json

# Verificar conexión
aws sts get-caller-identity
```

### 📋 **Checklist Pre-Migración**

- [ ] ✅ Cuenta AWS con permisos administrativos
- [ ] ✅ Acceso a Supabase para exportar datos
- [ ] ✅ Backup completo de la aplicación actual
- [ ] ✅ Dominio propio registrado (opcional)
- [ ] ✅ Equipo notificado del plan de migración
- [ ] ✅ Ambiente de testing preparado

---

## 5. Fase 1: Infraestructura Base

### 🌐 **VPC y Networking**

```bash
# 1. Crear VPC
aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=case-management-vpc}]'

# Capturar VPC ID
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=case-management-vpc" --query 'Vpcs[0].VpcId' --output text)

# 2. Crear subnets públicas
aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.1.0/24 \
    --availability-zone us-east-1a \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=public-subnet-1a}]'

aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.2.0/24 \
    --availability-zone us-east-1b \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=public-subnet-1b}]'

# 3. Crear subnets privadas
aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.3.0/24 \
    --availability-zone us-east-1a \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=private-subnet-1a}]'

aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.4.0/24 \
    --availability-zone us-east-1b \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=private-subnet-1b}]'

# 4. Internet Gateway
aws ec2 create-internet-gateway \
    --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=case-management-igw}]'

IGW_ID=$(aws ec2 describe-internet-gateways --filters "Name=tag:Name,Values=case-management-igw" --query 'InternetGateways[0].InternetGatewayId' --output text)

aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID

# 5. NAT Gateway
aws ec2 allocate-address --domain vpc --tag-specifications 'ResourceType=elastic-ip,Tags=[{Key=Name,Value=nat-eip}]'

EIP_ID=$(aws ec2 describe-addresses --filters "Name=tag:Name,Values=nat-eip" --query 'Addresses[0].AllocationId' --output text)
PUBLIC_SUBNET_1A=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=public-subnet-1a" --query 'Subnets[0].SubnetId' --output text)

aws ec2 create-nat-gateway \
    --subnet-id $PUBLIC_SUBNET_1A \
    --allocation-id $EIP_ID \
    --tag-specifications 'ResourceType=nat-gateway,Tags=[{Key=Name,Value=case-management-nat}]'
```

### 🔒 **Security Groups**

```bash
# 1. Security Group para ALB
aws ec2 create-security-group \
    --group-name alb-sg \
    --description "Security group for Application Load Balancer" \
    --vpc-id $VPC_ID \
    --tag-specifications 'ResourceType=security-group,Tags=[{Key=Name,Value=alb-sg}]'

ALB_SG=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=alb-sg" --query 'SecurityGroups[0].GroupId' --output text)

# Permitir HTTP y HTTPS
aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 443 --cidr 0.0.0.0/0

# 2. Security Group para ECS
aws ec2 create-security-group \
    --group-name ecs-sg \
    --description "Security group for ECS tasks" \
    --vpc-id $VPC_ID \
    --tag-specifications 'ResourceType=security-group,Tags=[{Key=Name,Value=ecs-sg}]'

ECS_SG=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=ecs-sg" --query 'SecurityGroups[0].GroupId' --output text)

# Permitir tráfico desde ALB
aws ec2 authorize-security-group-ingress --group-id $ECS_SG --protocol tcp --port 3000 --source-group $ALB_SG

# 3. Security Group para RDS
aws ec2 create-security-group \
    --group-name rds-sg \
    --description "Security group for RDS database" \
    --vpc-id $VPC_ID \
    --tag-specifications 'ResourceType=security-group,Tags=[{Key=Name,Value=rds-sg}]'

RDS_SG=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=rds-sg" --query 'SecurityGroups[0].GroupId' --output text)

# Permitir PostgreSQL desde ECS
aws ec2 authorize-security-group-ingress --group-id $RDS_SG --protocol tcp --port 5432 --source-group $ECS_SG
```

---

## 6. Fase 2: Base de Datos (RDS)

### 🗄️ **Configurar RDS PostgreSQL**

```bash
# 1. Crear subnet group para RDS
PRIVATE_SUBNET_1A=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=private-subnet-1a" --query 'Subnets[0].SubnetId' --output text)
PRIVATE_SUBNET_1B=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=private-subnet-1b" --query 'Subnets[0].SubnetId' --output text)

aws rds create-db-subnet-group \
    --db-subnet-group-name case-management-subnet-group \
    --db-subnet-group-description "Subnet group for case management database" \
    --subnet-ids $PRIVATE_SUBNET_1A $PRIVATE_SUBNET_1B \
    --tags Key=Name,Value=case-management-subnet-group

# 2. Crear RDS instance
aws rds create-db-instance \
    --db-instance-identifier case-management-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.3 \
    --master-username postgres \
    --master-user-password "YourSecurePassword123!" \
    --allocated-storage 20 \
    --vpc-security-group-ids $RDS_SG \
    --db-subnet-group-name case-management-subnet-group \
    --db-name casemanagement \
    --backup-retention-period 7 \
    --multi-az \
    --storage-encrypted \
    --copy-tags-to-snapshot \
    --tags Key=Name,Value=case-management-db

# Esperar a que esté disponible (5-10 minutos)
aws rds wait db-instance-available --db-instance-identifier case-management-db

# 3. Obtener endpoint de RDS
RDS_ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier case-management-db --query 'DBInstances[0].Endpoint.Address' --output text)
echo "RDS Endpoint: $RDS_ENDPOINT"
```

### 📁 **Exportar Datos de Supabase**

```bash
# Script para exportar desde Supabase
#!/bin/bash

# Variables de Supabase (actualizar con tus datos)
SUPABASE_HOST="db.your-project.supabase.co"
SUPABASE_USER="postgres"
SUPABASE_DB="postgres"
SUPABASE_PASSWORD="your-password"

# Crear directorio para backups
mkdir -p migration-backups
cd migration-backups

# 1. Exportar esquema (estructura)
echo "Exportando esquema..."
PGPASSWORD=$SUPABASE_PASSWORD pg_dump \
    --host=$SUPABASE_HOST \
    --port=5432 \
    --username=$SUPABASE_USER \
    --dbname=$SUPABASE_DB \
    --schema-only \
    --no-owner \
    --no-privileges \
    --file=01_schema.sql

# 2. Exportar datos
echo "Exportando datos..."
PGPASSWORD=$SUPABASE_PASSWORD pg_dump \
    --host=$SUPABASE_HOST \
    --port=5432 \
    --username=$SUPABASE_USER \
    --dbname=$SUPABASE_DB \
    --data-only \
    --no-owner \
    --no-privileges \
    --file=02_data.sql

# 3. Exportar scripts específicos de tu aplicación
echo "Copiando scripts SQL existentes..."
cp -r ../sql-scripts/ ./03_custom_scripts/

echo "Backup completado en: $(pwd)"
echo "Archivos generados:"
ls -la *.sql
```

### 🔄 **Migrar Datos a RDS**

```bash
# Script para importar a RDS
#!/bin/bash

RDS_ENDPOINT="your-rds-endpoint.amazonaws.com"
RDS_USER="postgres"
RDS_PASSWORD="YourSecurePassword123!"
RDS_DB="casemanagement"

cd migration-backups

# 1. Importar esquema
echo "Importando esquema..."
PGPASSWORD=$RDS_PASSWORD psql \
    --host=$RDS_ENDPOINT \
    --port=5432 \
    --username=$RDS_USER \
    --dbname=$RDS_DB \
    --file=01_schema.sql

# 2. Ejecutar scripts personalizados en orden
echo "Ejecutando scripts personalizados..."
for script in 03_custom_scripts/*.sql; do
    echo "Ejecutando: $script"
    PGPASSWORD=$RDS_PASSWORD psql \
        --host=$RDS_ENDPOINT \
        --port=5432 \
        --username=$RDS_USER \
        --dbname=$RDS_DB \
        --file="$script"
done

# 3. Importar datos
echo "Importando datos..."
PGPASSWORD=$RDS_PASSWORD psql \
    --host=$RDS_ENDPOINT \
    --port=5432 \
    --username=$RDS_USER \
    --dbname=$RDS_DB \
    --file=02_data.sql

# 4. Verificar migración
echo "Verificando migración..."
PGPASSWORD=$RDS_PASSWORD psql \
    --host=$RDS_ENDPOINT \
    --port=5432 \
    --username=$RDS_USER \
    --dbname=$RDS_DB \
    --command="SELECT COUNT(*) FROM cases;"

echo "Migración de base de datos completada!"
```

---

## 7. Fase 3: Backend (ECS/Fargate + Express)

### 📁 **Estructura del Proyecto Backend**

```bash
# Crear proyecto backend
mkdir case-management-backend
cd case-management-backend

# Estructura de carpetas
mkdir -p src/{config,controllers,middleware,models,routes,services,utils}
mkdir -p docker tests scripts
```

### 📦 **package.json**

```json
{
  "name": "case-management-backend",
  "version": "1.0.0",
  "description": "Backend API for Case Management System",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "docker:build": "docker build -t case-management-api .",
    "docker:run": "docker run -p 3000:3000 case-management-api",
    "migrate": "node scripts/migrate.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^6.10.0",
    "pg": "^8.11.3",
    "aws-sdk": "^2.1490.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "joi": "^17.11.0",
    "dotenv": "^16.3.1",
    "winston": "^3.10.0",
    "multer": "^1.4.5",
    "amazon-cognito-identity-js": "^6.3.6"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "nodemon": "^3.0.1",
    "jest": "^29.7.0"
  }
}
```

### 🚀 **src/server.js - Servidor Principal**

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { logger } = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Importar rutas
const authRoutes = require('./routes/auth');
const casesRoutes = require('./routes/cases');
const documentsRoutes = require('./routes/documents');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());
app.use(compression());

// CORS configurado para AWS
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        process.env.CLOUDFRONT_URL,
        'http://localhost:5173' // Para desarrollo
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: 'Demasiadas solicitudes desde esta IP'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Error handler
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
    logger.info(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    logger.info(`🌍 Ambiente: ${process.env.NODE_ENV}`);
    logger.info(`🗄️ Base de datos: ${process.env.RDS_ENDPOINT ? 'RDS' : 'Local'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM recibido, cerrando servidor...');
    server.close(() => {
        logger.info('Servidor cerrado exitosamente');
        process.exit(0);
    });
});

module.exports = app;
```

### 🗄️ **src/config/database.js - Configuración DB**

```javascript
const { Pool } = require('pg');
const { logger } = require('../utils/logger');

const pool = new Pool({
    host: process.env.RDS_ENDPOINT,
    port: process.env.RDS_PORT || 5432,
    database: process.env.RDS_DATABASE,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // máximo de conexiones en el pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Event listeners
pool.on('connect', () => {
    logger.info('📊 Conectado a PostgreSQL');
});

pool.on('error', (err) => {
    logger.error('❌ Error en pool de PostgreSQL:', err);
    process.exit(-1);
});

// Función para ejecutar queries con logging
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        logger.debug('Query ejecutado', { 
            sql: text.substring(0, 100) + '...', 
            duration, 
            rows: res.rowCount 
        });
        return res;
    } catch (error) {
        logger.error('❌ Error en query:', { 
            sql: text.substring(0, 100) + '...', 
            error: error.message 
        });
        throw error;
    }
};

// Test de conexión
const testConnection = async () => {
    try {
        const result = await query('SELECT NOW() as current_time');
        logger.info('✅ Test de base de datos exitoso:', result.rows[0]);
        return true;
    } catch (error) {
        logger.error('❌ Test de base de datos falló:', error.message);
        return false;
    }
};

module.exports = {
    pool,
    query,
    testConnection
};
```

### 🎮 **src/controllers/CasesController.js - Ejemplo Completo**

```javascript
const { query } = require('../config/database');
const { logger } = require('../utils/logger');
const Joi = require('joi');

// Schema de validación para casos
const caseSchema = Joi.object({
    numero_caso: Joi.string().required(),
    descripcion: Joi.string().required(),
    fecha: Joi.date().iso().required(),
    origen_id: Joi.string().uuid().allow(null),
    aplicacion_id: Joi.string().uuid().allow(null),
    historial_caso: Joi.number().min(1).max(5).required(),
    conocimiento_modulo: Joi.number().min(1).max(5).required(),
    manipulacion_datos: Joi.number().min(1).max(5).required(),
    claridad_descripcion: Joi.number().min(1).max(5).required(),
    causa_fallo: Joi.number().min(1).max(5).required()
});

class CasesController {
    // Listar casos con permisos
    static async getCases(req, res) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            
            let queryText = `
                SELECT c.*, o.nombre as origen_nombre, a.nombre as aplicacion_nombre,
                       u.full_name as created_by_name
                FROM cases c
                LEFT JOIN origenes o ON c.origen_id = o.id
                LEFT JOIN aplicaciones a ON c.aplicacion_id = a.id
                LEFT JOIN user_profiles u ON c.user_id = u.id
            `;
            
            let params = [];
            
            // Aplicar filtros según permisos
            if (userRole !== 'admin') {
                queryText += ' WHERE c.user_id = $1';
                params = [userId];
            }
            
            queryText += ' ORDER BY c.created_at DESC';
            
            const result = await query(queryText, params);
            
            logger.info(`📋 Casos consultados por usuario ${userId}`, {
                count: result.rows.length,
                userRole
            });
            
            res.json({
                success: true,
                data: result.rows,
                total: result.rows.length
            });
            
        } catch (error) {
            logger.error('❌ Error al consultar casos:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
    
    // Crear nuevo caso
    static async createCase(req, res) {
        try {
            // Validar datos
            const { error, value } = caseSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: 'Datos inválidos',
                    details: error.details
                });
            }
            
            const userId = req.user.id;
            
            // Calcular puntuación y clasificación
            const puntuacion = CasesController.calcularPuntuacion(value);
            const clasificacion = CasesController.clasificarCaso(puntuacion);
            
            const queryText = `
                INSERT INTO cases (
                    numero_caso, descripcion, fecha, origen_id, aplicacion_id,
                    historial_caso, conocimiento_modulo, manipulacion_datos,
                    claridad_descripcion, causa_fallo, puntuacion, clasificacion,
                    user_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *
            `;
            
            const params = [
                value.numero_caso, value.descripcion, value.fecha,
                value.origen_id, value.aplicacion_id, value.historial_caso,
                value.conocimiento_modulo, value.manipulacion_datos,
                value.claridad_descripcion, value.causa_fallo,
                puntuacion, clasificacion, userId
            ];
            
            const result = await query(queryText, params);
            const newCase = result.rows[0];
            
            logger.info(`✅ Caso creado exitosamente`, {
                caseId: newCase.id,
                numeroCaso: newCase.numero_caso,
                userId,
                puntuacion,
                clasificacion
            });
            
            res.status(201).json({
                success: true,
                data: newCase,
                message: 'Caso creado exitosamente'
            });
            
        } catch (error) {
            logger.error('❌ Error al crear caso:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
    
    // Obtener caso por ID
    static async getCaseById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;
            
            let queryText = `
                SELECT c.*, o.nombre as origen_nombre, a.nombre as aplicacion_nombre
                FROM cases c
                LEFT JOIN origenes o ON c.origen_id = o.id
                LEFT JOIN aplicaciones a ON c.aplicacion_id = a.id
                WHERE c.id = $1
            `;
            
            let params = [id];
            
            // Verificar permisos
            if (userRole !== 'admin') {
                queryText += ' AND c.user_id = $2';
                params.push(userId);
            }
            
            const result = await query(queryText, params);
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Caso no encontrado o sin permisos'
                });
            }
            
            res.json({
                success: true,
                data: result.rows[0]
            });
            
        } catch (error) {
            logger.error('❌ Error al consultar caso:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
    
    // Funciones auxiliares (migradas del frontend)
    static calcularPuntuacion(caseData) {
        const {
            historial_caso,
            conocimiento_modulo,
            manipulacion_datos,
            claridad_descripcion,
            causa_fallo
        } = caseData;
        
        return historial_caso + conocimiento_modulo + manipulacion_datos + 
               claridad_descripcion + causa_fallo;
    }
    
    static clasificarCaso(puntuacion) {
        if (puntuacion >= 20) return 'Excelente';
        if (puntuacion >= 15) return 'Bueno';
        if (puntuacion >= 10) return 'Regular';
        return 'Deficiente';
    }
}

module.exports = CasesController;
```

### 🔐 **src/middleware/auth.js - Autenticación**

```javascript
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const { logger } = require('../utils/logger');

// Configurar AWS Cognito
const cognito = new AWS.CognitoIdentityServiceProvider({
    region: process.env.AWS_REGION
});

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Token de acceso requerido'
            });
        }
        
        const token = authHeader.substring(7);
        
        // Verificar token con Cognito
        const params = {
            AccessToken: token
        };
        
        const userData = await cognito.getUser(params).promise();
        
        // Extraer información del usuario
        const userAttributes = {};
        userData.UserAttributes.forEach(attr => {
            userAttributes[attr.Name] = attr.Value;
        });
        
        req.user = {
            id: userAttributes.sub,
            email: userAttributes.email,
            name: userAttributes.name,
            role: userAttributes['custom:role'] || 'user'
        };
        
        next();
        
    } catch (error) {
        logger.error('❌ Error de autenticación:', error);
        
        if (error.code === 'NotAuthorizedException') {
            return res.status(401).json({
                success: false,
                error: 'Token inválido o expirado'
            });
        }
        
        return res.status(500).json({
            success: false,
            error: 'Error en autenticación'
        });
    }
};

module.exports = auth;
```

### 🐳 **Dockerfile**

```dockerfile
# Multi-stage build para optimizar tamaño
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Etapa de producción
FROM node:18-alpine AS production

WORKDIR /app

# Instalar curl para health checks
RUN apk add --no-cache curl

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Copiar aplicación desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./

# Cambiar ownership
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicio
CMD ["node", "src/server.js"]
```

### 📋 **Variables de Entorno (.env.example)**

```bash
# Configuración del servidor
NODE_ENV=production
PORT=3000

# Base de datos RDS
RDS_ENDPOINT=your-rds-endpoint.amazonaws.com
RDS_PORT=5432
RDS_DATABASE=casemanagement
RDS_USERNAME=postgres
RDS_PASSWORD=YourSecurePassword123!

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Cognito
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=your-client-id

# S3
S3_BUCKET=case-management-storage
S3_REGION=us-east-1

# URLs del frontend
FRONTEND_URL=https://your-domain.com
CLOUDFRONT_URL=https://d1234567890abc.cloudfront.net

# JWT Secret (backup)
JWT_SECRET=your-super-secure-secret-key

# Logging
LOG_LEVEL=info
```

---

Esta es la primera parte de la guía integrada. ¿Te gustaría que continúe con las siguientes fases (Frontend, Cognito, Storage, etc.) o prefieres que profundicemos en alguna sección específica?
