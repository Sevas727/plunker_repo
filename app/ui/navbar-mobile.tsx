'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Session } from 'next-auth';

export default function NavbarMobile({
  isLoggedIn,
  session,
}: {
  isLoggedIn: boolean;
  session: Session | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(!open)} className="p-1">
        {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-t border-blue-500 bg-blue-600 px-4 pb-4 pt-2">
          <Link
            href="/"
            className="block py-2 text-sm hover:text-blue-200"
            onClick={() => setOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/contacts"
            className="block py-2 text-sm hover:text-blue-200"
            onClick={() => setOpen(false)}
          >
            Contacts
          </Link>
          {isLoggedIn && (
            <Link
              href="/todos"
              className="block py-2 text-sm hover:text-blue-200"
              onClick={() => setOpen(false)}
            >
              Todos
            </Link>
          )}
          <div className="mt-2 border-t border-blue-500 pt-2">
            {isLoggedIn ? (
              <>
                <p className="py-2 text-sm">
                  {session?.user?.name}{' '}
                  <span className="rounded bg-blue-500 px-2 py-0.5 text-xs">
                    {session?.user?.role}
                  </span>
                </p>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="w-full rounded-md bg-blue-500 px-3 py-1.5 text-sm hover:bg-blue-400"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 rounded-md bg-blue-500 px-3 py-1.5 text-center text-sm hover:bg-blue-400"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex-1 rounded-md bg-white px-3 py-1.5 text-center text-sm text-blue-600 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
