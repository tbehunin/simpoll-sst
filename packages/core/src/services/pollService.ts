import { deleteMePolls } from "../data/deletemePolls";
import { AuthorType, Poll, PollScope, PollStatus, VoteStatus } from "../models";

export type QueryPollsRequest = {
  userId: string,
  authorType: AuthorType,
  scope?: PollScope | null,
  voteStatus?: VoteStatus | null,
  pollStatus?: PollStatus | null,
};
export const pollService = {
  queryPolls: (request: QueryPollsRequest): Promise<string[]> => {
    console.log('*** DATA ACCESS: queryPolls');
    return Promise.resolve(['123']);
  },
  getPollsByIds: (pollIds: string[]): Promise<Poll[]> => {
    console.log('*** DATA ACCESS: getPollsByIds', pollIds);
    return Promise.resolve(deleteMePolls);
  },
};
