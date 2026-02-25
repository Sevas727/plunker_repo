'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateTodo, TodoState } from '@/app/lib/actions';
import { TodoForm } from '@/app/lib/definitions';

export default function EditTodoForm({ todo }: { todo: TodoForm }) {
  const initialState: TodoState = { message: '', errors: {} };
  const updateTodoWithId = updateTodo.bind(null, todo.id);
  const [state, formAction] = useActionState(updateTodoWithId, initialState);

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
            defaultValue={todo.title}
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
            defaultValue={todo.description}
            placeholder="Enter description (optional)"
            rows={3}
            className="peer block w-full rounded-md border border-white/10 bg-white/5 py-2 pl-3 text-sm text-white/90 outline-2 placeholder:text-white/30"
          />
          {state.errors?.description && (
            <p className="mt-2 text-sm text-red-500">{state.errors.description[0]}</p>
          )}
        </div>

        <fieldset className="mb-4">
          <legend className="mb-2 block text-sm font-medium">Status</legend>
          <div className="rounded-md border border-white/10 bg-white/5 px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  defaultChecked={todo.status === 'pending'}
                  className="h-4 w-4 cursor-pointer border-white/10 bg-white/5 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/60"
                >
                  Pending
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="completed"
                  name="status"
                  type="radio"
                  value="completed"
                  defaultChecked={todo.status === 'completed'}
                  className="h-4 w-4 cursor-pointer border-white/10 bg-white/5 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="completed"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Completed
                </label>
              </div>
            </div>
          </div>
          {state.errors?.status && (
            <p className="mt-2 text-sm text-red-500">{state.errors.status[0]}</p>
          )}
        </fieldset>

        {state.message && <p className="mt-2 text-sm text-red-500">{state.message}</p>}
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/todos"
          className="flex h-10 items-center rounded-lg bg-white/10 px-4 text-sm font-medium text-white/60 transition-colors hover:bg-white/20"
        >
          Cancel
        </Link>
        <Button type="submit">Update Todo</Button>
      </div>
    </form>
  );
}
