import fastify from 'fastify';
import mercurius from 'mercurius';

export const init = () => {
  const app = fastify();

  const schema = `
    type Query {
        add(x: Int, y: Int): Int
    }`;

  const resolvers = {
    Query: {
      add: async (_, { x, y }) => x + y
    },
  };

  app.register(mercurius, {
    schema,
    resolvers,
  });

  return app;
}
