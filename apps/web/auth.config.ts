import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnTodos = nextUrl.pathname.startsWith('/todos');
      const isOnAuth =
        nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');

      if (isOnTodos) {
        if (isLoggedIn) return true;
        return false;
      } else if (isOnAuth && isLoggedIn) {
        return Response.redirect(new URL('/todos', nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
