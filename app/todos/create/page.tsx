import Breadcrumbs from '@/app/ui/todos/breadcrumbs';
import CreateTodoForm from '@/app/ui/todos/create-form';

export default function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Todos', href: '/todos' },
          { label: 'Create Todo', href: '/todos/create', active: true },
        ]}
      />
      <CreateTodoForm />
    </main>
  );
}
