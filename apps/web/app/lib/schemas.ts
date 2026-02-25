import { z } from 'zod';

// --- Todo Schemas ---
export const TodoSchema = z.object({
  id: z.string(),
  title: z
    .string()
    .min(1, { message: 'Title is required.' })
    .max(255, { message: 'Title must be at most 255 characters.' }),
  description: z
    .string()
    .max(2000, { message: 'Description must be at most 2000 characters.' })
    .optional()
    .default(''),
  status: z.enum(['pending', 'completed'], {
    invalid_type_error: 'Please select a status.',
  }),
});

export const CreateTodoSchema = TodoSchema.omit({ id: true, status: true });
export const UpdateTodoSchema = TodoSchema.omit({ id: true });

// --- Register Schema ---
export const RegisterSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});
