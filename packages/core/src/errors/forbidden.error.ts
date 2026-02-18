import { AppError } from './base.error';

export class ForbiddenError extends AppError {
  readonly code = 'FORBIDDEN';
  readonly statusCode = 403;

  constructor(message: string = 'Permission denied') {
    super(message);
  }
}
