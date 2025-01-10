import { builder } from "../builder";
import { MultipleChoicePoll, Poll, PollScope, PollStatus, PollType, VotePrivacy, VoteStatus } from "../../../../../core/src/models";
import { poll } from "../interfaces/poll";

// todo: remove this
export const deleteMePolls: Poll[] = [
  {
    pollId: '123',
    userId: '456',
    ct: '2021-01-01T00:00:00Z',
    scope: PollScope.Public,
    type: PollType.MultipleChoice,
    title: 'What is your favorite color?',
    expireTimestamp: '9999-12-31T23:59:59.999Z',
    votePrivacy: VotePrivacy.Anonymous,
    sharedWith: [],
    multiSelect: false,
    choices: [
      { text: 'Red' },
      { text: 'Green' },
      { text: 'Blue' },
    ],
    results: {
      totalVotes: 3,
      choices: [
        { votes: 1, users: ['123'] },
        { votes: 1, users: ['asdf'] },
        { votes: 1, users: ['qwer'] },
      ],
      selectedIndex: [0],
    },
  } as MultipleChoicePoll,
];

export const publicPolls = builder.queryField('publicPolls', (t) =>
  t.field({
    type: [poll],
    args: {
      input: t.arg({ type: publicPollsInput, required: false }),
    },
    resolve: publicPollsResolver,
  })
);

export const publicPollsInput = builder.inputType('PublicPollsInput', {
  fields: (t) => ({
    voteStatus: t.field({ type: VoteStatus, required: false }),
    pollStatus: t.field({ type: PollStatus, required: false }),
  }),
});

export const publicPollsResolver = (a: any, b: any, c: any, d: any): Poll[] => {
  return deleteMePolls;
};
