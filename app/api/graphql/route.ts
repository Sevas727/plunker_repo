import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

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

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
