import fastify from 'fastify';
import mercurius from 'mercurius';
import { schema } from './schema';

export const init = () => {
  const app = fastify();

  const resolvers = {
    Query: {
      add: async (_, { x, y }) => x + y,
      sub: async (_, { x, y }) => x - y,
      user: async (_, { x, y }): User => ({ fullName: 'todd' }),
    },
  };

  app.register(mercurius, {
    schema,
    resolvers,
  });

  return app;
}
