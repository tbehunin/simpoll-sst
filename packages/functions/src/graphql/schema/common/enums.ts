import { PollScope, PollType, VotePrivacy, MediaType, PollStatus } from '@simpoll-sst/core/common/types';
import { builder } from '../builder';

export const pollScope = builder.enumType(PollScope, {
  name: 'PollScope',
});
export const pollType = builder.enumType(PollType, {
  name: 'PollType',
});
export const pollStatus = builder.enumType(PollStatus, {
  name: 'PollStatus',
});
export const votePrivacy = builder.enumType(VotePrivacy, {
  name: 'VotePrivacy',
});
export const mediaType = builder.enumType(MediaType, {
  name: 'MediaType',
});
