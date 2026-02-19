import { PollType } from '@simpoll-sst/core/common';
import { PollParticipant } from '../../participants';

export interface AggregateVoteRequest {
  participant: PollParticipant<PollType>;
}
