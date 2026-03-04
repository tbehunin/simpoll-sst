import { SavePollRequest } from './save-poll.types';
import { PollDetail } from '../../details/poll-detail.domain';
import { PollType } from '@simpoll-sst/core/common';
import { PollDetailRepository } from '@simpoll-sst/core/data';
import { PollDetailMapper } from '../../details/poll-detail';
import { validateMediaAssetsExist } from '@simpoll-sst/core/services/media/media-validation';

export interface SavePollValidationContext {
  currentTime: string;
  existingPoll: PollDetail<PollType> | null;
  /** S3 existence errors for uploaded media assets; populated only when publish=true */
  mediaValidationErrors: string[];
}

export const createSavePollContext = async (
  request: SavePollRequest<PollType>
): Promise<SavePollValidationContext> => {
  let existingPoll: PollDetail<PollType> | null = null;

  if (request.pollId) {
    const pollEntity = await PollDetailRepository.get(request.pollId);
    existingPoll = pollEntity ? PollDetailMapper.fromEntity(pollEntity) : null;
  }

  // Only check S3 existence at publish time — draft autosaves skip this to avoid
  // paying a HeadObject per asset on every save.
  let mediaValidationErrors: string[] = [];
  if (request.publish && request.details) {
    mediaValidationErrors = await validateMediaAssetsExist(
      request.details,
      request.type,
      request.userId,
    );
  }

  return {
    currentTime: new Date().toISOString(),
    existingPoll,
    mediaValidationErrors,
  };
};
