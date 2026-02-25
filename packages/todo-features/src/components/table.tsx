import { formatDateToLocal } from "@/app/lib/utils";
import { UpdateTodo, DeleteTodo } from "./buttons";
import TodoStatus from "./status";
import { TodosTable } from "@/app/lib/definitions";

export default function TodosTableComponent({
  todos,
  showAuthor = false,
}: {
  todos: TodosTable[];
  showAuthor?: boolean;
}) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-white/[0.03] p-2 md:pt-0">
          <div className="md:hidden">
            {todos?.map((todo) => (
              <div
                key={todo.id}
                className="mb-2 w-full rounded-md bg-white/5 p-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm font-medium">{todo.title}</p>
                    {showAuthor && (
                      <p className="text-xs text-white/40">{todo.user_name}</p>
                    )}
                  </div>
                  <TodoStatus status={todo.status} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <p className="text-sm text-white/40">
                    {formatDateToLocal(todo.created_at)}
                  </p>
                  <div className="flex justify-end gap-2">
                    <UpdateTodo id={todo.id} />
                    <DeleteTodo id={todo.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-white/90 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Title
                </th>
                {showAuthor && (
                  <th scope="col" className="px-3 py-5 font-medium">
                    Author
                  </th>
                )}
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Created
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/[0.02]">
              {todos?.map((todo) => (
                <tr
                  key={todo.id}
                  className="w-full border-b border-white/[0.06] py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <p className="font-medium">{todo.title}</p>
                    {todo.description && (
                      <p className="mt-1 truncate text-xs text-white/40">
                        {todo.description}
                      </p>
                    )}
                  </td>
                  {showAuthor && (
                    <td className="whitespace-nowrap px-3 py-3">
                      <p className="text-sm">{todo.user_name}</p>
                      <p className="text-xs text-white/40">{todo.user_email}</p>
                    </td>
                  )}
                  <td className="whitespace-nowrap px-3 py-3">
                    <TodoStatus status={todo.status} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-white/40">
                    {formatDateToLocal(todo.created_at)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateTodo id={todo.id} />
                      <DeleteTodo id={todo.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
