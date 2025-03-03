import { awsLambdaRequestHandler } from './server';
import { schema } from './schema';

// export const main = Util.handler(async (event, context) => {
//   const foo = { hello: 'world', event,  context };
//   return JSON.stringify(foo);
// });

export const main = awsLambdaRequestHandler({
  schema,
  context: async ({ event, context }) => {
    return {
      currentUserId: 'user1', // TODO: wire up from auth
    };
  },
});
