import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import mercurius, { IResolvers }  from 'mercurius';
import schema from './schema.graphql';
import { User } from './schema-types';

// const buildContext = async (req: FastifyRequest, _reply: FastifyReply) => {
//   return {
//     authorization: req.headers.authorization,
//   }
// };

// type PromiseType<T> = T extends PromiseLike<infer U> ? U : T;

// declare module 'mercurius' {
//   interface MercuriusContext extends PromiseType<ReturnType<typeof buildContext>> {}
// };

export const init = () => {
  const app = fastify();

  const resolvers: IResolvers = {
    Query: {
      add: async (_, { x, y }, context, info) => x + y,
      sub: async (_, { x, y }, context, info) => x - y,
      user: async (_, args, context, info): Promise<User> => ({
        fullName: 'todd',
        bio: 'nerd',
        userId: '1234',
        username: 'tdawg',
      }),
    },
  };

  app.register(mercurius, {
    schema,
    resolvers,
    // context: buildContext,
  });

  return app;
};

// Wants:
// 1. schema type generation - DONE
// 2. watcher on schema changes
// 3. merge all *.graphql files into "combined-schema.ts" file
// 4. prevent starting sst dev session on tsc failures - DONE
// 5. auto generate and tsc on sst dev - DONE