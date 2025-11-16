import { 
  ValidationResult, 
  CommandType, 
  validateWithSchema, 
  combineValidationResults 
} from './validation.types';
import { getPollTypeHandler } from '../handlers/poll.registry';
import { CreatePollRequest } from '../services/poll/commands/create-poll/create-poll.types';
import { VoteRequest } from '../services/poll/commands/vote/vote.types';
import { AggregateVoteRequest } from '../services/poll/commands/aggregate-vote/aggregate-vote.types';
import { PollType } from './poll.types';

/**
 * Centralized validation service that uses poll-type-specific validation
 * through the PollTypeHandler registry system
 */
export class ValidationService {
  
  /**
   * Validate a create poll request using poll-type-specific validation
   */
  static validateCreatePoll<T extends PollType>(
    request: CreatePollRequest<T>,
    context: any
  ): ValidationResult {
    const handler = getPollTypeHandler(request.type);
    const schemas = handler.getValidationSchemas();
    
    // 1. Schema validation (structure + types)
    const schemaResult = validateWithSchema(
      schemas[CommandType.CreatePoll], 
      request
    );
    
    if (!schemaResult.success) {
      return schemaResult;
    }
    
    // 2. Poll-type-specific business logic validation
    const businessLogicResult: ValidationResult = handler.validateCreatePollBusinessLogic
      ? handler.validateCreatePollBusinessLogic(request, context)
      : { success: true, data: null };
    
    // 3. Combine results
    return combineValidationResults(schemaResult, businessLogicResult);
  }
  
  /**
   * Validate a vote request using poll-type-specific validation
   */
  static validateVote<T extends PollType>(
    request: VoteRequest<T>,
    context: any
  ): ValidationResult {
    const handler = getPollTypeHandler(request.type);
    const schemas = handler.getValidationSchemas();
    
    // 1. Schema validation (structure + types)
    const schemaResult = validateWithSchema(
      schemas[CommandType.Vote], 
      request
    );
    
    if (!schemaResult.success) {
      return schemaResult;
    }
    
    // 2. Poll-type-specific business logic validation
    const businessLogicResult: ValidationResult = handler.validateVoteBusinessLogic
      ? handler.validateVoteBusinessLogic(request, context)
      : { success: true, data: null };
    
    // 3. Combine results
    return combineValidationResults(schemaResult, businessLogicResult);
  }
  
  /**
   * Validate an aggregate vote request using poll-type-specific validation
   */
  static validateAggregateVote(
    request: AggregateVoteRequest,
    context: any
  ): ValidationResult {
    const handler = getPollTypeHandler(request.participant.type);
    const schemas = handler.getValidationSchemas();
    
    // 1. Schema validation (structure + types)
    const schemaResult = validateWithSchema(
      schemas[CommandType.AggregateVote], 
      request
    );
    
    if (!schemaResult.success) {
      return schemaResult;
    }
    
    // 2. Poll-type-specific business logic validation
    const businessLogicResult: ValidationResult = handler.validateAggregateVoteBusinessLogic
      ? handler.validateAggregateVoteBusinessLogic(request, context)
      : { success: true, data: null };
    
    // 3. Combine results
    return combineValidationResults(schemaResult, businessLogicResult);
  }
  
  /**
   * Generic validation method that can handle any command type
   */
  static validate(
    commandType: CommandType,
    pollType: PollType,
    request: any,
    context: any
  ): ValidationResult {
    switch (commandType) {
      case CommandType.CreatePoll:
        return this.validateCreatePoll(request, context);
      case CommandType.Vote:
        return this.validateVote(request, context);
      case CommandType.AggregateVote:
        return this.validateAggregateVote(request, context);
      default:
        return {
          success: false,
          errors: [{
            field: 'commandType',
            message: `Unknown command type: ${commandType}`,
            code: 'unknown_command_type'
          }]
        };
    }
  }
}