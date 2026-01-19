# EduFlow LMS - Deployment Guide

## Overview

This guide covers the complete deployment process for EduFlow LMS, from development to production environments. EduFlow is designed as a cloud-native application with support for multiple deployment strategies.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     LOAD BALANCER                            │
│                   (CloudFlare/AWS ALB)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   KUBERNETES CLUSTER                         │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Frontend      │   Backend API   │   Background Jobs       │
│   (Next.js)     │   (NestJS)      │   (Bull Queue)          │
├─────────────────┼─────────────────┼─────────────────────────┤
│   Admin Panel   │   WebSocket     │   File Processing       │
│   (React)       │   Server        │   (Video/Image)         │
└─────────────────┴─────────────────┴─────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  PostgreSQL  │  Redis       │  Elasticsearch│  S3 Storage   │
│  (Primary)   │  (Cache)     │  (Search)     │  (Files)      │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

## Prerequisites

### System Requirements

**Minimum Requirements (Development)**:
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB SSD
- Network: 10 Mbps

**Recommended Requirements (Production)**:
- CPU: 8+ cores per node
- RAM: 16GB+ per node
- Storage: 100GB+ SSD
- Network: 100 Mbps+

### Software Dependencies

- **Container Runtime**: Docker 20.10+ or containerd
- **Orchestration**: Kubernetes 1.24+
- **Database**: PostgreSQL 14+
- **Cache**: Redis 6+
- **Search**: Elasticsearch 8+
- **Load Balancer**: NGINX, HAProxy, or cloud provider LB

### Cloud Provider Requirements

**AWS**:
- EKS cluster or EC2 instances
- RDS PostgreSQL
- ElastiCache Redis
- S3 bucket for file storage
- CloudFront CDN
- Route 53 for DNS

**Azure**:
- AKS cluster or Virtual Machines
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Blob Storage
- Azure CDN
- Azure DNS

**Google Cloud**:
- GKE cluster or Compute Engine
- Cloud SQL PostgreSQL
- Memorystore Redis
- Cloud Storage
- Cloud CDN
- Cloud DNS

## Environment Setup

### 1. Development Environment

#### Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: eduflow_dev
      POSTGRES_USER: eduflow
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d

  # Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Search Engine
  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  # File Storage (MinIO)
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data

  # Backend API
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://eduflow:password@postgres:5432/eduflow_dev
      - REDIS_URL=redis://redis:6379
      - ELASTICSEARCH_URL=http://elasticsearch:9200
      - MINIO_ENDPOINT=minio:9000
    depends_on:
      - postgres
      - redis
      - elasticsearch
      - minio
    volumes:
      - ./apps/api:/app
      - /app/node_modules

  # Frontend Web App
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    depends_on:
      - api
    volumes:
      - ./apps/web:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
  minio_data:
```

#### Quick Start Commands

```bash
# Clone repository
git clone https://github.com/your-org/eduflow-lms.git
cd eduflow-lms

# Install dependencies
npm install

# Start development environment
docker-compose up -d

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Start development servers
npm run dev
```

### 2. Staging Environment

#### Kubernetes Deployment

**Namespace Configuration**:
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: eduflow-staging
  labels:
    environment: staging
```

**Database Configuration**:
```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: eduflow-staging
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16
        env:
        - name: POSTGRES_DB
          value: eduflow_staging
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
```

**Backend API Deployment**:
```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: eduflow-api
  namespace: eduflow-staging
spec:
  replicas: 2
  selector:
    matchLabels:
      app: eduflow-api
  template:
    metadata:
      labels:
        app: eduflow-api
    spec:
      containers:
      - name: api
        image: eduflow/api:staging
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "staging"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Frontend Deployment**:
```yaml
# k8s/web-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: eduflow-web
  namespace: eduflow-staging
spec:
  replicas: 2
  selector:
    matchLabels:
      app: eduflow-web
  template:
    metadata:
      labels:
        app: eduflow-web
    spec:
      containers:
      - name: web
        image: eduflow/web:staging
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_API_URL
          value: "https://api-staging.eduflow.com"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
```

#### Deployment Script

```bash
#!/bin/bash
# deploy-staging.sh

set -e

echo "Deploying EduFlow to Staging Environment..."

