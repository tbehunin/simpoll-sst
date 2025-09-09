import { PollType, PollParticipantMap } from '../../../../common/poll.types';

export type VoteRequest<T extends PollType> = {
  pollId: string
  userId: string
  type: T
  vote: PollParticipantMap[T]
};
