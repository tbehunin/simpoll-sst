import { PollType } from '@simpoll-sst/core/common';
import { SavePollRequest, DraftPollPayload, PublishPollPayload } from './save-poll.types';

/** SavePollRequest → DraftPollPayload (pass-through; all fields optional) */
const toDraftPayload = (request: SavePollRequest<PollType>): DraftPollPayload<PollType> => ({
  userId: request.userId,
  type: request.type,
  title: request.title,
  expireTimestamp: request.expireTimestamp,
  sharedWith: request.sharedWith,
  votePrivacy: request.votePrivacy,
  details: request.details,
});

/** SavePollRequest → PublishPollPayload (all required fields guaranteed by validation) */
const toPublishPayload = (request: SavePollRequest<PollType>): PublishPollPayload<PollType> => ({
  userId: request.userId,
  type: request.type,
  title: request.title!,
  expireTimestamp: request.expireTimestamp,
  sharedWith: request.sharedWith!,
  votePrivacy: request.votePrivacy!,
  details: request.details!,
});

export const SavePollMapper = { toDraftPayload, toPublishPayload };
