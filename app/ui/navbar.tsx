import Link from 'next/link';
import { auth, signOut } from '@/auth';
import AppLogo from '@/app/ui/app-logo';
import NavbarMobile from '@/app/ui/navbar-mobile';

export default async function Navbar() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/5 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <AppLogo />
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm text-white/70 transition-colors hover:text-white">
              Home
            </Link>
            <Link
              href="/contacts"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Contacts
            </Link>
            {isLoggedIn && (
              <Link
                href="/todos"
                className="text-sm text-white/70 transition-colors hover:text-white"
              >
                Todos
              </Link>
            )}
          </div>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-white/70">
                {session.user.name}{' '}
                <span className="rounded bg-white/10 px-2 py-0.5 text-xs">{session.user.role}</span>
              </span>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <button
                  type="submit"
                  className="rounded-md bg-white/10 px-3 py-1.5 text-sm transition-colors hover:bg-white/20"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md bg-white/10 px-3 py-1.5 text-sm transition-colors hover:bg-white/20"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-white/90 px-3 py-1.5 text-sm text-black transition-colors hover:bg-white"
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
