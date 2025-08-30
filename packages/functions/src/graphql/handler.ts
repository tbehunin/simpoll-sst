import { awsLambdaRequestHandler } from './server';
import { schema } from './schema';
import { context } from './context';

// export const main = Util.handler(async (event, context) => {
//   const foo = { hello: 'world', event,  context };
//   return JSON.stringify(foo);
// });

export const main = awsLambdaRequestHandler({
  schema,
  context,
});
