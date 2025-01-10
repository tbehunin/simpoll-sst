import { builder } from "../builder";
import { PollScope, PollType, VotePrivacy, MediaType, PollStatus, VoteStatus } from "../../../../../core/src/models";

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
export const voteStatus = builder.enumType(VoteStatus, {
  name: 'VoteStatus',
});
