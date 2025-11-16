import { z } from 'zod';

// Base validation result types
export interface ValidationSuccess {
  success: true;
  data: any;
}

export interface ValidationError {
  success: false;
  errors: ValidationErrorDetail[];
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
}

export type ValidationResult<T = any> = ValidationSuccess | ValidationError;

// Base validation context interface
export interface BaseValidationContext {
  currentTime: number;
}

// Command types for validation
export enum CommandType {
  CreatePoll = 'createPoll',
  Vote = 'vote',
  AggregateVote = 'aggregateVote'
}

// Validation schema registry type
export type ValidationSchemaRegistry<T> = {
  [K in CommandType]: z.ZodSchema<T>;
};

// Business logic validator function type
export type BusinessLogicValidator<TRequest, TContext> = (
  request: TRequest,
  context: TContext
) => ValidationResult;

// Utility function to convert Zod errors to our format
export const formatZodErrors = (error: z.ZodError): ValidationErrorDetail[] => {
  return error.issues.map((err: z.ZodIssue) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));
};

// Utility function to validate with Zod schema
export const validateWithSchema = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  }
  
  return {
    success: false,
    errors: formatZodErrors(result.error)
  };
};

// Utility function to combine validation results
export const combineValidationResults = (
  ...results: ValidationResult[]
): ValidationResult => {
  const errors: ValidationErrorDetail[] = [];
  
  for (const result of results) {
    if (!result.success) {
      errors.push(...result.errors);
    }
  }
  
  return errors.length === 0
    ? { success: true, data: null }
    : { success: false, errors };
};