# Build and push Docker images
docker build -t eduflow/api:staging -f apps/api/Dockerfile .
docker build -t eduflow/web:staging -f apps/web/Dockerfile .

docker push eduflow/api:staging
docker push eduflow/web:staging

# Apply Kubernetes configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets/
kubectl apply -f k8s/configmaps/
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/web-deployment.yaml
kubectl apply -f k8s/services.yaml
kubectl apply -f k8s/ingress.yaml

# Wait for deployments to be ready
kubectl rollout status deployment/eduflow-api -n eduflow-staging
kubectl rollout status deployment/eduflow-web -n eduflow-staging

# Run database migrations
kubectl exec -it deployment/eduflow-api -n eduflow-staging -- npm run db:migrate

echo "Staging deployment completed successfully!"
```

### 3. Production Environment

#### Infrastructure as Code (Terraform)

**AWS EKS Cluster**:
```hcl
# infrastructure/terraform/main.tf
provider "aws" {
  region = var.aws_region
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = "eduflow-production"
  cluster_version = "1.24"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  node_groups = {
    main = {
      desired_capacity = 3
      max_capacity     = 10
      min_capacity     = 3
      
      instance_types = ["t3.large"]
      
      k8s_labels = {
        Environment = "production"
        Application = "eduflow"
      }
    }
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier = "eduflow-production"
  
  engine         = "postgres"
  engine_version = "14.9"
  instance_class = "db.t3.medium"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_type          = "gp2"
  storage_encrypted     = true
  
  db_name  = "eduflow"
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "eduflow-production-final-snapshot"
  
  tags = {
    Name        = "eduflow-production"
    Environment = "production"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "eduflow-cache-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "eduflow-redis"
  description                = "Redis cluster for EduFlow"
  
  node_type                  = "cache.t3.micro"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  subnet_group_name = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  tags = {
    Name        = "eduflow-redis"
    Environment = "production"
  }
}

# S3 Bucket for file storage
resource "aws_s3_bucket" "storage" {
  bucket = "eduflow-production-storage"
  
  tags = {
    Name        = "eduflow-storage"
    Environment = "production"
  }
}

resource "aws_s3_bucket_versioning" "storage" {
  bucket = aws_s3_bucket.storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "storage" {
  bucket = aws_s3_bucket.storage.id
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}
```

#### Production Kubernetes Configuration

**Production Deployment with High Availability**:
```yaml
# k8s/production/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: eduflow-api
  namespace: eduflow-production
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 1
  selector:
    matchLabels:
      app: eduflow-api
  template:
    metadata:
      labels:
        app: eduflow-api
        version: v1
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - eduflow-api
              topologyKey: kubernetes.io/hostname
      containers:
      - name: api
        image: eduflow/api:v1.2.0
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 60
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        securityContext:
          runAsNonRoot: true
          runAsUser: 1000
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: logs
          mountPath: /app/logs
      volumes:
      - name: tmp
        emptyDir: {}
      - name: logs
        emptyDir: {}
```

**Horizontal Pod Autoscaler**:
```yaml
# k8s/production/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: eduflow-api-hpa
  namespace: eduflow-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: eduflow-api
  minReplicas: 5
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

#### Production Deployment Pipeline

```yaml
# .github/workflows/production-deploy.yml
name: Production Deployment

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-west-2
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1
    
    - name: Build and push Docker images
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: eduflow
        IMAGE_TAG: ${{ github.ref_name }}
      run: |
        # Build API image
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY-api:$IMAGE_TAG -f apps/api/Dockerfile .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY-api:$IMAGE_TAG
        
        # Build Web image
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY-web:$IMAGE_TAG -f apps/web/Dockerfile .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY-web:$IMAGE_TAG
    
    - name: Update kubeconfig
      run: |
        aws eks update-kubeconfig --region us-west-2 --name eduflow-production
    
    - name: Deploy to Kubernetes
      run: |
        # Update image tags in deployment files
        sed -i "s|eduflow/api:.*|$ECR_REGISTRY/$ECR_REPOSITORY-api:$IMAGE_TAG|g" k8s/production/api-deployment.yaml
        sed -i "s|eduflow/web:.*|$ECR_REGISTRY/$ECR_REPOSITORY-web:$IMAGE_TAG|g" k8s/production/web-deployment.yaml
        
        # Apply configurations
        kubectl apply -f k8s/production/
        
        # Wait for rollout to complete
        kubectl rollout status deployment/eduflow-api -n eduflow-production --timeout=600s
        kubectl rollout status deployment/eduflow-web -n eduflow-production --timeout=600s
    
    - name: Run database migrations
      run: |
        kubectl exec -it deployment/eduflow-api -n eduflow-production -- npm run db:migrate:prod
    
    - name: Verify deployment
      run: |
        kubectl get pods -n eduflow-production
        kubectl get services -n eduflow-production
        
        # Health check
        API_URL=$(kubectl get service eduflow-api -n eduflow-production -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
        curl -f http://$API_URL/health || exit 1
```

## Monitoring and Observability

### Prometheus and Grafana Setup

```yaml
# k8s/monitoring/prometheus.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    
    scrape_configs:
    - job_name: 'eduflow-api'
      kubernetes_sd_configs:
      - role: endpoints
        namespaces:
          names:
          - eduflow-production
      relabel_configs:
      - source_labels: [__meta_kubernetes_service_name]
        action: keep
        regex: eduflow-api
    
    - job_name: 'eduflow-web'
      kubernetes_sd_configs:
      - role: endpoints
        namespaces:
          names:
          - eduflow-production
      relabel_configs:
      - source_labels: [__meta_kubernetes_service_name]
        action: keep
        regex: eduflow-web
```

### Application Metrics

```typescript
// Backend metrics (NestJS)
import { Injectable } from '@nestjs/common';
import { register, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });

  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  private readonly activeUsers = new Gauge({
    name: 'active_users_total',
    help: 'Number of active users',
  });

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  setActiveUsers(count: number) {
    this.activeUsers.set(count);
  }

  getMetrics() {
    return register.metrics();
  }
}
```

### Logging Configuration

```yaml
# k8s/logging/fluentd-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
  namespace: logging
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/eduflow-*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      format json
      time_format %Y-%m-%dT%H:%M:%S.%NZ
    </source>
    
    <filter kubernetes.**>
      @type kubernetes_metadata
    </filter>
    
    <match kubernetes.**>
      @type elasticsearch
      host elasticsearch.logging.svc.cluster.local
      port 9200
      index_name eduflow-logs
      type_name _doc
    </match>
```

## Security Configuration

### Network Policies

```yaml
# k8s/security/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: eduflow-network-policy
  namespace: eduflow-production
spec:
  podSelector:
    matchLabels:
      app: eduflow-api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: eduflow-web
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3001
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 5432  # PostgreSQL
    - protocol: TCP
      port: 6379  # Redis
    - protocol: TCP
      port: 9200  # Elasticsearch
    - protocol: TCP
      port: 443   # HTTPS
    - protocol: TCP
      port: 53    # DNS
    - protocol: UDP
      port: 53    # DNS
```

### Pod Security Policy

```yaml
# k8s/security/pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: eduflow-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

## Backup and Disaster Recovery

### Database Backup Strategy

```bash
#!/bin/bash
# scripts/backup-database.sh

set -e

BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="eduflow_backup_${TIMESTAMP}.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform database backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Upload to S3
aws s3 cp "$BACKUP_DIR/${BACKUP_FILE}.gz" "s3://eduflow-backups/database/"

# Clean up local backup (keep last 7 days)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Database backup completed: ${BACKUP_FILE}.gz"
```

### Automated Backup CronJob

```yaml
# k8s/backup/database-backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
  namespace: eduflow-production
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:16
            command:
            - /bin/bash
            - -c
            - |
              pg_dump $DATABASE_URL | gzip > /tmp/backup.sql.gz
              aws s3 cp /tmp/backup.sql.gz s3://eduflow-backups/database/backup-$(date +%Y%m%d-%H%M%S).sql.gz
            env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: database-secret
                  key: url
            - name: AWS_ACCESS_KEY_ID
              valueFrom:
                secretKeyRef:
                  name: aws-secret
                  key: access-key-id
            - name: AWS_SECRET_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: aws-secret
                  key: secret-access-key
          restartPolicy: OnFailure
```

## Performance Optimization

### CDN Configuration (CloudFlare)

```javascript
// cloudflare-worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Cache static assets for 1 year
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
    const response = await fetch(request)
    const newResponse = new Response(response.body, response)
    newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return newResponse
  }
  
  // Cache API responses for 5 minutes
  if (url.pathname.startsWith('/api/')) {
    const cacheKey = new Request(url.toString(), request)
    const cache = caches.default
    
    let response = await cache.match(cacheKey)
    if (!response) {
      response = await fetch(request)
      if (response.status === 200) {
        const newResponse = new Response(response.body, response)
        newResponse.headers.set('Cache-Control', 'public, max-age=300')
        event.waitUntil(cache.put(cacheKey, newResponse.clone()))
        return newResponse
      }
    }
    return response
  }
  
  return fetch(request)
}
```

### Database Optimization

```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_courses_published ON courses(is_published) WHERE is_published = true;
CREATE INDEX CONCURRENTLY idx_enrollments_user_course ON course_enrollments(user_id, course_id);
CREATE INDEX CONCURRENTLY idx_innovations_stage ON innovations(stage);
CREATE INDEX CONCURRENTLY idx_reviews_innovation ON innovation_reviews(innovation_id);

-- Partial indexes for better performance
CREATE INDEX CONCURRENTLY idx_users_active ON users(id) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_courses_featured ON courses(id) WHERE is_featured = true;

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_course_enrollments_progress ON course_enrollments(user_id, progress_percentage, completed_at);
CREATE INDEX CONCURRENTLY idx_innovations_category_stage ON innovations(category_id, stage, created_at);
```

## Troubleshooting

### Common Issues and Solutions

**1. Pod Startup Issues**
```bash
# Check pod status
kubectl get pods -n eduflow-production

# View pod logs
kubectl logs -f deployment/eduflow-api -n eduflow-production

# Describe pod for events
kubectl describe pod <pod-name> -n eduflow-production
```

**2. Database Connection Issues**
```bash
# Test database connectivity
kubectl exec -it deployment/eduflow-api -n eduflow-production -- psql $DATABASE_URL -c "SELECT 1"

# Check database secrets
kubectl get secret database-secret -n eduflow-production -o yaml
```

**3. Performance Issues**
```bash
# Check resource usage
kubectl top pods -n eduflow-production
kubectl top nodes

# View HPA status
kubectl get hpa -n eduflow-production
```

**4. SSL Certificate Issues**
```bash
# Check certificate status
kubectl get certificate -n eduflow-production
kubectl describe certificate eduflow-tls -n eduflow-production

# Force certificate renewal
kubectl delete certificate eduflow-tls -n eduflow-production
```

### Health Check Endpoints

```typescript
// Health check implementation
@Controller('health')
export class HealthController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  async readiness() {
    const checks = await Promise.allSettled([
      this.databaseService.ping(),
      this.redisService.ping(),
    ]);

    const isReady = checks.every(check => check.status === 'fulfilled');

    return {
      status: isReady ? 'ready' : 'not ready',
      checks: {
        database: checks[0].status === 'fulfilled' ? 'ok' : 'error',
        redis: checks[1].status === 'fulfilled' ? 'ok' : 'error',
      },
    };
  }
}
```

## Maintenance

### Rolling Updates

```bash
# Update API deployment
kubectl set image deployment/eduflow-api api=eduflow/api:v1.3.0 -n eduflow-production

# Monitor rollout
kubectl rollout status deployment/eduflow-api -n eduflow-production

# Rollback if needed
kubectl rollout undo deployment/eduflow-api -n eduflow-production
```

### Database Migrations

```bash
# Run migrations in production
kubectl exec -it deployment/eduflow-api -n eduflow-production -- npm run db:migrate:prod

# Rollback migration if needed
kubectl exec -it deployment/eduflow-api -n eduflow-production -- npm run db:migrate:rollback
```

### Scaling Operations

```bash
# Manual scaling
kubectl scale deployment eduflow-api --replicas=10 -n eduflow-production

# Update HPA limits
kubectl patch hpa eduflow-api-hpa -n eduflow-production -p '{"spec":{"maxReplicas":25}}'
```

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Next Review**: March 2024