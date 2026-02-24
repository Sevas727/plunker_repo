import { lusitana } from '@/app/ui/fonts';
import { formatDateToLocal } from '@/app/lib/utils';
import TodoStatus from '@/app/ui/todos/status';
import { TodosTable } from '@/app/lib/definitions';

export default function RecentTodos({
  todos,
  showAuthor = false,
}: {
  todos: TodosTable[];
  showAuthor?: boolean;
}) {
  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>Recent Todos</h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {todos.map((todo, i) => (
            <div
              key={todo.id}
              className={`flex flex-row items-center justify-between py-4 ${
                i !== 0 ? 'border-t' : ''
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold md:text-base">{todo.title}</p>
                <p className="text-sm text-gray-500">
                  {showAuthor ? `${todo.user_name} · ` : ''}
                  {formatDateToLocal(todo.created_at)}
                </p>
              </div>
              <TodoStatus status={todo.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
