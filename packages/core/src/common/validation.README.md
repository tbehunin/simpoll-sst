# Zod-Based Validation Architecture

This document describes the comprehensive validation system implemented for the SimplePoll application using Zod for runtime type safety and poll-type-specific validation logic.

## Overview

The validation architecture provides:

- **Runtime Type Safety**: Zod schemas validate data structure and types at runtime
- **Poll-Type-Specific Validation**: Different validation rules for different poll types (MultipleChoice, etc.)
- **Structured Error Handling**: Errors include field paths, messages, and error codes
- **Integration with PollTypeHandler**: Validation logic is integrated with the existing poll type registry
- **Backward Compatibility**: Legacy validation functions are preserved for existing code

## Architecture Components

### 1. Core Types (`validation.types.ts`)

```typescript
interface ValidationSuccess {
  success: true;
  data: any;
}

interface ValidationError {
  success: false;
  errors: ValidationErrorDetail[];
}

interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
}

type ValidationResult<T = any> = ValidationSuccess | ValidationError;
```

### 2. Base Schemas (`validation.schemas.ts`)

Common Zod schemas for all poll types:
- `PollTypeSchema`: Validates poll type enum
- `CreatePollBaseSchema`: Base schema for create poll requests
- `VoteBaseSchema`: Base schema for vote requests
- `AggregateVoteBaseSchema`: Base schema for aggregate vote requests

### 3. Poll-Type-Specific Validation

Each poll type (e.g., MultipleChoice) has its own validation file:

#### Multiple Choice Validation (`multiple-choice.validation.ts`)

```typescript
// Schemas
export const MultipleChoiceDetailSchema = z.object({
  multiSelect: z.boolean(),
  choices: z.array(MultipleChoiceChoiceSchema)
    .min(2, 'At least 2 choices are required')
    .max(10, 'Maximum 10 choices allowed')
});

// Business Logic Validators
export const validateMultipleChoiceCreatePollBusinessLogic = (request, context) => {
  // Custom validation logic for Multiple Choice polls
  // e.g., unique choice texts, valid media assets, etc.
};
```

### 4. Enhanced PollTypeHandler Interface

The `PollTypeHandler` interface now includes validation methods:

```typescript
export interface PollTypeHandler<T extends PollType> {
  // Existing methods...
  parseDetails(details: any): PollDetailMap[T];
  buildResults(request: CreatePollRequest<PollType>): PollResultMap[T];
  
  // New validation methods
  getValidationSchemas(): ValidationSchemaRegistry<any>;
  validateCreatePollBusinessLogic?: BusinessLogicValidator<CreatePollRequest<T>, any>;
  validateVoteBusinessLogic?: BusinessLogicValidator<VoteRequest<T>, any>;
  validateAggregateVoteBusinessLogic?: BusinessLogicValidator<AggregateVoteRequest, any>;
}
```

### 5. Centralized Validation Service (`validation.service.ts`)

The `ValidationService` provides a unified interface for all validation:

```typescript
export class ValidationService {
  static validateCreatePoll<T extends PollType>(
    request: CreatePollRequest<T>,
    context: any
  ): ValidationResult {
    const handler = getPollTypeHandler(request.type);
    const schemas = handler.getValidationSchemas();
    
    // 1. Schema validation (structure + types)
    const schemaResult = validateWithSchema(schemas[CommandType.CreatePoll], request);
    
    // 2. Poll-type-specific business logic validation
    const businessLogicResult = handler.validateCreatePollBusinessLogic?.(request, context);
    
    // 3. Combine results
    return combineValidationResults(schemaResult, businessLogicResult);
  }
}
```

## Usage Examples

### 1. Create Poll Validation

```typescript
import { ValidationService } from './validation.service';
import { PollType, VotePrivacy } from './poll.types';

const createPollRequest = {
  userId: 'user123',
  type: PollType.MultipleChoice,
  title: 'What is your favorite programming language?',
  votePrivacy: VotePrivacy.Anonymous,
  details: {
    multiSelect: false,
    choices: [
      { text: 'JavaScript' },
      { text: 'TypeScript' },
      { text: 'Python' }
    ]
  }
};

const result = ValidationService.validateCreatePoll(createPollRequest, {
  currentTime: Date.now()
});

if (result.success) {
  // Proceed with poll creation
  console.log('Validation passed:', result.data);
} else {
  // Handle validation errors
  result.errors.forEach(error => {
    console.log(`${error.field}: ${error.message} (${error.code})`);
  });
}
```

### 2. Vote Validation

