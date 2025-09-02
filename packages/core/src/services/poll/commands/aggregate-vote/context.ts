import { PollResultEntity } from '../../../../data/poll/result/poll-result.entity';
import { pollResultRepository } from '../../../../data/poll/result/poll-result.repository';
import { AggregateVoteRequest } from './types';
import { PollType } from '../../../../common/types';

export type AggregateVoteValidationContext = {
  currentTime: string;
  pollResults?: PollResultEntity<PollType>;
};

// Context creator for aggregate vote commands (needs poll results)
export const createAggregateVoteContext = async (
  request: AggregateVoteRequest
): Promise<AggregateVoteValidationContext> => {
  const currentTime = new Date().toISOString();
  const { pollParticipant } = request;
  
  // Fetch poll results for aggregation
  const pollResults = await pollResultRepository.get(pollParticipant.pollId);

  return {
    currentTime,
    pollResults,
  };
};