import { PollType } from '../../../../common/types';
import { PollParticipant } from '../../participants/poll-participant.domain';

export interface AggregateVoteRequest {
  pollParticipant: PollParticipant<PollType>;
  voteStreamData: any; // Raw DynamoDB stream vote data
}