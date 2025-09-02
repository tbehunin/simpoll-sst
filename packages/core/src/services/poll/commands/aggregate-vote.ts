import { createContextCommand } from './command-builder';
import { createAggregateVoteContext } from '../validation/validation-context';
import { validateAggregateVote } from '../validation/poll-validation';
import { PollType, PollScope } from '../../../common/types';
import { PollParticipant } from '../participants/poll-participant.domain';
import { getPollTypeHandler } from '../../../handlers/pollRegistry';
import { dbClient } from '../../../data/dbClient';
import { ValidationContext } from '../validation/validation-context';
import { MultipleChoiceResult, MultipleChoiceParticipant } from '../../../handlers/multipleChoiceHandler';

export interface AggregateVoteRequest {
  pollParticipant: PollParticipant<PollType>;
  voteStreamData: any; // Raw DynamoDB stream vote data
}

// Pure executor function
const executeAggregateVote = async (
  request: AggregateVoteRequest,
  context: ValidationContext
): Promise<void> => {
  const { pollParticipant, voteStreamData } = request;
  const { pollId, type, userId, scope } = pollParticipant;

  // Get the correct handler and parse vote data
  const handler = getPollTypeHandler(type);
  const parsedVote = handler.parseVoteStream(voteStreamData);

  // Use poll results from context (already fetched during validation)
  const currentResults = context.pollResults!;

  // Parse current results and aggregate the new vote
  const currentParsedResults = handler.parseResults(currentResults.results);
  const updatedResults = aggregateVoteByType(type, currentParsedResults, parsedVote, userId, scope);
  
  // Update total votes count
  const newTotalVotes = (currentResults.totalVotes || 0) + 1;

  // Update the database atomically
  await dbClient.update(
    { pk: `Poll#${pollId}`, sk: 'Results' },
    'SET totalVotes = :totalVotes, results = :results',
    {
      ':totalVotes': newTotalVotes,
      ':results': updatedResults
    }
  );
};

// Pure function for vote aggregation by type
const aggregateVoteByType = (
  type: PollType,
  currentResults: any,
  vote: any,
  userId: string,
  scope: PollScope
): any => {
  switch (type) {
    case PollType.MultipleChoice:
      return aggregateMultipleChoiceVote(
        currentResults as MultipleChoiceResult,
        vote as MultipleChoiceParticipant,
        userId,
        scope
      );
    default:
      throw new Error(`Vote aggregation not implemented for poll type: ${type}`);
  }
};

// Pure function for multiple choice vote aggregation
const aggregateMultipleChoiceVote = (
  currentResults: MultipleChoiceResult,
  vote: MultipleChoiceParticipant,
  userId: string,
  scope: PollScope
): MultipleChoiceResult => {
  const updatedChoices = [...currentResults.choices];

  // Process each selected choice
  if (vote.selectedIndex) {
    vote.selectedIndex.forEach(choiceIndex => {
      if (choiceIndex >= 0 && choiceIndex < updatedChoices.length) {
        // Increment vote count
        updatedChoices[choiceIndex].votes += 1;
        
        // Add user to the choice if poll is not anonymous (private scope)
        if (scope === PollScope.Private) {
          if (!updatedChoices[choiceIndex].users.includes(userId)) {
            updatedChoices[choiceIndex].users.push(userId);
          }
        }
      }
    });
  }

  return { choices: updatedChoices };
};

// Composed command using context pattern for consistency
export const aggregateVoteCommand = createContextCommand(
  createAggregateVoteContext,
  validateAggregateVote,
  executeAggregateVote
);