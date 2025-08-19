import { Poll } from '@simpoll-sst/core/models';
import { PollService } from '@simpoll-sst/core/services/poll/poll.service';
import { MAX_DATE } from '@simpoll-sst/core/common/constants';
import { builder } from '../builder';
import { pollScope, pollType, votePrivacy } from '../common/enums';
import { user } from './user';
import { pollDetail } from '../unions/pollDetail';
import { pollResult } from '../unions/pollResult';
import { pollVoter } from '../unions/pollVoter';
import { generatePollVoterId } from '@simpoll-sst/core/services/utils';
import { PollType } from '@simpoll-sst/core/common/types';

export const poll = builder.loadableObject('Poll', {
  load: async (pollIds: string[]) => {
    const polls = await PollService.getPollDetailsByIds(pollIds);

    // The order of objects returned from Dynamo isn't guaranteed to be the same order as the order of id's passed in
    // so make sure that order is maintained before returning (a requirement to use DataLoader).
    return pollIds.map((pollId) => {
      const poll = polls.find(poll => poll.pollId === pollId);
      return poll ? poll : new Error(`Poll with id ${pollId} not found`);
    });
  },
  fields: (t) => ({
    pollId: t.exposeID('pollId'),
    userId: t.exposeID('userId'),
    user: t.field({
      type: user,
      resolve: (parent) => parent.userId,
    }),
    ct: t.exposeString('ct'),
    scope: t.expose('scope', { type: pollScope }),
    type: t.expose('type', { type: pollType }),
    title: t.exposeString('title'),
    expireTimestamp: t.field({
      type: 'String',
      nullable: true,
      resolve: (parent) => parent.expireTimestamp === MAX_DATE ? null : parent.expireTimestamp,
    }),
    votePrivacy: t.expose('votePrivacy', { type: votePrivacy }),
    sharedWith: t.exposeStringList('sharedWith'),
    details: t.field({
      type: pollDetail,
      resolve: (parent: Poll<PollType>) => parent,
    }),
    results: t.field({
      type: pollResult,
      nullable: true,
      resolve: async (poll, args, context) => {
        // Only return results (the pollId) when:
        // - The poll is expired
        // - The user is the author of the poll
        // - The user voted on the poll already
        const now = new Date().toISOString();
        if (poll.expireTimestamp < now || poll.userId === context.currentUserId) {
          return poll.pollId;
        }
        const voter = await pollVoter.getDataloader(context).load(generatePollVoterId(poll.pollId, context.currentUserId));
        return voter && voter.voted ? poll.pollId : null;
      },
    }),
    vote: t.field({
      type: pollVoter,
      nullable: true,
      resolve: (poll, args, context) => {
        // Generate the 'pollVoterId' for the current user and poll
        return generatePollVoterId(poll.pollId, context.currentUserId);
      },
    }),
  }),
});
