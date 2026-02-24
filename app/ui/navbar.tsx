import Link from 'next/link';
import { auth, signOut } from '@/auth';
import AppLogo from '@/app/ui/app-logo';
import NavbarMobile from '@/app/ui/navbar-mobile';

export default async function Navbar() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <nav className="bg-blue-600 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <AppLogo />
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm hover:text-blue-200">
              Home
            </Link>
            <Link href="/contacts" className="text-sm hover:text-blue-200">
              Contacts
            </Link>
            {isLoggedIn && (
              <Link href="/todos" className="text-sm hover:text-blue-200">
                Todos
              </Link>
            )}
          </div>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {isLoggedIn ? (
            <>
              <span className="text-sm">
                {session.user.name}{' '}
                <span className="rounded bg-blue-500 px-2 py-0.5 text-xs">{session.user.role}</span>
              </span>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <button
                  type="submit"
                  className="rounded-md bg-blue-500 px-3 py-1.5 text-sm hover:bg-blue-400"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md bg-blue-500 px-3 py-1.5 text-sm hover:bg-blue-400"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-white px-3 py-1.5 text-sm text-blue-600 hover:bg-gray-100"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <NavbarMobile isLoggedIn={isLoggedIn} session={session} />
      </div>
    </nav>
  );
}
