'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { User } from '@/app/lib/definitions';

export default function UserFilter({ users }: { users: Pick<User, 'id' | 'name' | 'email'>[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleChange(userId: string) {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (userId) {
      params.set('userId', userId);
    } else {
      params.delete('userId');
    }
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      className="rounded-md border border-gray-200 py-2 pl-3 pr-8 text-sm outline-2"
      defaultValue={searchParams.get('userId') ?? ''}
      onChange={(e) => handleChange(e.target.value)}
    >
      <option value="">All users</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name}
        </option>
      ))}
    </select>
  );
}
