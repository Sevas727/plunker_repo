import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { rateLimitApi, getClientIp } from '@/app/lib/rate-limit';

export interface GraphQLContext {
  userId: string | null;
  role: string | null;
}

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(server, {
  context: async () => {
    const session = await auth();
    return {
      userId: session?.user?.id ?? null,
      role: session?.user?.role ?? null,
    };
  },
});

async function checkRateLimit() {
  const ip = await getClientIp();
  if (!rateLimitApi(ip).success) {
    return NextResponse.json({ errors: [{ message: 'Too many requests.' }] }, { status: 429 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const limited = await checkRateLimit();
  if (limited) return limited;
  return handler(request);
}

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit();
  if (limited) return limited;
  return handler(request);
}
