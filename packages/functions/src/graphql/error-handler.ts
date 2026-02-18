import { GraphQLError } from 'graphql';
import { AppError, ValidationError } from '@simpoll-sst/core/errors';

const IS_SANDBOX = process.env.IS_LOCAL === 'true';

/**
 * Custom maskError function for graphql-yoga.
 * Converts AppError instances to structured GraphQL errors with extensions.
 * Masks unexpected errors in shared stages (dev/staging/production).
 *
 * yoga calls this as maskError(error, message) — two args only.
 * The `error` param is the original thrown error (yoga unwraps GraphQLError for us).
 */
export function maskError(
  error: unknown,
  message: string,
): GraphQLError {
  // Structured application errors → pass through with extensions
  if (error instanceof AppError) {
    return new GraphQLError(error.message, {
      extensions: {
        code: error.code,
        statusCode: error.statusCode,
        ...(error instanceof ValidationError &&
          error.details.length > 0 && {
            details: error.details,
          }),
      },
    });
  }

  // GraphQLErrors (e.g. schema validation) → pass through as-is
  if (error instanceof GraphQLError) {
    return error;
  }

  // Unexpected errors → log and mask in shared stages
  console.error('Unhandled error:', error);

  if (IS_SANDBOX) {
    return new GraphQLError(
      error instanceof Error ? error.message : String(error),
      {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          statusCode: 500,
        },
      },
    );
  }

  return new GraphQLError(message, {
    extensions: {
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    },
  });
}
