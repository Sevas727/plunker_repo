import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import Pagination from '@/app/ui/pagination';
import TodosTableComponent from '@/app/ui/todos/table';
import { CreateTodo } from '@/app/ui/todos/buttons';
import UserFilter from '@/app/ui/todos/user-filter';
import CardWrapper from '@/app/ui/dashboard/cards';
import { fetchFilteredTodos, fetchTodosPages, fetchAllUsers, fetchCardData } from '@/app/lib/data';
import { auth } from '@/auth';
import { Suspense } from 'react';

export default async function Page(props: {
  searchParams?: Promise<{ query?: string; page?: string; userId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const filterUserId = searchParams?.userId || undefined;

  const session = await auth();
  const userId = session!.user.id;
  const isAdmin = session!.user.role === 'admin';

  const [cardData, todos, totalPages, allUsers] = await Promise.all([
    fetchCardData(userId, isAdmin),
    fetchFilteredTodos(query, currentPage, userId, isAdmin, filterUserId),
    fetchTodosPages(query, userId, isAdmin, filterUserId),
    isAdmin ? fetchAllUsers() : Promise.resolve([]),
  ]);

  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>Todos</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <CardWrapper
          totalTodos={cardData.totalTodos}
          pendingTodos={cardData.pendingTodos}
          completedTodos={cardData.completedTodos}
        />
      </div>
      <div className="mt-6 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search todos..." />
        {isAdmin && (
          <Suspense>
            <UserFilter users={allUsers} />
          </Suspense>
        )}
        <CreateTodo />
      </div>
      <TodosTableComponent todos={todos} showAuthor={isAdmin} />
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
