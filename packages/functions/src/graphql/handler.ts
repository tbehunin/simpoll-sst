import { awsLambdaRequestHandler } from './server';
import { schema } from './schema';
import { context } from './context';
import { maskError } from './error-handler';

export const main = awsLambdaRequestHandler({
  schema,
  context,
  maskedErrors: {
    maskError,
  },
});
