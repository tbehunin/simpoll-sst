import { AppError } from './base.error';

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;

  constructor(resource: string, identifier?: string) {
    super(
      identifier
        ? `${resource} not found: ${identifier}`
        : `${resource} not found`
    );
  }
}
