/**
 * Examples demonstrating the new Zod-based validation architecture
 * 
 * This file shows how to use the enhanced validation system that provides:
 * 1. Runtime type safety with Zod schemas
 * 2. Poll-type-specific validation logic
 * 3. Structured error handling with field paths and error codes
 * 4. Integration with the existing PollTypeHandler registry
 */

import { PollType, VotePrivacy } from './poll.types';
import { ValidationService } from './validation.service';
import { CreatePollRequest } from '../services/poll/commands/create-poll/create-poll.types';
import { VoteRequest } from '../services/poll/commands/vote/vote.types';
import { AggregateVoteRequest } from '../services/poll/commands/aggregate-vote/aggregate-vote.types';

// Example 1: Create Poll Validation
export const exampleCreatePollValidation = () => {
  const createPollRequest: CreatePollRequest<PollType.MultipleChoice> = {
    userId: 'user123',
    type: PollType.MultipleChoice,
    title: 'What is your favorite programming language?',
    expireTimestamp: '2024-12-31T23:59:59Z',
    sharedWith: ['user456', 'user789'],
    votePrivacy: VotePrivacy.Anonymous,
    details: {
      multiSelect: false,
      choices: [
        { text: 'JavaScript' },
        { text: 'TypeScript' },
        { text: 'Python' },
        { text: 'Rust' }
      ]
    }
  };

  const context = {
    currentTime: Date.now()
  };

  const result = ValidationService.validateCreatePoll(createPollRequest, context);
  
  if (result.success) {
    console.log('✅ Create poll validation passed');
    console.log('Validated data:', result.data);
  } else {
    console.log('❌ Create poll validation failed');
    result.errors.forEach(error => {
      console.log(`Field: ${error.field}, Message: ${error.message}, Code: ${error.code}`);
    });
  }
  
  return result;
};

// Example 2: Vote Validation
export const exampleVoteValidation = () => {
  const voteRequest: VoteRequest<PollType.MultipleChoice> = {
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
      userId: 'user123', // Different from voter
      expireTimestamp: Date.now() + 86400000, // Expires tomorrow
      scope: 'Public' as any,
      sharedWith: [],
      details: {
        multiSelect: true,
        choices: [
          { text: 'JavaScript' },
          { text: 'TypeScript' },
          { text: 'Python' },
          { text: 'Rust' }
        ]
      }
    },
    existingParticipant: null // User hasn't voted yet
  };

  const result = ValidationService.validateVote(voteRequest, context);
  
  if (result.success) {
    console.log('✅ Vote validation passed');
  } else {
    console.log('❌ Vote validation failed');
    result.errors.forEach(error => {
      console.log(`Field: ${error.field}, Message: ${error.message}, Code: ${error.code}`);
    });
  }
  
  return result;
};

// Example 3: Aggregate Vote Validation
export const exampleAggregateVoteValidation = () => {
  const aggregateVoteRequest: AggregateVoteRequest = {
    participant: {
      pollId: 'poll123',
      userId: 'user456',
      type: PollType.MultipleChoice,
      scope: 'Public' as any,
      voted: true,
      expireTimestamp: Date.now() + 86400000,
      vote: {
        selectedIndex: [0] // JavaScript
      }
    } as any
  };

  const context = {
    currentTime: Date.now(),
    pollResults: {
      choices: [
        { votes: 5, users: ['user1', 'user2'] },
        { votes: 3, users: ['user3'] },
        { votes: 2, users: ['user4'] },
        { votes: 1, users: ['user5'] }
      ]
    }
  };

  const result = ValidationService.validateAggregateVote(aggregateVoteRequest, context);
  
  if (result.success) {
    console.log('✅ Aggregate vote validation passed');
  } else {
    console.log('❌ Aggregate vote validation failed');
    result.errors.forEach(error => {
      console.log(`Field: ${error.field}, Message: ${error.message}, Code: ${error.code}`);
    });
  }
  
  return result;
};

// Example 4: Validation Error Scenarios
export const exampleValidationErrors = () => {
  console.log('\n=== Testing Validation Error Scenarios ===\n');

  // 1. Invalid create poll - missing title
  const invalidCreatePoll: any = {
    userId: 'user123',
    type: PollType.MultipleChoice,
    title: '', // Empty title should fail
    votePrivacy: VotePrivacy.Anonymous,
    details: {
      multiSelect: false,
      choices: [
        { text: 'Option 1' }
      ] // Only one choice should fail (minimum 2 required)
    }
  };

  console.log('1. Testing invalid create poll...');
  const createResult = ValidationService.validateCreatePoll(invalidCreatePoll, { currentTime: Date.now() });
  if (!createResult.success) {
    createResult.errors.forEach(error => {
      console.log(`   ❌ ${error.field}: ${error.message} (${error.code})`);
    });
  }

  // 2. Invalid vote - choice index out of bounds
  const invalidVote: any = {
    pollId: 'poll123',
    userId: 'user456',
    type: PollType.MultipleChoice,
    vote: {
      selectedIndex: [5] // Index 5 doesn't exist (only 0-3 available)
    }
  };

  console.log('\n2. Testing invalid vote...');
  const voteContext = {
    currentTime: Date.now(),
    poll: {
      userId: 'user123',
      expireTimestamp: Date.now() + 86400000,
      scope: 'Public' as any,
      sharedWith: [],
      details: {
        multiSelect: false,
        choices: [
          { text: 'Option 1' },
          { text: 'Option 2' },
          { text: 'Option 3' },
          { text: 'Option 4' }
        ]
      }
    }
  };

  const voteResult = ValidationService.validateVote(invalidVote, voteContext);
  if (!voteResult.success) {
    voteResult.errors.forEach(error => {
      console.log(`   ❌ ${error.field}: ${error.message} (${error.code})`);
    });
  }
};

// Example 5: Using validation in command handlers
export const exampleCommandIntegration = () => {
  console.log('\n=== Example Command Integration ===\n');
  
  // This shows how you would integrate validation into your command handlers
  const createPollCommand = async (request: CreatePollRequest<PollType.MultipleChoice>) => {
    // 1. Validate the request
    const validationResult = ValidationService.validateCreatePoll(request, {
      currentTime: Date.now()
    });
    
    if (!validationResult.success) {
      // Return structured error response
      return {
        success: false,
        errors: validationResult.errors
      };
    }
    
    // 2. Proceed with business logic
    console.log('✅ Validation passed, proceeding with poll creation...');
    
    // Your existing poll creation logic here...
    
    return {
      success: true,
      data: { pollId: 'poll123' }
    };
  };
  
  console.log('Command integration example completed');
};

// Run all examples
export const runAllValidationExamples = () => {
  console.log('🚀 Running Zod Validation Architecture Examples\n');
  
  exampleCreatePollValidation();
  console.log('\n' + '='.repeat(50) + '\n');
  
  exampleVoteValidation();
  console.log('\n' + '='.repeat(50) + '\n');
  
  exampleAggregateVoteValidation();
  console.log('\n' + '='.repeat(50) + '\n');
  
  exampleValidationErrors();
  console.log('\n' + '='.repeat(50) + '\n');
  
  exampleCommandIntegration();
  
  console.log('\n✨ All validation examples completed!');
};