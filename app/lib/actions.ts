'use server';
import bcrypt from 'bcrypt';
import sql from './db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { getSessionOrThrow, checkOwnershipOrAdmin } from './auth-helpers';
import { CreateTodoSchema, UpdateTodoSchema, RegisterSchema } from './schemas';

export type TodoState = {
  errors?: {
    title?: string[];
    description?: string[];
    status?: string[];
  };
  message: string;
};

export async function createTodo(prevState: TodoState, formData: FormData) {
  const session = await getSessionOrThrow();

  const validatedFields = CreateTodoSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Todo.',
    };
  }

  const { title, description } = validatedFields.data;

  try {
    await sql`
      INSERT INTO todos (title, description, user_id)
      VALUES (${title}, ${description}, ${session.user.id})
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Create Todo.' };
  }

  revalidatePath('/todos');
  redirect('/todos');
}

export async function updateTodo(id: string, prevState: TodoState, formData: FormData) {
  const session = await getSessionOrThrow();
  await checkOwnershipOrAdmin(id, session.user.id, session.user.role);

  const validatedFields = UpdateTodoSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Todo.',
    };
  }

  const { title, description, status } = validatedFields.data;

  try {
    await sql`
      UPDATE todos
      SET title = ${title}, description = ${description}, status = ${status}, updated_at = NOW()
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Todo.' };
  }

  revalidatePath('/todos');
  redirect('/todos');
}

export async function deleteTodo(id: string) {
  const session = await getSessionOrThrow();
  await checkOwnershipOrAdmin(id, session.user.id, session.user.role);

  await sql`DELETE FROM todos WHERE id = ${id}`;
  revalidatePath('/todos');
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export type RegisterState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message: string;
};

export async function registerUser(prevState: RegisterState, formData: FormData) {
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed.',
    };
  }

  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${name}, ${email}, ${hashedPassword}, 'user')
    `;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('unique')) {
      return { message: 'Email already exists.' };
    }
    return { message: 'Database Error: Failed to register.' };
  }

  try {
    await signIn('credentials', { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: 'Registration successful but auto-login failed. Please log in manually.' };
    }
    throw error;
  }

  redirect('/todos');
}
