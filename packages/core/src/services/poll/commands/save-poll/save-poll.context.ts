import { SavePollRequest } from './save-poll.types';
import { PollDetail } from '../../details/poll-detail.domain';
import { PollType } from '@simpoll-sst/core/common';
import { PollDetailRepository } from '@simpoll-sst/core/data';
import { PollDetailMapper } from '../../details/poll-detail.mapper';

export interface SavePollValidationContext {
  currentTime: string;
  existingPoll: PollDetail<PollType> | null;
}

export const createSavePollContext = async (
  request: SavePollRequest<PollType>
): Promise<SavePollValidationContext> => {
  let existingPoll: PollDetail<PollType> | null = null;

  if (request.pollId) {
    const pollEntity = await PollDetailRepository.get(request.pollId);
    existingPoll = pollEntity ? PollDetailMapper.toDomain(pollEntity) : null;
  }

  return {
    currentTime: new Date().toISOString(),
    existingPoll,
  };
};
