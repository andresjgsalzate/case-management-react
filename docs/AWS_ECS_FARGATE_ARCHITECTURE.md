# 🏗️ AWS ECS/Fargate + Express.js Architecture

## 🎯 **¿Por qué ECS/Fargate en lugar de Lambda?**

### ✅ **Ventajas de ECS/Fargate para tu caso:**

1. **🔄 Conexiones Persistentes**
   - Pool de conexiones PostgreSQL eficiente
   - Sin cold starts como en Lambda
   - Estado en memoria para caché

2. **🧠 Lógica de Negocio Compleja**
   - Tu app tiene servicios complejos (permisos, casos, tiempo)
   - Mejor para aplicaciones con múltiples endpoints
   - Debugging más fácil

3. **📈 Performance Predecible**
   - Latencia consistente
   - Control total sobre recursos
   - Escalabilidad horizontal automática

4. **💰 Costo Eficiente**
   - Para aplicaciones con uso constante
   - No pagas por función individual
   - Mejor para cargas de trabajo sostenidasECS **

---

## 🏗️ **Arquitectura Completa**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │────│ Application LB   │────│  ECS Fargate    │
│      (CDN)      │    │     (ALB)        │    │   Cluster       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐              │
                       │   AWS Cognito   │──────────────┤
                       │     (Auth)      │              │
                       └─────────────────┘              │
                                                        │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│     React       │    │   RDS PostgreSQL │────│  Express API    │
│   Frontend      │    │    (Database)    │    │   Container     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐              │
                       │      S3         │──────────────┤
                       │   (Storage)     │              │
                       └─────────────────┘              │
                                                        │
                       ┌─────────────────┐              │
                       │      SES        │──────────────┘
                       │    (Email)      │
                       └─────────────────┘
```

---

## 🐳 **Docker Configuration**

### Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

### docker-compose.yml (Para desarrollo local)
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/casemanagement
      - JWT_SECRET=your-jwt-secret
      - AWS_REGION=us-east-1
    depends_on:
      - db
    volumes:
      - ./src:/app/src
      - ./dist:/app/dist

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=casemanagement
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## 🚀 **AWS CDK Infrastructure**

### ECS Stack
```typescript
// infrastructure/lib/ecs-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';

export class EcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'CaseManagementVpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'CaseManagementCluster', {
      vpc,
      clusterName: 'case-management-cluster',
    });

    // Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'CaseManagementTask', {
      memoryLimitMiB: 1024,
      cpu: 512,
    });

    // Container Definition
    const container = taskDefinition.addContainer('CaseManagementContainer', {
      image: ecs.ContainerImage.fromRegistry('your-account.dkr.ecr.region.amazonaws.com/case-management-api:latest'),
      environment: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
      secrets: {
        DATABASE_URL: ecs.Secret.fromSecretsManager(databaseSecret),
        JWT_SECRET: ecs.Secret.fromSecretsManager(jwtSecret),
      },
      logging: ecs.LogDrivers.awsLogs({
        logGroup: new logs.LogGroup(this, 'CaseManagementLogGroup', {
          logGroupName: '/ecs/case-management',
          retention: logs.RetentionDays.ONE_WEEK,
        }),
        streamPrefix: 'ecs',
      }),
    });

    container.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP,
    });

    // Fargate Service
    const service = new ecs.FargateService(this, 'CaseManagementService', {
      cluster,
      taskDefinition,
      desiredCount: 2,
      assignPublicIp: false,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    });

    // Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'CaseManagementALB', {
      vpc,
      internetFacing: true,
    });

    const listener = alb.addListener('CaseManagementListener', {
      port: 80,
      open: true,
    });

    listener.addTargets('CaseManagementTargets', {
      port: 3000,
      targets: [service],
      healthCheckPath: '/health',
      healthCheckInterval: cdk.Duration.seconds(60),
    });

    // Auto Scaling
    const scaling = service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 10,
    });

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
    });

    scaling.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 80,
    });

    // Outputs
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: alb.loadBalancerDnsName,
    });
  }
}
```

---

## 🗄️ **Database Stack (RDS)**

```typescript
// infrastructure/lib/database-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class DatabaseStack extends cdk.Stack {
  public readonly database: rds.DatabaseInstance;

  constructor(scope: Construct, id: string, vpc: ec2.Vpc, props?: cdk.StackProps) {
    super(scope, id, props);

    // Security Group para RDS
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc,
      description: 'Security group for RDS database',
      allowAllOutbound: false,
    });

    // Permitir conexiones desde ECS
    dbSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL connections from ECS'
    );

    // RDS Subnet Group
    const subnetGroup = new rds.SubnetGroup(this, 'DatabaseSubnetGroup', {
      vpc,
      description: 'Subnet group for RDS database',
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    });

    // RDS Instance
    this.database = new rds.DatabaseInstance(this, 'CaseManagementDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15_3,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      vpc,
      subnetGroup,
      securityGroups: [dbSecurityGroup],
      multiAz: true,
      allocatedStorage: 100,
      storageType: rds.StorageType.GP2,
      backupRetention: cdk.Duration.days(7),
      deletionProtection: true,
      databaseName: 'casemanagement',
    });

    // Output
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.database.instanceEndpoint.hostname,
    });
  }
}
```

---

## 📊 **Costos Estimados (ECS vs Lambda)**

### ECS/Fargate
```typescript
// Costo mensual estimado
const ecsEstimate = {
  fargate: {
    vCPU: 0.5, // 0.5 vCPU
    memory: 1,  // 1 GB
    hours: 24 * 30, // 720 horas/mes
    costPerHour: 0.04048, // us-east-1
    monthlyCost: 720 * 0.04048 // ~$29/mes
  },
  
  alb: {
    monthlyCost: 16.20 // ~$16/mes
  },
  
  rds: {
    instance: 'db.t3.medium',
    monthlyCost: 65 // ~$65/mes
  },
  
  total: 110 // ~$110/mes base
};
```

### Lambda (comparación)
```typescript
// Lambda sería más caro para tu caso
const lambdaEstimate = {
  requests: 1000000, // 1M requests/mes
  duration: 200, // 200ms promedio
  memory: 1024, // 1GB
  monthlyCost: 25, // ~$25/mes solo compute
  
  // PERO necesitarías:
  apiGateway: 3.50, // API Gateway
  rdsProxy: 12.60, // RDS Proxy para conexiones
  coldStartIssues: 'Problemas de rendimiento',
  
  total: 41, // Pero con limitaciones
};
```

---

## 🚀 **Ventajas de la Nueva Arquitectura**

### ✅ **Performance**
- Pool de conexiones PostgreSQL persistente
- Sin cold starts
- Cache en memoria (Redis opcional)
- Latencia predecible < 100ms

### ✅ **Escalabilidad**
- Auto-scaling basado en CPU/memoria
- Load balancer distribuyendo carga
- Horizontal scaling automático

### ✅ **Desarrollo**
- Docker para consistencia dev/prod
- Hot reload en desarrollo
- Debugging normal con breakpoints
- Logs centralizados en CloudWatch

### ✅ **Operaciones**
- Health checks automáticos
- Rolling deployments
- Blue-green deployments fáciles
- Monitoring completo

---

## 🛠️ **Próximos Pasos**

1. **Crear estructura del proyecto Express**
2. **Setup Docker y desarrollo local**
3. **Implementar infraestructura CDK**
4. **Migrar primer servicio (Auth)**
5. **Setup CI/CD pipeline**

¿Te gustaría que creemos la estructura completa del proyecto Express ahora?
