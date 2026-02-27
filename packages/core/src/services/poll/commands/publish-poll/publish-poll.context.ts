import { PublishPollRequest } from './publish-poll.types';
import { PollDetail } from '../../details/poll-detail.domain';
import { PollType } from '@simpoll-sst/core/common';
import { PollDetailRepository } from '@simpoll-sst/core/data';
import { PollDetailMapper } from '../../details/poll-detail.mapper';

export interface PublishPollValidationContext {
  currentTime: string;
  existingPoll: PollDetail<PollType> | null;
}

export const createPublishPollContext = async (
  request: PublishPollRequest
): Promise<PublishPollValidationContext> => {
  // Fetch existing draft poll
  const pollEntity = await PollDetailRepository.get(request.pollId);

  const existingPoll = pollEntity ? PollDetailMapper.toDomain(pollEntity) : null;

  return {
    currentTime: new Date().toISOString(),
    existingPoll,
  };
};
