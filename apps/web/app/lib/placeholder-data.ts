const users = [
  {
    id: '410544b2-4001-4271-9855-fec4b6a6442a',
    name: 'Admin',
    email: 'admin@fedotov.dev',
    password: '123456',
    role: 'admin',
  },
  {
    id: '510544b2-4001-4271-9855-fec4b6a6442b',
    name: 'Demo User',
    email: 'user@fedotov.dev',
    password: '123456',
    role: 'user',
  },
];

const todos = [
  {
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    status: 'completed',
    user_id: users[0].id,
  },
  {
    title: 'Write unit tests for utils',
    description: 'Cover formatDate, generatePagination and other utility functions with Vitest',
    status: 'pending',
    user_id: users[0].id,
  },
  {
    title: 'Deploy to AWS',
    description: 'Set up ECS Fargate deployment with RDS PostgreSQL',
    status: 'pending',
    user_id: users[1].id,
  },
  {
    title: 'Add Docker support',
    description: 'Create multi-stage Dockerfile and docker-compose for local development',
    status: 'completed',
    user_id: users[0].id,
  },
  {
    title: 'Implement dark mode',
    description: 'Add dark theme support using Tailwind dark: variant',
    status: 'pending',
    user_id: users[1].id,
  },
  {
    title: 'Set up monitoring',
    description: 'Integrate OpenTelemetry with Jaeger for distributed tracing',
    status: 'pending',
    user_id: users[0].id,
  },
  {
    title: 'Configure Kubernetes',
    description: 'Write K8s manifests: Deployment, Service, Ingress, HPA',
    status: 'pending',
    user_id: users[1].id,
  },
  {
    title: 'Build REST API',
    description: 'Create versioned REST endpoints for todos with proper HTTP status codes',
    status: 'completed',
    user_id: users[1].id,
  },
  {
    title: 'Add GraphQL layer',
    description: 'Set up Apollo Server with schema for todos and users',
    status: 'pending',
    user_id: users[0].id,
  },
  {
    title: 'Improve accessibility',
    description: 'Audit and fix ARIA attributes, keyboard navigation, color contrast',
    status: 'pending',
    user_id: users[1].id,
  },
];

export { users, todos };
