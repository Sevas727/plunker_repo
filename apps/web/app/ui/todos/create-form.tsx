'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { createTodo, TodoState } from '@/app/lib/actions';

export default function CreateTodoForm() {
  const initialState: TodoState = { message: '', errors: {} };
  const [state, formAction] = useActionState(createTodo, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-white/[0.03] p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="title" className="mb-2 block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Enter todo title"
            className="peer block w-full rounded-md border border-white/10 bg-white/5 py-2 pl-3 text-sm text-white/90 outline-2 placeholder:text-white/30"
            required
          />
          {state.errors?.title && (
            <p className="mt-2 text-sm text-red-500">{state.errors.title[0]}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="mb-2 block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Enter description (optional)"
            rows={3}
            className="peer block w-full rounded-md border border-white/10 bg-white/5 py-2 pl-3 text-sm text-white/90 outline-2 placeholder:text-white/30"
          />
          {state.errors?.description && (
            <p className="mt-2 text-sm text-red-500">{state.errors.description[0]}</p>
          )}
        </div>

        {state.message && <p className="mt-2 text-sm text-red-500">{state.message}</p>}
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/todos"
          className="flex h-10 items-center rounded-lg bg-white/10 px-4 text-sm font-medium text-white/60 transition-colors hover:bg-white/20"
        >
          Cancel
        </Link>
        <Button type="submit">Create Todo</Button>
      </div>
    </form>
  );
}
