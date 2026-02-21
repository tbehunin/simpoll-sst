import { GraphQLError } from 'graphql';
import { AppError, ValidationError } from '@simpoll-sst/core/errors';

const IS_SANDBOX = process.env.IS_LOCAL === 'true';
const STAGE = process.env.SST_STAGE ?? 'production';
const IS_PRODUCTION = STAGE === 'production';
const IS_INTERNAL = IS_SANDBOX || STAGE === 'dev' || STAGE === 'staging';

/**
 * Custom maskError function for graphql-yoga.
 * Converts AppError instances to structured GraphQL errors with extensions.
 * Masks unexpected errors in production only.
 *
 * NOTE: yoga may pass a GraphQLError wrapping the original thrown error
 * (the original is in error.originalError). We must unwrap it first so that
 * AppError instanceof checks work correctly.
 */
export function maskError(
  error: unknown,
  message: string,
): GraphQLError {
  // Unwrap GraphQLError wrappers — yoga sometimes passes the GraphQL execution
  // wrapper rather than the original thrown error.
  const unwrapped = error instanceof GraphQLError
    ? (error.originalError ?? error)
    : error;

  // Structured application errors → always pass through with extensions
  if (unwrapped instanceof AppError) {
    if (!IS_PRODUCTION) {
      console.warn(`[AppError] ${unwrapped.code}: ${unwrapped.message}`, {
        ...(unwrapped instanceof ValidationError && { details: unwrapped.details }),
      });
    }
    return new GraphQLError(unwrapped.message, {
      extensions: {
        code: unwrapped.code,
        statusCode: unwrapped.statusCode,
        ...(unwrapped instanceof ValidationError &&
          unwrapped.details.length > 0 && {
            details: unwrapped.details,
          }),
      },
    });
  }

  // GraphQLErrors with no original error (e.g. schema validation, syntax errors) → pass through
  if (unwrapped instanceof GraphQLError) {
    return unwrapped;
  }

  // Unexpected errors → always log
  console.error('Unhandled error:', unwrapped);

  // Return real message in internal environments, mask in production
  if (IS_INTERNAL) {
    return new GraphQLError(
      unwrapped instanceof Error ? unwrapped.message : String(unwrapped),
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
