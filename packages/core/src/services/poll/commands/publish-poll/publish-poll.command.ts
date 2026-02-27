import { createContextCommand } from '../command-builder';
import { createPublishPollContext, PublishPollValidationContext } from './publish-poll.context';
import { validatePublishPoll } from './publish-poll.validation';
import { PublishPollRequest } from './publish-poll.types';
import { PollType } from '@simpoll-sst/core/common';
import { PollDetailMapper } from '../../details';
import { PollResultMapper } from '../../results';
import { PollParticipantMapper } from '../../participants';
import { dbClient } from '@simpoll-sst/core/data';
import { calculatePollScope, generateExpireTimestamp } from '@simpoll-sst/core/services/utils';

// Pure executor function
const executePublishPoll = async (
  request: PublishPollRequest,
  context: PublishPollValidationContext
): Promise<string> => {
  if (!context.existingPoll) {
    throw new Error('Poll not found'); // Should never happen after validation
  }

  const poll = context.existingPoll;
  const pollId = request.pollId;

  // Calculate new scope based on sharedWith (isDraft=false)
  const newScope = calculatePollScope(poll.sharedWith, false);
  const expireTimestamp = generateExpireTimestamp(poll.expireTimestamp);

  // Update the existing poll detail doc with new scope
  const updatedPollDetailDoc = PollDetailMapper.fromCreateRequest(
    pollId,
    poll.ct, // Keep original creation timestamp
    {
      userId: poll.userId,
      type: poll.type,
      title: poll.title,
      expireTimestamp: poll.expireTimestamp,
      sharedWith: poll.sharedWith,
      votePrivacy: poll.votePrivacy,
      details: poll.details,
    },
    false // isDraft=false to calculate proper scope
  );

  // Create result and participant docs (not created during saveDraft)
  const pollResultDoc = PollResultMapper.fromCreateRequest(pollId, {
    userId: poll.userId,
    type: poll.type,
    title: poll.title,
    expireTimestamp: poll.expireTimestamp,
    sharedWith: poll.sharedWith,
    votePrivacy: poll.votePrivacy,
    details: poll.details,
  });

  const pollParticipantDocs = PollParticipantMapper.fromCreateRequest(pollId, {
    userId: poll.userId,
    type: poll.type,
    title: poll.title,
    expireTimestamp: poll.expireTimestamp,
    sharedWith: poll.sharedWith,
    votePrivacy: poll.votePrivacy,
    details: poll.details,
  });

  // Prepare items to write
  const itemsToWrite: any[] = [updatedPollDetailDoc, pollResultDoc];
  
  // Add participant docs if it's an array and not empty
  if (Array.isArray(pollParticipantDocs) && pollParticipantDocs.length > 0) {
    itemsToWrite.push(...pollParticipantDocs);
  }

  await dbClient.batchWrite(itemsToWrite);
  
  return pollId;
};

// Composed command using context pattern
export const publishPollCommand = createContextCommand(
  createPublishPollContext,
  validatePublishPoll,
  executePublishPoll
);
