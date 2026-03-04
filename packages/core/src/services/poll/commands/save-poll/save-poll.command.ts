import { createContextCommand } from '../command-builder';
import { createSavePollContext, SavePollValidationContext } from './save-poll.context';
import { validateSavePoll } from './save-poll.validation';
import { SavePollRequest } from './save-poll.types';
import { SavePollMapper } from './save-poll.mapper';
import { PollType } from '@simpoll-sst/core/common';
import { PollDetailEntityBuilder } from '../../details';
import { PollResultEntityBuilder } from '../../results';
import { PollParticipantEntityBuilder } from '../../participants';
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
    const payload = SavePollMapper.toPublishPayload(request);
    const pollDetailDoc = PollDetailEntityBuilder.fromPublishPayload(pollId, ct, payload);
    const pollResultDoc = PollResultEntityBuilder.fromPublishPayload(pollId, payload);
    const pollParticipantDocs = PollParticipantEntityBuilder.fromPublishPayload(pollId, payload);

    await dbClient.batchWrite([pollDetailDoc, pollResultDoc, ...pollParticipantDocs]);
  } else {
    // Draft: save only the Detail doc
    const payload = SavePollMapper.toDraftPayload(request);
    await dbClient.put(PollDetailEntityBuilder.fromDraftPayload(pollId, ct, payload));
  }

  return pollId;
};

export const savePollCommand = createContextCommand(
  createSavePollContext,
  validateSavePoll,
  executeSavePoll
);
