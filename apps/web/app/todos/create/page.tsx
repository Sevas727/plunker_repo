import { Breadcrumbs, CreateTodoForm } from '@repo/todo-features';

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
