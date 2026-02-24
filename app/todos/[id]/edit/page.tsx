import Breadcrumbs from '@/app/ui/todos/breadcrumbs';
import EditTodoForm from '@/app/ui/todos/edit-form';
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
