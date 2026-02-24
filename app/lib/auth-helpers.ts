import { auth } from '@/auth';
import { fetchTodoOwnerId } from './data';

export async function getSessionOrThrow() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function checkOwnershipOrAdmin(
  todoId: string,
  sessionUserId: string,
  sessionRole: string,
) {
  if (sessionRole === 'admin') return;
  const ownerId = await fetchTodoOwnerId(todoId);
  if (ownerId !== sessionUserId) {
    throw new Error('Forbidden: You can only modify your own todos.');
  }
}
