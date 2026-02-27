import { createContextCommand } from '../command-builder';
import { createSavePollContext, SavePollValidationContext } from './save-poll.context';
import { validateSavePoll } from './save-poll.validation';
import { SavePollRequest } from './save-poll.types';
import { PollType, VotePrivacy } from '@simpoll-sst/core/common';
import { PollDetailMapper } from '../../details';
import { PollResultMapper } from '../../results';
import { PollParticipantMapper } from '../../participants';
import { dbClient } from '@simpoll-sst/core/data';
import { v4 as uuidv4 } from 'uuid';

const executeSavePoll = async (
  request: SavePollRequest<PollType>,
  context: SavePollValidationContext
): Promise<string> => {
  const pollId = request.pollId || uuidv4();
  const ct = context.existingPoll?.ct || context.currentTime;

  if (request.publish) {
    // Publishing: create/update Detail + create Results + create Participants
    // All fields are guaranteed to be present by validation
    const pollDetailDoc = PollDetailMapper.fromCreateRequest(pollId, ct, {
      userId: request.userId,
      type: request.type,
      title: request.title!,
      expireTimestamp: request.expireTimestamp,
      sharedWith: request.sharedWith!,
      votePrivacy: request.votePrivacy!,
      details: request.details!,
    }, true);

    const pollResultDoc = PollResultMapper.fromCreateRequest(pollId, {
      userId: request.userId,
      type: request.type,
      title: request.title!,
      expireTimestamp: request.expireTimestamp,
      sharedWith: request.sharedWith!,
      votePrivacy: request.votePrivacy!,
      details: request.details!,
    });

    const pollParticipantDocs = PollParticipantMapper.fromCreateRequest(pollId, {
      userId: request.userId,
      type: request.type,
      title: request.title!,
      expireTimestamp: request.expireTimestamp,
      sharedWith: request.sharedWith!,
      votePrivacy: request.votePrivacy!,
      details: request.details!,
    });

    const pollParticipantDocsArray = Array.isArray(pollParticipantDocs) 
      ? pollParticipantDocs 
      : [pollParticipantDocs];

    await dbClient.batchWrite([pollDetailDoc, pollResultDoc, ...pollParticipantDocsArray]);
  } else {
    // Draft: save only Detail doc with defaults for missing fields
    const normalizedRequest = {
      userId: request.userId,
      type: request.type,
      title: request.title || '',
      expireTimestamp: request.expireTimestamp,
      sharedWith: request.sharedWith || [],
      votePrivacy: request.votePrivacy || VotePrivacy.Anonymous,
      details: request.details || {} as any,
    };

    const pollDetailDoc = PollDetailMapper.fromCreateRequest(pollId, ct, normalizedRequest, false);
    await dbClient.put(pollDetailDoc);
  }

  return pollId;
};

export const savePollCommand = createContextCommand(
  createSavePollContext,
  validateSavePoll,
  executeSavePoll
);
