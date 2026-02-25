# AWS Architecture — Todo Dashboard

## Diagram

```
                    ┌─────────────────────────────────────────────┐
                    │                  Internet                   │
                    └──────────────┬──────────────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────────────┐
                    │           CloudFront (CDN)                  │
                    │  /_next/static/* → S3                       │
                    │  /* (dynamic)   → ALB                       │
                    └──────┬───────────────────┬──────────────────┘
                           │                   │
              ┌────────────▼────────┐   ┌──────▼──────────────┐
              │  S3 Bucket          │   │  VPC 10.0.0.0/16    │
              │  (static assets)    │   │                     │
              └─────────────────────┘   │  ┌───────────────┐  │
                                        │  │ Public Subnets │  │
                                        │  │               │  │
                                        │  │  ┌─────────┐  │  │
                                        │  │  │   ALB   │  │  │
                                        │  │  └────┬────┘  │  │
                                        │  └───────┼───────┘  │
                                        │          │          │
                                        │  ┌───────▼───────┐  │
                                        │  │Private Subnets│  │
                                        │  │               │  │
                                        │  │ ┌───────────┐ │  │
                                        │  │ │ECS Fargate│ │  │
                                        │  │ │ (Next.js) │ │  │
                                        │  │ └─────┬─────┘ │  │
                                        │  │       │       │  │
                                        │  │  ┌────▼────┐  │  │
                                        │  │  │   NAT   │  │  │
                                        │  │  └────┬────┘  │  │
                                        │  └───────┼───────┘  │
                                        └──────────┼──────────┘
                                                   │
                                    ┌──────────────▼────────────┐
                                    │    External Services      │
                                    │  ┌──────────────────────┐ │
                                    │  │  Neon PostgreSQL      │ │
                                    │  │  (managed, external)  │ │
                                    │  └──────────────────────┘ │
                                    │  ┌──────────────────────┐ │
                                    │  │  GitHub OAuth         │ │
                                    │  └──────────────────────┘ │
                                    └───────────────────────────┘

  ┌──────────────────┐    ┌──────────────────┐
  │  ECR             │    │  Secrets Manager  │
  │  (Docker images) │    │  DATABASE_URL     │
  │                  │    │  AUTH_SECRET       │
  └──────────────────┘    │  AUTH_GITHUB_*    │
                          └──────────────────┘
  ┌──────────────────┐
  │  CloudWatch Logs │
  │  (app logs)      │
  └──────────────────┘
```

## Components

| Service             | Purpose                                                 | Tier             |
| ------------------- | ------------------------------------------------------- | ---------------- |
| **CloudFront**      | CDN, SSL termination, routes static → S3, dynamic → ALB | Pay-per-request  |
| **S3**              | Static assets (`_next/static/`, images)                 | ~$0.02/GB        |
| **ALB**             | Load balancer in public subnets, health checks          | ~$16/mo          |
| **ECS Fargate**     | Runs Next.js containers in private subnets              | CPU/memory based |
| **ECR**             | Docker image registry with lifecycle policy             | ~$0.10/GB        |
| **Secrets Manager** | Stores DATABASE_URL, AUTH_SECRET, OAuth keys            | $0.40/secret/mo  |
| **Neon**            | PostgreSQL (external, serverless)                       | Free tier        |
| **CloudWatch**      | Container logs, 7d retention (dev) / 30d (prod)         | Pay-per-GB       |

## Network

- **VPC**: `10.0.0.0/16`
- **Public subnets**: `10.0.0.0/24`, `10.0.1.0/24` (ALB)
- **Private subnets**: `10.0.10.0/24`, `10.0.11.0/24` (ECS)
- **NAT Gateway**: allows ECS tasks to reach Neon and external APIs
- **Security Groups**: ALB accepts 80/443 from internet; ECS accepts port 3000 from ALB only

## Auto Scaling

- CPU target tracking at 70%
- Dev: 1–2 tasks
- Prod: 2–4 tasks
