import { PollType } from '../../../../common/poll.types';
import { PollParticipant } from '../../participants';

export interface AggregateVoteRequest {
  participant: PollParticipant<PollType>;
}
