resource "aws_secretsmanager_secret" "database_url" {
  name        = "${var.project_name}/${var.environment}/database-url"
  description = "Neon PostgreSQL connection string"

  tags = { Name = "${var.project_name}-${var.environment}-database-url" }
}

resource "aws_secretsmanager_secret" "auth_secret" {
  name        = "${var.project_name}/${var.environment}/auth-secret"
  description = "NextAuth secret key"

  tags = { Name = "${var.project_name}-${var.environment}-auth-secret" }
}

resource "aws_secretsmanager_secret" "auth_github_id" {
  name        = "${var.project_name}/${var.environment}/auth-github-id"
  description = "GitHub OAuth client ID"

  tags = { Name = "${var.project_name}-${var.environment}-auth-github-id" }
}

resource "aws_secretsmanager_secret" "auth_github_secret" {
  name        = "${var.project_name}/${var.environment}/auth-github-secret"
  description = "GitHub OAuth client secret"

  tags = { Name = "${var.project_name}-${var.environment}-auth-github-secret" }
}
