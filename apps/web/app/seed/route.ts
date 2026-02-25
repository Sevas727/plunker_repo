import bcrypt from 'bcrypt';
import sql from '../lib/db';
import { users, todos } from '../lib/placeholder-data';

async function seedUsers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`DROP TABLE IF EXISTS todos`;
  await sql`DROP TABLE IF EXISTS invoices`;
  await sql`DROP TABLE IF EXISTS customers`;
  await sql`DROP TABLE IF EXISTS revenue`;
  await sql`DROP TABLE IF EXISTS users`;

  await sql`
    CREATE TABLE users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, name, email, password, role)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword}, ${user.role})
        ON CONFLICT (id) DO NOTHING
      `;
    }),
  );

  return insertedUsers;
}

async function seedTodos() {
  await sql`
    CREATE TABLE IF NOT EXISTS todos (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC)`;

  const insertedTodos = await Promise.all(
    todos.map(
      (todo) => sql`
        INSERT INTO todos (title, description, status, user_id)
        VALUES (${todo.title}, ${todo.description}, ${todo.status}, ${todo.user_id})
        ON CONFLICT (id) DO NOTHING
      `,
    ),
  );

  return insertedTodos;
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Seed is disabled in production' }, { status: 403 });
  }

  try {
    await seedUsers();
    await seedTodos();

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
