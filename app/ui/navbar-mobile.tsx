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
    <div className="flex items-center gap-2 md:hidden">
      <button onClick={() => setOpen(!open)} className="p-1">
        {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-t border-white/10 bg-black/80 px-4 pb-4 pt-2 backdrop-blur-xl">
          <Link
            href="/"
            className="block py-2 text-sm text-white/70 hover:text-white"
            onClick={() => setOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/contacts"
            className="block py-2 text-sm text-white/70 hover:text-white"
            onClick={() => setOpen(false)}
          >
            Contacts
          </Link>
          {isLoggedIn && (
            <Link
              href="/todos"
              className="block py-2 text-sm text-white/70 hover:text-white"
              onClick={() => setOpen(false)}
            >
              Todos
            </Link>
          )}
          <div className="mt-2 border-t border-white/10 pt-2">
            {isLoggedIn ? (
              <>
                <p className="py-2 text-sm text-white/70">
                  {session?.user?.name}{' '}
                  <span className="rounded bg-white/10 px-2 py-0.5 text-xs">
                    {session?.user?.role}
                  </span>
                </p>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="w-full rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 rounded-md bg-white/10 px-3 py-1.5 text-center text-sm hover:bg-white/20"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex-1 rounded-md bg-white/90 px-3 py-1.5 text-center text-sm text-black hover:bg-white"
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
