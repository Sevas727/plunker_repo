-- Seed script for Docker PostgreSQL
-- Runs automatically on first container start via docker-entrypoint-initdb.d
-- Password "123456" pre-hashed with bcrypt (10 rounds)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (id, name, email, password, role) VALUES
  ('410544b2-4001-4271-9855-fec4b6a6442a', 'Admin', 'admin@fedotov.dev', '$2b$10$/ra9VT6xzEQWRBfI4J3kou0g7Of1Wy3vNjYyDZoKSGj0ct3GOuthq', 'admin'),
  ('510544b2-4001-4271-9855-fec4b6a6442b', 'Demo User', 'user@fedotov.dev', '$2b$10$/ra9VT6xzEQWRBfI4J3kou0g7Of1Wy3vNjYyDZoKSGj0ct3GOuthq', 'user');

-- ── Todos ────────────────────────────────────────────────────
CREATE TABLE todos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_created_at ON todos(created_at DESC);

INSERT INTO todos (title, description, status, user_id) VALUES
  ('Set up CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment', 'completed', '410544b2-4001-4271-9855-fec4b6a6442a'),
  ('Write unit tests for utils', 'Cover formatDate, generatePagination and other utility functions with Vitest', 'pending', '410544b2-4001-4271-9855-fec4b6a6442a'),
  ('Deploy to AWS', 'Set up ECS Fargate deployment with RDS PostgreSQL', 'pending', '510544b2-4001-4271-9855-fec4b6a6442b'),
  ('Add Docker support', 'Create multi-stage Dockerfile and docker-compose for local development', 'completed', '410544b2-4001-4271-9855-fec4b6a6442a'),
  ('Implement dark mode', 'Add dark theme support using Tailwind dark: variant', 'pending', '510544b2-4001-4271-9855-fec4b6a6442b'),
  ('Set up monitoring', 'Integrate OpenTelemetry with Jaeger for distributed tracing', 'pending', '410544b2-4001-4271-9855-fec4b6a6442a'),
  ('Configure Kubernetes', 'Write K8s manifests: Deployment, Service, Ingress, HPA', 'pending', '510544b2-4001-4271-9855-fec4b6a6442b'),
  ('Build REST API', 'Create versioned REST endpoints for todos with proper HTTP status codes', 'completed', '510544b2-4001-4271-9855-fec4b6a6442b'),
  ('Add GraphQL layer', 'Set up Apollo Server with schema for todos and users', 'pending', '410544b2-4001-4271-9855-fec4b6a6442a'),
  ('Improve accessibility', 'Audit and fix ARIA attributes, keyboard navigation, color contrast', 'pending', '510544b2-4001-4271-9855-fec4b6a6442b');