```typescript
const voteRequest = {
  pollId: 'poll123',
  userId: 'user456',
  type: PollType.MultipleChoice,
  vote: {
    selectedIndex: [0, 2] // JavaScript and Python
  }
};

const context = {
  currentTime: Date.now(),
  poll: {
    userId: 'user123',
    expireTimestamp: Date.now() + 86400000,
    scope: 'Public',
    sharedWith: [],
    details: {
      multiSelect: true,
      choices: [/* ... */]
    }
  },
  existingParticipant: null
};

const result = ValidationService.validateVote(voteRequest, context);
```

## Validation Layers

The validation system operates in multiple layers:

### Layer 1: Base Schema Validation
- Validates basic structure and required fields
- Ensures correct data types
- Validates enum values

### Layer 2: Poll-Type Schema Validation
- Validates poll-type-specific structure
- Enforces poll-type-specific constraints
- Validates nested objects (e.g., choice details)

### Layer 3: Poll-Type Business Logic
- Custom validation rules per poll type
- Complex business logic validation
- Cross-field validation

### Layer 4: General Business Logic
- User permissions and access control
- Temporal validation (expiration, etc.)
- State validation (already voted, etc.)

## Error Handling

Validation errors are structured and provide detailed information:

```typescript
{
  success: false,
  errors: [
    {
      field: 'details.choices',
      message: 'At least 2 choices are required',
      code: 'too_small'
    },
    {
      field: 'title',
      message: 'Title is required',
      code: 'invalid_string'
    }
  ]
}
```

## Adding New Poll Types

To add validation for a new poll type:

1. **Create validation schemas**:
   ```typescript
   // new-poll-type.validation.ts
   export const NewPollTypeDetailSchema = z.object({
     // Define poll-type-specific fields
   });
   
   export const newPollTypeValidationSchemas = {
     [CommandType.CreatePoll]: CreatePollBaseSchema.extend({
       type: z.literal(PollType.NewPollType),
       details: NewPollTypeDetailSchema
     }),
     // ... other command schemas
   };
   ```

2. **Implement business logic validators**:
   ```typescript
   export const validateNewPollTypeCreatePollBusinessLogic = (request, context) => {
     // Custom validation logic
   };
   ```

3. **Update the poll type handler**:
   ```typescript
   export const newPollTypeHandler: PollTypeHandler<PollType.NewPollType> = {
     // Existing methods...
     
     // Validation methods
     getValidationSchemas: () => newPollTypeValidationSchemas,
     validateCreatePollBusinessLogic: validateNewPollTypeCreatePollBusinessLogic,
     // ... other validation methods
   };
   ```

4. **Register the handler**:
   ```typescript
   registerPollType(PollType.NewPollType, newPollTypeHandler);
   ```

## Migration Guide

### For Existing Code

The validation system maintains backward compatibility:

```typescript
// Legacy validation (still works)
const legacyResult = validateCreatePoll(request, context);
if (legacyResult.isValid) {
  // Handle success
} else {
  // Handle errors: legacyResult.errors (string[])
}

// Enhanced validation (recommended)
const enhancedResult = validateCreatePollEnhanced(request, context);
if (enhancedResult.success) {
  // Handle success
} else {
  // Handle structured errors: enhancedResult.errors (ValidationErrorDetail[])
}
```

### Gradual Migration

1. Start using enhanced validation functions in new code
2. Gradually migrate existing code to use `ValidationService`
3. Update error handling to use structured errors
4. Remove legacy validation functions when no longer needed

## Benefits

1. **Type Safety**: Runtime validation ensures data matches expected types
2. **Extensibility**: Easy to add new poll types and validation rules
3. **Consistency**: Uniform validation approach across all commands
4. **Error Quality**: Structured errors with field paths and codes
5. **Maintainability**: Centralized validation logic per poll type
6. **Testing**: Easy to unit test validation logic in isolation

## Testing

The validation system is designed to be easily testable:

```typescript
import { ValidationService } from './validation.service';

describe('Multiple Choice Validation', () => {
  it('should validate valid create poll request', () => {
    const request = { /* valid request */ };
    const result = ValidationService.validateCreatePoll(request, context);
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid choice count', () => {
    const request = { /* request with 1 choice */ };
    const result = ValidationService.validateCreatePoll(request, context);
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual({
      field: 'details.choices',
      message: 'At least 2 choices are required',
      code: 'too_small'
    });
  });
});
```

## Performance Considerations

- Zod schemas are compiled once and reused
- Validation is performed synchronously
- Business logic validators should avoid database calls
- Context should contain pre-fetched data needed for validation

## Future Enhancements

- Async validation support for database-dependent rules
- Validation result caching for repeated validations
- Custom error message internationalization
- Validation middleware for automatic request validation