import { Breadcrumbs, EditTodoForm } from '@repo/todo-features';
import { fetchTodoById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const todo = await fetchTodoById(id);

  if (!todo) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Todos', href: '/todos' },
          { label: 'Edit Todo', href: `/todos/${id}/edit`, active: true },
        ]}
      />
      <EditTodoForm todo={todo} />
    </main>
  );
}
