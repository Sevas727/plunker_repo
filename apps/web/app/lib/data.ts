import sql from './db';
import { TodoForm, TodosTable, User } from './definitions';
import { logger } from './logger';

const ITEMS_PER_PAGE = 6;

export async function fetchCardData(userId: string, isAdmin: boolean) {
  try {
    const userFilter = isAdmin ? sql`` : sql`WHERE user_id = ${userId}`;

    const totalPromise = sql`SELECT COUNT(*) FROM todos ${userFilter}`;
    const pendingPromise = sql`SELECT COUNT(*) FROM todos ${userFilter} ${isAdmin ? sql`` : sql`AND`} ${isAdmin ? sql`WHERE` : sql``} status = 'pending'`;
    const completedPromise = sql`SELECT COUNT(*) FROM todos ${userFilter} ${isAdmin ? sql`` : sql`AND`} ${isAdmin ? sql`WHERE` : sql``} status = 'completed'`;

    const data = await Promise.all([totalPromise, pendingPromise, completedPromise]);

    const totalTodos = Number(data[0][0].count ?? '0');
    const pendingTodos = Number(data[1][0].count ?? '0');
    const completedTodos = Number(data[2][0].count ?? '0');

    return { totalTodos, pendingTodos, completedTodos };
  } catch (error) {
    logger.error({ err: error }, 'Database Error');
    throw new Error('Failed to fetch card data.');
  }
}

export async function fetchRecentTodos(userId: string, isAdmin: boolean) {
  try {
    const data = isAdmin
      ? await sql<TodosTable[]>`
          SELECT todos.*, users.name AS user_name, users.email AS user_email
          FROM todos
          JOIN users ON todos.user_id = users.id
          ORDER BY todos.created_at DESC
          LIMIT 5
        `
      : await sql<TodosTable[]>`
          SELECT todos.*, users.name AS user_name, users.email AS user_email
          FROM todos
          JOIN users ON todos.user_id = users.id
          WHERE todos.user_id = ${userId}
          ORDER BY todos.created_at DESC
          LIMIT 5
        `;

    return data;
  } catch (error) {
    logger.error({ err: error }, 'Database Error');
    throw new Error('Failed to fetch recent todos.');
  }
}

export async function fetchFilteredTodos(
  query: string,
  currentPage: number,
  userId: string,
  isAdmin: boolean,
  filterUserId?: string,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const effectiveUserId = isAdmin ? filterUserId : userId;

    const todos = effectiveUserId
      ? await sql<TodosTable[]>`
          SELECT todos.*, users.name AS user_name, users.email AS user_email
          FROM todos
          JOIN users ON todos.user_id = users.id
          WHERE
            todos.user_id = ${effectiveUserId} AND (
              todos.title ILIKE ${`%${query}%`} OR
              todos.description ILIKE ${`%${query}%`} OR
              todos.status ILIKE ${`%${query}%`}
            )
          ORDER BY todos.created_at DESC
          LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
        `
      : await sql<TodosTable[]>`
          SELECT todos.*, users.name AS user_name, users.email AS user_email
          FROM todos
          JOIN users ON todos.user_id = users.id
          WHERE
            todos.title ILIKE ${`%${query}%`} OR
            todos.description ILIKE ${`%${query}%`} OR
            todos.status ILIKE ${`%${query}%`}
          ORDER BY todos.created_at DESC
          LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
        `;

    return todos;
  } catch (error) {
    logger.error({ err: error }, 'Database Error');
    throw new Error('Failed to fetch todos.');
  }
}

export async function fetchTodosPages(
  query: string,
  userId: string,
  isAdmin: boolean,
  filterUserId?: string,
) {
  try {
    const effectiveUserId = isAdmin ? filterUserId : userId;

    const data = effectiveUserId
      ? await sql`
          SELECT COUNT(*)
          FROM todos
          WHERE
            user_id = ${effectiveUserId} AND (
              title ILIKE ${`%${query}%`} OR
              description ILIKE ${`%${query}%`} OR
              status ILIKE ${`%${query}%`}
            )
        `
      : await sql`
          SELECT COUNT(*)
          FROM todos
          WHERE
            title ILIKE ${`%${query}%`} OR
            description ILIKE ${`%${query}%`} OR
            status ILIKE ${`%${query}%`}
        `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    logger.error({ err: error }, 'Database Error');
    throw new Error('Failed to fetch total number of todos.');
  }
}

export async function fetchTodoById(id: string) {
  try {
    const data = await sql<TodoForm[]>`
      SELECT id, title, description, status
      FROM todos
      WHERE id = ${id}
    `;

    return data[0];
  } catch (error) {
    logger.error({ err: error }, 'Database Error');
    throw new Error('Failed to fetch todo.');
  }
}

export async function fetchTodoOwnerId(id: string): Promise<string | null> {
  try {
    const data = await sql<{ user_id: string }[]>`
      SELECT user_id FROM todos WHERE id = ${id}
    `;
    return data[0]?.user_id ?? null;
  } catch (error) {
    logger.error({ err: error }, 'Database Error');
    throw new Error('Failed to fetch todo owner.');
  }
}

export async function fetchAllUsers() {
  try {
    const data = await sql<Pick<User, 'id' | 'name' | 'email'>[]>`
      SELECT id, name, email FROM users ORDER BY name ASC
    `;
    return data;
  } catch (error) {
    logger.error({ err: error }, 'Database Error');
    throw new Error('Failed to fetch users.');
  }
}
