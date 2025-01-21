import { MultipleChoicePoll, Poll, PollScope, PollType, VotePrivacy } from "../models";

// todo: delete this file after testing
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
