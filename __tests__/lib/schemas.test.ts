import { describe, it, expect } from 'vitest';
import { CreateTodoSchema, UpdateTodoSchema, RegisterSchema } from '@/app/lib/schemas';

describe('CreateTodoSchema', () => {
  it('accepts valid input with title only', () => {
    const result = CreateTodoSchema.safeParse({ title: 'Buy milk' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Buy milk');
      expect(result.data.description).toBe('');
    }
  });

  it('accepts valid input with title and description', () => {
    const result = CreateTodoSchema.safeParse({
      title: 'Buy milk',
      description: 'From the store',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('From the store');
    }
  });

  it('rejects empty title', () => {
    const result = CreateTodoSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const titleErrors = result.error.flatten().fieldErrors.title;
      expect(titleErrors).toContain('Title is required.');
    }
  });

  it('rejects missing title', () => {
    const result = CreateTodoSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('UpdateTodoSchema', () => {
  it('accepts valid complete input', () => {
    const result = UpdateTodoSchema.safeParse({
      title: 'Buy milk',
      description: 'From store',
      status: 'pending',
    });
    expect(result.success).toBe(true);
  });

  it('accepts completed status', () => {
    const result = UpdateTodoSchema.safeParse({
      title: 'Done task',
      status: 'completed',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status value', () => {
    const result = UpdateTodoSchema.safeParse({
      title: 'Test',
      status: 'invalid',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const statusErrors = result.error.flatten().fieldErrors.status;
      expect(statusErrors!.length).toBeGreaterThan(0);
    }
  });

  it('rejects missing status', () => {
    const result = UpdateTodoSchema.safeParse({ title: 'Test' });
    expect(result.success).toBe(false);
  });
});

describe('RegisterSchema', () => {
  it('accepts valid registration data', () => {
    const result = RegisterSchema.safeParse({
      name: 'John',
      email: 'john@test.com',
      password: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('rejects name shorter than 2 characters', () => {
    const result = RegisterSchema.safeParse({
      name: 'J',
      email: 'j@t.com',
      password: '123456',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toContain(
        'Name must be at least 2 characters.',
      );
    }
  });

  it('rejects invalid email', () => {
    const result = RegisterSchema.safeParse({
      name: 'John',
      email: 'not-email',
      password: '123456',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toContain('Please enter a valid email.');
    }
  });

  it('rejects password shorter than 6 characters', () => {
    const result = RegisterSchema.safeParse({
      name: 'John',
      email: 'j@t.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toContain(
        'Password must be at least 6 characters.',
      );
    }
  });

  it('rejects completely empty input', () => {
    const result = RegisterSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.name).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    }
  });
});
