type ValidationResult = { isValid: true } | { isValid: false; errors: string[] };
type ContextCreator<T, TContext> = (request: T) => Promise<TContext>;
type ContextValidator<T, TContext> = (request: T, context: TContext) => ValidationResult;
type ContextExecutor<TRequest, TResult, TContext> = (request: TRequest, context: TContext) => Promise<TResult>;
type SimpleValidator<T> = (request: T) => Promise<ValidationResult>;
type SimpleExecutor<TRequest, TResult> = (request: TRequest) => Promise<TResult>;

// Optimized command builder - single data fetch, pure validation, efficient execution
export const createContextCommand = <TRequest, TResult, TContext>(
  createContext: ContextCreator<TRequest, TContext>,
  validator: ContextValidator<TRequest, TContext>,
  executor: ContextExecutor<TRequest, TResult, TContext>
) => async (request: TRequest): Promise<TResult> => {
  // 1. Fetch all required data once
  const context = await createContext(request);
  
  // 2. Run pure validation with pre-fetched data
  const validationResult = validator(request, context);
  
  if (!validationResult.isValid) {
    throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
  }
  
  // 3. Execute with context (may reuse fetched data)
  return executor(request, context);
};

// Simple command builder for commands that don't need context
export const createSimpleCommand = <TRequest, TResult>(
  validator: SimpleValidator<TRequest>,
  executor: SimpleExecutor<TRequest, TResult>
) => async (request: TRequest): Promise<TResult> => {
  // 1. Run validation
  const validationResult = await validator(request);
  
  if (!validationResult.isValid) {
    throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
  }
  
  // 2. Execute command
  return executor(request);
};