import { AppError } from './base.error';

export class UnauthorizedError extends AppError {
  readonly code = 'UNAUTHORIZED';
  readonly statusCode = 401;

  constructor(message: string = 'Authentication required') {
    super(message);
  }
}
