import { z } from 'zod';

const envSchema = z.object({
  POSTGRES_URL: z.string().min(1, 'POSTGRES_URL is required'),
  POSTGRES_SSL: z.string().optional(),
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
  AUTH_URL: z.string().optional(),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
