import sql from '@/app/lib/db';
import {
  fetchFilteredTodos,
  fetchTodosPages,
  fetchTodoById,
  fetchTodoOwnerId,
  fetchCardData,
  fetchAllUsers,
} from '@/app/lib/data';
import { CreateTodoSchema, UpdateTodoSchema } from '@/app/lib/schemas';
import { GraphQLError } from 'graphql';
import type { GraphQLContext } from './route';

type Context = GraphQLContext;

function requireAuth(ctx: Context) {
  if (!ctx.userId) {
    throw new GraphQLError('Authentication required.', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
}

function requireAdmin(ctx: Context) {
  requireAuth(ctx);
  if (ctx.role !== 'admin') {
    throw new GraphQLError('Admin access required.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}

async function requireOwnershipOrAdmin(todoId: string, ctx: Context) {
  requireAuth(ctx);
  if (ctx.role === 'admin') return;
  const ownerId = await fetchTodoOwnerId(todoId);
  if (ownerId !== ctx.userId) {
    throw new GraphQLError('You can only modify your own todos.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}

export const resolvers = {
  Query: {
    todos: async (
      _: unknown,
      args: { query?: string; page?: number; userId?: string },
      ctx: Context,
    ) => {
      requireAuth(ctx);
      const query = args.query ?? '';
      const page = Math.max(1, args.page ?? 1);
      const isAdmin = ctx.role === 'admin';
      const filterUserId = isAdmin ? args.userId : undefined;

      const [data, totalPages] = await Promise.all([
        fetchFilteredTodos(query, page, ctx.userId!, isAdmin, filterUserId),
        fetchTodosPages(query, ctx.userId!, isAdmin, filterUserId),
      ]);

      return { data, page, totalPages };
    },

    todo: async (_: unknown, args: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      const todo = await fetchTodoById(args.id);
      if (!todo) return null;

      if (ctx.role !== 'admin') {
        const ownerId = await fetchTodoOwnerId(args.id);
        if (ownerId !== ctx.userId) {
          throw new GraphQLError('You can only view your own todos.', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      }

      return todo;
    },

    stats: async (_: unknown, __: unknown, ctx: Context) => {
      requireAuth(ctx);
      return fetchCardData(ctx.userId!, ctx.role === 'admin');
    },

    users: async (_: unknown, __: unknown, ctx: Context) => {
      requireAdmin(ctx);
      return fetchAllUsers();
    },
  },

  Mutation: {
    createTodo: async (_: unknown, args: { title: string; description?: string }, ctx: Context) => {
      requireAuth(ctx);

      const validated = CreateTodoSchema.safeParse(args);
      if (!validated.success) {
        throw new GraphQLError('Invalid input.', {
          extensions: {
            code: 'BAD_USER_INPUT',
            details: validated.error.flatten().fieldErrors,
          },
        });
      }

      const { title, description } = validated.data;
      const result = await sql`
        INSERT INTO todos (title, description, user_id)
        VALUES (${title}, ${description ?? ''}, ${ctx.userId!})
        RETURNING id, title, description, status, created_at, updated_at, user_id
      `;

      return result[0];
    },

    updateTodo: async (
      _: unknown,
      args: { id: string; title: string; description?: string; status: string },
      ctx: Context,
    ) => {
      await requireOwnershipOrAdmin(args.id, ctx);

      const validated = UpdateTodoSchema.safeParse(args);
      if (!validated.success) {
        throw new GraphQLError('Invalid input.', {
          extensions: {
            code: 'BAD_USER_INPUT',
            details: validated.error.flatten().fieldErrors,
          },
        });
      }

      const { title, description, status } = validated.data;
      const result = await sql`
        UPDATE todos
        SET title = ${title}, description = ${description ?? ''}, status = ${status}, updated_at = NOW()
        WHERE id = ${args.id}
        RETURNING id, title, description, status, created_at, updated_at, user_id
      `;

      if (result.length === 0) {
        throw new GraphQLError('Todo not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return result[0];
    },

    deleteTodo: async (_: unknown, args: { id: string }, ctx: Context) => {
      await requireOwnershipOrAdmin(args.id, ctx);

      const result = await sql`DELETE FROM todos WHERE id = ${args.id} RETURNING id`;
      if (result.length === 0) {
        throw new GraphQLError('Todo not found.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return args.id;
    },
  },
};
