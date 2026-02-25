import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import { authConfig } from './auth.config';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import sql from '@/app/lib/db';
import { logger } from '@/app/lib/logger';

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch user');
    throw new Error('Failed to fetch user.');
  }
}

async function findOrCreateOAuthUser(
  name: string | null | undefined,
  email: string,
): Promise<User> {
  let user = await getUser(email);
  if (!user) {
    await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${name || 'GitHub User'}, ${email}, '', 'user')
    `;
    user = await getUser(email);
    if (!user) throw new Error('Failed to create OAuth user.');
  }
  return user;
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === 'github') {
          // OAuth sign-in — look up or create user in our DB
          const dbUser = await findOrCreateOAuthUser(user.name, user.email!);
          token.id = dbUser.id;
          token.role = dbUser.role;
        } else {
          // Credentials sign-in — user comes from authorize()
          const u = user as User;
          token.id = u.id;
          token.role = u.role;
        }
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        logger.warn('Invalid credentials attempt');
        return null;
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
});
