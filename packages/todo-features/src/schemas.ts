import { z } from "zod";

// --- Todo Schemas ---
export const TodoSchema = z.object({
  id: z.string(),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional().default(""),
  status: z.enum(["pending", "completed"], {
    invalid_type_error: "Please select a status.",
  }),
});

export const CreateTodoSchema = TodoSchema.omit({ id: true, status: true });
export const UpdateTodoSchema = TodoSchema.omit({ id: true });

// --- Register Schema ---
export const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});
